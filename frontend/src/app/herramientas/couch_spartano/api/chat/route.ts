// Coach Espartano - Chat API
// Main chat endpoint for Layer 1 AI responses

import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { verifyIdToken } from '@/lib/server/firebaseAdmin';
import { withErrorHandler, AuthenticationError, NotFoundError } from '@/lib/api/error-handler';
import { getChatResponse, runStrategistAnalysis, type SpartanProfileContext, type ChatMessage } from '@/lib/coach-espartano/gemini';
import { canSendMessage, recordMessageSent } from '@/lib/coach-espartano/credits';
import { encryptMessage, decryptMessage } from '@/lib/coach-espartano/encryption';
import { checkMessageSafety } from '@/lib/coach-espartano/safety';
import { COACH_SETTINGS, type CoachType, COACHES } from '@/lib/coach-espartano/config/coaches.config';

const handler = async (request: NextRequest) => {
    const auth = request.headers.get('authorization') || '';
    if (!auth.startsWith('Bearer ')) {
        throw new AuthenticationError('Missing or invalid authorization header');
    }

    const idToken = auth.split('Bearer ')[1];
    let decoded;
    try {
        decoded = await verifyIdToken(idToken);
    } catch {
        throw new AuthenticationError('Invalid or expired token');
    }

    const user = await prisma.user.findUnique({
        where: { uid: decoded.uid },
        include: {
            spartanProfile: true
        }
    });

    if (!user) {
        throw new NotFoundError('User');
    }

    if (!user.spartanProfile?.onboardingDone) {
        return NextResponse.json(
            { error: 'ONBOARDING_REQUIRED', message: 'Please complete onboarding first' },
            { status: 400 }
        );
    }

    const body = await request.json();
    const { coachType, message } = body;

    // Validate coach type
    if (!coachType || !(coachType in COACHES)) {
        return NextResponse.json(
            { error: 'Invalid coach type' },
            { status: 400 }
        );
    }

    // Check if this coach is enabled for the user
    if (!user.spartanProfile.enabledCoaches.includes(coachType)) {
        return NextResponse.json(
            { error: 'COACH_NOT_ENABLED', message: 'This coach is not available for you yet' },
            { status: 403 }
        );
    }

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return NextResponse.json(
            { error: 'Message is required' },
            { status: 400 }
        );
    }

    // Check credits/free tier
    const creditCheck = await canSendMessage(user.id);
    if (!creditCheck.canSend) {
        return NextResponse.json(
            { error: 'INSUFFICIENT_CREDITS', message: 'No credits available. Please buy more credits.' },
            { status: 402 }
        );
    }

    // Safety check
    const safetyResult = checkMessageSafety(message);
    if (!safetyResult.isSafe && safetyResult.response) {
        // Return safety response without consuming credits
        return NextResponse.json({
            success: true,
            response: safetyResult.response,
            safetyTriggered: true
        });
    }

    // Get or create conversation
    let conversation = await prisma.coachConversation.findUnique({
        where: {
            profile_id_coachType: {
                profile_id: user.spartanProfile.id,
                coachType: coachType as CoachType
            }
        },
        include: {
            messages: {
                orderBy: { created_at: 'asc' },
                take: 50 // Limit context window
            }
        }
    });

    if (!conversation) {
        conversation = await prisma.coachConversation.create({
            data: {
                profile_id: user.spartanProfile.id,
                coachType: coachType as CoachType
            },
            include: {
                messages: true
            }
        });
    }

    // Build chat history
    const chatHistory: ChatMessage[] = conversation.messages.map(m => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: decryptMessage(m.content)
    }));

    // Add current message
    chatHistory.push({ role: 'user', content: message });

    // Build profile context
    const profileContext: SpartanProfileContext = {
        mainGoal: user.spartanProfile.mainGoal,
        subGoals: user.spartanProfile.subGoals,
        levels: user.spartanProfile.levels as Record<string, string> | undefined,
        restrictions: user.spartanProfile.restrictions as Record<string, string> | undefined,
        preferences: user.spartanProfile.preferences as Record<string, boolean> | undefined,
        currentFocuses: user.spartanProfile.currentFocuses
    };

    // Get strategist guidance if available
    const strategistGuidance = user.spartanProfile.strategistPlan as Record<string, unknown> | undefined;

    // Get AI response
    const aiResponse = await getChatResponse(
        coachType as CoachType,
        chatHistory,
        profileContext,
        strategistGuidance
    );

    // Store messages (encrypted)
    await prisma.coachMessage.createMany({
        data: [
            {
                conversationId: conversation.id,
                role: 'user',
                content: encryptMessage(message)
            },
            {
                conversationId: conversation.id,
                role: 'assistant',
                content: encryptMessage(aiResponse)
            }
        ]
    });

    // Update message count
    const newMessageCount = conversation.messageCount + 2;
    await prisma.coachConversation.update({
        where: { id: conversation.id },
        data: { messageCount: newMessageCount }
    });

    // Record message sent (handles credit consumption)
    const creditResult = await recordMessageSent(user.id);

    // Check if we should trigger Layer 2 (strategist)
    if (newMessageCount >= COACH_SETTINGS.STRATEGIST_THRESHOLD &&
        newMessageCount % COACH_SETTINGS.STRATEGIST_THRESHOLD === 0) {
        // Trigger strategist in background (don't await)
        triggerStrategist(user.spartanProfile.id, coachType as CoachType, profileContext).catch(console.error);
    }

    return NextResponse.json({
        success: true,
        response: aiResponse,
        credits: {
            remaining: creditResult.remainingCredits,
            creditConsumed: creditResult.creditConsumed
        }
    });
};

// Background task to run strategist analysis
async function triggerStrategist(
    profileId: number,
    coachType: CoachType,
    profileContext: SpartanProfileContext
) {
    try {
        // Get conversation summary
        const conversation = await prisma.coachConversation.findUnique({
            where: {
                profile_id_coachType: {
                    profile_id: profileId,
                    coachType
                }
            },
            include: {
                messages: {
                    orderBy: { created_at: 'desc' },
                    take: 30
                }
            }
        });

        if (!conversation) return;

        // Decrypt and summarize messages
        const messageTexts = conversation.messages
            .reverse()
            .map(m => `${m.role}: ${decryptMessage(m.content)}`)
            .join('\n');

        // Run strategist
        const guidance = await runStrategistAnalysis(messageTexts, profileContext, coachType);

        // Update profile with new guidance
        await prisma.spartanProfile.update({
            where: { id: profileId },
            data: {
                strategistPlan: guidance
            }
        });
    } catch (error) {
        console.error('[Coach Espartano] Strategist error:', error);
    }
}

export const POST = withErrorHandler(handler);
