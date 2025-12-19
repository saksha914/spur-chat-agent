import { pool } from './pool';

const seed = async () => {
  try {
    console.log('Seeding database with sample data...');

    const result = await pool.query(`
      INSERT INTO conversations (metadata) 
      VALUES ($1) 
      RETURNING id
    `, [{ type: 'demo', seeded: true }]);

    const conversationId = result.rows[0].id;

    await pool.query(`
      INSERT INTO messages (conversation_id, sender, text) 
      VALUES 
        ($1, 'user', 'What is your return policy?'),
        ($1, 'ai', 'Our return policy allows you to return items within 30 days of purchase. Items must be in their original condition with tags attached. Once we receive your return, we''ll process your refund within 5-7 business days.'),
        ($1, 'user', 'Do you ship internationally?'),
        ($1, 'ai', 'Yes, we ship to most countries worldwide! International shipping typically takes 7-14 business days. Shipping costs vary by destination and will be calculated at checkout.')
    `, [conversationId]);

    console.log('Database seeded successfully');
    console.log(`Sample conversation ID: ${conversationId}`);
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seed();