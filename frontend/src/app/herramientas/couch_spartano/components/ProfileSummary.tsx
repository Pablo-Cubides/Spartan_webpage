'use client';

// ProfileSummary Component - Shows AI-generated profile after onboarding

import type { ProfileData } from '../types';

interface ProfileSummaryProps {
    profile: ProfileData;
    summaryResponse: string;
    onContinue: () => void;
}

export function ProfileSummary({ profile, summaryResponse, onContinue }: ProfileSummaryProps) {
    return (
        <div className="max-w-2xl mx-auto p-8">
            <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto bg-[#D32F2F]/20 rounded-full flex items-center justify-center mb-4">
                    <span className="text-3xl">⚔️</span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Tu Perfil Espartano</h2>
                <p className="text-gray-400">He analizado tu mensaje y creado tu perfil</p>
            </div>

            <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800 mb-6">
                <div className="prose prose-invert max-w-none">
                    <p className="text-gray-300 whitespace-pre-wrap">{summaryResponse}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-[#0f0f0f] rounded-lg p-4 border border-gray-800">
                    <p className="text-[#D32F2F] font-bold text-sm mb-2">META PRINCIPAL</p>
                    <p className="text-white">{profile.mainGoal}</p>
                </div>
                <div className="bg-[#0f0f0f] rounded-lg p-4 border border-gray-800">
                    <p className="text-[#D32F2F] font-bold text-sm mb-2">COACHES ASIGNADOS</p>
                    <p className="text-white">{profile.enabledCoaches.length} coaches</p>
                </div>
            </div>

            {profile.currentFocuses.length > 0 && (
                <div className="mb-8">
                    <p className="text-gray-400 text-sm mb-3">Áreas de enfoque:</p>
                    <div className="flex flex-wrap gap-2">
                        {profile.currentFocuses.map((focus, i) => (
                            <span key={i} className="bg-[#D32F2F]/20 text-[#D32F2F] px-3 py-1 rounded-full text-sm">
                                {focus}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <button
                onClick={onContinue}
                className="w-full bg-[#D32F2F] hover:bg-red-700 text-white font-bold py-4 rounded-lg transition-colors"
            >
                Comenzar con mis Coaches →
            </button>
        </div>
    );
}
