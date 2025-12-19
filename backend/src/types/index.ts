export interface Message {
  id: string;
  conversationId: string;
  sender: 'user' | 'ai';
  text: string;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  createdAt: Date;
  metadata?: Record<string, any>;
}

export interface ChatRequest {
  message: string;
  sessionId?: string;
}

export interface ChatResponse {
  reply: string;
  sessionId: string;
}

export interface ErrorResponse {
  error: string;
  details?: string;
}