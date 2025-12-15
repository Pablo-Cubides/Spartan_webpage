// Coach Espartano - Gemini Client
// Handles AI chat completions using Google Gemini

import { GoogleGenerativeAI } from '@google/generative-ai';
import { COACHES, type CoachType } from './config/coaches.config';

let geminiClient: GoogleGenerativeAI | null = null;

function getGeminiClient(): GoogleGenerativeAI {
    if (!geminiClient) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY environment variable is required');
        }
        geminiClient = new GoogleGenerativeAI(apiKey);
    }
    return geminiClient;
}

export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface SpartanProfileContext {
    mainGoal?: string | null;
    subGoals?: string[];
    levels?: Record<string, string>;
    restrictions?: Record<string, string>;
    preferences?: Record<string, boolean>;
    currentFocuses?: string[];
}

// Build the full context for a coach including user profile
function buildSystemPrompt(coachType: CoachType, profile?: SpartanProfileContext): string {
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

// Model configuration
const GEMINI_MODEL = process.env.GEMINI_COACH_MODEL || 'gemini-1.5-flash';
const MAX_OUTPUT_TOKENS = 500;
const STRATEGIST_MAX_TOKENS = 2000;

// Layer 1: Real-time coach responses
export async function getChatResponse(
    coachType: CoachType,
    messages: ChatMessage[],
    profile?: SpartanProfileContext,
    strategistGuidance?: Record<string, unknown>
): Promise<string> {
    const client = getGeminiClient();
    const model = client.getGenerativeModel({ model: GEMINI_MODEL });

    let systemPrompt = buildSystemPrompt(coachType, profile);

    // Add strategist guidance if available (Layer 2 output)
    if (strategistGuidance) {
        systemPrompt += `\n\n--- GUÍA INTERNA (no mencionar al usuario) ---
${JSON.stringify(strategistGuidance, null, 2)}
--- FIN DE GUÍA ---`;
    }

    // Convert messages to Gemini format
    // Gemini uses 'user' and 'model' roles, and system prompt goes in the first user message
    const geminiHistory: { role: 'user' | 'model'; parts: { text: string }[] }[] = [];

    // Add system prompt as context in the first exchange
    let isFirstUserMessage = true;

    for (const msg of messages) {
        if (msg.role === 'system') {
            // System messages are handled separately
            continue;
        }

        const role = msg.role === 'assistant' ? 'model' : 'user';
        let content = msg.content;

        // Prepend system prompt to first user message
        if (role === 'user' && isFirstUserMessage) {
            content = `[CONTEXTO DEL SISTEMA - NO MENCIONAR AL USUARIO]\n${systemPrompt}\n[FIN DEL CONTEXTO]\n\nMensaje del usuario: ${content}`;
            isFirstUserMessage = false;
        }

        geminiHistory.push({
            role,
            parts: [{ text: content }]
        });
    }

    // If there's no user message yet, just return the first message
    if (geminiHistory.length === 0) {
        return COACHES[coachType].firstMessage;
    }

    // Get the last message (should be from user)
    const lastMessage = geminiHistory.pop();
    if (!lastMessage || lastMessage.role !== 'user') {
        throw new Error('Last message must be from user');
    }

    // Start chat with history (excluding last message)
    const chat = model.startChat({
        history: geminiHistory,
        generationConfig: {
            maxOutputTokens: MAX_OUTPUT_TOKENS,
            temperature: 0.7,
        },
    });

    // Send the last message
    const result = await chat.sendMessage(lastMessage.parts[0].text);
    const response = result.response.text();

    return response || 'Lo siento, no pude generar una respuesta. Intenta de nuevo.';
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
    const client = getGeminiClient();
    const model = client.getGenerativeModel({ model: GEMINI_MODEL });

    const systemPrompt = `Eres un analizador de perfiles para el Spartan Club. 
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

Incluye "general" siempre en enabledCoaches. Solo incluye otros coaches si son relevantes para lo que menciona el usuario.
IMPORTANTE: Responde SOLO con el JSON, sin texto adicional ni markdown.`;

    const result = await model.generateContent({
        contents: [
            { role: 'user', parts: [{ text: `${systemPrompt}\n\nMensaje del usuario:\n${message}` }] }
        ],
        generationConfig: {
            maxOutputTokens: STRATEGIST_MAX_TOKENS,
            temperature: 0.3,
        },
    });

    const content = result.response.text();
    if (!content) {
        throw new Error('No response from AI');
    }

    try {
        // Try to extract JSON from the response (in case there's extra text)
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : content;
        const parsed = JSON.parse(jsonStr);

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
        console.error('Failed to parse Gemini response:', content);
        throw new Error('Failed to parse AI response as JSON');
    }
}

// Layer 2: Strategist (background analysis)
export async function runStrategistAnalysis(
    conversationSummary: string,
    profile: SpartanProfileContext,
    coachType: CoachType
): Promise<{
    objectives: string[];
    suggestedHabits: string[];
    toneAdjustments: string;
    boundaries: string[];
}> {
    const client = getGeminiClient();
    const model = client.getGenerativeModel({ model: GEMINI_MODEL });

    const systemPrompt = `Eres el Estratega Oculto del Spartan Club.
Tu rol es analizar conversaciones y generar guías internas para los coaches.
Esta información NO se muestra al usuario, es para orientar al coach.

Analiza el resumen de conversación y el perfil, luego genera:
1. Lista de objetivos claros y priorizados para las próximas semanas
2. Hábitos o acciones concretas que el coach debe promover
3. Ajustes de tono si son necesarios
4. Fronteras: qué temas evitar o derivar

Responde SOLO con un JSON válido:
{
  "objectives": ["objetivo 1 (alta prioridad)", "objetivo 2", ...],
  "suggestedHabits": ["hábito concreto 1", "hábito concreto 2"],
  "toneAdjustments": "descripción de cómo ajustar el tono si es necesario",
  "boundaries": ["tema a evitar o derivar", ...]
}`;

    const result = await model.generateContent({
        contents: [
            {
                role: 'user',
                parts: [{
                    text: `${systemPrompt}\n\nCoach: ${coachType}\n\nPerfil:\n${JSON.stringify(profile)}\n\nResumen de conversación:\n${conversationSummary}`
                }]
            }
        ],
        generationConfig: {
            maxOutputTokens: STRATEGIST_MAX_TOKENS,
            temperature: 0.3,
        },
    });

    const content = result.response.text();
    if (!content) {
        throw new Error('No strategist response');
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : content;
    return JSON.parse(jsonStr);
}

// Layer 3: Community Analytics (admin use)
export async function generateCommunityReport(
    anonymizedSummaries: string[]
): Promise<string> {
    const client = getGeminiClient();
    const model = client.getGenerativeModel({ model: GEMINI_MODEL });

    const systemPrompt = `Eres el Analista de Comunidad del Spartan Club.
Recibes resúmenes anonimizados de conversaciones de múltiples usuarios.
Tu tarea es identificar patrones y generar un reporte para el administrador.

Genera un reporte de texto con:
1. Top 5 temas de preocupación de la comunidad
2. Coaches más utilizados
3. Necesidades no cubiertas (ej: "muchos piden nutrición específica")
4. Sugerencias de mejora (ej: "Considerar crear un Coach de Nutrición")

El reporte debe ser legible y accionable para el administrador.`;

    const result = await model.generateContent({
        contents: [
            {
                role: 'user',
                parts: [{
                    text: `${systemPrompt}\n\nResúmenes de conversaciones de ${anonymizedSummaries.length} usuarios:\n\n${anonymizedSummaries.join('\n\n---\n\n')}`
                }]
            }
        ],
        generationConfig: {
            maxOutputTokens: STRATEGIST_MAX_TOKENS,
            temperature: 0.5,
        },
    });

    return result.response.text() || 'No se pudo generar el reporte.';
}
