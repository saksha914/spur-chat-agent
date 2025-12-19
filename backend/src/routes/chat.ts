import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { ChatRequest, ChatResponse } from '../types';
import { AppError } from '../middleware/errorHandler';
import { llmService } from '../services/llm';
import * as db from '../db/queries';

const router = Router();

const chatRequestSchema = z.object({
  message: z.string().min(1).max(2000),
  sessionId: z.string().uuid().optional()
});

const validateChatRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parsed = chatRequestSchema.parse(req.body);
    req.body = parsed;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map(i => `${i.path.join('.')}: ${i.message}`);
      throw new AppError('Invalid request data', 400, issues.join(', '));
    }
    next(error);
  }
};

router.post('/message', validateChatRequest, async (
  req: Request<{}, {}, ChatRequest>,
  res: Response<ChatResponse>,
  next: NextFunction
) => {
  try {
    const { message, sessionId } = req.body;

    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      throw new AppError('Message cannot be empty', 400);
    }

    let conversationId = sessionId;

    if (conversationId) {
      const conversation = await db.getConversation(conversationId);
      if (!conversation) {
        conversationId = await db.createConversation();
      }
    } else {
      conversationId = await db.createConversation();
    }

    await db.saveMessage(conversationId, 'user', trimmedMessage);

    const previousMessages = await db.getConversationMessages(conversationId);
    
    const reply = await llmService.generateReply(
      previousMessages.slice(0, -1),
      trimmedMessage
    );

    await db.saveMessage(conversationId, 'ai', reply);

    res.json({
      reply,
      sessionId: conversationId
    });
  } catch (error) {
    next(error);
  }
});

router.get('/history/:sessionId', async (
  req: Request<{ sessionId: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId || !sessionId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      throw new AppError('Invalid session ID', 400);
    }

    const conversation = await db.getConversation(sessionId);
    if (!conversation) {
      throw new AppError('Conversation not found', 404);
    }

    const messages = await db.getConversationMessages(sessionId);

    res.json({
      conversationId: sessionId,
      messages,
      createdAt: conversation.createdAt
    });
  } catch (error) {
    next(error);
  }
});

export { router as chatRouter };