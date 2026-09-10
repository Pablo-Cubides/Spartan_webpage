import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { config } from "dotenv";
import path from "path";

// Load .env.local in development
if (process.env.NODE_ENV !== "production") {
  config({ path: path.resolve(process.cwd(), ".env.local"), override: true });
}

declare global {
  // Using var is required for global augmentation in TypeScript
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

let prismaInstance: PrismaClient | null = null;

function getPrismaClient(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error(
      "[Prisma] DATABASE_URL is not set. Available env vars:",
      Object.keys(process.env).filter(
        (k) => k.includes("DATABASE") || k.includes("SUPABASE"),
      ),
    );
    throw new Error(
      "DATABASE_URL environment variable is not set. Check Vercel environment variables.",
    );
  }

  if (!prismaInstance) {
    const isServerless =
      process.env.NODE_ENV === "production" || !!process.env.VERCEL;
    const pool = new Pool({
      connectionString: databaseUrl,
      max: isServerless ? 2 : 10,
      connectionTimeoutMillis: 10000,
    });
    const adapter = new PrismaPg(pool);
    prismaInstance = global.__prisma ?? new PrismaClient({ adapter });
    global.__prisma = prismaInstance;
  }

  return prismaInstance;
}

export const prisma = new Proxy({} as PrismaClient, {
  get: (_, prop) => {
    const client = getPrismaClient();
    return Reflect.get(client, prop);
  },
});

export default prisma;
