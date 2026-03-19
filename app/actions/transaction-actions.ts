"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { cache } from "react"
import { findBestProductMatch } from "@/lib/product-matching"

export async function addTransaction(data: { type: string, amount: number, description?: string, productId?: string, isQuantity?: boolean, taxDocumentType?: string, paymentMethod?: string }) {
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
            productId: finalProductId,
            taxDocumentType: data.taxDocumentType,
            paymentMethod: data.paymentMethod
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

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { _count: { select: { products: true } } }
    })

    if (!user) throw new Error("User not found")

    // Límite de Inventario para Plan Básico (Freemium)
    if (user.subscriptionPlan === 'BASIC' && user._count.products >= 30) {
        throw new Error("Límite de 30 productos en Plan Gratis alcanzado. Adquiere el Plan Emprende PRO para inventario ilimitado.");
    }

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

// HELPER: Corrector de Zona Horaria para Servidores Vercel (UTC -> UTC-3 Chile)
function getChileTimeBounds(baseDate: Date = new Date()) {
    const tzOffsetHours = 3;
    const chileTime = new Date(baseDate.getTime() - (tzOffsetHours * 60 * 60 * 1000));

    const year = chileTime.getUTCFullYear();
    const month = chileTime.getUTCMonth();
    const date = chileTime.getUTCDate();

    // Medianoche en Chile expresada en horario UTC
    const todayStart = new Date(Date.UTC(year, month, date, tzOffsetHours, 0, 0, 0));

    const currentDay = chileTime.getUTCDay();
    const diffToMonday = currentDay === 0 ? 6 : currentDay - 1;
    const weekStart = new Date(Date.UTC(year, month, date - diffToMonday, tzOffsetHours, 0, 0, 0));
    const weekEnd = new Date(Date.UTC(year, month, date - diffToMonday + 6, tzOffsetHours + 23, 59, 59, 999));

    // Corrección Semana Anterior
    const lastWeekStart = new Date(Date.UTC(year, month, date - diffToMonday - 7, tzOffsetHours, 0, 0, 0));
    const lastWeekEnd = new Date(Date.UTC(year, month, date - diffToMonday - 1, tzOffsetHours + 23, 59, 59, 999));

    const monthStart = new Date(Date.UTC(year, month, 1, tzOffsetHours, 0, 0, 0));
    const monthEnd = new Date(Date.UTC(year, month + 1, 0, tzOffsetHours + 23, 59, 59, 999));

    const yearStart = new Date(Date.UTC(year, 0, 1, tzOffsetHours, 0, 0, 0));
    const yearEnd = new Date(Date.UTC(year, 11, 31, tzOffsetHours + 23, 59, 59, 999));

    // Medianoche Final en Chile (23:59:59)
    const todayEnd = new Date(Date.UTC(year, month, date, tzOffsetHours + 23, 59, 59, 999));

    // Corrección para "Mes Anterior" con cambio de año
    const lastMonthYear = month === 0 ? year - 1 : year;
    const lastMonthIdx = month === 0 ? 11 : month - 1;

    const lastMonthStart = new Date(Date.UTC(lastMonthYear, lastMonthIdx, 1, tzOffsetHours, 0, 0, 0));
    const lastMonthEnd = new Date(Date.UTC(lastMonthYear, lastMonthIdx + 1, 0, tzOffsetHours + 23, 59, 59, 999));

    // Corrección para "Año Anterior"
    const lastYearStart = new Date(Date.UTC(year - 1, 0, 1, tzOffsetHours, 0, 0, 0));
    const lastYearEnd = new Date(Date.UTC(year - 1, 11, 31, tzOffsetHours + 23, 59, 59, 999));

    return { todayStart, todayEnd, weekStart, weekEnd, lastWeekStart, lastWeekEnd, monthStart, monthEnd, lastMonthStart, lastMonthEnd, yearStart, yearEnd, lastYearStart, lastYearEnd, chileTime };
}

