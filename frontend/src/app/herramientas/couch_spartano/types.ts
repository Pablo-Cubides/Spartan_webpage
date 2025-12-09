// Coach Espartano - Shared Types

export interface Coach {
    id: string;
    name: string;
    title: string;
    description: string;
    icon: string;
    color: string;
    welcomeVideo: string;
    welcomeShown: boolean;
    messageCount: number;
}

export interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface ProfileData {
    mainGoal: string;
    subGoals: string[];
    currentFocuses: string[];
    enabledCoaches: string[];
}

export interface CreditInfo {
    credits: number;
    messagesRemaining: number;
}

export interface CoachChatState {
    coaches: Coach[];
    selectedCoach: string | null;
    messages: Record<string, Message[]>;
    loading: boolean;
    credits: number;
    messagesRemaining: number;
    showWelcomeModal: boolean;
    showCreditsModal: boolean;
}
