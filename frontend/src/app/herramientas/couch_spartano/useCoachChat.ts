'use client';

// Coach Espartano - Custom Hook for Chat State Management

import { useState, useCallback } from 'react';
import { getTokenCookie } from '@/lib/api';
import type { Coach, Message, CreditInfo } from './types';

interface UseCoachChatReturn {
    // State
    coaches: Coach[];
    selectedCoach: string | null;
    messages: Record<string, Message[]>;
    loading: boolean;
    credits: number;
    messagesRemaining: number;
    showWelcomeModal: boolean;
    showCreditsModal: boolean;

    // Actions
    setCoaches: (coaches: Coach[]) => void;
    selectCoach: (id: string) => void;
    closeWelcomeModal: () => void;
    sendMessage: (content: string) => Promise<void>;
    setShowCreditsModal: (show: boolean) => void;
    updateCredits: (info: CreditInfo) => void;
    addFirstMessage: (coachId: string, message: string) => void;

    // Computed
    currentCoach: Coach | undefined;
    currentMessages: Message[];
}

export function useCoachChat(initialCoaches: Coach[]): UseCoachChatReturn {
    const [coaches, setCoaches] = useState<Coach[]>(initialCoaches);
    const [selectedCoach, setSelectedCoach] = useState<string | null>(null);
    const [messages, setMessages] = useState<Record<string, Message[]>>({});
    const [loading, setLoading] = useState(false);
    const [credits, setCredits] = useState(0);
    const [messagesRemaining, setMessagesRemaining] = useState(0);
    const [showWelcomeModal, setShowWelcomeModal] = useState(false);
    const [showCreditsModal, setShowCreditsModal] = useState(false);

    const currentCoach = coaches.find(c => c.id === selectedCoach);
    const currentMessages = selectedCoach ? (messages[selectedCoach] || []) : [];

    const selectCoach = useCallback((id: string) => {
        setSelectedCoach(id);
        const coach = coaches.find(c => c.id === id);
        if (coach && !coach.welcomeShown) {
            setShowWelcomeModal(true);
        }
    }, [coaches]);

    const closeWelcomeModal = useCallback(async () => {
        if (!selectedCoach) return;

        try {
            const token = getTokenCookie();
            await fetch('/herramientas/couch_spartano/api/welcome', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ coachType: selectedCoach })
            });

            // Update local state
            setCoaches(prev => prev.map(c =>
                c.id === selectedCoach ? { ...c, welcomeShown: true } : c
            ));
        } catch (error) {
            console.error('Error marking welcome shown:', error);
        }

        setShowWelcomeModal(false);
    }, [selectedCoach]);

    const sendMessage = useCallback(async (content: string) => {
        if (!selectedCoach || loading) return;

        // Add user message immediately
        setMessages(prev => ({
            ...prev,
            [selectedCoach]: [...(prev[selectedCoach] || []), { role: 'user' as const, content }]
        }));

        setLoading(true);

        try {
            const token = getTokenCookie();
            const res = await fetch('/herramientas/couch_spartano/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ coachType: selectedCoach, message: content })
            });

            const data = await res.json();

            if (res.status === 402) {
                setShowCreditsModal(true);
                // Remove the user message since it wasn't processed
                setMessages(prev => ({
                    ...prev,
                    [selectedCoach]: (prev[selectedCoach] || []).slice(0, -1)
                }));
                return;
            }

            if (!res.ok) {
                throw new Error(data.error || 'Chat error');
            }

            // Add assistant response
            setMessages(prev => ({
                ...prev,
                [selectedCoach]: [...(prev[selectedCoach] || []), { role: 'assistant' as const, content: data.response }]
            }));

            // Update credits
            if (data.credits) {
                setCredits(data.credits.remaining);
                setMessagesRemaining(data.credits.remaining * 5); // 5 messages per credit
            }
        } catch (err) {
            // Add error message
            setMessages(prev => ({
                ...prev,
                [selectedCoach]: [...(prev[selectedCoach] || []), {
                    role: 'assistant' as const,
                    content: `Error: ${err instanceof Error ? err.message : 'Conexión fallida'}`
                }]
            }));
        } finally {
            setLoading(false);
        }
    }, [selectedCoach, loading]);

    const updateCredits = useCallback((info: CreditInfo) => {
        setCredits(info.credits);
        setMessagesRemaining(info.messagesRemaining);
    }, []);

    const addFirstMessage = useCallback((coachId: string, message: string) => {
        setMessages(prev => ({
            ...prev,
            [coachId]: [{ role: 'assistant' as const, content: message }]
        }));
    }, []);

    return {
        // State
        coaches,
        selectedCoach,
        messages,
        loading,
        credits,
        messagesRemaining,
        showWelcomeModal,
        showCreditsModal,

        // Actions
        setCoaches,
        selectCoach,
        closeWelcomeModal,
        sendMessage,
        setShowCreditsModal,
        updateCredits,
        addFirstMessage,

        // Computed
        currentCoach,
        currentMessages,
    };
}
