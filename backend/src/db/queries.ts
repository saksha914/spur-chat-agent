import { pool } from './pool';
import { Message, Conversation } from '../types';

export const createConversation = async (metadata?: Record<string, any>): Promise<string> => {
  const result = await pool.query(
    'INSERT INTO conversations (metadata) VALUES ($1) RETURNING id',
    [metadata || {}]
  );
  return result.rows[0].id;
};

export const getConversation = async (id: string): Promise<Conversation | null> => {
  const result = await pool.query(
    'SELECT * FROM conversations WHERE id = $1',
    [id]
  );
  
  if (result.rows.length === 0) return null;
  
  return {
    id: result.rows[0].id,
    createdAt: result.rows[0].created_at,
    metadata: result.rows[0].metadata
  };
};

export const saveMessage = async (
  conversationId: string,
  sender: 'user' | 'ai',
  text: string
): Promise<Message> => {
  const result = await pool.query(
    `INSERT INTO messages (conversation_id, sender, text) 
     VALUES ($1, $2, $3) 
     RETURNING *`,
    [conversationId, sender, text]
  );
  
  return {
    id: result.rows[0].id,
    conversationId: result.rows[0].conversation_id,
    sender: result.rows[0].sender,
    text: result.rows[0].text,
    createdAt: result.rows[0].created_at
  };
};

export const getConversationMessages = async (
  conversationId: string,
  limit: number = 50
): Promise<Message[]> => {
  const result = await pool.query(
    `SELECT * FROM messages 
     WHERE conversation_id = $1 
     ORDER BY created_at ASC 
     LIMIT $2`,
    [conversationId, limit]
  );
  
  return result.rows.map(row => ({
    id: row.id,
    conversationId: row.conversation_id,
    sender: row.sender,
    text: row.text,
    createdAt: row.created_at
  }));
};