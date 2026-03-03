const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanFebruary() {
    const user = await prisma.user.findFirst();
    if (!user) return console.log('Error: Usuario no encontrado.');

    console.log(`Iniciando purga de datos financieros para: ${user.email} en Febrero 2026`);

    // Definir límites de Febrero 2026 UTC
    const febStart = new Date('2026-02-01T00:00:00Z');
    const febEnd = new Date('2026-03-01T00:00:00Z');

    try {
        // Borrar Ventas (SALE) y Gastos (EXPENSE)
        // NOTA: Se excluyen explícitamente ajustes de inventario para no alterar el stock actual
        const deletedRecords = await prisma.transaction.deleteMany({
            where: {
                userId: user.id,
                type: {
                    in: ['SALE', 'EXPENSE']
                },
                createdAt: {
                    gte: febStart,
                    lt: febEnd
                }
            }
        });

        console.log(`[EXITO] Se eliminaron permanentemente ${deletedRecords.count} registros financieros de Febrero.`);
    } catch (error) {
        console.error('Error durante el borrado:', error);
    }
}

cleanFebruary().finally(() => prisma.$disconnect());
