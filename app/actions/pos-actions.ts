"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { CartItem } from "@/components/pos/CartContext"

export async function processSale(cart: CartItem[], total: number, paymentMethod: string = 'CASH') {
    const session = await auth()
    if (!session?.user?.id) throw new Error("No autorizado")

    const user = await prisma.user.findUnique({ where: { email: session.user.email! } })
    if (!user) throw new Error("User not found")

    if (cart.length === 0) throw new Error("El carrito está vacío")

    // 1. Validate Stock for all items FIRST
    for (const item of cart) {
        const product = await prisma.product.findUnique({
            where: { id: item.id, userId: user.id }
        })

        if (!product) {
            throw new Error(`Producto no encontrado: ${item.name}`)
        }

        if (product.stock < item.quantity) {
            throw new Error(`Stock insuficiente para ${item.name}. Disponibles: ${product.stock}`)
        }
    }

    // 2. Execute Sale (Deduct Stock & Create Transaction)
    // We create a single transaction for the whole cart? Or one per item?
    // User requested "Show total order details". Usually a single Ticket.
    // Our Transaction model is simple. Let's create a single "Sale" transaction with the summary description.
    // Or multiple if we want detailed reporting per product?
    // Current Dashboard aggregates by Type. A single transaction with "Venta: 2x Cola, 1x Pan" is better for simple list.
    // BUT we lose structured data for analytics if we don't link productId. 
    // Our Transaction model allows productId (optional). 
    // If we have mixed products, we can't link ONE productId.
    // Option A: Split transaction into one row per product (Cleaner for analytics).
    // Option B: One big row.
    // Decision: Split rows for proper analytics (Product margin, rotation).
    // EXCEPT the user might want one entry in "Restante" / "Activity".
    // Let's do Split Rows for data integrity, maybe grouping UI handles it?
    // Actually `addMultiProductTransaction` logic does One Transaction with composite description.
    // User wants "Estudios permanentes". Individual rows are CRITICAL for "Mejor producto".
    // So I should create ONE transaction per product line item.

    // However, CartSummary passes "cartTotal". If I split, I assume sum matches.

    const transactionGroupId = crypto.randomUUID(); // Logical grouping (not in DB schema yet but useful concept)

    for (const item of cart) {
        // Deduct Stock
        await prisma.product.update({
            where: { id: item.id },
            data: { stock: { decrement: item.quantity } }
        })

        // Create Transaction Record
        await prisma.transaction.create({
            data: {
                userId: user.id,
                type: 'SALE',
                amount: item.price * item.quantity,
                quantity: item.quantity,
                description: `Venta POS: ${item.quantity}x ${item.name}`,
                paymentMethod: paymentMethod,
                groupId: transactionGroupId, // Link items together
                productId: item.id
                // We don't have groupId column yet, but individual rows are best for analytics.
            }
        })
    }

    revalidatePath("/")
    return { success: true }
}
