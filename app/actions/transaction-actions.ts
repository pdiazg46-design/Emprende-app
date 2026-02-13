"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function addTransaction(data: { type: string, amount: number, description?: string, productId?: string, isQuantity?: boolean }) {
    const session = await auth()
    if (!session?.user?.email) throw new Error("Unauthorized")

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) throw new Error("User not found")

    let finalAmount = data.amount;
    let finalProductId = data.productId;
    let finalDescription = data.description;
    let finalQuantity = 1; // Default to 1
    let successMessage = "";

    // RESTOCK LOGIC
    if (data.type === 'INVENTORY_RESTOCK' && data.description) {
        const product = await prisma.product.findFirst({
            where: {
                userId: user.id,
                name: { contains: data.description }
            }
        })

        if (!product) {
            throw new Error(`No encontré el producto "${data.description}".`)
        }

        // Increment Stock
        await prisma.product.update({
            where: { id: product.id },
            data: { stock: { increment: data.amount } }
        })

        finalAmount = 0; // No financial impact for simple restock as requested
        finalProductId = product.id;
        finalQuantity = data.amount;
        finalDescription = product.name; // Just the name, 'Inventario' comes from Type in UI
        successMessage = `Repuestos ${data.amount} ${product.name}. Nuevo stock: ${product.stock + data.amount}.`;

        // Map to INVENTORY_IN type for DB
        data.type = 'INVENTORY_IN';
    }

    // STOCK DEDUCTION LOGIC
    if (data.isQuantity && data.type === 'SALE' && data.description) {
        // 1. Fetch ALL products to perform smart matching in JS
        const allProducts = await prisma.product.findMany({
            where: { userId: user.id }
        });

        // 2. Normalize helper
        const normalize = (str: string) => str.toLowerCase().trim()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Remove accents

        const target = normalize(data.description);

        // 3. Find Best Match
        let product = allProducts.find(p => {
            const pName = normalize(p.name);
            return pName === target; // Exact Query
        });

        if (!product) {
            // Try Singular/Plural flexibility
            // Remove 's' from end of words for comparison
            const simpleTarget = target.replace(/s\b/g, '');

            product = allProducts.find(p => {
                const pName = normalize(p.name);
                const simpleName = pName.replace(/s\b/g, '');

                // Check if simplified names match OR keys contain each other
                return simpleName === simpleTarget || simpleName.includes(simpleTarget) || simpleTarget.includes(simpleName);
            });
        }

        if (!product) {
            throw new Error(`No encontré el producto "${data.description}" en tu inventario. Crea el producto primero o di el monto en dinero.`)
        }

        // Calculate Total Amount: Qty * Price
        finalAmount = product.price * data.amount;
        finalProductId = product.id;
        finalDescription = product.name; // Normalize name
        finalQuantity = data.amount;

        // Update Stock
        await prisma.product.update({
            where: { id: product.id },
            data: { stock: { decrement: data.amount } }
        })

        successMessage = `Venta de ${data.amount} ${product.name} ($${finalAmount.toLocaleString('es-CL')}) registrada. Quedan ${product.stock - data.amount}.`;
    }

    await prisma.transaction.create({
        data: {
            userId: user.id,
            type: data.type,
            amount: finalAmount, // Saved as Monitor Amount
            quantity: finalQuantity,
            description: finalDescription,
            productId: finalProductId
        }
    })

    revalidatePath("/")

    // Return explicit message if available, otherwise generic
    return {
        success: true,
        message: successMessage || undefined,
        amount: finalAmount // Return calculated amount for UI
    }
}

export async function addProduct(data: { name: string, price: number, stock?: number }) {
    const session = await auth()
    if (!session?.user?.email) throw new Error("Unauthorized")

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) throw new Error("User not found")

    await prisma.product.create({
        data: {
            userId: user.id,
            name: data.name,
            price: data.price,
            stock: data.stock || 0
        }
    })

    revalidatePath("/")
    return { success: true }
}

