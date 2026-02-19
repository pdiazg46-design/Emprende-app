"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

// Check if current user is admin
async function requireAdmin() {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") {
        redirect("/emprende")
    }
    return session
}

export async function getAdminStats() {
    await requireAdmin()

    const totalUsers = await prisma.user.count({
        where: { role: "USER" }
    })

    const activeUsers = await prisma.user.count({
        where: {
            role: "USER",
            subscriptionStatus: "ACTIVE"
        }
    })

    const trialUsers = await prisma.user.count({
        where: {
            role: "USER",
            subscriptionStatus: "TRIAL"
        }
    })

    // Calculate estimated revenue (simple for now)
    const proUsers = await prisma.user.count({
        where: {
            role: "USER",
            subscriptionStatus: "ACTIVE",
            subscriptionPlan: "PRO"
        }
    })

    // $4.990 CLP per pro user
    const monthlyRevenue = proUsers * 4990

    return {
        totalUsers,
        activeUsers,
        trialUsers,
        monthlyRevenue
    }
}

export async function getAllUsers() {
    await requireAdmin()

    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
            subscriptionStatus: true,
            subscriptionPlan: true,
            nextPaymentDate: true,
            createdAt: true,
            _count: {
                select: {
                    transactions: true,
                    products: true
                }
            }
        }
    })

    return users
}

export async function updateUserStatus(userId: string, status: string) {
    await requireAdmin()

    try {
        await prisma.user.update({
            where: { id: userId },
            data: { subscriptionStatus: status }
        })
        revalidatePath("/admin")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to update status" }
    }
}

export async function updateUserPlan(userId: string, plan: string) {
    await requireAdmin()

    try {
        await prisma.user.update({
            where: { id: userId },
            data: { subscriptionPlan: plan }
        })
        revalidatePath("/admin")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to update plan" }
    }
}
