// Coach Espartano - Credits Management
// Handles free tier and credit consumption for coach chat

import { prisma } from '../server/prisma';
import { COACH_SETTINGS } from './config/coaches.config';

// Get current month-year string
function getCurrentMonthYear(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// Check if user can send a message (has free messages or credits)
export async function canSendMessage(userId: number): Promise<{
    canSend: boolean;
    reason?: 'no_credits' | 'rate_limit';
    freeRemaining?: number;
}> {
    // Get or create free messages record for this month
    const monthYear = getCurrentMonthYear();

    let freeRecord = await prisma.coachFreeMessages.findUnique({
        where: { user_id: userId }
    });

    // If no record or different month, reset count
    if (!freeRecord || freeRecord.monthYear !== monthYear) {
        freeRecord = await prisma.coachFreeMessages.upsert({
            where: { user_id: userId },
            update: { count: 0, monthYear },
            create: { user_id: userId, count: 0, monthYear }
        });
    }

    // Check if user has free messages remaining
    // Note: User gets 2 free credits on signup which allow 10 messages (5 per credit)
    // Plus any additional free monthly allowance if configured

    // For now, use credit system: 5 messages per credit
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { credits: true }
    });

    if (!user) {
        return { canSend: false, reason: 'no_credits' };
    }

    // Calculate messages available from credits
    // 5 messages per credit
    const messagesFromCredits = user.credits * COACH_SETTINGS.MESSAGES_PER_CREDIT;

    // Count messages sent this month
    const freeMessagesUsed = freeRecord.count;

    // User can send if they have credit-based messages available
    // We track how many messages have been used and consume credit every 5 messages
    if (user.credits > 0 || (freeMessagesUsed < COACH_SETTINGS.MESSAGES_PER_CREDIT)) {
        return {
            canSend: true,
            freeRemaining: Math.max(0, messagesFromCredits - (freeMessagesUsed % COACH_SETTINGS.MESSAGES_PER_CREDIT))
        };
    }

    return { canSend: false, reason: 'no_credits' };
}

// Record that a message was sent and consume credit if needed
export async function recordMessageSent(userId: number): Promise<{
    success: boolean;
    creditConsumed: boolean;
    remainingCredits?: number;
}> {
    const monthYear = getCurrentMonthYear();

    // Increment message count
    const freeRecord = await prisma.coachFreeMessages.upsert({
        where: { user_id: userId },
        update: {
            count: { increment: 1 },
            monthYear // Keep month updated
        },
        create: {
            user_id: userId,
            count: 1,
            monthYear
        }
    });

    // Check if we need to consume a credit (every 5 messages)
    if (freeRecord.count % COACH_SETTINGS.MESSAGES_PER_CREDIT === 0) {
        // Time to consume a credit
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { credits: true }
        });

        if (user && user.credits > 0) {
            await prisma.user.update({
                where: { id: userId },
                data: { credits: { decrement: 1 } }
            });

            return {
                success: true,
                creditConsumed: true,
                remainingCredits: user.credits - 1
            };
        }
    }

    // Get current credits for response
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { credits: true }
    });

    return {
        success: true,
        creditConsumed: false,
        remainingCredits: user?.credits ?? 0
    };
}

// Get user's credit status for display
export async function getCreditStatus(userId: number): Promise<{
    credits: number;
    messagesRemaining: number;
    messagesUntilNextCredit: number;
}> {
    const monthYear = getCurrentMonthYear();

    const [user, freeRecord] = await Promise.all([
        prisma.user.findUnique({
            where: { id: userId },
            select: { credits: true }
        }),
        prisma.coachFreeMessages.findUnique({
            where: { user_id: userId }
        })
    ]);

    const credits = user?.credits ?? 0;
    const messagesUsed = (freeRecord?.monthYear === monthYear ? freeRecord.count : 0);
    const messagesInCurrentCreditCycle = messagesUsed % COACH_SETTINGS.MESSAGES_PER_CREDIT;
    const messagesUntilNextCredit = COACH_SETTINGS.MESSAGES_PER_CREDIT - messagesInCurrentCreditCycle;
    const messagesRemaining = (credits * COACH_SETTINGS.MESSAGES_PER_CREDIT) - messagesInCurrentCreditCycle;

    return {
        credits,
        messagesRemaining: Math.max(0, messagesRemaining),
        messagesUntilNextCredit
    };
}
