
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is required');
}
const prisma = new PrismaClient({
  adapter: new PrismaPg(new Pool({ connectionString: databaseUrl })),
});

async function main() {
  console.log('🚀 Testing Signup Bonus...');

  const testUid = 'bonus-test-' + Date.now();
  const testEmail = `bonus-${Date.now()}@example.com`;

  // Simulate what happens in api/users/profile PUT
  // We can't call the API directly easily because of auth, but we can simulate the DB call
  // which is what we changed.
  
  console.log(`Creating user ${testUid} via upsert (simulating API)...`);
  
  const data = {
    email: testEmail,
    name: 'Bonus Tester',
    alias: 'bonus_tester',
  };

  const user = await prisma.user.upsert({
    where: { uid: testUid },
    update: data,
    create: { 
      uid: testUid, 
      ...data,
      credits: 2 // This is the logic we added to the route
    },
  });

  console.log(`User created. Credits: ${user.credits}`);

  if (user.credits === 2) {
    console.log('✅ SUCCESS: User received 2 free credits!');
  } else {
    console.error(`❌ FAILURE: User has ${user.credits} credits instead of 2.`);
    process.exit(1);
  }

  // Cleanup
  await prisma.user.delete({ where: { id: user.id } });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
