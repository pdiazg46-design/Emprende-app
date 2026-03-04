import { PrismaClient } from '../node_modules/@prisma/client-finanza'

const globalForPrismaFinanza = globalThis as unknown as { prismaFinanza: PrismaClient }

const dummyUrl = "postgresql://dummy:dummy@localhost:5432/dummy"

export const prismaFinanza =
    globalForPrismaFinanza.prismaFinanza ||
    new PrismaClient({
        datasources: {
            db: {
                url: process.env.FINANZA_DATABASE_URL || dummyUrl
            }
        },
        log: ['query', 'error', 'warn']
    })

//@ts-ignore
if (process.env.NODE_ENV !== 'production') globalForPrismaFinanza.prismaFinanza = prismaFinanza
