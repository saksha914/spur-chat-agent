export const API_CONFIG = {
    BASE_URL: '/api'
} as const;

export const UI_TEXT = {
    HEADER_TITLE: 'SpurStore Support',
    NEW_CHAT_BUTTON: 'New Chat',
    WELCOME_TITLE: 'Welcome to SpurStore Support!',
    WELCOME_SUBTITLE: 'How can I help you today?',
    PLACEHOLDER_INPUT: 'Type your message...',
    SEND_BUTTON: 'Send',
    SENDING_BUTTON: '...',
    CLEAR_CHAT_TOOLTIP: 'Clear chat'
} as const;

export const STORAGE_KEYS = {
    SESSION_ID: 'chatSessionId'
} as const;

export const SUGGESTIONS = [
    { label: 'Return policy?', text: 'What\'s your return policy?' },
    { label: 'International shipping?', text: 'Do you ship internationally?' },
    { label: 'Support hours?', text: 'What are your support hours?' }
] as const;

export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Network error',
    SEND_FAILED: 'Failed to send message',
    HISTORY_FAILED: 'Failed to fetch history'
} as const;
