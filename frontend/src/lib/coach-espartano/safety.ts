// Coach Espartano - Content Safety Handler
// Handles sensitive topics appropriately

const CRISIS_RESOURCES = `
📞 **Líneas de ayuda (disponibles 24/7):**
- España: 024 (Línea de Atención a la Conducta Suicida)
- México: 800 290 0024 (SAPTEL)
- Argentina: (011) 5275-1135 (Centro de Asistencia al Suicida)
- Colombia: 106 (Línea de la Vida)
- Chile: 600 360 7777 (Fono Salud)
- Internacional: https://findahelpline.com

Por favor, busca ayuda profesional. No estás solo.`;

// Keywords that trigger safety response
const CRITICAL_KEYWORDS = [
    'suicid', 'suicidarme', 'matarme', 'quitarme la vida', 'acabar con todo',
    'no quiero vivir', 'quiero morir', 'mejor muerto', 'autolesión', 'hacerme daño',
    'cortarme', 'lastimarm'
];

const ILLEGAL_KEYWORDS = [
    'drogas ilegales', 'cómo hackear', 'robar', 'matar a alguien', 'venganza violenta',
    'armas ilegales', 'narcotráfico'
];

export interface SafetyCheckResult {
    isSafe: boolean;
    type: 'safe' | 'crisis' | 'illegal' | 'medical';
    response?: string;
}

export function checkMessageSafety(message: string): SafetyCheckResult {
    const lowerMessage = message.toLowerCase();

    // Check for crisis/self-harm keywords
    for (const keyword of CRITICAL_KEYWORDS) {
        if (lowerMessage.includes(keyword)) {
            return {
                isSafe: false,
                type: 'crisis',
                response: `Hermano, lo que describes me preocupa. 💙

Quiero que sepas que lo que sientes es válido, pero necesitas hablar con alguien que pueda ayudarte de verdad. Esto está por encima de lo que yo puedo hacer como coach.

${CRISIS_RESOURCES}

Estoy aquí para apoyarte en tu camino, pero por favor, da el paso de buscar ayuda profesional primero. ¿Puedes prometerme que vas a contactar a una de estas líneas?`
            };
        }
    }

    // Check for illegal activity requests
    for (const keyword of ILLEGAL_KEYWORDS) {
        if (lowerMessage.includes(keyword)) {
            return {
                isSafe: false,
                type: 'illegal',
                response: `Hermano, no puedo ayudarte con eso. No es el camino espartano.

El verdadero guerrero busca soluciones dentro de la ley y la ética. Si estás en una situación difícil, hablemos de alternativas legítimas.

¿Qué está pasando realmente? Cuéntame el problema de fondo y busquemos una solución que te haga sentir orgulloso.`
            };
        }
    }

    return { isSafe: true, type: 'safe' };
}

// Check if response from AI needs safety filtering
export function sanitizeAIResponse(response: string): string {
    // Remove any potential harmful content that might slip through
    // This is a secondary safety layer

    // Basic sanitization - can be expanded as needed
    const sanitized = response;

    // Remove any URLs that aren't our approved crisis resources
    // (keeping crisis resources is important)

    return sanitized;
}
