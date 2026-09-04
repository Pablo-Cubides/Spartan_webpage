"use client";

// Coach Triarvon - Main Page
// Refactored: Logic moved to useCoachChat hook, UI to separate components

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/firebase";
import { getTokenCookie } from "@/lib/api";
import ModalLogin from "@/components/ModalLogin";
import BuyCredits from "@/components/BuyCredits";
import { Breadcrumb } from "@/components/Breadcrumb";

import { useCoachChat } from "./useCoachChat";
import { COACHES } from "@/lib/coach-triarvon/config/coaches.config";
import type { ProfileData } from "./types";

import {
  OnboardingFlow,
  ProfileSummary,
  CoachSidebar,
  ChatInterface,
  CreditStatus,
  CoachWelcomeModal,
} from "./components";

type PageState =
  "loading" | "video" | "onboarding" | "profile-summary" | "chat";

export default function CoachTriarvonPage() {
  const { user, loading: authLoading } = useAuth();
  const [pageState, setPageState] = useState<PageState>("loading");
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [summaryResponse, setSummaryResponse] = useState("");

  // Initialize coach chat hook with empty coaches (will be populated after fetch)
  const chatState = useCoachChat([]);

  // Fetch profile and coaches on mount
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      // Video skipping logic: check localStorage
      const videoWatched = localStorage.getItem("coach_video_watched");
      if (videoWatched) {
        setPageState("chat");
      } else {
        setPageState("video");
      }

      // Initialize with default coach for unauthenticated users
      const defaultCoaches = [
        {
          id: "general",
          name: "Coach Triarvon",
          title: "Coach General",
          description: "Tu coach personal para transformación integral",
          icon: "⚔️",
          color: "#D32F2F",
          welcomeVideo: "/Herramientas/Videos/onboarding-welcome.mp4",
          welcomeShown: true,
          messageCount: 0,
        },
      ];
      chatState.setCoaches(defaultCoaches);
      chatState.selectCoach("general");
      return;
    }

    const fetchData = async () => {
      try {
        const token = getTokenCookie();
        const res = await fetch("/herramientas/couch_triarvono/api/coaches", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (!data.hasProfile || !data.onboardingDone) {
          setPageState("onboarding");
          return;
        }

        // Initialize coaches in hook
        const coaches = data.coaches || [];
        chatState.setCoaches(coaches);
        chatState.updateCredits({
          credits: data.credits || 5,
          messagesRemaining: (data.credits || 5) * 5,
        });

        // Auto-select the general coach (main coach) if available
        const generalCoach = coaches.find(
          (c: { id: string }) => c.id === "general",
        );
        if (generalCoach) {
          chatState.selectCoach("general");
        }

        setPageState("chat");
      } catch (error) {
        console.error("Error fetching data:", error);
        setPageState("onboarding");
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  // Load first message when coach is selected and welcome flow is complete
  useEffect(() => {
    if (!chatState.selectedCoach || !chatState.currentCoach) return;

    // Skip if messages already loaded
    if (chatState.currentMessages.length > 0) return;

    // For 'general' coach, no welcome modal needed - load first message immediately
    // For other coaches, wait until welcome has been shown
    const isGeneralCoach = chatState.selectedCoach === "general";
    const welcomeComplete =
      isGeneralCoach || chatState.currentCoach.welcomeShown;

    if (!welcomeComplete) return;

    // Get coach config for first message
    const coachConfig =
      COACHES[chatState.selectedCoach as keyof typeof COACHES];
    if (coachConfig?.firstMessage) {
      chatState.addFirstMessage(
        chatState.selectedCoach,
        coachConfig.firstMessage,
      );
    }
  }, [
    chatState.selectedCoach,
    chatState.currentCoach,
    chatState.currentCoach?.welcomeShown,
    chatState.currentMessages.length,
    chatState,
  ]);

  // Handle onboarding completion
  const handleOnboardingComplete = (response: string, profile: ProfileData) => {
    setSummaryResponse(response);
    setProfileData(profile);
    setPageState("profile-summary");
  };

  // Handle continue to chat after profile summary
  const handleContinueToChat = async () => {
    try {
      const token = getTokenCookie();
      const res = await fetch("/herramientas/couch_triarvono/api/coaches", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      chatState.setCoaches(data.coaches || []);
      chatState.updateCredits({
        credits: data.credits || 5,
        messagesRemaining: (data.credits || 5) * 5,
      });
      setPageState("chat");
    } catch (error) {
      console.error("Error fetching coaches:", error);
    }
  };

  // Handle handling video completion
  const handleVideoComplete = () => {
    localStorage.setItem("coach_video_watched", "true");
    setPageState("chat");
  };

  // Handle edit profile from sidebar
  const handleEditProfile = async () => {
    // Fetch latest profile data
    try {
      const token = getTokenCookie();
      const res = await fetch("/api/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.triarvonProfile) {
        // Use a specialized edit mode or reuse onboarding with pre-filled?
        // For now, simple re-onboarding. Better would be a dedicated settings modal.
        // Retrigger onboarding flow but we need to populate it.
        // Given the complexity, let's just go to onboarding state, ensuring the API handles updates correctly.
        setPageState("onboarding");
      }
    } catch (e) {
      console.error("Error fetching profile for edit:", e);
    }
  };

  // Render based on page state
  return (
    <div className="flex-1 bg-[#0a0a0a] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb
          items={[
            { label: "Inicio", href: "/" },
            { label: "Herramientas", href: "/herramientas" },
            {
              label: "Coach Triarvon",
              href: "/herramientas/couch_triarvono",
              current: true,
            },
          ]}
        />

        <h1 className="sr-only">Coach Triarvon - Tu Entrenador IA Personal</h1>

        {/* Loading State */}
        {pageState === "loading" && (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#D32F2F]" />
          </div>
        )}

        {/* Video Introduction - Sin requerir login, luego va al chat */}
        {pageState === "video" && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-black uppercase text-white tracking-tight leading-[1.1] mb-6 drop-shadow-2xl">
              ¡Bienvenido a Coach Triarvon!
            </h1>
            <div className="relative w-full max-w-3xl aspect-video bg-[#1a1a1a] rounded-2xl overflow-hidden border border-gray-800">
              <video
                src="/Herramientas/Videos/onboarding-welcome.mp4"
                autoPlay
                controls
                playsInline
                className="w-full h-full object-cover"
                onEnded={handleVideoComplete}
              >
                Tu navegador no soporta videos HTML5.
              </video>
              <button
                onClick={handleVideoComplete}
                className="absolute bottom-4 right-4 bg-black/60 hover:bg-black/80 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Continuar →
              </button>
            </div>
            <p className="mt-4 text-gray-300 text-center max-w-xl">
              Puedes escribir tu primer mensaje después del video para iniciar tu asesoría personalizada con inteligencia artificial.
            </p>

            {/* Guía de Especialidades de Coaches */}
            <div className="mt-10 w-full max-w-3xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-left">
              <div className="bg-[#141416] p-4 rounded-xl border border-gray-800">
                <div className="text-2xl mb-1">⚔️</div>
                <h3 className="font-bold text-white text-sm text-red-400">Coach General</h3>
                <p className="text-gray-300 text-xs mt-1 leading-relaxed">
                  Coordina tu plan maestro de desarrollo personal, alineando hábitos, disciplina y objetivos trimestrales.
                </p>
              </div>
              <div className="bg-[#141416] p-4 rounded-xl border border-gray-800">
                <div className="text-2xl mb-1">💪</div>
                <h3 className="font-bold text-white text-sm text-red-400">Coach de Cuerpo</h3>
                <p className="text-gray-300 text-xs mt-1 leading-relaxed">
                  Programación de fuerza, hipertrofia, resistencia cardiovascular y nutrición estratégica adaptada a tu rutina.
                </p>
              </div>
              <div className="bg-[#141416] p-4 rounded-xl border border-gray-800">
                <div className="text-2xl mb-1">👔</div>
                <h3 className="font-bold text-white text-sm text-red-400">Coach de Estilo</h3>
                <p className="text-gray-300 text-xs mt-1 leading-relaxed">
                  Presencia, código de vestimenta, combinaciones cromáticas y cuidado de la imagen masculina.
                </p>
              </div>
              <div className="bg-[#141416] p-4 rounded-xl border border-gray-800">
                <div className="text-2xl mb-1">🧠</div>
                <h3 className="font-bold text-white text-sm text-red-400">Coach de Mentalidad</h3>
                <p className="text-gray-300 text-xs mt-1 leading-relaxed">
                  Principios estoicos, control de la reactividad emocional, enfoque mental y resiliencia ante la adversidad.
                </p>
              </div>
              <div className="bg-[#141416] p-4 rounded-xl border border-gray-800 sm:col-span-2 md:col-span-2">
                <div className="text-2xl mb-1">⚡</div>
                <h3 className="font-bold text-white text-sm text-red-400">Coach de Productividad</h3>
                <p className="text-gray-300 text-xs mt-1 leading-relaxed">
                  Sistemas de trabajo profundo (Deep Work), bloqueo de tiempo, eliminación de distracciones y ejecución diaria de alto impacto.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Onboarding */}
        {pageState === "onboarding" && (
          <OnboardingFlow onComplete={handleOnboardingComplete} />
        )}

        {/* Profile Summary */}
        {pageState === "profile-summary" && profileData && (
          <ProfileSummary
            profile={profileData}
            summaryResponse={summaryResponse}
            onContinue={handleContinueToChat}
          />
        )}

        {/* Chat View */}
        {pageState === "chat" && (
          <div className="flex flex-col md:flex-row gap-6 mt-6">
            {/* Sidebar */}
            <div className="md:w-64 space-y-4">
              <CoachSidebar
                coaches={chatState.coaches}
                selectedCoach={chatState.selectedCoach}
                onSelectCoach={chatState.selectCoach}
                onEditProfile={handleEditProfile}
              />
              <CreditStatus
                credits={chatState.credits}
                messagesRemaining={chatState.messagesRemaining}
              />
            </div>

            {/* Chat Area */}
            <ChatInterface
              coach={chatState.currentCoach}
              messages={chatState.currentMessages}
              loading={chatState.loading} // Pass general loading
              onSendMessage={chatState.sendMessage}
              disabled={chatState.loading}
            />
          </div>
        )}

        {/* Welcome Modal */}
        {chatState.showWelcomeModal && chatState.currentCoach && (
          <CoachWelcomeModal
            coach={chatState.currentCoach}
            onClose={chatState.closeWelcomeModal}
          />
        )}

        {/* Credits Modal */}
        {chatState.showCreditsModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="relative bg-[#0a0a0a] rounded-2xl max-w-4xl w-full border border-gray-800 overflow-hidden">
              <button
                onClick={() => chatState.setShowCreditsModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <BuyCredits />
            </div>
          </div>
        )}

        {/* Login Modal - shows when session expires */}
        {chatState.showLoginModal && (
          <ModalLogin
            open={chatState.showLoginModal}
            onClose={() => chatState.setShowLoginModal(false)}
          />
        )}
      </div>
    </div>
  );
}
