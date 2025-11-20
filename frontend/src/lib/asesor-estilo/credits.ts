import { APP_CONFIG } from './config/app.config';
import { CreditError } from './errors';
import { appendLog } from './ai/logger';
import { consumeCredits as globalConsume, hasSufficientCredits as globalCheck } from '@/lib/server/credits';
import { prisma } from '@/lib/server/prisma';

/**
 * CREDIT SYSTEM - Integrated with Spartan Platform
 */

/**
 * Gets the cost of a specific action.
 */
export function getActionCost(action: 'analyze' | 'generate' | 'edit'): number {
  switch (action) {
    case 'analyze':
      return APP_CONFIG.credits.COST_PER_ANALYSIS;
    case 'generate':
      return APP_CONFIG.credits.COST_PER_GENERATION;
    case 'edit':
      return APP_CONFIG.credits.COST_PER_GENERATION;
    default:
      return 0;
  }
}

/**
 * Enforce credit requirements before an operation
 * Throws CreditError if insufficient credits
 */
export async function enforceCredits(
  userId: string | undefined, // Expecting Firebase UID
  action: 'analyze' | 'generate' | 'edit'
): Promise<void> {
  const cost = getActionCost(action);
  
  // Skip if cost is 0 or credits not enforced
  if (cost === 0 || !APP_CONFIG.credits.ENFORCE_CREDITS) {
    return;
  }

  if (!userId) {
    throw new CreditError('Debes iniciar sesión para usar esta función.', cost, 0);
  }

  const user = await prisma.user.findUnique({ where: { uid: userId } });
  if (!user) {
    throw new CreditError('Usuario no encontrado.', cost, 0);
  }
  
  const hasEnough = await globalCheck(user.id, cost);
  
  if (!hasEnough) {
    throw new CreditError(
      `Créditos insuficientes. Requeridos: ${cost}, Disponibles: ${user.credits}`,
      cost,
      user.credits
    );
  }
}

/**
 * Consumes a specified number of credits.
 */
export async function consumeCredits(
  userId: string | undefined, // Expecting Firebase UID
  cost: number = 1,
  operation: string = 'unknown'
): Promise<{ ok: boolean; remaining?: number }> {
  if (cost === 0 || !APP_CONFIG.credits.ENFORCE_CREDITS) {
    return { ok: true, remaining: 999 };
  }

  if (!userId) return { ok: false };

  const user = await prisma.user.findUnique({ where: { uid: userId } });
  if (!user) return { ok: false };

  const success = await globalConsume(user.id, cost, operation);
  
  // Fetch fresh credits
  const updatedUser = await prisma.user.findUnique({ where: { id: user.id } });

  return { ok: success, remaining: updatedUser?.credits };
}

// Legacy/Unused functions kept for compatibility if needed, but stubbed
export async function checkCredits(sessionId: string): Promise<number> {
  return 0; 
}

export async function addCredits(sessionId: string, amount: number): Promise<{ ok: boolean; newBalance: number }> {
  return { ok: false, newBalance: 0 };
}
