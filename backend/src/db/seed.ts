import { getDb } from './pool';
import { createConversation, saveMessage } from './queries';

const seed = async () => {
  const db = await getDb();
  console.log('Seeding database...');

  try {
    // Clear existing data (optional, but good for idempotent seed)
    await db.exec('DELETE FROM messages');
    await db.exec('DELETE FROM conversations');

    // Create a sample conversation
    const conversationId = await createConversation({ source: 'seed' });
    console.log(`Created conversation: ${conversationId}`);

    // Add some messages
    await saveMessage(conversationId, 'user', 'Hello, do you ship to Canada?');
    await saveMessage(conversationId, 'ai', 'Yes, we ship internationally including Canada. It typically takes 7-14 business days.');
    await saveMessage(conversationId, 'user', 'How much does it cost?');
    await saveMessage(conversationId, 'ai', 'International shipping costs vary by destination, but we have a standard rate of $15 for most countries.');

    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seed();