export const getDashboardMetrics = cache(async (timeframe: string = 'today') => {
    const session = await auth()
    if (!session?.user?.id) return { salesToday: 0, expensesToday: 0, transactionsToday: [], totalStockValue: 0, inventory: [] }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (!user) return { salesToday: 0, expensesToday: 0, transactionsToday: [], totalStockValue: 0, inventory: [] }

    const bounds = getChileTimeBounds();
    
    // Dynamic boundaries based on timeframe
    let periodStart = bounds.todayStart;
    let periodEnd = bounds.todayEnd; // Fix: 23:59:59 Chile (GMT-3), NOT standard absolute new Date() UTC

    if (timeframe === 'week') {
        periodStart = bounds.weekStart;
        periodEnd = bounds.weekEnd;
    } else if (timeframe === 'month') {
        periodStart = bounds.monthStart;
        periodEnd = bounds.monthEnd;
    } else if (timeframe === 'year') {
        periodStart = bounds.yearStart;
        periodEnd = bounds.yearEnd;
    } else if (timeframe === 'prev_week') {
        periodStart = bounds.lastWeekStart;
        periodEnd = bounds.lastWeekEnd;
    } else if (timeframe === 'prev_month') {
        periodStart = bounds.lastMonthStart;
        periodEnd = bounds.lastMonthEnd;
    } else if (timeframe === 'prev_year') {
        periodStart = bounds.lastYearStart;
        periodEnd = bounds.lastYearEnd;
    } else if (timeframe.startsWith('custom_')) {
        const parts = timeframe.split('_');
        if (parts.length === 3) {
            periodStart = new Date(`${parts[1]}T00:00:00.000Z`);
            periodEnd = new Date(`${parts[2]}T23:59:59.999Z`);
        }
    }

    // Keep the week baseline for comparisons if needed, otherwise use the period
    const comparisonStart = timeframe === 'today' ? bounds.weekStart : periodStart;

    const [transactionsToday, salesToday, salesThisWeek, expensesToday, expensesThisWeek, inventory] = await Promise.all([
        prisma.transaction.findMany({
            where: {
                userId: user.id,
                createdAt: { gte: periodStart, lte: periodEnd }
            },
            orderBy: { createdAt: 'desc' },
            include: { product: true }
        }),
        prisma.transaction.aggregate({
            where: {
                userId: user.id,
                type: { in: ['SALE', 'WEB_SALE'] },
                amount: { gt: 0 },
                NOT: [
                    { description: { contains: 'Añadido', mode: 'insensitive' } },
                    { description: { contains: 'Inventario', mode: 'insensitive' } },
                    { description: { contains: 'stock', mode: 'insensitive' } },
                    { description: { startsWith: 'Repuestos', mode: 'insensitive' } }
                ],
                createdAt: { gte: periodStart, lte: periodEnd }
            },
            _sum: { amount: true }
        }),
        prisma.transaction.aggregate({
            where: {
                userId: user.id,
                type: { in: ['SALE', 'WEB_SALE'] },
                amount: { gt: 0 },
                NOT: [
                    { description: { contains: 'Añadido', mode: 'insensitive' } },
                    { description: { contains: 'Inventario', mode: 'insensitive' } },
                    { description: { contains: 'stock', mode: 'insensitive' } },
                    { description: { startsWith: 'Repuestos', mode: 'insensitive' } }
                ],
                createdAt: { gte: comparisonStart, lte: periodEnd }
            },
            _sum: { amount: true }
        }),
        prisma.transaction.aggregate({
            where: {
                userId: user.id,
                type: 'EXPENSE',
                createdAt: { gte: periodStart, lte: periodEnd }
            },
            _sum: { amount: true }
        }),
        prisma.transaction.aggregate({
            where: {
                userId: user.id,
                type: 'EXPENSE',
                createdAt: { gte: comparisonStart, lte: periodEnd }
            },
            _sum: { amount: true }
        }),
        prisma.product.findMany({
            where: { userId: user.id },
            orderBy: { name: 'asc' }
        })
    ]);

    const totalStockValue = inventory.reduce((acc, curr) => acc + (curr.price * Math.max(0, curr.stock)), 0)

    return {
        salesThisWeek: salesThisWeek._sum.amount || 0,
        salesToday: salesToday._sum.amount || 0,
        expensesToday: expensesToday._sum.amount || 0,
        expensesThisWeek: expensesThisWeek._sum.amount || 0,
        transactionsToday,
        totalStockValue,
        inventory
    }
})

