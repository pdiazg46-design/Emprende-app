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

        // Check Stock Availability
        if (product.stock <= 0) {
            throw new Error(`No puedes vender ${product.name} (Stock: 0). Repone stock u ofrece otra opción al cliente.`);
        }

        if (product.stock < data.amount) {
            throw new Error(`Solo tienes ${product.stock} unidades de ${product.name}. Repone stock si quieres completar el pedido.`);
        }

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

export async function addProduct(data: { name: string, price: number, stock?: number, minStock?: number, cost?: number }) {
    const session = await auth()
    if (!session?.user?.email) throw new Error("Unauthorized")

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) throw new Error("User not found")

    await prisma.product.create({
        data: {
            userId: user.id,
            name: data.name,
            price: data.price,
            stock: data.stock || 0,
            minStock: data.minStock || 5,
            cost: data.cost || 0
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

export async function bulkUpdateStock(updates: { id: string; price?: number; addStock?: number; name?: string; minStock?: number; cost?: number }[]) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("No autorizado")

    console.log("Starting bulkUpdateStock with updates:", updates);
    let movementsCount = 0;

    try {
        for (const update of updates) {
            const data: any = {};
            if (update.price !== undefined) data.price = update.price;
            if (update.name !== undefined) data.name = update.name;
            if (update.minStock !== undefined) data.minStock = update.minStock;
            if (update.cost !== undefined) data.cost = update.cost;

            if (update.addStock && update.addStock > 0) {
                data.stock = { increment: update.addStock };
            }

            // Only proceed if there are changes
            if (Object.keys(data).length > 0) {
                // Perform the update and get the updated product details
                const updatedProduct = await prisma.product.update({
                    where: { id: update.id, userId: session.user.id },
                    data
                });

                // Log Transaction if Stock Added
                if (update.addStock && update.addStock > 0) {
                    await prisma.transaction.create({
                        data: {
                            userId: session.user.id,
                            type: 'INVENTORY_IN',
                            amount: 0,
                            quantity: update.addStock,
                            description: updatedProduct.name, // Use name from updated record
                            productId: updatedProduct.id,
                        }
                    })
                    movementsCount++;
                }

                console.log(`Updated product ${updatedProduct.name} successfully.`);
            } else {
                console.log("Skipping update due to empty values:", update);
            }
        }

        revalidatePath("/")
        return { success: true, count: movementsCount }
    } catch (error) {
        console.error("Error in bulkUpdateStock:", error);
        throw error;
    }
}

// HELPER: Product Matching Logic (Refactored for reuse)
async function findBestProductMatch(description: string, userId: string) {
    const allProducts = await prisma.product.findMany({
        where: { userId: userId }
    });

    const normalize = (str: string) => str.toLowerCase().trim()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const target = normalize(description);

    // 1. Exact Match
    let product = allProducts.find(p => {
        const pName = normalize(p.name);
        return pName === target;
    });

    if (!product) {
        // 2. Singular/Plural & Inclusion
        const simpleTarget = target.replace(/s\b/g, '');

        product = allProducts.find(p => {
            const pName = normalize(p.name);
            const simpleName = pName.replace(/s\b/g, '');
            // Check if simplified names match OR keys contain each other
            return simpleName === simpleTarget || simpleName.includes(simpleTarget) || simpleTarget.includes(simpleName);
        });
    }

    return product;
}

import { randomUUID } from "crypto"

export async function addMultiProductTransaction(items: { amount: number, product: string, isQuantity: boolean }[]) {
    const session = await auth()
    if (!session?.user?.email) throw new Error("Unauthorized")

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) throw new Error("User not found")

    let totalAmount = 0;
    const groupId = randomUUID(); // Link all items to this group
    let successCount = 0;
    let failedItems: string[] = [];
    const transactionsToCreate: any[] = [];

    // 1. Validation Logic
    for (const item of items) {
        if (!item.isQuantity) continue; // Skip non-quantity items for stock check

        const product = await findBestProductMatch(item.product, user.id);

        if (!product) {
            continue;
        }

        // Check Stock
        if (product.stock <= 0) {
            throw new Error(`No puedes vender ${product.name} (Stock: 0). Repone stock u ofrece otra opción al cliente.`);
        }

        if (product.stock < item.amount) {
            throw new Error(`Solo tienes ${product.stock} unidades de ${product.name}. Repone stock si quieres completar el pedido.`);
        }
    }

    // 2. Execution Logic
    for (const item of items) {
        try {
            if (item.isQuantity) {
                const product = await findBestProductMatch(item.product, user.id);

                if (product) {
                    const lineAmount = product.price * item.amount;
                    totalAmount += lineAmount;

                    // Deduct Stock
                    await prisma.product.update({
                        where: { id: product.id },
                        data: { stock: { decrement: item.amount } }
                    });

                    // Prepare Transaction
                    transactionsToCreate.push({
                        userId: user.id,
                        type: 'SALE',
                        amount: lineAmount,
                        quantity: item.amount,
                        description: product.name, // Just the name, quantity is separate
                        productId: product.id,
                        groupId: groupId
                    });

                    successCount++;
                } else {
                    failedItems.push(item.product);
                }
            } else {
                // Non-inventory item (e.g. "1000 de propina")
                totalAmount += item.amount;

                transactionsToCreate.push({
                    userId: user.id,
                    type: 'SALE',
                    amount: item.amount,
                    quantity: 1,
                    description: item.product,
                    productId: null,
                    groupId: groupId
                });

                successCount++;
            }

        } catch (error) {
            console.error("Error processing item:", item, error);
            failedItems.push(item.product);
        }
    }

    if (successCount === 0) {
        return { success: false, message: "No se pudo identificar ningún producto." };
    }

    // 3. Bulk Create Transactions
    if (transactionsToCreate.length > 0) {
        await prisma.transaction.createMany({
            data: transactionsToCreate
        });
    }



    revalidatePath("/");

    // Construct friendly message
    const itemCount = transactionsToCreate.length;
    const itemLabel = itemCount === 1 ? 'producto' : 'productos';

    return {
        success: true,
        amount: totalAmount,
        message: `Venta de ${itemCount} ${itemLabel} registrada.`,
        failedItems
    };

}

export async function getSalesInsights() {
    const session = await auth()
    if (!session?.user?.id) return null

    try {
        // 1. Fetch ALL sales for historical analysis
        const sales = await prisma.transaction.findMany({
            where: {
                userId: session.user.id,
                type: 'SALE'
            },
            orderBy: { createdAt: 'desc' },
            include: {
                product: true
            }
        })

        if (sales.length === 0) {
            return {
                totalRevenue: 0,
                totalTransactions: 0,
                topProducts: [],
                peakHours: [],
                averageTicket: 0
            }
        }

        // 2. Aggregate Data
        const productStats = new Map<string, { name: string, quantity: number, revenue: number }>()
        const hourStats = new Array(24).fill(0)
        let totalRevenue = 0

        sales.forEach(sale => {
            // Product Stats
            const key = sale.productId || sale.description || 'Otros'
            const current = productStats.get(key) || {
                name: sale.description || 'Producto Desconocido',
                quantity: 0,
                revenue: 0
            }

            productStats.set(key, {
                name: current.name,
                quantity: current.quantity + (sale.quantity || 1),
                revenue: current.revenue + sale.amount
            })

            // Hourly Stats
            const hour = new Date(sale.createdAt).getHours()
            hourStats[hour]++

            totalRevenue += sale.amount
        })

        // 3. Format & Sort Results
        const topProducts = Array.from(productStats.values())
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5) // Top 5

        const peakHours = hourStats.map((count, hour) => ({ hour, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 3) // Top 3 hours
            .filter(h => h.count > 0)
            .map(h => ({
                hour: `${h.hour}:00`,
                count: h.count,
                intensity: h.count / sales.length // unexpected usage? relative
            }))

        // Calculate Average Ticket (Grouped by GroupID for true ticket size)
        const uniqueGroups = new Set(sales.map(s => s.groupId || s.id)).size
        const averageTicket = uniqueGroups > 0 ? Math.round(totalRevenue / uniqueGroups) : 0

        return {
            totalRevenue,
            totalTransactions: uniqueGroups,
            topProducts,
            peakHours,
            averageTicket
        }

    } catch (error) {
        console.error("Error generating insights:", error)
        return null
    }
}


// --- EXPENSE INTELLIGENCE ---
export async function getExpenseInsights() {
    const session = await auth()
    if (!session?.user?.id) return {
        totalExpenses: 0,
        averageMonthly: 0,
        topCategories: [],
        advice: "No hay datos suficientes."
    }

    const expenses = await prisma.transaction.findMany({
        where: {
            userId: session.user.id,
            type: 'EXPENSE'
        },
        orderBy: { date: 'desc' }
    })

    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0)

    // Monthly Average
    const months = new Set(expenses.map(e => {
        const d = new Date(e.date)
        return `${d.getFullYear()}-${d.getMonth()}`
    })).size
    const averageMonthly = months > 0 ? Math.round(totalExpenses / (months || 1)) : totalExpenses

    // Top Categories (Group by normalized description)
    const categoryMap = new Map<string, number>()
    expenses.forEach(e => {
        const key = (e.description || 'Varios').trim().toUpperCase() // Normalize
        categoryMap.set(key, (categoryMap.get(key) || 0) + e.amount)
    })

    // Convert to array and sort
    const topCategories = Array.from(categoryMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5) // Top 5

    // Generate Humanized Advice (Heuristic Brain)
    let advice = "💡 Consejo: Registra cada gasto, por pequeño que sea. Los 'gastos hormiga' suman."

    if (topCategories.length > 0) {
        const top = topCategories[0]
        const percent = Math.round((top.value / totalExpenses) * 100)

        if (percent > 40) {
            advice = `⚠️ Alerta: El ${percent}% de tu dinero se va en "${top.name}". ¡Es una dependencia riesgoza! Busca proveedores alternativos.`
        } else if (months > 1) {
            // Simple interaction check (mocked for now, real trend would compare prev month)
            advice = `📊 Tu estructura de costos parece estable. Tu mayor ítem es "${top.name}" (${percent}%). ¿Es un costo fijo o puedes negociarlo?`
        } else {
            advice = `👀 Ojo con "${top.name}". Representa tu mayor salida de caja hoy ($${top.value.toLocaleString('es-CL')}).`
        }
    }

    return {
        totalExpenses,
        averageMonthly,
        topCategories,
        advice,
        historyCount: expenses.length
    }
}

// --- INVENTORY INTELLIGENCE ---
export async function getInventoryInsights() {
    const session = await auth()
    if (!session?.user?.id) return {
        totalValue: 0,
        totalCost: 0,
        potentialProfit: 0,
        lowStockItems: [],
        topValuedItems: [],
        advice: "Crea productos para ver análisis."
    }

    const inventory = await prisma.product.findMany({
        where: { userId: session.user.id },
        orderBy: { stock: 'asc' } // Low stock first
    })

    const totalValue = inventory.reduce((sum, p) => sum + (p.price * p.stock), 0)
    // Assuming 'cost' field exists (Phase 1). If not, default to 0.
    const totalCost = inventory.reduce((sum, p) => sum + ((p.cost || 0) * p.stock), 0)
    const potentialProfit = totalValue - totalCost

    const lowStockItems = inventory.filter(p => p.stock <= (p.minStock || 5)).slice(0, 5)

    const topValuedItems = [...inventory]
        .sort((a, b) => (b.price * b.stock) - (a.price * a.stock))
        .slice(0, 5)

    let advice = "📦 Consejo: Un inventario parado es dinero perdiendo valor. Revisa qué no se vende hace tiempo."

    if (lowStockItems.length > 0) {
        const criticalItem = lowStockItems[0]
        advice = `🚨 Urgente: Te quedan solo ${criticalItem.stock} unidades de "${criticalItem.name}". Si es un producto estrella, perderás ventas hoy.`
    } else if (inventory.length > 0) {
        if (potentialProfit > totalCost) {
            advice = `🚀 ¡Excelente salud! Tu inventario tiene un alto potencial de retorno. Tienes más ganancia proyectada ($${potentialProfit.toLocaleString('es-CL')}) que costo invertido.`
        } else {
            advice = `✅ Todo en orden. Tienes $${totalValue.toLocaleString('es-CL')} en mercadería lista para venderse. ¡A rotar ese stock!`
        }
    }

    return {
        totalValue,
        totalCost,
        potentialProfit,
        lowStockItems,
        topValuedItems,
        advice,
        totalItems: inventory.length
    }
}

// --- RISK MANAGEMENT SYSTEM ---
export async function getRiskAnalysis() {
    const session = await auth()
    if (!session?.user?.id) return null

    const today = new Date()
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    // Fetch critical data
    const [inventory, salesThisMonth, expensesThisMonth] = await Promise.all([
        prisma.product.findMany({ where: { userId: session.user.id } }),
        prisma.transaction.aggregate({
            _sum: { amount: true },
            where: {
                userId: session.user.id,
                type: 'SALE',
                date: { gte: firstDayOfMonth }
            }
        }),
        prisma.transaction.aggregate({
            _sum: { amount: true },
            where: {
                userId: session.user.id,
                type: 'EXPENSE',
                date: { gte: firstDayOfMonth }
            }
        })
    ])

    const income = salesThisMonth._sum.amount || 0
    const outgo = expensesThisMonth._sum.amount || 0

    // 2. Inventory Risk (Prioritize Stockouts)
    // Sort by: 1. Stock (Asc), 2. Price (Desc) -> Caught zero stock high price first
    const criticalProducts = inventory
        .filter(p => p.stock <= (p.minStock || 5))
        .sort((a, b) => {
            if (a.stock === b.stock) {
                return b.price - a.price // Same stock, higher price first
            }
            return a.stock - b.stock // Lower stock first
        })

    if (criticalProducts.length > 0) {
        const riskyProduct = criticalProducts[0]
        const isStockout = riskyProduct.stock === 0

        return {
            id: `inventory-${riskyProduct.id}-${riskyProduct.stock}`, // specific ID for dismissal
            title: isStockout ? "🛑 ¡Stock Agotado!" : "Riesgo de Quiebre de Stock",
            description: isStockout
                ? `Tu producto "${riskyProduct.name}" está en 0. Estás perdiendo ventas cada minuto.`
                : `Tu producto "${riskyProduct.name}" está en nivel crítico. Es un activo valioso que no puedes dejar de vender.`,
            severity: 'critical',
            actionLabel: "Reponer Inventario",
            actionType: 'INVENTORY',
            stockCount: riskyProduct.stock, // EXPLICIT STOCK COUNT
            highlightValue: true
        }
    }


    // 1. Profitability Risk (Check AFTER inventory to alert visual stuff first? No, money is king.)
    // But user complained about "stuck". 
    // Maybe we should allow cycling? 
    // For now, let's keep Profitability first but make sure it's real red.
    if (income > 0 && outgo > income) {
        return {
            id: 'profitability-red',
            title: "Pérdida Operativa Detectada",
            description: `Tus gastos del mes ($${outgo.toLocaleString('es-CL')}) han superado tus ventas ($${income.toLocaleString('es-CL')}). Estás operando en rojo.`,
            severity: 'critical',
            actionLabel: "Revisar Gastos Ahora",
            actionType: 'EXPENSE'
        }
    }


    // 3. Margin Risk (Warning)
    if (income > 0 && outgo > (income * 0.8)) {
        return {
            title: "Margen Peligroso",
            description: `Cuidado: Tus gastos ya consumieron el 80% de tus ingresos este mes. Te queda poco margen de maniobra.`,
            severity: 'warning',
            actionLabel: "Analizar Fugas",
            actionType: 'EXPENSE'
        }
    }

    return null
}
