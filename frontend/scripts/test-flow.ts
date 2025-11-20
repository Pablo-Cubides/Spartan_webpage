
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { hasSufficientCredits, consumeCredits } from '../src/lib/server/credits.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting Credit Flow Test...');

  let user, pkg, purchase;

  try {
    // 1. Create Test User
    const testUid = 'test-user-' + Date.now();
    const testEmail = `test-${Date.now()}@example.com`;
    console.log(`Creating test user: ${testEmail}`);
    
    user = await prisma.user.create({
      data: {
        uid: testUid,
        email: testEmail,
        name: 'Test User',
        credits: 0,
      },
    });
    console.log(`User created with ID: ${user.id}`);

    // 2. Create Test Package
    console.log('Creating test package...');
    pkg = await prisma.creditPackage.create({
      data: {
        name: 'Test Package',
        credits: 10,
        price: 100,
      },
    });
    console.log(`Package created with ID: ${pkg.id}`);

    // 3. Simulate Purchase Initiation (credits/buy)
    console.log('Simulating purchase initiation...');
    purchase = await prisma.purchase.create({
      data: {
        user_id: user.id,
        package_id: pkg.id,
        amount_paid: pkg.price,
        credits_received: pkg.credits,
        payment_method: 'mercadopago',
        status: 'pending',
      },
    });
    console.log(`Purchase created with ID: ${purchase.id} (Pending)`);

    // 4. Simulate Webhook (Payment Approved)
    console.log('Simulating webhook approval...');
    // Logic from webhook: find by ID (external_reference) and update
    const paymentId = 'mp-payment-' + Date.now();
    
    const foundPurchase = await prisma.purchase.findUnique({
      where: { id: purchase.id },
      include: { user: true }
    });

    if (foundPurchase && foundPurchase.status !== 'completed') {
      await prisma.purchase.update({
        where: { id: foundPurchase.id },
        data: { 
          status: 'completed', 
          completed_at: new Date(),
          payment_id: paymentId
        }
      });

      if (foundPurchase.user_id && foundPurchase.credits_received > 0) {
        await prisma.user.update({
          where: { id: foundPurchase.user_id },
          data: { credits: { increment: foundPurchase.credits_received } }
        });
      }
    }
    console.log('Webhook logic executed.');

    // 5. Verify Credits Added
    const userAfterPurchase = await prisma.user.findUnique({ where: { id: user.id } });
    console.log(`User credits after purchase: ${userAfterPurchase?.credits}`);
    if (userAfterPurchase?.credits !== 10) {
      throw new Error('Credits were not added correctly!');
    }

    // 6. Simulate Usage (Analyze)
    console.log('Simulating usage (cost: 1)...');
    const hasCredits = await hasSufficientCredits(user.id, 1);
    if (!hasCredits) throw new Error('User should have sufficient credits!');
    
    const consumed = await consumeCredits(user.id, 1, 'test-analysis');
    if (!consumed) throw new Error('Failed to consume credits!');

    const userAfterUsage = await prisma.user.findUnique({ where: { id: user.id } });
    console.log(`User credits after usage: ${userAfterUsage?.credits}`);
    if (userAfterUsage?.credits !== 9) {
      throw new Error('Credits were not deducted correctly!');
    }

    console.log('✅ Test Flow Completed Successfully!');

  } catch (error) {
    console.error('❌ Test Failed:', error);
    throw error;
  } finally {
    // Cleanup
    console.log('Cleaning up...');
    if (purchase) await prisma.purchase.delete({ where: { id: purchase.id } }).catch(() => {});
    if (pkg) await prisma.creditPackage.delete({ where: { id: pkg.id } }).catch(() => {});
    if (user) await prisma.user.delete({ where: { id: user.id } }).catch(() => {});
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
