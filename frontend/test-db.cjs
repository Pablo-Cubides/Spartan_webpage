const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Connecting...');
    await prisma.$connect();
    console.log('Connected successfully!');
    
    // Check if tables exist
    const users = await prisma.user.count().catch(e => console.log('User table check failed:', e.message));
    console.log('User count check done');
    
  } catch (e) {
    console.error('Connection error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
