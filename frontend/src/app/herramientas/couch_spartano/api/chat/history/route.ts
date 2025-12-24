// Coach Espartano - Chat History API
// Fetches previous messages for a specific coach

import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { verifyIdToken } from '@/lib/server/firebaseAdmin';
import { withErrorHandler, AuthenticationError, NotFoundError } from '@/lib/api/error-handler';
import { decryptMessage } from '@/lib/coach-espartano/encryption';
import { type CoachType, COACHES } from '@/lib/coach-espartano/config/coaches.config';

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

    const searchParams = request.nextUrl.searchParams;
    const coachType = searchParams.get('coachType');

    if (!coachType || !(coachType in COACHES)) {
        return NextResponse.json(
            { error: 'Invalid coach type' },
            { status: 400 }
        );
    }

    const user = await prisma.user.findUnique({
        where: { uid: decoded.uid },
        include: {
            spartanProfile: true
        }
    });

    if (!user || !user.spartanProfile) {
        throw new NotFoundError('User profile');
    }

    // Get conversation with messages
    const conversation = await prisma.coachConversation.findUnique({
        where: {
            profile_id_coachType: {
                profile_id: user.spartanProfile.id,
                coachType: coachType as CoachType
            }
        },
        include: {
            messages: {
                orderBy: { created_at: 'asc' },
                take: 100 // Load last 100 messages
            }
        }
    });

    if (!conversation) {
        return NextResponse.json({ messages: [] });
    }

    // Decrypt messages
    const messages = conversation.messages.map(m => ({
        role: m.role,
        content: decryptMessage(m.content),
        created_at: m.created_at
    }));

    return NextResponse.json({ messages });
};

export const GET = withErrorHandler(handler);
