// Coach Triarvon - Welcome Shown API
// Marks a coach's welcome video as shown

import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { verifyIdToken } from '@/lib/server/firebaseAdmin';
import { withErrorHandler, AuthenticationError, NotFoundError } from '@/lib/api/error-handler';
import { type CoachType, COACHES } from '@/lib/coach-triarvon/config/coaches.config';

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
        include: { triarvonProfile: true }
    });

    if (!user || !user.triarvonProfile) {
        throw new NotFoundError('Profile');
    }

    const body = await request.json();
    const { coachType } = body;

    if (!coachType || !(coachType in COACHES)) {
        return NextResponse.json(
            { error: 'Invalid coach type' },
            { status: 400 }
        );
    }

    // Update welcome shown status
    await prisma.coachConversation.upsert({
        where: {
            profile_id_coachType: {
                profile_id: user.triarvonProfile.id,
                coachType: coachType as CoachType
            }
        },
        update: { welcomeShown: true },
        create: {
            profile_id: user.triarvonProfile.id,
            coachType: coachType as CoachType,
            welcomeShown: true
        }
    });

    return NextResponse.json({ success: true });
};

export const POST = withErrorHandler(handler);
