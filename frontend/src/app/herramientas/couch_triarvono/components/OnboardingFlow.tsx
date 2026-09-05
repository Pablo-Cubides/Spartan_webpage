"use client";

// OnboardingFlow Component - Initial user questionnaire

import { useState } from "react";
import { getTokenCookie } from "@/lib/api";
import type { ProfileData } from "../types";

interface OnboardingFlowProps {
  onComplete: (response: string, profile: ProfileData) => void;
}

// Video URL for onboarding welcome
const ONBOARDING_VIDEO_URL = "/Herramientas/Videos/onboarding-welcome.mp4";

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState<"video" | "question" | "processing">(
    "video",
  );
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (message.length < 10) {
      setError("Por favor, escribe al menos 10 caracteres.");
      return;
    }

    setStep("processing");
    setError("");

    try {
      const token = getTokenCookie();
      const res = await fetch("/herramientas/couch_triarvono/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error processing message");
      }

      onComplete(data.summaryResponse, data.profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de conexión");
      setStep("question");
    }
  };

  if (step === "video") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
        <WelcomeVideo
          title="¡Bienvenido a Coach Triarvon!"
          onComplete={() => setStep("question")}
        />
      </div>
    );
  }

  if (step === "processing") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#D32F2F]" />
        <p className="mt-6 text-lg text-gray-300">Analizando tu perfil...</p>
        <p className="text-sm text-gray-400 mt-2">
          Esto puede tomar unos segundos
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h2 className="text-3xl font-bold text-white mb-4">
        Cuéntame sobre ti, guerrero
      </h2>
      <p className="text-gray-400 mb-6">
        ¿Cuál es tu mayor objetivo en la vida ahora mismo? ¿Qué áreas quieres
        mejorar? Cuéntame sobre tus metas en fitness, estilo, mentalidad,
        productividad o cualquier aspecto de tu vida que quieras transformar.
      </p>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="w-full h-48 bg-[#1a1a1a] border border-gray-700 rounded-lg p-4 text-white resize-none focus:ring-2 focus:ring-[#D32F2F] focus:border-transparent"
        placeholder="Escribe aquí tu mensaje... (mínimo 10 caracteres)"
      />

      <div className="flex justify-between items-center mt-4">
        <span className="text-sm text-gray-400">
          {message.length} caracteres
        </span>
        {error && <span className="text-red-400 text-sm">{error}</span>}
      </div>

      <button
        onClick={handleSubmit}
        disabled={message.length < 10}
        className="mt-6 w-full bg-[#D32F2F] hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg transition-colors"
      >
        Enviar y conocer mi perfil
      </button>
    </div>
  );
}

// Welcome video component with autoplay
function WelcomeVideo({
  onComplete,
}: {
  title?: string;
  onComplete: () => void;
}) {
  return (
    <div className="relative w-full max-w-3xl aspect-video bg-[#1a1a1a] rounded-2xl overflow-hidden border border-gray-800">
      <video
        src={ONBOARDING_VIDEO_URL}
        autoPlay
        controls
        playsInline
        className="w-full h-full object-cover"
        onEnded={onComplete}
      >
        Tu navegador no soporta videos HTML5.
      </video>
      {/* Skip button overlay */}
      <button
        onClick={onComplete}
        className="absolute bottom-4 right-4 bg-black/60 hover:bg-black/80 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
      >
        Saltar video →
      </button>
    </div>
  );
}
