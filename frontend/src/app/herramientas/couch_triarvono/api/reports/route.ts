// Coach Triarvon - Reports API (Admin Only)
// Layer 3: Community Analytics

import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { verifyIdToken } from '@/lib/server/firebaseAdmin';
import { withErrorHandler, AuthenticationError } from '@/lib/api/error-handler';
import { generateCommunityReport } from '@/lib/coach-triarvon/openai';
import { decryptMessage } from '@/lib/coach-triarvon/encryption';
import { COACH_SETTINGS } from '@/lib/coach-triarvon/config/coaches.config';

// GET - Fetch existing reports
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

    // Check if user is admin
    const user = await prisma.user.findUnique({
        where: { uid: decoded.uid },
        select: { role: true }
    });

    if (!user || user.role !== 'admin') {
        return NextResponse.json(
            { error: 'UNAUTHORIZED', message: 'Admin access required' },
            { status: 403 }
        );
    }

    // Get existing reports
    const reports = await prisma.coachAnalytics.findMany({
        orderBy: { created_at: 'desc' },
        take: 10
    });

    return NextResponse.json({ reports });
};

// POST - Generate a new community report
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

    // Check if user is admin
    const user = await prisma.user.findUnique({
        where: { uid: decoded.uid },
        select: { role: true }
    });

    if (!user || user.role !== 'admin') {
        return NextResponse.json(
            { error: 'UNAUTHORIZED', message: 'Admin access required' },
            { status: 403 }
        );
    }

    // Check if we have enough data
    const conversationsWithMessages = await prisma.coachConversation.findMany({
        where: {
            messageCount: { gte: COACH_SETTINGS.ANALYTICS_MIN_MESSAGES }
        },
        include: {
            profile: {
                select: { user_id: true }
            },
            messages: {
                take: 20,
                orderBy: { created_at: 'desc' }
            }
        }
    });

    // Get unique users
    const uniqueUsers = new Set(conversationsWithMessages.map(c => c.profile.user_id));

    if (uniqueUsers.size < COACH_SETTINGS.ANALYTICS_MIN_USERS) {
        return NextResponse.json({
            error: 'INSUFFICIENT_DATA',
            message: `Need at least ${COACH_SETTINGS.ANALYTICS_MIN_USERS} users with ${COACH_SETTINGS.ANALYTICS_MIN_MESSAGES}+ messages. Currently have ${uniqueUsers.size} users.`
        }, { status: 400 });
    }

    // Create anonymized summaries
    const summaries: string[] = [];
    for (const conv of conversationsWithMessages) {
        // Only include topic keywords, not actual messages
        const topics = conv.messages
            .slice(0, 10)
            .map(m => {
                try {
                    const content = decryptMessage(m.content);
                    // Extract just key topics (very simplified)
                    return `[${conv.coachType}] ${m.role === 'user' ? 'User asked about' : 'Coach discussed'}: ${content.substring(0, 50)}...`;
                } catch {
                    return null;
                }
            })
            .filter(Boolean);

        if (topics.length > 0) {
            summaries.push(topics.join('\n'));
        }
    }

    // Generate report
    const reportContent = await generateCommunityReport(summaries);

    // Save report
    const report = await prisma.coachAnalytics.create({
        data: {
            reportDate: new Date(),
            reportType: 'on_demand',
            content: reportContent,
            userCount: uniqueUsers.size,
            messageCount: conversationsWithMessages.reduce((sum, c) => sum + c.messageCount, 0)
        }
    });

    return NextResponse.json({
        success: true,
        report: {
            id: report.id,
            content: reportContent,
            userCount: report.userCount,
            messageCount: report.messageCount,
            createdAt: report.created_at
        }
    });
};

export const GET = withErrorHandler(getHandler);
export const POST = withErrorHandler(postHandler);
