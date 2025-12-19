const API_BASE = '/api';

export async function sendMessage(message: string, sessionId?: string | null) {
    const response = await fetch(`${API_BASE}/chat/message`, {
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
        const error = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(error.error || 'Failed to send message');
    }

    return response.json();
}

export async function getHistory(sessionId: string) {
    const response = await fetch(`${API_BASE}/chat/history/${sessionId}`);

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(error.error || 'Failed to fetch history');
    }

    return response.json();
}
