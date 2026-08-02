// Coach Triarvon - OpenAI Client
// Handles AI chat completions

import OpenAI from 'openai';
import { COACH_SETTINGS, COACHES, type CoachType } from './config/coaches.config';

let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
    if (!openaiClient) {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error('OPENAI_API_KEY environment variable is required');
        }
        openaiClient = new OpenAI({ apiKey });
    }
    return openaiClient;
}

export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface TriarvonProfileContext {
    mainGoal?: string | null;
    subGoals?: string[];
    levels?: Record<string, string>;
    restrictions?: Record<string, string>;
    preferences?: Record<string, boolean>;
    currentFocuses?: string[];
}

// Build the full context for a coach including user profile
function buildSystemPrompt(coachType: CoachType, profile?: TriarvonProfileContext): string {
    const coach = COACHES[coachType];
    let systemPrompt = coach.systemPrompt;

    if (profile) {
        systemPrompt += `\n\n--- PERFIL DEL USUARIO ---
Objetivo principal: ${profile.mainGoal || 'No definido'}
Sub-objetivos: ${profile.subGoals?.join(', ') || 'No definidos'}
Niveles: ${profile.levels ? JSON.stringify(profile.levels) : 'No definidos'}
Restricciones: ${profile.restrictions ? JSON.stringify(profile.restrictions) : 'Ninguna conocida'}
Preferencias: ${profile.preferences ? JSON.stringify(profile.preferences) : 'No definidas'}
Focos actuales: ${profile.currentFocuses?.join(', ') || 'No definidos'}
--- FIN DEL PERFIL ---`;
    }

    return systemPrompt;
}

// Layer 1: Real-time coach responses
export async function getChatResponse(
    coachType: CoachType,
    messages: ChatMessage[],
    profile?: TriarvonProfileContext,
    strategistGuidance?: Record<string, unknown>
): Promise<string> {
    const client = getOpenAIClient();

    let systemPrompt = buildSystemPrompt(coachType, profile);

    // Add strategist guidance if available (Layer 2 output)
    if (strategistGuidance) {
        systemPrompt += `\n\n--- GUÍA INTERNA (no mencionar al usuario) ---
${JSON.stringify(strategistGuidance, null, 2)}
--- FIN DE GUÍA ---`;
    }

    const fullMessages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        ...messages
    ];

    const response = await client.chat.completions.create({
        model: COACH_SETTINGS.OPENAI_MODEL,
        messages: fullMessages,
        max_tokens: COACH_SETTINGS.MAX_TOKENS,
        temperature: 0.7,
    });

    return response.choices[0]?.message?.content || 'Lo siento, no pude generar una respuesta. Intenta de nuevo.';
}

// Process onboarding message and generate profile
export async function processOnboardingMessage(message: string): Promise<{
    mainGoal: string;
    subGoals: string[];
    levels: Record<string, string>;
    restrictions: Record<string, string>;
    preferences: Record<string, boolean>;
    currentFocuses: string[];
    enabledCoaches: CoachType[];
    summaryResponse: string;
}> {
    const client = getOpenAIClient();

    const systemPrompt = `Eres un analizador de perfiles para el Triarvon Club. 
El usuario acaba de describir su vida ideal y qué quiere cambiar.
Tu tarea es extraer información estructurada de su mensaje.

Responde ÚNICAMENTE con un JSON válido con esta estructura:
{
  "mainGoal": "objetivo principal en una frase",
  "subGoals": ["sub-objetivo 1", "sub-objetivo 2", ...],
  "levels": {
    "body": "novice|intermediate|advanced",
    "style": "novice|intermediate|advanced",
    "mindset": "novice|intermediate|advanced",
    "productivity": "novice|intermediate|advanced"
  },
  "restrictions": {
    "time": "descripción del tiempo disponible",
    "budget": "low|medium|high",
    "injuries": "descripción de lesiones si hay",
    "other": "otras restricciones"
  },
  "preferences": {
    "gym": true/false,
    "homeWorkout": true/false,
    "formalStyle": true/false,
    "casualStyle": true/false
  },
  "currentFocuses": ["foco 1", "foco 2"],
  "enabledCoaches": ["general", y otros de: "cuerpo", "estilo", "mentalidad", "productividad"],
  "summaryResponse": "Respuesta breve (2-3 párrafos) resumiendo lo que entendiste y los focos principales. Tono motivador de hermano mayor."
}

Incluye "general" siempre en enabledCoaches. Solo incluye otros coaches si son relevantes para lo que menciona el usuario.`;

    const response = await client.chat.completions.create({
        model: COACH_SETTINGS.OPENAI_MODEL_STRATEGIST,
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
        ],
        max_tokens: COACH_SETTINGS.MAX_TOKENS_STRATEGIST,
        temperature: 0.3,
        response_format: { type: 'json_object' }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
        throw new Error('No response from AI');
    }

    try {
        const parsed = JSON.parse(content);
        return {
            mainGoal: parsed.mainGoal || '',
            subGoals: parsed.subGoals || [],
            levels: parsed.levels || {},
            restrictions: parsed.restrictions || {},
            preferences: parsed.preferences || {},
            currentFocuses: parsed.currentFocuses || [],
            enabledCoaches: parsed.enabledCoaches || ['general'],
            summaryResponse: parsed.summaryResponse || 'Perfil creado exitosamente.'
        };
    } catch {
        throw new Error('Failed to parse AI response as JSON');
    }
}

