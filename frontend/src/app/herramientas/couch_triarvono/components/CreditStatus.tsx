'use client';

// CreditStatus Component - Displays remaining credits and messages

interface CreditStatusProps {
    credits: number;
    messagesRemaining: number;
}

export function CreditStatus({ credits, messagesRemaining }: CreditStatusProps) {
    return (
        <div className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-800">
            <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Mensajes disponibles</span>
                <span className="text-white font-bold">{messagesRemaining}</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                    className="bg-[#D32F2F] h-2 rounded-full transition-all"
                    style={{ width: `${Math.min((messagesRemaining / 25) * 100, 100)}%` }}
                />
            </div>
            <p className="text-gray-300 text-xs mt-2">
                {credits > 0 ? `${credits} créditos restantes` : 'Sin créditos'}
            </p>
            <p className="text-gray-300 text-xs mt-3 leading-relaxed">
                🔒 Tus conversaciones se almacenan cifradas. Nadie del equipo lee tus chats.
            </p>
        </div>
    );
}
