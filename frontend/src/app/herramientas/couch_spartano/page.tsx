'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/firebase';
import { getTokenCookie } from '@/lib/api';
import ModalLogin from '@/components/ModalLogin';
import BuyCredits from '@/components/BuyCredits';
import { Breadcrumb } from '@/components/Breadcrumb';

// Types
interface Coach {
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

interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

interface ProfileData {
    mainGoal: string;
    subGoals: string[];
    currentFocuses: string[];
    enabledCoaches: string[];
}

// Placeholder video component - replace src when videos are ready
// Format: 16:9, 1080p
function VideoPlaceholder({ title, onComplete }: { title: string; onComplete: () => void }) {
    return (
        <div className="relative w-full aspect-video bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] rounded-xl overflow-hidden flex items-center justify-center">
            {/* Replace this src with actual video path when ready */}
            <video
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                onEnded={onComplete}
                poster="/Herramientas/Guerrero spartano.png"
            >
                {/* Placeholder - replace with actual video:
            /videos/coach-espartano/onboarding-welcome.mp4 */}
                <source src="" type="video/mp4" />
            </video>

            {/* Fallback overlay for when no video is available */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60">
                <div className="text-6xl mb-4">⚔️</div>
                <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
                <p className="text-[#ba9c9c] mb-6">Video de bienvenida próximamente</p>
                <button
                    onClick={onComplete}
                    className="px-6 py-3 bg-[#c20909] hover:bg-[#a00707] text-white font-bold rounded-lg transition-colors"
                >
                    Continuar
                </button>
            </div>
        </div>
    );
}

// Onboarding Flow Component
function OnboardingFlow({ onComplete }: { onComplete: (response: string, profile: ProfileData) => void }) {
    const [step, setStep] = useState<'video' | 'input' | 'processing'>('video');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (message.trim().length < 20) {
            setError('Por favor escribe con más detalle (mínimo 20 caracteres)');
            return;
        }

        setStep('processing');
        setError('');

        try {
            const token = getTokenCookie();
            const res = await fetch('/herramientas/couch_spartano/api/profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ message })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Error processing message');
            }

            onComplete(data.summaryResponse, data.profile);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error de conexión');
            setStep('input');
        }
    };

    if (step === 'video') {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <VideoPlaceholder title="Bienvenido al Spartan Club" onComplete={() => setStep('input')} />
            </div>
        );
    }

    if (step === 'processing') {
        return (
            <div className="max-w-2xl mx-auto p-6 text-center">
                <div className="animate-pulse">
                    <div className="text-6xl mb-6">⚔️</div>
                    <h2 className="text-2xl font-bold text-white mb-4">Analizando tu perfil...</h2>
                    <p className="text-[#ba9c9c]">Estamos creando tu plan de desarrollo personalizado</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-6">
            <div className="text-center mb-8">
                <div className="text-5xl mb-4">⚔️</div>
                <h1 className="text-3xl font-bold text-white mb-4">Bienvenido a Spartan Club</h1>
                <p className="text-[#ba9c9c] text-lg">
                    Para ayudarte de verdad, necesito conocerte. Responde en un solo mensaje:
                </p>
            </div>

            <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#333]">
                <p className="text-white font-semibold mb-4">
                    ¿Cómo sería tu vida ideal y qué quieres cambiar ahora?
                </p>
                <p className="text-[#888] text-sm mb-4">
                    💡 Te recomendamos responder con mucho detalle en un solo mensaje. Cuéntanos sobre tu situación actual,
                    tus metas, qué obstáculos enfrentas, y cómo te gustaría verte en el futuro.
                </p>

                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Por ejemplo: Tengo 28 años, trabajo en oficina y quiero mejorar mi físico, vestir mejor y ser más productivo. Actualmente no hago ejercicio y me cuesta organizarme. Mi vida ideal sería..."
                    className="w-full h-48 bg-[#0d0d0d] border border-[#444] rounded-lg p-4 text-white placeholder-[#666] resize-none focus:outline-none focus:border-[#c20909] transition-colors"
                />

                {error && (
                    <p className="text-red-500 text-sm mt-2">{error}</p>
                )}

                <button
                    onClick={handleSubmit}
                    disabled={message.trim().length < 20}
                    className="w-full mt-4 py-3 bg-[#c20909] hover:bg-[#a00707] disabled:bg-[#333] disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors"
                >
                    Comenzar mi Transformación
                </button>
            </div>
        </div>
    );
}

