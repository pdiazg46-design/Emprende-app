const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Mock auth
jest = { mock: () => { } }; // trick if it uses node modules normally

async function run() {
    const user = await prisma.user.findFirst();
    if (!user) return console.log('no user');

    const tzOffsetHours = 3;
    const chileTime = new Date('2026-03-03T19:00:00Z');
    const year = chileTime.getUTCFullYear();
    const month = chileTime.getUTCMonth();
    const date = chileTime.getUTCDate();
    const lastMonthStart = new Date(Date.UTC(year, month - 1, 1, tzOffsetHours, 0, 0, 0));
    const lastMonthEnd = new Date(Date.UTC(year, month, 0, tzOffsetHours + 23, 59, 59, 999));

    console.log('Febrero Bounds:', lastMonthStart, 'to', lastMonthEnd);

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
            createdAt: { gte: lastMonthStart, lte: lastMonthEnd } // exact bounds used in finance-actions
        }
    });

    let sGross = 0, mpGross = 0;
    sales.forEach(s => {
        if (s.paymentMethod === 'SUMUP') sGross += s.amount;
        if (s.paymentMethod === 'MERCADO_PAGO') mpGross += s.amount;
    });

    console.log('Result last_month:', sales.length, 'ventas. SUMUP:', sGross, 'MP:', mpGross);
}
run().catch(console.error).finally(() => prisma.$disconnect());
