import 'dotenv/config';
import express from 'express';
import path from 'path';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { chatRouter } from './routes/chat';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 3000;

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '20'),
  message: 'Too many requests, please try again later.'
});

app.use(cors({
  origin: [
    'https://glowing-praline-e1c5cc.netlify.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use('/api', limiter);

app.use('/api/chat', chatRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Serve frontend static files
const frontendDist = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDist));

// Handle client-side routing (SPA catch-all)
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'));
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});