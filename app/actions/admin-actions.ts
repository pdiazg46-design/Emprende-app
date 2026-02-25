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

    // Calculate estimated revenue (Padrinazgos OUT)
    const proUsers = await prisma.user.count({
        where: {
            role: "USER",
            subscriptionStatus: "ACTIVE",
            subscriptionPlan: "PRO",
            notes: { not: "GIFT" }
        }
    })

    // $15.000 CLP per pro user
    const monthlyRevenue = proUsers * 15000

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
            notes: true,
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

export async function grantProAccess(userId: string) {
    await requireAdmin()

    try {
        await prisma.user.update({
            where: { id: userId },
            data: { subscriptionStatus: 'ACTIVE', subscriptionPlan: 'PRO', notes: 'GIFT' }
        })
        revalidatePath("/admin")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to grant PRO access" }
    }
}

export async function grantBasicAccess(userId: string) {
    await requireAdmin()

    try {
        await prisma.user.update({
            where: { id: userId },
            data: { subscriptionStatus: 'ACTIVE', subscriptionPlan: 'BASIC', notes: 'GIFT' }
        })
        revalidatePath("/admin")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to grant Basic access" }
    }
}

export async function getSaaSAnalytics() {
    await requireAdmin()

    // 1. Get raw chronological data of ALL users
    const allUsers = await prisma.user.findMany({
        orderBy: { createdAt: 'asc' },
        select: {
            createdAt: true,
            subscriptionPlan: true,
            subscriptionStatus: true,
            notes: true
        }
    })

    // 2. Setup Monthly Accumulation Array
    const monthlyDataMap = new Map<string, { month: string, pro: number, basic: number, trial: number }>()

    allUsers.forEach(user => {
        // Format as "Feb 26", "Mar 26" string logic
        const date = new Date(user.createdAt)
        const monthKey = new Intl.DateTimeFormat('es-CL', { month: 'short', year: '2-digit' }).format(date) // e.g., "feb. 26"

        // Capitalize month key
        const formattedMonth = monthKey.charAt(0).toUpperCase() + monthKey.slice(1)

        if (!monthlyDataMap.has(formattedMonth)) {
            monthlyDataMap.set(formattedMonth, { month: formattedMonth, pro: 0, basic: 0, trial: 0 })
        }

        const dataPoint = monthlyDataMap.get(formattedMonth)!

        // Increment logic based on SaaS states
        if (user.subscriptionStatus === 'ACTIVE' && user.notes !== 'GIFT') {
            if (user.subscriptionPlan === 'PRO') {
                dataPoint.pro += 1
            } else {
                dataPoint.basic += 1
            }
        } else {
            // Unpaid / Idle / Trial / Regalos falls into TRIAL bucket for graphing generic onboarding without financial bias
            dataPoint.trial += 1
        }
    })

    // 3. Derive Composition Total (for Pie Chart) only for Real Money users
    const composition = {
        proTotal: allUsers.filter(u => u.subscriptionStatus === 'ACTIVE' && u.subscriptionPlan === 'PRO' && u.notes !== 'GIFT').length,
        basicTotal: allUsers.filter(u => u.subscriptionStatus === 'ACTIVE' && u.subscriptionPlan === 'BASIC' && u.notes !== 'GIFT').length,
        trialTotal: allUsers.filter(u => u.subscriptionStatus !== 'ACTIVE' || u.notes === 'GIFT').length,
    }

    return {
        // Convert Map to Recharts Array
        trendData: Array.from(monthlyDataMap.values()),
        composition
    }
}
