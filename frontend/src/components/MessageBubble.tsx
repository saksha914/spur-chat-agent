import React from 'react';
import type { Message } from '../types';
import './MessageBubble.css';

interface MessageBubbleProps {
    message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
    return (
        <div className={`message ${message.sender}`}>
            <div className="bubble">
                <div className="text">{message.text}</div>
                {message.timestamp && (
                    <div className="timestamp">
                        {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                )}
            </div>
        </div>
    );
};
