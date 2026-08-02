'use client';

// CoachWelcomeModal Component - Welcome video modal for each coach

import { COACHES } from '@/lib/coach-triarvon/config/coaches.config';
import type { Coach } from '../types';

interface CoachWelcomeModalProps {
    coach: Coach;
    onClose: () => void;
}

export function CoachWelcomeModal({ coach, onClose }: CoachWelcomeModalProps) {
    // Get the coach config to access the video URL
    const coachConfig = COACHES[coach.id as keyof typeof COACHES];
    const videoUrl = coachConfig?.welcomeVideo;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-[#0f0f0f] rounded-2xl max-w-3xl w-full border border-gray-800 overflow-hidden">
                {/* Video or placeholder */}
                <div className="aspect-video bg-[#1a1a1a] relative">
                    {videoUrl ? (
                        <video
                            src={videoUrl}
                            autoPlay
                            controls
                            className="w-full h-full object-cover"
                            onEnded={onClose}
                        >
                            Tu navegador no soporta videos HTML5.
                        </video>
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <div className="w-20 h-20 rounded-full bg-[#D32F2F]/20 flex items-center justify-center mb-4">
                                <span className="text-4xl">{coach.icon}</span>
                            </div>
                            <h3 className="text-white text-2xl font-bold mb-2">{coach.name}</h3>
                            <p className="text-gray-400">{coach.title}</p>
                            <p className="text-gray-600 text-sm mt-4">Video de bienvenida próximamente</p>
                        </div>
                    )}
                </div>

                {/* Modal footer */}
                <div className="p-6 border-t border-gray-800">
                    <p className="text-gray-300 mb-4">{coach.description}</p>
                    <button
                        onClick={onClose}
                        className="w-full bg-[#D32F2F] hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors"
                    >
                        Comenzar a chatear
                    </button>
                </div>
            </div>
        </div>
    );
}
