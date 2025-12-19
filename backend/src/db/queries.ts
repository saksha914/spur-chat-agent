import { getDb } from './pool';
import { v4 as uuidv4 } from 'uuid';
import { Message, Conversation } from '../types';

export const createConversation = async (metadata?: Record<string, any>): Promise<string> => {
  const db = await getDb();
  const id = uuidv4();
  // SQLite doesn't natively support storing objects/arrays, so we stringify
  const metadataStr = JSON.stringify(metadata || {});

  await db.run(
    'INSERT INTO conversations (id, metadata) VALUES (?, ?)',
    [id, metadataStr]
  );

  return id;
};

export const getConversation = async (id: string): Promise<Conversation | null> => {
  const db = await getDb();
  const row = await db.get(
    'SELECT * FROM conversations WHERE id = ?',
    [id]
  );

  if (!row) return null;

  return {
    id: row.id.toString(),
    createdAt: row.created_at,
    metadata: row.metadata ? JSON.parse(row.metadata) : {}
  };
};

export const saveMessage = async (
  conversationId: string,
  sender: 'user' | 'ai',
  text: string
): Promise<Message> => {
  const db = await getDb();
  const id = uuidv4();

  await db.run(
    `INSERT INTO messages (id, conversation_id, sender, text) 
     VALUES (?, ?, ?, ?)`,
    [id, conversationId, sender, text]
  );

  const row = await db.get('SELECT * FROM messages WHERE id = ?', [id]);

  return {
    id: row.id.toString(),
    conversationId: row.conversation_id.toString(),
    sender: row.sender,
    text: row.text,
    createdAt: row.created_at
  };
};

export const getConversationMessages = async (
  conversationId: string,
  limit: number = 50
): Promise<Message[]> => {
  const db = await getDb();
  const rows = await db.all(
    `SELECT * FROM messages 
     WHERE conversation_id = ? 
     ORDER BY created_at ASC 
     LIMIT ?`,
    [conversationId, limit]
  );

  return rows.map(row => ({
    id: row.id.toString(),
    conversationId: row.conversation_id.toString(),
    sender: row.sender,
    text: row.text,
    createdAt: row.created_at
  }));
};