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

    // $9.990 CLP per pro user
    const monthlyRevenue = proUsers * 9990

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
            f29Active: true,
            ecommerceActive: true,
            ppmRate: true,
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

export async function updateUserF29(userId: string, f29Active: boolean, ppmRate: number) {
    await requireAdmin()

    try {
        await prisma.user.update({
            where: { id: userId },
            data: { f29Active, ppmRate }
        })
        revalidatePath("/admin")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to update F29 configuration" }
    }
}

export async function updateUserEcommerce(userId: string, ecommerceActive: boolean) {
    await requireAdmin()

    try {
        await prisma.user.update({
            where: { id: userId },
            data: { ecommerceActive }
        })
        revalidatePath("/admin")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to update E-Commerce configuration" }
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

export async function deleteUser(userId: string) {
    await requireAdmin()

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { mpPreapprovalId: true, name: true, email: true }
        })

        if (!user) {
            return { success: false, error: "Usuario no encontrado" }
        }

        // 1. Cancel in MercadoPago if a preapproval plan exists
        if (user.mpPreapprovalId) {
            try {
                const mpRes = await fetch(`https://api.mercadopago.com/preapproval/${user.mpPreapprovalId}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ status: 'cancelled' })
                })
                
                if (!mpRes.ok) {
                    const mpError = await mpRes.text()
                    console.error(`MP Cancellation Error for ${user.email} (${user.mpPreapprovalId}):`, mpError)
                    // We log it but continue deleting from the platform so the admin isn't blocked 
                    // if the MP plan was already cancelled externally.
                } else {
                    console.log(`Successfully cancelled MP Subscription ${user.mpPreapprovalId} for ${user.email}`)
                }
            } catch (error) {
                console.error("Network error while cancelling MP subscription:", error)
            }
        }

        // 2. Cascade delete records mathematically to avoid Foreign Key conflicts
        await prisma.$transaction([
            prisma.transaction.deleteMany({ where: { userId } }),
            prisma.product.deleteMany({ where: { userId } }),
            prisma.account.deleteMany({ where: { userId } }),
            prisma.session.deleteMany({ where: { userId } }),
            prisma.user.delete({ where: { id: userId } })
        ])

        revalidatePath("/admin")
        return { success: true }
    } catch (error) {
        console.error("Delete user error:", error)
        return { success: false, error: "Fallo crítico al eliminar el usuario y sus dependencias." }
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
