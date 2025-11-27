import { prisma } from './prisma'

export async function hasSufficientCredits(userId: number, amount: number): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true }
  })
  return (user?.credits ?? 0) >= amount
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function consumeCredits(userId: number, amount: number, _description: string): Promise<boolean> {
  try {
    return await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { credits: true }
      })

      if (!user || user.credits < amount) {
        return false
      }

      await tx.user.update({
        where: { id: userId },
        data: { credits: { decrement: amount } }
      })

      // Future: Log usage to a CreditUsage table if it exists
      
      return true
    })
  } catch (error) {
    console.error('Error consuming credits:', error)
    return false
  }
}