export async function getTransactionsByRange(from: string, to: string) {
    const session = await auth()
    if (!session?.user?.email) throw new Error("Unauthorized")

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) throw new Error("User not found")

    const startDate = new Date(from + 'T00:00:00');
    const endDate = new Date(to + 'T23:59:59.999');

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

    let movementsCount = 0;

    try {
        for (const update of updates) {
            const data: any = {};
            if (update.price !== undefined) data.price = update.price;
            if (update.name !== undefined) data.name = update.name;
            if (update.minStock !== undefined) data.minStock = update.minStock;
            if (update.cost !== undefined) data.cost = update.cost;

            if (update.addStock && update.addStock !== 0) {
                data.stock = { increment: update.addStock };
            }

            if (Object.keys(data).length > 0) {
                const updatedProduct = await prisma.product.update({
                    where: { id: update.id, userId: session.user.id },
                    data
                });

                if (update.addStock && update.addStock !== 0) {
                    await prisma.transaction.create({
                        data: {
                            userId: session.user.id,
                            type: update.addStock > 0 ? 'INVENTORY_IN' : 'INVENTORY_OUT',
                            amount: 0,
                            quantity: Math.abs(update.addStock),
                            description: updatedProduct.name,
                            productId: updatedProduct.id,
                        }
                    })
                    movementsCount++;
                }

            }
        }

        revalidatePath("/")
        return { success: true, count: movementsCount }
    } catch (error) {
        throw error;
    }
}

// Helper function moved to @/lib/product-matching

import { randomUUID } from "crypto"

export async function addMultiProductTransaction(items: { amount: number, product: string, isQuantity: boolean }[]) {
    const session = await auth()
    if (!session?.user?.email) throw new Error("Unauthorized")

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) throw new Error("User not found")

    // 🔥 PRE-FETCH in RAM: Reduce drastically N+1 DB calls
    const allProducts = await prisma.product.findMany({
        where: { userId: user.id }
    });

    let totalAmount = 0;
    const groupId = randomUUID();
    let successCount = 0;
    let failedItems: string[] = [];
    const transactionsToCreate: any[] = [];
    const stockUpdates: any[] = []; // Array for holding bulk promises

    // PRE-VALIDATION PHASE (Runs in RAM instantly)
    for (const item of items) {
        if (!item.isQuantity) continue;

        const product = findBestProductMatch(item.product, allProducts);

        if (!product) {
            continue;
        }

        if (product.stock <= 0) {
            throw new Error(`No puedes vender ${product.name} (Stock: 0). Repone stock u ofrece otra opción al cliente.`);
        }

        if (product.stock < item.amount) {
            throw new Error(`Solo tienes ${product.stock} unidades de ${product.name}. Repone stock si quieres completar el pedido.`);
        }
    }

    // PROCESSING PHASE
    for (const item of items) {
        try {
            if (item.isQuantity) {
                const product = findBestProductMatch(item.product, allProducts);

                if (product) {
                    const lineAmount = product.price * item.amount;
                    totalAmount += lineAmount;

                    // Queue Stock Depletion
                    stockUpdates.push(
                        prisma.product.update({
                            where: { id: product.id },
                            data: { stock: { decrement: item.amount } }
                        })
                    );

                    // Queue Transaction Log
                    transactionsToCreate.push({
                        userId: user.id,
                        type: 'SALE',
                        amount: lineAmount,
                        quantity: item.amount,
                        description: product.name,
                        productId: product.id,
                        groupId: groupId
                    });

                    successCount++;
                } else {
                    failedItems.push(item.product);
                }
            } else {
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
            failedItems.push(item.product);
        }
    }

    if (successCount === 0) {
        return { success: false, message: "No se pudo identificar ningún producto válido." };
    }

    // BULK EXECUTION PHASE: Single DB connection trip
    const dbOperations = [...stockUpdates];
    if (transactionsToCreate.length > 0) {
        dbOperations.push(prisma.transaction.createMany({
            data: transactionsToCreate
        }));
    }

    await prisma.$transaction(dbOperations);

    revalidatePath("/");

    const itemCount = transactionsToCreate.length;
    const itemLabel = itemCount === 1 ? 'producto' : 'productos';

    return {
        success: true,
        amount: totalAmount,
        message: `Venta de ${itemCount} ${itemLabel} registrada.`,
        failedItems
    };
}

