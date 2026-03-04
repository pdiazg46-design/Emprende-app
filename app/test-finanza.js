const { PrismaClient } = require('@prisma/client-finanza');
const fs = require('fs');

const prismaFinanza = new PrismaClient({
    datasources: {
        db: {
            url: "postgres://16edf67f0a84b357f04c9ef665a79e2c46f4ec45faa22730f9e40e4bf400cfad:sk_46_eXqtA75nb4J9sQWQbN@db.prisma.io:5432/postgres?sslmode=require"
        }
    }
});

async function main() {
    try {
        console.log("Conectando a BD Finanzas Remota...");
        const users = await prismaFinanza.user.findMany({
            select: { email: true, sharedFund: { select: { id: true, name: true } } }
        });
        const mapped = users.map(u => ({ email: u.email, fundId: u.sharedFund?.id }));
        fs.writeFileSync('out.json', JSON.stringify(mapped, null, 2), 'utf-8');
        console.log("Written to out.json");
    } catch (e) {
        console.error("Error BD:", e);
    } finally {
        await prismaFinanza.$disconnect();
    }
}

main();
