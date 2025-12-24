// Coach Espartano - Coaches List API
// Returns list of enabled coaches for the user

import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { verifyIdToken } from '@/lib/server/firebaseAdmin';
import { withErrorHandler, AuthenticationError, NotFoundError } from '@/lib/api/error-handler';
import { COACHES, type CoachType } from '@/lib/coach-espartano/config/coaches.config';

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
            spartanProfile: {
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

    if (!user.spartanProfile) {
        return NextResponse.json({
            hasProfile: false,
            coaches: []
        });
    }

    // Build list of coaches with their status
    // Always include 'general' coach even if enabledCoaches is empty
    const rawEnabled = user.spartanProfile.enabledCoaches as CoachType[];
    const enabledCoachIds: CoachType[] = rawEnabled && rawEnabled.length > 0
        ? (rawEnabled.includes('general') ? rawEnabled : ['general', ...rawEnabled])
        : ['general'];

    const coaches = enabledCoachIds.map(coachId => {
        const coachConfig = COACHES[coachId];
        if (!coachConfig) return null; // Skip invalid coach IDs
        const conversation = user.spartanProfile!.conversations.find(c => c.coachType === coachId);

        return {
            id: coachId,
            name: coachConfig.name,
            title: coachConfig.title,
            description: coachConfig.description,
            icon: coachConfig.icon,
            color: coachConfig.color,
            welcomeVideo: coachConfig.welcomeVideo,
            // For 'general' coach, always mark welcomeShown as true (no video needed)
            welcomeShown: coachId === 'general' ? true : (conversation?.welcomeShown ?? false),
            messageCount: conversation?.messageCount ?? 0
        };
    }).filter(Boolean); // Remove nulls

    return NextResponse.json({
        hasProfile: true,
        onboardingDone: user.spartanProfile.onboardingDone,
        coaches,
        credits: user.credits // Include user credits
    });
};

export const GET = withErrorHandler(handler);