export async function getSalesInsights(timeframe: string = 'week') {
    const session = await auth()
    if (!session?.user?.id) return null

    try {
        const bounds = getChileTimeBounds();
        let startDate = bounds.weekStart;
        let endDate = bounds.weekEnd;
        let isDailyTrend = true; // Si es true, agrupa por día (ej: "Lun", "15"). Si es false, agrupa por mes (ej: "Ene", "Feb")
        
        // --- TIMEFRAME PARSING ---
        if (timeframe === 'today') {
            startDate = bounds.todayStart;
            endDate = bounds.todayEnd;
        } else if (timeframe === 'month') {
            startDate = bounds.monthStart;
            endDate = bounds.monthEnd;
        } else if (timeframe === 'year') {
            startDate = bounds.yearStart;
            endDate = bounds.yearEnd;
            isDailyTrend = false;
        } else if (timeframe === 'prev_week') {
            startDate = bounds.lastWeekStart;
            endDate = bounds.lastWeekEnd;
        } else if (timeframe === 'prev_month') {
            startDate = bounds.lastMonthStart;
            endDate = bounds.lastMonthEnd;
        } else if (timeframe === 'prev_year') {
            startDate = bounds.lastYearStart;
            endDate = bounds.lastYearEnd;
            isDailyTrend = false;
        } else if (timeframe.startsWith('custom_')) {
            // format: custom_YYYY-MM-DD_YYYY-MM-DD
            const parts = timeframe.split('_');
            if (parts.length === 3) {
                // Parse as UTC dates starting precisely at midnight Chilean Time equivalent
                startDate = new Date(`${parts[1]}T03:00:00Z`); // +3 UTC offset to align with Chilean midnight accurately backwards
                endDate = new Date(`${parts[2]}T23:59:59Z`);
                
                // Adjust endpoint by adding 3 hours to compensate for the trailing timezone shift
                endDate = new Date(endDate.getTime() + (3 * 3600 * 1000));
                
                // If diff > 60 days, default to monthly grouping for trends
                const diffDays = (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24);
                if (diffDays > 45) {
                    isDailyTrend = false;
                }
            }
        }

        const sales = await prisma.transaction.findMany({
            where: {
                userId: session.user.id,
                type: { in: ['SALE', 'WEB_SALE'] },
                amount: { gt: 0 },
                NOT: [
                    { description: { contains: 'Añadido', mode: 'insensitive' } },
                    { description: { contains: 'Inventario', mode: 'insensitive' } },
                    { description: { contains: 'stock', mode: 'insensitive' } },
                    { description: { startsWith: 'Repuestos', mode: 'insensitive' } }
                ],
                createdAt: {
                    gte: startDate,
                    lte: endDate
                }
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
                averageTicket: 0,
                trend: []
            }
        }

        const productStats = new Map<string, { name: string, quantity: number, revenue: number }>()
        const hourStats = new Array(24).fill(0)
        let totalRevenue = 0

        const trendMap = new Map<string, number>()
        
        // Fair Stats: Total Revenue, Transaction Count, Product Map, Hour Count
        const fairStats = new Map<string, { 
            totalRevenue: number, 
            transactionCount: number,
            productStats: Map<string, { name: string, quantity: number, revenue: number }>,
            hourStats: number[]
        }>()

        // --- TREND MAP INITIATION ---
        if (timeframe === 'today') {
            trendMap.set('Hoy', 0)
        } else if (timeframe === 'week' || timeframe === 'prev_week') {
            const daysOfWeek = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
            daysOfWeek.forEach(day => trendMap.set(day, 0))
        } else if (timeframe === 'month') {
            const daysInMonth = bounds.chileTime.getDate() // Hasta el día actual del mes
            for (let i = 1; i <= daysInMonth; i++) trendMap.set(i.toString(), 0)
        } else if (timeframe === 'prev_month') {
            const daysInLastMonth = new Date(bounds.lastMonthEnd.getTime() - 4 * 3600 * 1000).getDate()
            for (let i = 1; i <= daysInLastMonth; i++) trendMap.set(i.toString(), 0)
        } else if (timeframe === 'year' || timeframe === 'prev_year') {
            const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
            months.forEach(m => trendMap.set(m, 0))
        } else if (timeframe.startsWith('custom_')) {
            // Dependiendo si es diario o mensual
            if (isDailyTrend) {
                // Initialize all days between start and end
                let curr = new Date(startDate.getTime());
                while (curr <= endDate) {
                    const chileCurr = new Date(curr.getTime() - (3 * 3600 * 1000));
                    const label = `${chileCurr.getUTCDate()}/${chileCurr.getUTCMonth()+1}`;
                    trendMap.set(label, 0);
                    curr.setDate(curr.getDate() + 1);
                }
            } else {
                const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
                months.forEach(m => trendMap.set(m, 0))
            }
        }

        sales.forEach(sale => {
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

            // Adjust Sale Date to Chile Time
            const saleDateUTC = new Date(sale.createdAt);
            const saleDateLocal = new Date(saleDateUTC.getTime() - (3 * 3600 * 1000));
            // Hour adjusted
            const localHour = saleDateLocal.getUTCHours();
            hourStats[localHour]++

            // Track Fair (Feria) Performance
            const fairMatch = sale.description?.match(/\[Feria: (.*?)\]/);
            if (fairMatch && fairMatch[1]) {
                const fairName = fairMatch[1];
                
                if (!fairStats.has(fairName)) {
                    fairStats.set(fairName, { 
                        totalRevenue: 0, 
                        transactionCount: 0,
                        productStats: new Map<string, { name: string, quantity: number, revenue: number }>(),
                        hourStats: new Array(24).fill(0)
                    });
                }
                
                const currentFair = fairStats.get(fairName)!;
                
                // Add Fair Revenue & Transactions
                currentFair.totalRevenue += sale.amount;
                // Para simplificar, contamos items como transacciones o asumimos el mismo agrupador luego, 
                // pero por ahora cada "sale" suma 1. (Ideal si filtramos uniqueIds, pero es OK para rough metrics).
                currentFair.transactionCount += 1;
                
                // Add Fair Product
                const fairProductKey = sale.productId || sale.description || 'Otros';
                const currentFProduct = currentFair.productStats.get(fairProductKey) || {
                    name: sale.description || 'Producto Desconocido',
                    quantity: 0,
                    revenue: 0
                };
                currentFair.productStats.set(fairProductKey, {
                    name: currentFProduct.name,
                    quantity: currentFProduct.quantity + (sale.quantity || 1),
                    revenue: currentFProduct.revenue + sale.amount
                });
                
                // Add Fair Hour
                currentFair.hourStats[localHour]++;
            }

            let labelKey = ''

            if (timeframe === 'today') {
                labelKey = 'Hoy'
            } else if (timeframe === 'week' || timeframe === 'prev_week') {
                const dayIndex = saleDateLocal.getUTCDay()
                const mappedIndex = dayIndex === 0 ? 6 : dayIndex - 1
                labelKey = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'][mappedIndex]
            } else if (timeframe === 'month' || timeframe === 'prev_month') {
                labelKey = saleDateLocal.getUTCDate().toString()
            } else if (timeframe === 'year' || timeframe === 'prev_year') {
                labelKey = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][saleDateLocal.getUTCMonth()]
            } else if (timeframe.startsWith('custom_')) {
                if (isDailyTrend) {
                    labelKey = `${saleDateLocal.getUTCDate()}/${saleDateLocal.getUTCMonth()+1}`;
                } else {
                    labelKey = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][saleDateLocal.getUTCMonth()];
                }
            }

            if (trendMap.has(labelKey)) {
                trendMap.set(labelKey, trendMap.get(labelKey)! + sale.amount)
            } else if (isDailyTrend && timeframe.startsWith('custom_')) {
               // Fallback setup array for missing days
               trendMap.set(labelKey, sale.amount)
            }

            totalRevenue += sale.amount
        })

        const topProducts = Array.from(productStats.values())
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5)

        const peakHours = hourStats.map((count, hour) => ({ hour, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 3)
            .filter(h => h.count > 0)
            .map(h => ({
                hour: `${h.hour}:00`,
                count: h.count,
                intensity: h.count / sales.length
            }))

        const trend = Array.from(trendMap.entries()).map(([label, amount]) => ({ label, amount }))

        // Calculate Average Ticket (Grouped by GroupID for true ticket size)
        const uniqueGroups = new Set(sales.map(s => s.groupId || s.id)).size
        const averageTicket = uniqueGroups > 0 ? Math.round(totalRevenue / uniqueGroups) : 0

        const fairPerformance = Array.from(fairStats.entries()).map(([name, data]) => {
            // Find Top Product for this Fair
            const topFProducts = Array.from(data.productStats.values()).sort((a, b) => b.quantity - a.quantity);
            const topProduct = topFProducts.length > 0 ? topFProducts[0] : undefined;

            // Find Peak Hour for this Fair
            const peakFHours = data.hourStats.map((count, hour) => ({ hour, count })).sort((a, b) => b.count - a.count);
            const peakHour = peakFHours.length > 0 && peakFHours[0].count > 0 ? `${peakFHours[0].hour}:00` : undefined;

            return {
                name,
                totalRevenue: data.totalRevenue,
                transactionCount: data.transactionCount,
                topProduct,
                peakHour
            }
        }).sort((a, b) => b.totalRevenue - a.totalRevenue);

        // Find Unsold Products (Products in Inventory but NOT in productStats map)
        const allProducts = await prisma.product.findMany({ where: { userId: session.user.id } });
        const soldProductIds = new Set(sales.filter(s => s.productId).map(s => s.productId));
        const unsoldProducts = allProducts
            .filter(p => !soldProductIds.has(p.id) && p.stock > 0)
            .map(p => ({
                name: p.name,
                stock: p.stock,
                cost: p.cost * p.stock // Valor total inmovilizado
            }))
            .sort((a, b) => b.cost - a.cost)
            .slice(0, 3); // Top 3 productos que te están costando dinero por no venderse

        return {
            totalRevenue,
            totalTransactions: uniqueGroups,
            topProducts,
            peakHours,
            averageTicket,
            trend,
            fairPerformance,
            unsoldProducts
        }

    } catch (error) {
        console.error("Error generating insights:", error)
        return null
    }
}


