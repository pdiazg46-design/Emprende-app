const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    const user = await prisma.user.findFirst();
    const sales = await prisma.transaction.findMany({
        where: { userId: user.id, type: 'SALE', amount: { gt: 0 }, createdAt: { gte: new Date('2026-02-01T00:00:00Z'), lt: new Date('2026-03-01T00:00:00Z') } }
    });

    let sumup = 0, mp = 0, trans = 0, cash = 0, undef = 0;
    sales.forEach(s => {
        if (s.paymentMethod === 'SUMUP') sumup++;
        else if (s.paymentMethod === 'MERCADO_PAGO') mp++;
        else if (s.paymentMethod === 'TRANSFER') trans++;
        else if (s.paymentMethod === 'CASH') cash++;
        else undef++;
    });
    console.log('Metodos Febrero:', { sumup, mp, trans, cash, undef });
}
run().catch(console.error).finally(() => prisma.$disconnect());
