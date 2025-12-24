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
    showLoginModal: boolean;

    // Actions
    setCoaches: (coaches: Coach[]) => void;
    selectCoach: (id: string) => void;
    closeWelcomeModal: () => void;
    sendMessage: (content: string) => Promise<void>;
    setShowCreditsModal: (show: boolean) => void;
    setShowLoginModal: (show: boolean) => void;
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
    const [showLoginModal, setShowLoginModal] = useState(false);

    const [historyLoading, setHistoryLoading] = useState(false);

    const currentCoach = coaches.find(c => c.id === selectedCoach);
    const currentMessages = selectedCoach ? (messages[selectedCoach] || []) : [];

    // Helper to fetch history
    const fetchHistory = useCallback(async (coachId: string) => {
        // Don't fetch if we already have messages (except the first welcome message)
        if (messages[coachId] && messages[coachId].length > 1) return;

        setHistoryLoading(true);
        try {
            const token = getTokenCookie();
            // Validar que el token exista antes de hacer la petición
            if (!token) {
                console.log("No auth token, skipping history fetch");
                return;
            }

            const res = await fetch(`/herramientas/couch_spartano/api/chat/history?coachType=${coachId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                if (data.messages && data.messages.length > 0) {
                    setMessages(prev => ({
                        ...prev,
                        [coachId]: data.messages
                    }));
                }
            }
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setHistoryLoading(false);
        }
    }, [messages]);

    const selectCoach = useCallback((id: string) => {
        setSelectedCoach(id);
        const coach = coaches.find(c => c.id === id);

        // Fetch history immediately
        fetchHistory(id);

        // For 'general' coach: no welcome video needed, mark as shown immediately
        if (id === 'general') {
            // Auto-mark as shown for general coach
            if (coach && !coach.welcomeShown) {
                setCoaches(prev => prev.map(c =>
                    c.id === 'general' ? { ...c, welcomeShown: true } : c
                ));
            }
            return;
        }

        // For other coaches: show welcome modal if not already shown
        if (coach && !coach.welcomeShown) {
            setShowWelcomeModal(true);
        }
    }, [coaches, fetchHistory]);

    const closeWelcomeModal = useCallback(async () => {
        if (!selectedCoach) return;

        // First close the modal to give immediate feedback
        setShowWelcomeModal(false);

        // Then update the coach state to mark welcome as shown
        setCoaches(prev => prev.map(c =>
            c.id === selectedCoach ? { ...c, welcomeShown: true } : c
        ));

        // Persist to backend (fire and forget)
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
        } catch (error) {
            console.error('Error marking welcome shown:', error);
            // Don't revert - user experience is more important
        }
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

            // Handle 401 - session expired, show login modal
            if (res.status === 401) {
                setShowLoginModal(true);
                // Remove the user message since it wasn't processed
                setMessages(prev => ({
                    ...prev,
                    [selectedCoach]: (prev[selectedCoach] || []).slice(0, -1)
                }));
                return;
            }

            // Handle 402 - no credits, show credits modal
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
        showLoginModal,

        // Actions
        setCoaches,
        selectCoach,
        closeWelcomeModal,
        sendMessage,
        setShowCreditsModal,
        setShowLoginModal,
        updateCredits,
        addFirstMessage,

        // Computed
        currentCoach,
        currentMessages,
    };
}
