const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findFirst();
    if (!user) return console.log('No user');

    const sales = await prisma.transaction.findMany({
        where: {
            userId: user.id,
            type: 'SALE',
            amount: { gt: 0 },
            NOT: [
                { description: { contains: 'Añadido', mode: 'insensitive' } },
                { description: { contains: 'Inventario', mode: 'insensitive' } },
                { description: { contains: 'stock', mode: 'insensitive' } },
                { description: { startsWith: 'Repuestos', mode: 'insensitive' } }
            ],
            createdAt: { gte: new Date('2026-02-01T00:00:00Z'), lt: new Date('2026-03-01T00:00:00Z') }
        }
    });

    console.log('Ventas Válidas Febrero 2026 (' + user.email + '):', sales.length);
    if (sales.length > 0) {
        console.log('Sample sale:', sales[0]);
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
