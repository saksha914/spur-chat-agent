import { Message } from '../types';
import { AppError } from '../middleware/errorHandler';
import { ILLMProvider } from './llm-providers/types';
import { AnthropicProvider } from './llm-providers/anthropic';
import { OpenAIProvider } from './llm-providers/openai';
import { GemmaProvider } from './llm-providers/gemma';

const STORE_KNOWLEDGE = `
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
`;

export class LLMService {
  private provider: ILLMProvider | null = null;

  constructor() {
    this.initializeProvider();
  }

  private initializeProvider() {
    // 1. Check for explicit preference
    const preferredProvider = process.env.LLM_PROVIDER;

    if (preferredProvider === 'gemma' && process.env.GEMMA_API_KEY) {
      this.provider = new GemmaProvider(process.env.GEMMA_API_KEY);
      console.log('Using Gemma (Google) AI Provider');
      return;
    }

    if (preferredProvider === 'openai' && process.env.OPENAI_API_KEY) {
      this.provider = new OpenAIProvider(process.env.OPENAI_API_KEY);
      console.log('Using OpenAI Provider');
      return;
    }

    if (preferredProvider === 'anthropic' && process.env.ANTHROPIC_API_KEY) {
      this.provider = new AnthropicProvider(process.env.ANTHROPIC_API_KEY);
      console.log('Using Anthropic Provider');
      return;
    }

    // 2. Auto-discovery (Priority: Gemma (Free tier) -> OpenAI -> Anthropic)
    if (process.env.GEMMA_API_KEY) {
      this.provider = new GemmaProvider(process.env.GEMMA_API_KEY);
      console.log('Using Gemma (Google) AI Provider (Auto-detected)');
      return;
    }

    if (process.env.OPENAI_API_KEY) {
      this.provider = new OpenAIProvider(process.env.OPENAI_API_KEY);
      console.log('Using OpenAI Provider (Auto-detected)');
      return;
    }

    if (process.env.ANTHROPIC_API_KEY) {
      this.provider = new AnthropicProvider(process.env.ANTHROPIC_API_KEY);
      console.log('Using Anthropic Provider (Auto-detected)');
      return;
    }

    console.warn('No valid AI API keys found. LLM features will be limited to fallback responses.');
  }

  async generateReply(
    messages: Message[],
    userMessage: string
  ): Promise<string> {
    if (!this.provider) {
      return this.getFallbackReply(userMessage);
    }

    try {
      return await this.provider.generateReply(messages, userMessage, STORE_KNOWLEDGE);
    } catch (error: any) {
      console.error('Provider error:', error);
      // Fallback if provider fails unexpectedly
      return this.getFallbackReply(userMessage);
    }
  }

  private getFallbackReply(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('return') || lowerMessage.includes('refund')) {
      return 'Our return policy allows returns within 30 days of purchase. Items must be in original condition. For specific help with your return, please email support@spurstore.com';
    }

    if (lowerMessage.includes('ship') || lowerMessage.includes('delivery')) {
      return 'We offer domestic shipping (3-5 days, $5) and international shipping (7-14 days). Free shipping on orders over $50 (domestic only). For tracking info, please email support@spurstore.com';
    }

    if (lowerMessage.includes('hours') || lowerMessage.includes('contact')) {
      return 'Our support hours are Mon-Fri 9AM-6PM EST, Sat 10AM-4PM EST. You can email us anytime at support@spurstore.com';
    }

    return 'I\'m currently unable to access the full support system. Please email support@spurstore.com or try again later. Our team will be happy to help!';
  }
}

export const llmService = new LLMService();