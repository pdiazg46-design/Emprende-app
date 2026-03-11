import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const userEmail = "pdiazg46@gmail.com";
    const user = await prisma.user.findUnique({ where: { email: userEmail } });
    
    if(!user) {
        console.log("No user found.");
        return;
    }

    const tzOffsetHours = 3;
    const baseDate = new Date(); // now

    const chileTime = new Date(baseDate.getTime() - (tzOffsetHours * 60 * 60 * 1000));

    const year = chileTime.getUTCFullYear();
    const month = chileTime.getUTCMonth();
    const date = chileTime.getUTCDate();

    // Medianoche en Chile expresada en horario UTC
    const todayStart = new Date(Date.UTC(year, month, date, tzOffsetHours, 0, 0, 0));

    // Medianoche Final en Chile (23:59:59)
    const todayEnd = new Date(Date.UTC(year, month, date, tzOffsetHours + 23, 59, 59, 999));

    const rawTxToday = await prisma.transaction.findMany({
        where: {
            userId: user.id,
            createdAt: { gte: todayStart, lte: todayEnd }
        },
        orderBy: { createdAt: 'desc' }
    });

    console.log(`Found ${rawTxToday.length} raw transactions today between ${todayStart.toISOString()} and ${todayEnd.toISOString()}`);
    
    if(rawTxToday.length > 0) {
        console.log("Recent 3:", rawTxToday.slice(0,3).map(tx => ({ type: tx.type, amount: tx.amount, date: tx.createdAt, desc: tx.description })));
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
