# Spur AI Live Chat Agent

A production-ready AI-powered live chat support system built with TypeScript, Node.js, Svelte, and PostgreSQL.

## Features

- Real-time chat interface with AI-powered responses
- Conversation persistence with PostgreSQL
- Session management for continuous conversations
- Rate limiting and error handling
- Clean, responsive UI with typing indicators
- Contextual responses based on conversation history

## Tech Stack

- **Backend**: Node.js + TypeScript + Express
- **Frontend**: Svelte + TypeScript + Vite
- **Database**: PostgreSQL
- **LLM**: Anthropic Claude API
- **Styling**: CSS3 with modern design

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Anthropic API key (or OpenAI API key with minor code changes)

## AI Provider Setup

This project supports multiple AI providers. **Google's Gemma (Gemini)** is the recommended default due to its generous free tier.

You can configure the active provider in `backend/.env` using `LLM_PROVIDER` or simply by providing the API Key for the service you want to use.

### Supported Providers

1.  **Google Gemini (Gemma)** - *Recommended Free Option*
    *   **Get Key**: [Google AI Studio](https://aistudio.google.com/app/apikey)
    *   **Env Var**: `GEMMA_API_KEY`
    *   **Config**: `LLM_PROVIDER=gemma`

2.  **OpenAI**
    *   **Get Key**: [OpenAI Platform](https://platform.openai.com/api-keys)
    *   **Env Var**: `OPENAI_API_KEY`
    *   **Config**: `LLM_PROVIDER=openai`

3.  **Anthropic**
    *   **Get Key**: [Anthropic Console](https://console.anthropic.com/settings/keys)
    *   **Env Var**: `ANTHROPIC_API_KEY`
    *   **Config**: `LLM_PROVIDER=anthropic`

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd spur-chat-agent
```

### 2. Database Setup

Create a PostgreSQL database:

```bash
createdb spur_chat
```

Or using psql:
```sql
CREATE DATABASE spur_chat;
```

### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
```

Edit `.env` and configure:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/spur_chat
ANTHROPIC_API_KEY=your_anthropic_api_key_here
PORT=3000
```

Run database migrations:
```bash
npm run db:migrate
```

(Optional) Seed with sample data:
```bash
npm run db:seed
```

Start the backend:
```bash
npm run dev
```

### 4. Frontend Setup

In a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start the frontend
npm run dev
```

### 5. Access the Application

Open your browser and navigate to: `http://localhost:5173`

## Architecture Overview

### Backend Structure

```
backend/
├── src/
│   ├── index.ts           # Express server entry point
│   ├── routes/
│   │   └── chat.ts        # Chat API endpoints
│   ├── services/
│   │   └── llm.ts         # LLM integration service
│   ├── db/
│   │   ├── pool.ts        # Database connection pool
│   │   ├── queries.ts     # Database query functions
│   │   ├── migrate.ts     # Migration script
│   │   └── seed.ts        # Seeding script
│   ├── middleware/
│   │   └── errorHandler.ts # Global error handling
│   └── types/
│       └── index.ts       # TypeScript type definitions
```

### Frontend Structure

```
frontend/
├── src/
│   ├── App.svelte         # Main app component
│   ├── lib/
│   │   ├── ChatWidget.svelte    # Main chat interface
│   │   ├── MessageBubble.svelte # Individual message component
│   │   ├── api.ts              # API client functions
│   │   └── types.ts            # TypeScript types
```

### Key Design Decisions

1. **Separation of Concerns**: Clean architecture with separate layers for routes, services, and data access
2. **Error Handling**: Centralized error handling with graceful fallbacks
3. **Session Management**: UUID-based sessions stored in localStorage for persistence
4. **Rate Limiting**: Built-in rate limiting to prevent API abuse
5. **LLM Abstraction**: Service layer abstraction makes it easy to swap LLM providers
6. **Input Validation**: Zod schema validation for API inputs
7. **Responsive Design**: Mobile-friendly chat interface

## API Endpoints

### POST /api/chat/message
Send a message and receive an AI response.

Request:
```json
{
  "message": "What is your return policy?",
  "sessionId": "uuid-string" // optional
}
```

Response:
```json
{
  "reply": "Our return policy allows...",
  "sessionId": "uuid-string"
}
```

### GET /api/chat/history/:sessionId
Retrieve conversation history for a session.

Response:
```json
{
  "conversationId": "uuid-string",
  "messages": [
    {
      "id": "uuid",
      "sender": "user",
      "text": "Hello",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "createdAt": "2024-01-01T00:00:00Z"
}
```

## LLM Configuration

The system uses Anthropic's Claude API by default. The LLM service includes:

- System prompt with store knowledge (shipping, returns, support hours)
- Conversation context (last 10 messages)
- Error handling for API failures
- Fallback responses when API is unavailable
- Token limits for cost control

To switch to OpenAI:
1. Install OpenAI SDK: `npm install openai`
2. Update `src/services/llm.ts` to use OpenAI client
3. Change environment variable to `OPENAI_API_KEY`

## Robustness Features

- **Input Validation**: Message length limits (2000 chars), non-empty validation
- **Error Recovery**: Graceful handling of LLM API failures with fallback responses
- **Rate Limiting**: Configurable request limits per time window
- **Database Connection Pooling**: Efficient connection management
- **Session Persistence**: Conversations survive page reloads
- **Network Error Handling**: Clean error messages for network failures

## Trade-offs & Future Improvements

### Current Trade-offs
- No authentication system (simplified for demo)
- Single-tenant design (no user isolation)
- Basic prompt engineering (could be more sophisticated)
- No Redis caching (using in-memory for simplicity)

### If I Had More Time...
1. **Enhanced Features**:
   - WebSocket support for real-time updates
   - File upload support for customer queries
   - Multi-language support
   - Analytics dashboard for conversation metrics

2. **Technical Improvements**:
   - Redis caching layer for frequently asked questions
   - Message queue for async processing
   - Comprehensive test suite
   - Docker containerization
   - CI/CD pipeline setup

3. **Security Enhancements**:
   - JWT-based authentication
   - Request signing
   - Content security policy headers
   - SQL injection prevention (already using parameterized queries)

4. **UX Improvements**:
   - Message reactions and feedback
   - Suggested responses/quick replies
   - Conversation export functionality
   - Dark mode support

## Development Commands

### Backend
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm run start` - Run production server
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed sample data

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run check` - Run Svelte type checking

## Testing

To test the application:

1. Send various messages to test AI responses
2. Reload the page to verify session persistence
3. Try edge cases (empty messages, very long messages)
4. Test error scenarios (disable network, invalid API key)
5. Verify rate limiting by sending many rapid requests

## License

MIT