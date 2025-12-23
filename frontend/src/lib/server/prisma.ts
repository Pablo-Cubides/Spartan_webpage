import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'
import path from 'path'

// Load .env.local in development
if (process.env.NODE_ENV !== 'production') {
  config({ path: path.resolve(process.cwd(), '.env.local'), override: true })
}

declare global {
  // Using var is required for global augmentation in TypeScript
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined
}

const databaseUrl = process.env.DATABASE_URL

let prismaInstance: PrismaClient | null = null

function getPrismaClient(): PrismaClient {
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set')
  }

  if (!prismaInstance) {
    prismaInstance = global.__prisma ?? new PrismaClient({
      datasourceUrl: databaseUrl,
    })

    if (process.env.NODE_ENV !== 'production') {
      global.__prisma = prismaInstance
    }
  }

  return prismaInstance
}

export const prisma = new Proxy({} as PrismaClient, {
  get: (_, prop) => {
    const client = getPrismaClient()
    return Reflect.get(client, prop)
  },
})

export default prisma
