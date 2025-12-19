# Spur AI Live Chat Agent

## 1. Approach
This project implements a full-stack AI chat agent using a **React** (Vite + TypeScript) frontend and a **Node.js** (Express + TypeScript) backend.

-   **Frontend**: Handles real-time user interaction, state management, and optimistic UI updates. It maintains a consistent chat history using persistent sessions.
-   **Backend**: Manages API endpoints (`/api/chat/message`, `/api/chat/history`), validates inputs with Zod, and persists conversations in **PostgreSQL**.
-   **AI Integration**: Features a provider-agnostic `LLMService` that supports **Google Gemma**, **OpenAI**, and **Anthropic**. It automatically selects the best available provider based on your environment keys, with fallback logic for rate limits and errors. The system uses a persistent "Store Knowledge" system prompt to maintain persona and context.

## 2. Prompt Used

The following system prompt (`STORE_KNOWLEDGE`) is injected into every LLM request to define the agent's persona and knowledge base:

```text
You are a helpful support agent for SpurStore, a small e-commerce store. Here's what you need to know:

**Shipping Policy:**
- Domestic shipping: 3-5 business days, $5 flat rate
- International shipping: 7-14 business days, varies by destination
- Free shipping on orders over $50 (domestic only)
- We ship worldwide except to sanctioned countries

**Return/Refund Policy:**
- 30-day return window from delivery date
- Items must be unused and in original packaging
- Customer pays return shipping unless item is defective
- Refunds processed within 5-7 business days after receipt
- Exchanges available for different sizes/colors

**Support Hours:**
- Monday-Friday: 9 AM - 6 PM EST
- Saturday: 10 AM - 4 PM EST
- Sunday: Closed
- Email support available 24/7 with 24-hour response time

**Store Information:**
- We sell premium lifestyle products
- All products come with 1-year warranty
- Gift wrapping available for $3
- Loyalty program: Earn 1 point per $1 spent, 100 points = $5 off

Answer customer questions clearly and concisely. Be friendly and professional.
If you don't know something specific, acknowledge that and offer to connect them with a human agent.
```

## 3. How to Configure Env

1.  Navigate to the `backend` folder.
2.  Create a `.env` file (you can copy `.env.example`).
3.  Add at least one AI API key.

**Recommended (Free): Google Gemma**
```bash
# Priority: LLM_PROVIDER > Gemma > OpenAI > Anthropic
LLM_PROVIDER=gemma
GEMMA_API_KEY=your_google_aistudio_key
```

**Alternative: OpenAI**
```bash
LLM_PROVIDER=openai
OPENAI_API_KEY=your_openai_key
```

## 4. How to Start Server

**Backend**
```bash
cd backend
npm install
# Database is auto-configured (SQLite)
npm run db:migrate  # Initialize chat.db
npm run dev         # Start server on http://localhost:3000
```

**Frontend**
```bash
cd frontend
npm install
npm run dev         # Start frontend on http://localhost:5173
```