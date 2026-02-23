
const { PrismaClient } = require('@prisma/client-finanza')
const prisma = new PrismaClient()

async function main() {
    // Usuario solicitado: Jose Diaz
    const email = 'josediaz@test.com'
    const name = 'Jose Diaz'

    console.log(`Creando usuario: ${name} (${email})...`)

    const user = await prisma.user.upsert({
        where: { email },
        update: { name }, // Asegurar que el nombre se actualice si ya existe
        create: {
            email,
            name,
            image: null,
            emailVerified: new Date(),
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