export async function getDashboardMetrics() {
    const session = await auth()
    if (!session?.user?.email) return { salesToday: 0, expensesToday: 0, recentTransactions: [], totalStockValue: 0, inventory: [] }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return { salesToday: 0, expensesToday: 0, recentTransactions: [], totalStockValue: 0, inventory: [] }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const transactionsToday = await prisma.transaction.findMany({
        where: {
            userId: user.id,
            createdAt: { gte: today }
        },
        orderBy: { createdAt: 'desc' },
        include: { product: true }
    })

    const salesToday = await prisma.transaction.aggregate({
        where: {
            userId: user.id,
            type: 'SALE',
            date: { gte: today }
        },
        _sum: { amount: true }
    })

    const expensesToday = await prisma.transaction.aggregate({
        where: {
            userId: user.id,
            type: 'EXPENSE',
            date: { gte: today }
        },
        _sum: { amount: true }
    })

    // Calculate Stock Logic
    const inventory = await prisma.product.findMany({
        where: { userId: user.id },
        orderBy: { name: 'asc' }
    })

    const totalStockValue = inventory.reduce((acc, curr) => acc + (curr.price * Math.max(0, curr.stock)), 0)

    return {
        salesToday: salesToday._sum.amount || 0,
        expensesToday: expensesToday._sum.amount || 0,
        transactionsToday,
        totalStockValue,
        inventory
    }
}

export async function getTransactionsByRange(from: string, to: string) {
    const session = await auth()
    if (!session?.user?.email) throw new Error("Unauthorized")

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) throw new Error("User not found")

    // Force Local Time Range
    // appending T00:00:00 uses local time parsing in Node environment
    const startDate = new Date(from + 'T00:00:00');
    const endDate = new Date(to + 'T23:59:59.999');

    console.log(`Searching transactions between: ${startDate.toISOString()} and ${endDate.toISOString()}`)

    return await prisma.transaction.findMany({
        where: {
            userId: user.id,
            createdAt: {
                gte: startDate,
                lte: endDate
            }
        },
        orderBy: { createdAt: 'desc' },
        include: { product: true }
    })
}

export async function deleteTransaction(id: string) {
    const session = await auth()
    if (!session?.user?.email) throw new Error("Unauthorized")

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) throw new Error("User not found")

    await prisma.transaction.delete({
        where: { id, userId: user.id }
    })

    revalidatePath("/")
    return { success: true }
}

export async function deleteProduct(id: string) {
    const session = await auth()
    if (!session?.user?.email) throw new Error("Unauthorized")

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) throw new Error("User not found")

    await prisma.product.delete({
        where: { id, userId: user.id }
    })

    revalidatePath("/")
    return { success: true }
}

export async function bulkUpdateStock(updates: { id: string, name?: string, price: number, addStock: number }[]) {
    const session = await auth()
    if (!session?.user?.email) throw new Error("Unauthorized")

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) throw new Error("User not found")

    let movementsCount = 0;

    for (const update of updates) {
        // Skip if no changes (though usually UI filters this)
        // We will rely on UI filter, but safety check:
        if (update.addStock === 0 && update.price === 0 && !update.name) continue;

        // 1. Update Product (Name, Price & Stock)
        const product = await prisma.product.findUnique({
            where: { id: update.id, userId: user.id } // Ensure ownership
        })

        if (!product) continue;

        await prisma.product.update({
            where: { id: update.id },
            data: {
                name: update.name || product.name, // Update name if provided
                price: update.price,
                stock: { increment: update.addStock }
            }
        })

        // 2. Log Transaction if Stock Added
        if (update.addStock > 0) {
            await prisma.transaction.create({
                data: {
                    userId: user.id,
                    type: 'INVENTORY_IN',
                    amount: 0,
                    quantity: update.addStock,
                    description: update.name || product.name,
                    productId: product.id,
                }
            })
            movementsCount++;
        }
    }

    revalidatePath("/")
    return { success: true, count: movementsCount }
}
