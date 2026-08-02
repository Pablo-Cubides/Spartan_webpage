// Coach Triarvon - Profile API
// Handles Triarvon Profile CRUD and onboarding

import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { verifyIdToken } from '@/lib/server/firebaseAdmin';
import { withErrorHandler, AuthenticationError, NotFoundError } from '@/lib/api/error-handler';
import { processOnboardingMessage } from '@/lib/coach-triarvon/gemini';
import { CoachType } from '@/lib/coach-triarvon/config/coaches.config';

// GET - Fetch user's Triarvon Profile
const getHandler = async (request: NextRequest) => {
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
            triarvonProfile: {
                include: {
                    conversations: {
                        select: {
                            coachType: true,
                            welcomeShown: true,
                            messageCount: true
                        }
                    }
                }
            }
        }
    });

    if (!user) {
        throw new NotFoundError('User');
    }

    return NextResponse.json({
        hasProfile: !!user.triarvonProfile?.onboardingDone,
        profile: user.triarvonProfile ? {
            mainGoal: user.triarvonProfile.mainGoal,
            subGoals: user.triarvonProfile.subGoals,
            levels: user.triarvonProfile.levels,
            currentFocuses: user.triarvonProfile.currentFocuses,
            enabledCoaches: user.triarvonProfile.enabledCoaches,
            conversations: user.triarvonProfile.conversations
        } : null
    });
};

// POST - Process onboarding message and create/update profile
const postHandler = async (request: NextRequest) => {
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
        where: { uid: decoded.uid }
    });

    if (!user) {
        throw new NotFoundError('User');
    }

    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== 'string' || message.length < 10) {
        return NextResponse.json(
            { error: 'Message is required and must be at least 10 characters' },
            { status: 400 }
        );
    }

    // Process the onboarding message with AI
    const result = await processOnboardingMessage(message);

    // Create or update the profile
    const profile = await prisma.triarvonProfile.upsert({
        where: { user_id: user.id },
        update: {
            mainGoal: result.mainGoal,
            subGoals: result.subGoals,
            levels: result.levels,
            restrictions: result.restrictions,
            preferences: result.preferences,
            currentFocuses: result.currentFocuses,
            enabledCoaches: result.enabledCoaches,
            onboardingDone: true
        },
        create: {
            user_id: user.id,
            mainGoal: result.mainGoal,
            subGoals: result.subGoals,
            levels: result.levels,
            restrictions: result.restrictions,
            preferences: result.preferences,
            currentFocuses: result.currentFocuses,
            enabledCoaches: result.enabledCoaches,
            onboardingDone: true
        }
    });

    // Create initial conversations for enabled coaches
    for (const coachType of result.enabledCoaches) {
        await prisma.coachConversation.upsert({
            where: {
                profile_id_coachType: {
                    profile_id: profile.id,
                    coachType: coachType as CoachType
                }
            },
            update: {},
            create: {
                profile_id: profile.id,
                coachType: coachType as CoachType
            }
        });
    }

    return NextResponse.json({
        success: true,
        profile: {
            mainGoal: result.mainGoal,
            subGoals: result.subGoals,
            currentFocuses: result.currentFocuses,
            enabledCoaches: result.enabledCoaches
        },
        summaryResponse: result.summaryResponse
    });
};

export const GET = withErrorHandler(getHandler);
export const POST = withErrorHandler(postHandler);
