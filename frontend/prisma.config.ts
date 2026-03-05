import { config } from 'dotenv';
import { defineConfig } from 'prisma/config';

config({ path: '.env.local', override: true });

const resolvedDatabaseUrl =
  process.env.DATABASE_URL ||
  process.env.DIRECT_URL ||
  'postgresql://postgres:postgres@localhost:5432/postgres';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: resolvedDatabaseUrl,
  },
});
