export interface Message {
    id?: string;
    sender: 'user' | 'ai';
    text: string;
    timestamp?: string;
}

export interface ChatState {
    messages: Message[];
    sessionId: string | null;
    isLoading: boolean;
    error: string | null;
}
