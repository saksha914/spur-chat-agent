import { API_CONFIG, ERROR_MESSAGES } from './constants';

export async function sendMessage(message: string, sessionId?: string | null) {
    const response = await fetch(`${API_CONFIG.BASE_URL}/chat/message`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            message,
            sessionId: sessionId || undefined
        }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: ERROR_MESSAGES.NETWORK_ERROR }));
        throw new Error(error.error || ERROR_MESSAGES.SEND_FAILED);
    }

    return response.json();
}

export async function getHistory(sessionId: string) {
    const response = await fetch(`${API_CONFIG.BASE_URL}/chat/history/${sessionId}`);

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: ERROR_MESSAGES.NETWORK_ERROR }));
        throw new Error(error.error || ERROR_MESSAGES.HISTORY_FAILED);
    }

    return response.json();
}
