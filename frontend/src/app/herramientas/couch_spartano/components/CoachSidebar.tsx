'use client';

// CoachSidebar Component - Coach selection panel

import type { Coach } from '../types';

interface CoachSidebarProps {
    coaches: Coach[];
    selectedCoach: string | null;
    onSelectCoach: (id: string) => void;
}

export function CoachSidebar({ coaches, selectedCoach, onSelectCoach }: CoachSidebarProps) {
    if (coaches.length === 0) {
        return (
            <aside className="w-full md:w-64 bg-[#1a1a1a] rounded-lg p-4 border border-gray-800">
                <p className="text-gray-500 text-center">Cargando coaches...</p>
            </aside>
        );
    }

    return (
        <aside className="w-full md:w-64 bg-[#1a1a1a] rounded-lg p-4 border border-gray-800 flex-shrink-0">
            <h3 className="text-white font-bold mb-4">Tus Coaches</h3>
            <nav className="space-y-2">
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
                            <p className="text-xs opacity-70">{coach.title}</p>
                        </div>
                    </button>
                ))}
            </nav>
        </aside>
    );
}
