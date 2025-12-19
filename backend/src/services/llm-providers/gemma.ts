import { GoogleGenerativeAI } from '@google/generative-ai';
import { Message } from '../../types';
import { ILLMProvider } from './types';
import { GEMMA_MODEL, PROVIDERS } from '../../constants';
import { AppError } from '../../middleware/errorHandler';

export class GemmaProvider implements ILLMProvider {
    public name = PROVIDERS.GEMMA;
    private client: GoogleGenerativeAI;
    private model: any;

    constructor(apiKey: string) {
        this.client = new GoogleGenerativeAI(apiKey);
        this.model = this.client.getGenerativeModel({ model: GEMMA_MODEL });
    }

    async generateReply(messages: Message[], userMessage: string, systemPrompt: string): Promise<string> {
        try {
            // Gemini's history format is { role: 'user' | 'model', parts: [{ text: string }] }
            // Initializing chat with system prompt behavior
            const chat = this.model.startChat({
                history: [
                    {
                        role: 'user',
                        parts: [{ text: `System Instruction: ${systemPrompt} ` }],
                    },
                    {
                        role: 'model',
                        parts: [{ text: 'Understood. I will follow these instructions.' }],
                    },
                    ...messages.slice(-10).map(m => ({
                        role: m.sender === 'user' ? 'user' : 'model',
                        parts: [{ text: m.text }]
                    }))
                ],
            });

            const result = await chat.sendMessage(userMessage);
            const response = await result.response;
            return response.text();
        } catch (error: any) {
            console.error('Gemma API error:', error);
            throw new AppError('Error communicating with Gemma API', 500, error.message);
        }
    }
}
