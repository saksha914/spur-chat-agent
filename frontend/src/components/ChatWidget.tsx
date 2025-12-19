import React, { useState, useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { sendMessage, getHistory } from '../api';
import type { Message } from '../types';
import './ChatWidget.css';

export const ChatWidget: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [inputValue, setInputValue] = useState('');

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 50);
    };

    useEffect(() => {
        const storedSessionId = localStorage.getItem('chatSessionId');
        if (storedSessionId) {
            loadHistory(storedSessionId);
        }
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const loadHistory = async (sid: string) => {
        try {
            const data = await getHistory(sid);
            const historyMessages = data.messages.map((m: any) => ({
                id: m.id,
                sender: m.sender,
                text: m.text,
                timestamp: m.createdAt
            }));
            setMessages(historyMessages);
            setSessionId(sid);
        } catch (err) {
            console.error('Failed to load history:', err);
        }
    };

    const handleSend = async () => {
        const message = inputValue.trim();
        if (!message || isLoading) return;

        setError(null);

        const userMessage: Message = {
            sender: 'user',
            text: message,
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const response = await sendMessage(message, sessionId);

            const aiMessage: Message = {
                sender: 'ai',
                text: response.reply,
                timestamp: new Date().toISOString()
            };

            setMessages(prev => [...prev, aiMessage]);
            setSessionId(response.sessionId);
            localStorage.setItem('chatSessionId', response.sessionId);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to send message');
            setMessages(prev => prev.slice(0, -1)); // Remove failed message
        } finally {
            setIsLoading(false);
            inputRef.current?.focus();
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSend();
        }
    };

    const clearChat = () => {
        setMessages([]);
        setSessionId(null);
        setError(null);
        localStorage.removeItem('chatSessionId');
    };

    const handleSuggestion = (text: string) => {
        setInputValue(text);
    };

    return (
        <div className="chat-widget">
            <div className="header">
                <h3>SpurStore Support</h3>
                <button className="clear-btn" onClick={clearChat} title="Clear chat">
                    New Chat
                </button>
            </div>

            <div className="messages">
                {messages.length === 0 && (
                    <div className="welcome">
                        <h4>Welcome to SpurStore Support!</h4>
                        <p>How can I help you today?</p>
                        <div className="suggestions">
                            <button onClick={() => handleSuggestion("What's your return policy?")}>
                                Return policy?
                            </button>
                            <button onClick={() => handleSuggestion("Do you ship internationally?")}>
                                International shipping?
                            </button>
                            <button onClick={() => handleSuggestion("What are your support hours?")}>
                                Support hours?
                            </button>
                        </div>
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <MessageBubble key={msg.id || idx} message={msg} />
                ))}

                {isLoading && (
                    <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                )}

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="input-area">
                <input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    disabled={isLoading}
                    maxLength={2000}
                />
                <button
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isLoading}
                    className="send-btn"
                >
                    {isLoading ? '...' : 'Send'}
                </button>
            </div>
        </div>
    );
};
