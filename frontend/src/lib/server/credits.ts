import { prisma } from './prisma'
import { Prisma } from '@prisma/client'

export async function hasSufficientCredits(userId: number, amount: number): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true }
  })
  return (user?.credits ?? 0) >= amount
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function consumeCredits(
  userId: number,
  amount: number,
  operation: string,
  metadata?: Prisma.InputJsonValue
): Promise<boolean> {
  try {
    return await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { credits: true }
      })

      if (!user || user.credits < amount) {
        return false
      }

      // Decrement credits
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { credits: { decrement: amount } }
      })

      // Log usage to CreditUsage table
      await tx.creditUsage.create({
        data: {
          user_id: userId,
          amount: amount,
          operation: operation,
          description: `Used ${amount} credit(s) for ${operation}`,
          balance_after: updatedUser.credits,
          metadata: metadata ?? undefined
        }
      })

      return true
    })
  } catch (error) {
    console.error('Error consuming credits:', error)
    return false
  }
}

