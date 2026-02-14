'use server'

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function switchUserPlan(targetEmail: string, newPlan: "FREE" | "PREMIUM") {
    const session = await auth()

    // Security check: Only allow the specific admin to perform this action
    if (session?.user?.email !== "pdiazg46@gmail.com") {
        throw new Error("Unauthorized: Only the admin can switch plans.")
    }

    try {
        await prisma.user.update({
            where: { email: targetEmail },
            data: { plan: newPlan }
        })

        // Revalidate everything to ensure UI updates immediately
        revalidatePath("/", "layout")

        return { success: true, message: `Plan switched to ${newPlan}` }
    } catch (error) {
        console.error("Failed to switch plan:", error)
        return { success: false, message: "Failed to update plan" }
    }
}

export async function getUsers() {
    const session = await auth()

    // Security check: Only allow the specific admin
    if (session?.user?.email !== "pdiazg46@gmail.com") {
        throw new Error("Unauthorized")
    }

    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                plan: true,
                createdAt: true,
                allowedMachineIds: true
            }
        })
        return users
    } catch (error) {
        console.error("Failed to fetch users:", error)
        return []
    }
}

export async function toggleMachineAccess(targetEmail: string, machineId: string) {
    const session = await auth()

    if (session?.user?.email !== "pdiazg46@gmail.com") {
        throw new Error("Unauthorized")
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: targetEmail },
            select: { allowedMachineIds: true }
        })

        if (!user) return { success: false, message: "User not found" }

        const currentIds = user.allowedMachineIds ? user.allowedMachineIds.split(",") : []
        const exists = currentIds.includes(machineId)

        let newIds: string[]
        if (exists) {
            newIds = currentIds.filter(id => id !== machineId)
        } else {
            newIds = [...currentIds, machineId]
        }

        await prisma.user.update({
            where: { email: targetEmail },
            data: { allowedMachineIds: newIds.join(",") }
        })

        revalidatePath("/", "layout")
        return { success: true, message: exists ? "Machine removed" : "Machine authorized" }
    } catch (error) {
        console.error("Failed to toggle machine:", error)
        return { success: false, message: "Error" }
    }
}

export async function getMyAllowedIds() {
    const session = await auth()
    if (!session?.user?.email) return []

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { allowedMachineIds: true }
        })
        return user?.allowedMachineIds ? user.allowedMachineIds.split(",") : []
    } catch (error) {
        console.error("Failed to fetch allowed IDs:", error)
        return []
    }
}
