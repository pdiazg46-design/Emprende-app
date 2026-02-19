
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const email = process.argv[2]
    if (!email) {
        console.error('Please provide an email address')
        process.exit(1)
    }

    console.log(`Promoting ${email} to ADMIN...`)

    try {
        const user = await prisma.user.update({
            where: { email },
            data: {
                role: 'ADMIN',
                subscriptionStatus: 'ACTIVE',
                subscriptionPlan: 'PRO',
            },
        })
        console.log(`Success! User ${user.email} is now ${user.role} with status ${user.subscriptionStatus}`)
    } catch (error) {
        console.error('Error updating user:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