// Profile Summary Component
function ProfileSummary({ profile, summaryResponse, onContinue }: {
    profile: ProfileData;
    summaryResponse: string;
    onContinue: () => void;
}) {
    return (
        <div className="max-w-2xl mx-auto p-6">
            <div className="text-center mb-8">
                <div className="text-5xl mb-4">🎯</div>
                <h1 className="text-2xl font-bold text-white mb-4">Tu Perfil Spartan</h1>
            </div>

            <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#333] mb-6">
                <p className="text-white whitespace-pre-wrap">{summaryResponse}</p>
            </div>

            <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#333] mb-6">
                <h3 className="text-lg font-bold text-white mb-4">Tus Focos Spartan</h3>
                <div className="flex flex-wrap gap-2">
                    {profile.currentFocuses.map((focus, idx) => (
                        <span key={idx} className="px-3 py-1 bg-[#c20909]/20 text-[#ff6666] rounded-full text-sm">
                            {focus}
                        </span>
                    ))}
                </div>
            </div>

            <button
                onClick={onContinue}
                className="w-full py-3 bg-[#c20909] hover:bg-[#a00707] text-white font-bold rounded-lg transition-colors"
            >
                Ir al Chat con mi Coach
            </button>
        </div>
    );
}

// Coach Sidebar Component
function CoachSidebar({ coaches, selectedCoach, onSelectCoach }: {
    coaches: Coach[];
    selectedCoach: string | null;
    onSelectCoach: (id: string) => void;
}) {
    return (
        <div className="w-64 bg-[#111] border-r border-[#333] flex flex-col">
            <div className="p-4 border-b border-[#333]">
                <h2 className="text-white font-bold flex items-center gap-2">
                    <span>⚔️</span> Tus Coaches
                </h2>
            </div>
            <div className="flex-1 overflow-y-auto">
                {coaches.map((coach) => (
                    <button
                        key={coach.id}
                        onClick={() => onSelectCoach(coach.id)}
                        className={`w-full p-4 text-left border-b border-[#222] transition-colors ${selectedCoach === coach.id
                            ? 'bg-[#c20909]/20 border-l-2 border-l-[#c20909]'
                            : 'hover:bg-[#1a1a1a]'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">{coach.icon}</span>
                            <div>
                                <p className="text-white font-medium text-sm">{coach.name}</p>
                                <p className="text-[#888] text-xs">{coach.messageCount} mensajes</p>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}

// Coach Welcome Modal
function CoachWelcomeModal({ coach, onClose }: { coach: Coach; onClose: () => void }) {
    const markWelcomeShown = async () => {
        try {
            const token = getTokenCookie();
            await fetch('/herramientas/couch_spartano/api/welcome', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ coachType: coach.id })
            });
        } catch (err) {
            console.error('Error marking welcome shown:', err);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-3xl bg-[#1a1a1a] rounded-xl overflow-hidden">
                <button
                    onClick={markWelcomeShown}
                    className="absolute top-4 right-4 text-white/60 hover:text-white z-10"
                >
                    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="p-6">
                    <VideoPlaceholder title={coach.title} onComplete={markWelcomeShown} />
                </div>
            </div>
        </div>
    );
}

// Chat Messages Component
function ChatMessages({ messages, loading }: { messages: Message[]; loading: boolean }) {
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
                <div className="text-center text-[#666] py-12">
                    <p>Envía un mensaje para comenzar la conversación</p>
                </div>
            )}

            {messages.map((msg, idx) => (
                <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                    <div
                        className={`max-w-[80%] rounded-xl px-4 py-3 ${msg.role === 'user'
                            ? 'bg-[#c20909] text-white'
                            : msg.role === 'system'
                                ? 'bg-[#333] text-[#ccc] italic'
                                : 'bg-[#1a1a1a] text-white border border-[#333]'
                            }`}
                    >
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                </div>
            ))}

            {loading && (
                <div className="flex justify-start">
                    <div className="bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3">
                        <div className="flex gap-1">
                            <span className="w-2 h-2 bg-[#666] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-2 h-2 bg-[#666] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-2 h-2 bg-[#666] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                </div>
            )}

            <div ref={endRef} />
        </div>
    );
}

// Chat Input Component
function ChatInput({ onSend, disabled }: { onSend: (message: string) => void; disabled: boolean }) {
    const [input, setInput] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !disabled) {
            onSend(input.trim());
            setInput('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 border-t border-[#333]">
            <div className="flex gap-3">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmit(e);
                        }
                    }}
                    placeholder={disabled ? 'Procesando...' : 'Escribe tu mensaje...'}
                    disabled={disabled}
                    className="flex-1 bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-3 text-white placeholder-[#666] resize-none focus:outline-none focus:border-[#c20909] transition-colors disabled:opacity-50"
                    rows={1}
                />
                <button
                    type="submit"
                    disabled={disabled || !input.trim()}
                    className="px-6 py-3 bg-[#c20909] hover:bg-[#a00707] disabled:bg-[#333] disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors"
                >
                    Enviar
                </button>
            </div>
        </form>
    );
}

// Credit Status Display
function CreditStatus({ credits, messagesRemaining }: { credits: number; messagesRemaining: number }) {
    return (
        <div className="px-4 py-2 bg-[#0d0d0d] border-b border-[#333]">
            <div className="flex items-center justify-between text-sm">
                <span className="text-[#888]">
                    Créditos: <span className="text-white font-medium">{credits}</span>
                </span>
                <span className="text-[#888]">
                    Mensajes disponibles: <span className="text-white font-medium">{messagesRemaining}</span>
                </span>
            </div>
            <p className="text-[#555] text-xs mt-1 flex items-center gap-1">
                <span>🔒</span>
                Tus conversaciones se almacenan cifradas. Nadie del equipo lee tus chats.
            </p>
        </div>
    );
}

// Main Chat View
function ChatView({ coaches: initialCoaches }: { coaches: Coach[] }) {
    const [coaches, setCoaches] = useState<Coach[]>(initialCoaches);
    const [selectedCoach, setSelectedCoach] = useState<string | null>(initialCoaches[0]?.id || null);
    const [messages, setMessages] = useState<Record<string, Message[]>>({});
    const [loading, setLoading] = useState(false);
    const [showWelcome, setShowWelcome] = useState<Coach | null>(null);
    const [credits, setCredits] = useState({ credits: 0, messagesRemaining: 0 });
    const [showCreditsModal, setShowCreditsModal] = useState(false);

    const currentCoach = coaches.find(c => c.id === selectedCoach);
    const currentMessages = selectedCoach ? messages[selectedCoach] || [] : [];

    // Check if we need to show welcome for selected coach
    useEffect(() => {
        if (currentCoach && !currentCoach.welcomeShown) {
            setShowWelcome(currentCoach);
        }
    }, [currentCoach]);

    const handleSelectCoach = (id: string) => {
        setSelectedCoach(id);
    };

    const handleWelcomeClose = () => {
        if (showWelcome) {
            setCoaches(prev => prev.map(c =>
                c.id === showWelcome.id ? { ...c, welcomeShown: true } : c
            ));
        }
        setShowWelcome(null);
    };

    const sendMessage = async (content: string) => {
        if (!selectedCoach) return;

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
                setMessages(prev => ({
                    ...prev,
                    [selectedCoach]: [...(prev[selectedCoach] || []), {
                        role: 'system' as const,
                        content: 'No tienes créditos suficientes. Compra más créditos para continuar.'
                    }]
                }));
                return;
            }

            if (!res.ok) {
                throw new Error(data.error || 'Error sending message');
            }

            // Add assistant response
            setMessages(prev => ({
                ...prev,
                [selectedCoach]: [...(prev[selectedCoach] || []), {
                    role: 'assistant' as const,
                    content: data.response
                }]
            }));

            // Update credits
            if (data.credits) {
                setCredits({
                    credits: data.credits.remaining,
                    messagesRemaining: data.credits.remaining * 5 // 5 messages per credit
                });
            }
        } catch (err) {
            setMessages(prev => ({
                ...prev,
                [selectedCoach]: [...(prev[selectedCoach] || []), {
                    role: 'system' as const,
                    content: `Error: ${err instanceof Error ? err.message : 'Conexión fallida'}`
                }]
            }));
        } finally {
            setLoading(false);
        }
    };

    // If coach is first opening after welcome, show coach's first message
    useEffect(() => {
        const loadFirstMessage = async () => {
            if (selectedCoach && currentMessages.length === 0 && currentCoach?.welcomeShown) {
                // Load first message from coach config
                try {
                    const coachConfig = await import('@/lib/coach-espartano/config/coaches.config');
                    const config = coachConfig.COACHES[selectedCoach as keyof typeof coachConfig.COACHES];
                    if (config?.firstMessage) {
                        setMessages(prev => ({
                            ...prev,
                            [selectedCoach]: [{ role: 'assistant' as const, content: config.firstMessage }]
                        }));
                    }
                } catch (err) {
                    console.error('Error loading coach first message:', err);
                }
            }
        };
        loadFirstMessage();
    }, [selectedCoach, currentMessages.length, currentCoach?.welcomeShown]);

    return (
        <div className="flex h-[calc(100vh-120px)]">
            {/* Credits Modal */}
            {showCreditsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="relative w-full max-w-4xl bg-white rounded-xl overflow-hidden">
                        <button
                            onClick={() => setShowCreditsModal(false)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 z-10"
                        >
                            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <div className="max-h-[90vh] overflow-y-auto">
                            <BuyCredits />
                        </div>
                    </div>
                </div>
            )}

            {/* Welcome Modal */}
            {showWelcome && (
                <CoachWelcomeModal coach={showWelcome} onClose={handleWelcomeClose} />
            )}

            {/* Sidebar */}
            <CoachSidebar
                coaches={coaches}
                selectedCoach={selectedCoach}
                onSelectCoach={handleSelectCoach}
            />

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                {currentCoach && (
                    <div className="p-4 border-b border-[#333] flex items-center gap-3">
                        <span className="text-3xl">{currentCoach.icon}</span>
                        <div>
                            <h2 className="text-white font-bold">{currentCoach.title}</h2>
                            <p className="text-[#888] text-sm">{currentCoach.description}</p>
                        </div>
                    </div>
                )}

                <CreditStatus credits={credits.credits} messagesRemaining={credits.messagesRemaining} />
                <ChatMessages messages={currentMessages} loading={loading} />
                <ChatInput onSend={sendMessage} disabled={loading} />
            </div>
        </div>
    );
}

// Main Page Component
export default function CoachEspartanoPage() {
    const { user, loading: authLoading } = useAuth();
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [pageState, setPageState] = useState<'loading' | 'onboarding' | 'summary' | 'chat'>('loading');
    const [coaches, setCoaches] = useState<Coach[]>([]);
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [summaryResponse, setSummaryResponse] = useState('');

    // Check user profile status
    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            setShowLoginModal(true);
            setPageState('loading');
            return;
        }

        // Fetch profile and coaches
        const fetchData = async () => {
            try {
                const token = getTokenCookie();
                const res = await fetch('/herramientas/couch_spartano/api/coaches', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                const data = await res.json();

                if (!data.hasProfile || !data.onboardingDone) {
                    setPageState('onboarding');
                } else {
                    setCoaches(data.coaches);
                    setPageState('chat');
                }
            } catch (err) {
                console.error('Error fetching data:', err);
                setPageState('onboarding');
            }
        };

        fetchData();
    }, [user, authLoading]);

    const handleOnboardingComplete = async (response: string, profileData: ProfileData) => {
        setSummaryResponse(response);
        setProfile(profileData);
        setPageState('summary');
    };

    const handleContinueToChat = async () => {
        // Refresh coaches list
        try {
            const token = getTokenCookie();
            const res = await fetch('/herramientas/couch_spartano/api/coaches', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setCoaches(data.coaches);
        } catch (err) {
            console.error('Error fetching coaches:', err);
        }
        setPageState('chat');
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            <ModalLogin open={showLoginModal} onClose={() => setShowLoginModal(false)} />

            {/* Breadcrumb */}
            <div className="px-4 md:px-8 py-4">
                <Breadcrumb items={[
                    { label: 'Inicio', href: '/' },
                    { label: 'Herramientas', href: '/herramientas' },
                    { label: 'Coach Espartano', href: '/herramientas/couch_spartano', current: true },
                ]} />
            </div>

            {pageState === 'loading' && (
                <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                        <div className="text-5xl mb-4 animate-pulse">⚔️</div>
                        <p className="text-[#888]">Cargando...</p>
                    </div>
                </div>
            )}

            {pageState === 'onboarding' && (
                <OnboardingFlow onComplete={handleOnboardingComplete} />
            )}

            {pageState === 'summary' && profile && (
                <ProfileSummary
                    profile={profile}
                    summaryResponse={summaryResponse}
                    onContinue={handleContinueToChat}
                />
            )}

            {pageState === 'chat' && coaches.length > 0 && (
                <ChatView coaches={coaches} />
            )}
        </div>
    );
}
