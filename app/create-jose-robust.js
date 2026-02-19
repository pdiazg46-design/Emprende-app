const fs = require('fs');
const log = (msg) => fs.appendFileSync('create-user.log', msg + '\n');
console.log = log;
console.error = log;

// Intentar importar desde la ruta generada estándar o relativa
// Basado en que list_dir mostró client-finanza en node_modules/@prisma
let PrismaClient;
try {
    PrismaClient = require('@prisma/client-finanza').PrismaClient;
} catch (e) {
    log('No se pudo cargar @prisma/client-finanza, intentando rutas alternativas...');
    try {
        PrismaClient = require('./node_modules/@prisma/client-finanza').PrismaClient;
    } catch (e2) {
        console.error('Error cargando cliente. Asegúrate de haber ejecutado: npx prisma generate --schema=./prisma/finanza.prisma');
        console.error(e2);
        process.exit(1);
    }
}

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL_FINANZA || "file:./finanza.db"
        }
    }
})

async function main() {
    const email = 'josediaz@test.com'
    const name = 'Jose Diaz'

    console.log(`Conectando a DB...`)
    // Verificar conexión
    try {
        await prisma.$connect();
        console.log('Conexión exitosa.');
    } catch (e) {
        console.error('Error de conexión:', e);
        process.exit(1);
    }

    console.log(`Creando usuario: ${name} (${email})...`)

    const user = await prisma.user.upsert({
        where: { email },
        update: { name },
        create: {
            email,
            name,
            image: null,

        },
    })

    console.log('Usuario creado/verificado:', user)

    // Crear SharedFund si no existe
    const fund = await prisma.sharedFund.findUnique({
        where: { userId: user.id }
    })

    if (!fund) {
        console.log('Creando Shared Fund inicial...')
        await prisma.sharedFund.create({
            data: {
                userId: user.id,
                name: `Fondo de ${name}`,
                balance: 0,
                monthlyBurnRate: 0,
                totalSavings: 0,
                partnerName: 'Pareja Test',
                partnerContribution: 0
            }
        })
        console.log('Shared Fund creado.')
    } else {
        console.log('Shared Fund ya existe.')
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
