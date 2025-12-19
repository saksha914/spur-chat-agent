import { Message } from '../types';
import { AppError } from '../middleware/errorHandler';
import { ILLMProvider } from './llm-providers/types';
import { AnthropicProvider } from './llm-providers/anthropic';
import { OpenAIProvider } from './llm-providers/openai';
import { GemmaProvider } from './llm-providers/gemma';
import { STORE_KNOWLEDGE, FALLBACK_RESPONSES, PROVIDERS } from '../constants';

export class LLMService {
  private provider: ILLMProvider | null = null;

  constructor() {
    this.initializeProvider();
  }

  private initializeProvider() {
    // 1. Check for explicit preference
    const preferredProvider = process.env.LLM_PROVIDER;

    if (preferredProvider === PROVIDERS.GEMMA && process.env.GEMMA_API_KEY) {
      this.provider = new GemmaProvider(process.env.GEMMA_API_KEY);
      console.log('Using Gemma (Google) AI Provider');
      return;
    }

    if (preferredProvider === PROVIDERS.OPENAI && process.env.OPENAI_API_KEY) {
      this.provider = new OpenAIProvider(process.env.OPENAI_API_KEY);
      console.log('Using OpenAI Provider');
      return;
    }

    if (preferredProvider === PROVIDERS.ANTHROPIC && process.env.ANTHROPIC_API_KEY) {
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
      return FALLBACK_RESPONSES.RETURN_POLICY;
    }

    if (lowerMessage.includes('ship') || lowerMessage.includes('delivery')) {
      return FALLBACK_RESPONSES.SHIPPING_INFO;
    }

    if (lowerMessage.includes('hours') || lowerMessage.includes('contact')) {
      return FALLBACK_RESPONSES.SUPPORT_HOURS;
    }

    return FALLBACK_RESPONSES.GENERIC_ERROR;
  }
}

export const llmService = new LLMService();