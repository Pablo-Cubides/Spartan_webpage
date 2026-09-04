'use client';

// CoachSidebar Component - Coach selection panel

import type { Coach } from '../types';

interface CoachSidebarProps {
    coaches: Coach[];
    selectedCoach: string | null;
    onSelectCoach: (id: string) => void;
    onEditProfile?: () => void;
}

export function CoachSidebar({ coaches, selectedCoach, onSelectCoach, onEditProfile }: CoachSidebarProps) {
    if (coaches.length === 0) {
        return (
            <aside className="w-full md:w-64 bg-[#1a1a1a] rounded-lg p-4 border border-gray-800">
                <p className="text-gray-500 text-center">Cargando coaches...</p>
            </aside>
        );
    }

    return (
        <aside className="w-full md:w-64 bg-[#1a1a1a] rounded-lg p-4 border border-gray-800 flex-shrink-0 flex flex-col h-full">
            <h3 className="text-white font-bold mb-4">Tus Coaches</h3>
            <nav className="space-y-2 flex-grow">
                {coaches.map(coach => (
                    <button
                        key={coach.id}
                        onClick={() => onSelectCoach(coach.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${selectedCoach === coach.id
                            ? 'bg-[#D32F2F] text-white'
                            : 'hover:bg-gray-800 text-gray-300'
                            }`}
                    >
                        <span className="text-2xl">{coach.icon}</span>
                        <div className="text-left">
                            <p className="font-semibold text-sm">{coach.name}</p>
                            <p className={`text-xs ${selectedCoach === coach.id ? 'text-white/90' : 'text-gray-300'}`}>{coach.title}</p>
                        </div>
                    </button>
                ))}
            </nav>

            {onEditProfile && (
                <div className="pt-4 mt-4 border-t border-gray-700">
                    <button
                        onClick={onEditProfile}
                        className="w-full flex items-center justify-center gap-2 p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Editar Perfil
                    </button>
                </div>
            )}
        </aside>
    );
}
