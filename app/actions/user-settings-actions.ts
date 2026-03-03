"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"


export async function updatePaymentConfig(data: {
    mpAccessToken?: string
    mpPublicKey?: string
    useSumUp?: boolean
    acceptsCash?: boolean
    acceptsMercadoPago?: boolean
    acceptsTransfer?: boolean
    bankName?: string
    accountType?: string
    accountNumber?: string
    accountHolder?: string
    accountEmail?: string
    ppmRate?: number
}) {
    const session = await auth()
    if (!session?.user?.id) {
        throw new Error("No autorizado")
    }

    try {
        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                mpAccessToken: data.mpAccessToken,
                mpPublicKey: data.mpPublicKey,
                useSumUp: data.useSumUp,
                acceptsCash: data.acceptsCash,
                acceptsMercadoPago: data.acceptsMercadoPago,
                acceptsTransfer: data.acceptsTransfer,
                bankName: data.bankName,
                accountType: data.accountType,
                accountNumber: data.accountNumber,
                accountHolder: data.accountHolder,
                accountEmail: data.accountEmail,
                ppmRate: data.ppmRate
            }
        })
        revalidatePath("/emprende/settings")
        return { success: true }
    } catch (error) {
        console.error("Error updating payment config:", error)
        throw new Error("Error al guardar configuración")
    }
}

export async function getPaymentConfig() {
    const session = await auth()
    if (!session?.user?.id) return null

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            mpAccessToken: true,
            mpPublicKey: true,
            useSumUp: true,
            acceptsCash: true,
            acceptsMercadoPago: true,
            acceptsTransfer: true,
            bankName: true,
            accountType: true,
            accountNumber: true,
            accountHolder: true,
            accountEmail: true,
            f29Active: true,
            ppmRate: true
        }
    })

    return user
}

export async function requestProUpgrade() {
    const session = await auth()
    if (!session?.user?.id) throw new Error("No autorizado")

    try {
        await prisma.user.update({
            where: { id: session.user.id },
            data: { subscriptionStatus: "UPGRADE_REQUESTED" }
        })
        return { success: true }
    } catch (error) {
        console.error("Error requesting upgrade:", error)
        throw new Error("No se pudo procesar la solicitud")
    }
}

export async function getUserDataCount() {
    const session = await auth()
    if (!session?.user?.id) return { products: 0, transactions: 0 }

    const [products, transactions] = await Promise.all([
        prisma.product.count({ where: { userId: session.user.id } }),
        prisma.transaction.count({ where: { userId: session.user.id } })
    ])

    return { products, transactions }
}

export async function wipeUserData() {
    const session = await auth()
    if (!session?.user?.id) throw new Error("No autorizado")

    // Retrieve user to check plan
    const user = await prisma.user.findUnique({
        where: { id: session.user.id }
    })

    if (user?.subscriptionPlan !== 'PRO') {
        throw new Error("Reinicio Seguro requiere Plan PRO")
    }

    try {
        // Run in transaction to ensure atomicity
        await prisma.$transaction([
            prisma.product.deleteMany({ where: { userId: session.user.id } }),
            prisma.transaction.deleteMany({ where: { userId: session.user.id } })
        ])

        revalidatePath("/emprende")
        return { success: true }
    } catch (error) {
        console.error("Error wiping data:", error)
        throw new Error("Fallo Crítico al intentar borrar datos.")
    }
}
