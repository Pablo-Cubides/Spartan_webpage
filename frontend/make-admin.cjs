const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.update({
        where: { email: 'spartanmarketcol@gmail.com' },
        data: { role: 'admin', credits: 100 }
    });
    console.log('✅ Usuario actualizado:');
    console.log('  Email:', user.email);
    console.log('  Role:', user.role);
    console.log('  Credits:', user.credits);
    await prisma.$disconnect();
}

main().catch(e => {
    console.error('Error:', e.message);
    process.exit(1);
});
