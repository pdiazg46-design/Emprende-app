const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const c = await prisma.transaction.count({
        where: {
            type: 'SALE',
            createdAt: { gte: new Date('2026-02-01T00:00:00Z'), lt: new Date('2026-03-01T00:00:00Z') }
        }
    });
    console.log('Ventas en Febrero 2026:', c);
}

main().catch(console.error).finally(() => prisma.$disconnect());
