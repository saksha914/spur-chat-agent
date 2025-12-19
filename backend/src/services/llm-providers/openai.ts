import OpenAI from 'openai';
import { Message } from '../../types';
import { ILLMProvider } from './types';
import { OPENAI_MODEL, PROVIDERS } from '../../constants';
import { AppError } from '../../middleware/errorHandler';

export class OpenAIProvider implements ILLMProvider {
    public name = PROVIDERS.OPENAI;
    private client: OpenAI;

    constructor(apiKey: string) {
        this.client = new OpenAI({ apiKey });
    }

    async generateReply(messages: Message[], userMessage: string, systemPrompt: string): Promise<string> {
        try {
            const formattedMessages: any[] = [
                { role: 'system', content: systemPrompt },
                ...messages.slice(-10).map(m => ({
                    role: m.sender === 'user' ? 'user' : 'assistant',
                    content: m.text
                })),
                { role: 'user', content: userMessage }
            ];

            const response = await this.client.chat.completions.create({
                model: OPENAI_MODEL,
                messages: formattedMessages,
                max_tokens: 500,
                temperature: 0.7,
            });

            return response.choices[0].message.content || 'I could not generate a response.';
        } catch (error: any) {
            console.error('OpenAI API error:', error);
            throw new AppError(error.message || 'Error communicating with OpenAI', error.status || 500);
        }
    }
}
