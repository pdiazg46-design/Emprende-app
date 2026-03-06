"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { CartItem } from "@/components/pos/CartContext"

export async function processSale(cart: CartItem[], total: number, paymentMethod: string = 'CASH') {
    try {
        const session = await auth()
        if (!session?.user?.id) return { error: "No autorizado" }

        const user = await prisma.user.findUnique({ where: { email: session.user.email! } })
        if (!user) return { error: "User not found" }

        if (cart.length === 0) return { error: "El carrito está vacío" }

        // 1. Validate Stock for all items (PRE-FETCH en RAM para evitar consultas N+1)
        const productIds = cart.map(item => item.id);
        const dbProducts = await prisma.product.findMany({
            where: { id: { in: productIds }, userId: user.id }
        });

        const productsMap = new Map(dbProducts.map(p => [p.id, p]));

        for (const item of cart) {
            const product = productsMap.get(item.id);

            if (!product) {
                // Este es un producto genérico o introducido manualmente/por voz que no existe en BD
                continue;
            }

            if (product.stock < item.quantity) {
                return { error: `Stock insuficiente para ${item.name}. Disponibles: ${product.stock}` };
            }
        }

        // 2. Execute Sale (Deduct Stock & Create Transaction en UNA SOLA TRANSACCIÓN MASIVA)
        const transactionGroupId = crypto.randomUUID();
        const dbOperations = [];

        for (const item of cart) {
            const product = productsMap.get(item.id);
            const isManual = item.isManual || !product;

            if (!isManual) {
                dbOperations.push(
                    prisma.product.update({
                        where: { id: item.id },
                        data: { stock: { decrement: item.quantity } }
                    })
                );
            }

            dbOperations.push(
                prisma.transaction.create({
                    data: {
                        userId: user.id,
                        type: 'SALE',
                        amount: item.price * item.quantity,
                        quantity: item.quantity,
                        description: `Venta POS: ${item.quantity}x ${item.name}`,
                        paymentMethod: paymentMethod,
                        groupId: transactionGroupId,
                        productId: isManual ? null : item.id
                    }
                })
            );
        }

        await prisma.$transaction(dbOperations);

        revalidatePath("/")
        return { success: true }
    } catch (e: any) {
        console.error("[processSale] Server Error: ", e)
        return { error: e.message || "Error interno del servidor procesando la venta." }
    }
}
