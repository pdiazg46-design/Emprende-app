const { PrismaClient } = require('@prisma/client-finanza');

const prismaFinanza = new PrismaClient({
    datasources: {
        db: {
            url: "postgres://16edf67f0a84b357f04c9ef665a79e2c46f4ec45faa22730f9e40e4bf400cfad:sk_46_eXqtA75nb4J9sQWQbN@db.prisma.io:5432/postgres?sslmode=require"
        }
    }
});

async function main() {
    try {
        console.log("Simulando Inserción...");
        const finanzaUser = await prismaFinanza.user.findUnique({
            where: { email: "pdiazg46@gmail.com" },
            include: { sharedFund: true }
        });

        if (!finanzaUser || !finanzaUser.sharedFund) {
            console.log("Usuario o fondo no hallado");
            return;
        }

        const inserted = await prismaFinanza.movement.create({
            data: {
                amount: 1234,
                type: 'INCOME',
                fundId: finanzaUser.sharedFund.id,
                category: 'Ingreso Empresarial',
                description: `Retiro desde Emprende POS (CASH TEST)`,
                installments: 1
            }
        });
        console.log("Inserción exitosa:", inserted);
    } catch (e) {
        console.error("Fallo durante Inserción:", e);
    } finally {
        await prismaFinanza.$disconnect();
    }
}

main();
