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
                accountEmail: data.accountEmail
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
            accountEmail: true
        }
    })

    return user
}