// --- EXPENSE INTELLIGENCE ---
export async function getExpenseInsights(timeframe: string = 'week') {
    const session = await auth()
    if (!session?.user?.id) return {
        totalExpenses: 0,
        averageMonthly: 0,
        topCategories: [],
        advice: "No hay datos suficientes.",
        trend: []
    }

    const bounds = getChileTimeBounds();
    let startDate = bounds.weekStart;
    let endDate = bounds.weekEnd;
    let isDailyTrend = true;

    if (timeframe === 'month') {
        startDate = bounds.monthStart;
        endDate = bounds.monthEnd;
    } else if (timeframe === 'year') {
        startDate = bounds.yearStart;
        endDate = bounds.yearEnd;
        isDailyTrend = false;
    } else if (timeframe === 'prev_week') {
        startDate = bounds.lastWeekStart;
        endDate = bounds.lastWeekEnd;
    } else if (timeframe === 'prev_month') {
        startDate = bounds.lastMonthStart;
        endDate = bounds.lastMonthEnd;
    } else if (timeframe === 'prev_year') {
        startDate = bounds.lastYearStart;
        endDate = bounds.lastYearEnd;
        isDailyTrend = false;
    } else if (timeframe.startsWith('custom_')) {
        const parts = timeframe.split('_');
        if (parts.length === 3) {
            startDate = new Date(`${parts[1]}T00:00:00.000Z`);
            endDate = new Date(`${parts[2]}T23:59:59.999Z`);
            
            const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays > 31) {
                isDailyTrend = false;
            }
        }
    }

    const expenses = await prisma.transaction.findMany({
        where: {
            userId: session.user.id,
            type: 'EXPENSE',
            createdAt: {
                gte: startDate,
                lte: endDate
            }
        },
        orderBy: { createdAt: 'desc' }
    })

    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0)

    // Monthly Average based on specific timeframe bounds vs real historical
    // For insights we can just reuse a simplified local average calculation
    const uniqueDays = new Set(expenses.map(e => {
        const d = new Date(e.createdAt);
        return `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`
    })).size
    const averageMonthly = uniqueDays > 0 ? Math.round(totalExpenses / uniqueDays) : 0; // Using it as Average Ticket/Daily for the label

    // Top Categories (Group by normalized description)
    const categoryMap = new Map<string, number>()

    // Trend Map Logic (Week, Month, Year)
    const trendMap = new Map<string, number>()

    if (timeframe === 'week' || timeframe === 'prev_week') {
        const daysOfWeek = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
        daysOfWeek.forEach(day => trendMap.set(day, 0))
    } else if (timeframe === 'month' || timeframe === 'prev_month') {
        const daysInMonth = (new Date(endDate.getTime() - 4 * 3600 * 1000)).getDate();
        for (let i = 1; i <= daysInMonth; i++) trendMap.set(i.toString(), 0)
    } else if (timeframe === 'year' || timeframe === 'prev_year') {
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
        months.forEach(m => trendMap.set(m, 0))
    } else if (timeframe.startsWith('custom_') && !isDailyTrend) {
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
        months.forEach(m => trendMap.set(m, 0))
    }

    expenses.forEach(e => {
        const key = (e.description || 'Varios').trim().toUpperCase() // Normalize
        categoryMap.set(key, (categoryMap.get(key) || 0) + e.amount)

        // Populate Trend
        const expDateUTC = new Date(e.createdAt);
        const expDateLocal = new Date(expDateUTC.getTime() - (3 * 3600 * 1000));

        let labelKey = ''

        if (timeframe === 'week' || timeframe === 'prev_week') {
            const dayIndex = expDateLocal.getUTCDay()
            const mappedIndex = dayIndex === 0 ? 6 : dayIndex - 1
            labelKey = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'][mappedIndex]
        } else if (timeframe === 'month' || timeframe === 'prev_month') {
            labelKey = expDateLocal.getUTCDate().toString()
        } else if (timeframe === 'year' || timeframe === 'prev_year') {
            labelKey = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][expDateLocal.getUTCMonth()]
        } else if (timeframe.startsWith('custom_')) {
            if (isDailyTrend) {
                labelKey = `${expDateLocal.getUTCDate()}/${expDateLocal.getUTCMonth()+1}`;
            } else {
                labelKey = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][expDateLocal.getUTCMonth()];
            }
        }

        if (trendMap.has(labelKey)) {
            trendMap.set(labelKey, trendMap.get(labelKey)! + e.amount)
        } else if (isDailyTrend && timeframe.startsWith('custom_')) {
            trendMap.set(labelKey, e.amount)
        }
    })

    // Convert to array and sort
    const topCategories = Array.from(categoryMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5) // Top 5

    const trend = Array.from(trendMap.entries()).map(([label, amount]) => ({ label, amount }))

    // Generate Humanized Advice
    let advice = "💡 Consejo: Registra cada gasto, por pequeño que sea. Los 'gastos hormiga' suman."

    if (topCategories.length > 0) {
        const top = topCategories[0]
        const percent = Math.round((top.value / totalExpenses) * 100)

        if (percent > 40) {
            advice = `⚠️ Alerta: El ${percent}% de tu dinero de este periodo se va en "${top.name}". ¡Es una dependencia riesgosa! Busca proveedores alternativos.`
        } else if (uniqueDays > 1) {
            advice = `📊 Tu estructura de costos parece estable. Tu mayor ítem es "${top.name}" (${percent}%). ¿Es un costo fijo o puedes negociarlo?`
        } else {
            advice = `👀 Ojo con "${top.name}". Representa tu mayor salida de caja ahora ($${top.value.toLocaleString('es-CL')}).`
        }
    }

    return {
        totalExpenses,
        averageMonthly, // Now serves as average per day per timeframe
        topCategories,
        advice,
        historyCount: expenses.length,
        trend
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

export async function toggleProductWeb(id: string, isActiveOnline: boolean, stockEcommerce?: number) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("No autorizado")

    const data: any = { isActiveOnline }
    if (stockEcommerce !== undefined) {
        data.stockEcommerce = stockEcommerce
    }

    await prisma.product.update({
        where: { id, userId: session.user.id },
        data
    })

    revalidatePath("/")
    return { success: true }
}
