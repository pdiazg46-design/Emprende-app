"use server";

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function getProductsForVoiceCart(items: any[]) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("No autorizado");

    const resolvedItems = [];

    const allProducts = await prisma.product.findMany({
        where: { userId: session.user.id }
    });

    for (const item of items) {
        let foundProduct = null;
        if (item.product && item.product.toLowerCase() !== "venta general" && item.product.toLowerCase() !== "venta") {
            foundProduct = allProducts.find((p: any) => p.name.toLowerCase() === item.product.toLowerCase())
                || allProducts.find((p: any) => p.name.toLowerCase().includes(item.product.toLowerCase()));
        }

        if (foundProduct) {
            resolvedItems.push({
                id: foundProduct.id,
                name: foundProduct.name,
                price: foundProduct.price,
                // Voice gives amount in price if it thought it was total, or amount as quantity. 
                // We default to 1 quantity, but if the voice engine flagged 'isQuantity', we use it.
                quantity: item.isQuantity ? Number(item.amount) : 1,
                isManual: false
            });
        } else {
            // General sale (no product match)
            resolvedItems.push({
                id: crypto.randomUUID(),
                name: item.product || "Venta General",
                price: item.isQuantity ? 0 : Number(item.amount),
                quantity: item.isQuantity ? Number(item.amount) : 1,
                isManual: true
            });
        }
    }

    return resolvedItems;
}
