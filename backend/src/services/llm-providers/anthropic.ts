import Anthropic from '@anthropic-ai/sdk';
import { Message } from '../../types';
import { ILLMProvider } from './types';
import { AppError } from '../../middleware/errorHandler';

export class AnthropicProvider implements ILLMProvider {
    public name = 'anthropic';
    private client: Anthropic;

    constructor(apiKey: string) {
        this.client = new Anthropic({ apiKey });
    }

    async generateReply(messages: Message[], userMessage: string, systemPrompt: string): Promise<string> {
        try {
            const conversationHistory = messages
                .slice(-10)
                .map(m => `${m.sender === 'user' ? 'Customer' : 'Agent'}: ${m.text}`)
                .join('\n');

            const prompt = conversationHistory
                ? `Recent conversation:\n${conversationHistory}\n\nCustomer: ${userMessage}`
                : `Customer: ${userMessage}`;

            const response = await this.client.messages.create({
                model: 'claude-3-haiku-20240307',
                max_tokens: 500,
                temperature: 0.7,
                system: systemPrompt,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ]
            });

            if (response.content[0].type === 'text') {
                return response.content[0].text;
            }

            throw new Error('Unexpected response format from Anthropic');
        } catch (error: any) {
            console.error('Anthropic API error:', error);
            throw new AppError(error.message || 'Error communicating with Anthropic', error.status || 500);
        }
    }
}
