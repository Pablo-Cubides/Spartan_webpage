'use client';

// ChatInterface Component - Main chat area with messages and input

import { useState, useRef, useEffect } from 'react';
import type { Message, Coach } from '../types';

interface ChatInterfaceProps {
    coach: Coach | undefined;
    messages: Message[];
    loading: boolean;
    onSendMessage: (message: string) => void;
    disabled?: boolean;
}

export function ChatInterface({ coach, messages, loading, onSendMessage, disabled }: ChatInterfaceProps) {
    if (!coach) {
        return (
            <div className="flex-1 flex items-center justify-center bg-[#0f0f0f] rounded-lg border border-gray-800">
                <div className="text-center p-8">
                    <p className="text-2xl mb-2">👈</p>
                    <p className="text-gray-400">Selecciona un coach para comenzar</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-[#0f0f0f] rounded-lg border border-gray-800 overflow-hidden">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-800 flex items-center gap-3">
                <span className="text-3xl">{coach.icon}</span>
                <div>
                    <h3 className="text-white font-bold">{coach.name}</h3>
                    <p className="text-gray-500 text-sm">{coach.title}</p>
                </div>
            </div>

            {/* Messages */}
            <ChatMessages messages={messages} loading={loading} />

            {/* Input */}
            <ChatInput onSend={onSendMessage} disabled={disabled || loading} />
        </div>
    );
}

// Chat Messages Component
function ChatMessages({ messages, loading }: { messages: Message[]; loading: boolean }) {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && !loading && (
                <div className="text-center text-gray-500 py-8">
                    <p>¡Comienza la conversación!</p>
                </div>
            )}

            {messages.map((msg, i) => (
                <div
                    key={i}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                    <div
                        className={`max-w-[80%] p-4 rounded-2xl whitespace-pre-wrap ${msg.role === 'user'
                                ? 'bg-[#D32F2F] text-white rounded-br-none'
                                : 'bg-[#1a1a1a] text-gray-200 rounded-bl-none border border-gray-800'
                            }`}
                    >
                        {msg.content}
                    </div>
                </div>
            ))}

            {loading && (
                <div className="flex justify-start">
                    <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl rounded-bl-none p-4">
                        <div className="flex gap-1">
                            <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                </div>
            )}

            <div ref={messagesEndRef} />
        </div>
    );
}

// Chat Input Component
function ChatInput({ onSend, disabled }: { onSend: (message: string) => void; disabled: boolean }) {
    const [input, setInput] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !disabled) {
            onSend(input.trim());
            setInput('');
        }
    };

    useEffect(() => {
        if (!disabled) {
            inputRef.current?.focus();
        }
    }, [disabled]);

    return (
        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-800">
            <div className="flex gap-3">
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={disabled ? 'Espera la respuesta...' : 'Escribe tu mensaje...'}
                    disabled={disabled}
                    className="flex-1 bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-[#D32F2F] focus:border-transparent disabled:opacity-50"
                />
                <button
                    type="submit"
                    disabled={disabled || !input.trim()}
                    className="bg-[#D32F2F] hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold px-6 py-3 rounded-lg transition-colors"
                >
                    Enviar
                </button>
            </div>
        </form>
    );
}
