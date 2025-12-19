import { Message } from '../../types';

export interface ILLMProvider {
    name: string;
    generateReply(messages: Message[], userMessage: string, systemPrompt: string): Promise<string>;
}