// Layer 2: Strategist (background analysis)
export async function runStrategistAnalysis(
    conversationSummary: string,
    profile: TriarvonProfileContext,
    coachType: CoachType
): Promise<{
    objectives: string[];
    suggestedHabits: string[];
    toneAdjustments: string;
    boundaries: string[];
}> {
    const client = getOpenAIClient();

    const systemPrompt = `Eres el Estratega Oculto del Triarvon Club.
Tu rol es analizar conversaciones y generar guías internas para los coaches.
Esta información NO se muestra al usuario, es para orientar al coach.

Analiza el resumen de conversación y el perfil, luego genera:
1. Lista de objetivos claros y priorizados para las próximas semanas
2. Hábitos o acciones concretas que el coach debe promover
3. Ajustes de tono si son necesarios
4. Fronteras: qué temas evitar o derivar

Responde en JSON:
{
  "objectives": ["objetivo 1 (alta prioridad)", "objetivo 2", ...],
  "suggestedHabits": ["hábito concreto 1", "hábito concreto 2"],
  "toneAdjustments": "descripción de cómo ajustar el tono si es necesario",
  "boundaries": ["tema a evitar o derivar", ...]
}`;

    const response = await client.chat.completions.create({
        model: COACH_SETTINGS.OPENAI_MODEL_STRATEGIST,
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Coach: ${coachType}\n\nPerfil:\n${JSON.stringify(profile)}\n\nResumen de conversación:\n${conversationSummary}` }
        ],
        max_tokens: COACH_SETTINGS.MAX_TOKENS_STRATEGIST,
        temperature: 0.3,
        response_format: { type: 'json_object' }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
        throw new Error('No strategist response');
    }

    return JSON.parse(content);
}

// Layer 3: Community Analytics (admin use)
export async function generateCommunityReport(
    anonymizedSummaries: string[]
): Promise<string> {
    const client = getOpenAIClient();

    const systemPrompt = `Eres el Analista de Comunidad del Triarvon Club.
Recibes resúmenes anonimizados de conversaciones de múltiples usuarios.
Tu tarea es identificar patrones y generar un reporte para el administrador.

Genera un reporte de texto con:
1. Top 5 temas de preocupación de la comunidad
2. Coaches más utilizados
3. Necesidades no cubiertas (ej: "muchos piden nutrición específica")
4. Sugerencias de mejora (ej: "Considerar crear un Coach de Nutrición")

El reporte debe ser legible y accionable para el administrador.`;

    const response = await client.chat.completions.create({
        model: COACH_SETTINGS.OPENAI_MODEL_STRATEGIST,
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Resúmenes de conversaciones de ${anonymizedSummaries.length} usuarios:\n\n${anonymizedSummaries.join('\n\n---\n\n')}` }
        ],
        max_tokens: COACH_SETTINGS.MAX_TOKENS_STRATEGIST,
        temperature: 0.5,
    });

    return response.choices[0]?.message?.content || 'No se pudo generar el reporte.';
}
