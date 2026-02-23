import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
    const session = await auth()
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    // 1. Create Products
    const products = [
        { name: "Coca Cola 3L", price: 2500, cost: 1800, stock: 24 },
        { name: "Pan Hallulla (Kg)", price: 2200, cost: 1200, stock: 15 },
        { name: "Leche Colun", price: 1100, cost: 850, stock: 30 },
        { name: "Queso Laminado", price: 3500, cost: 2400, stock: 10 },
        { name: "Galletas Triton", price: 800, cost: 450, stock: 50 },
    ]

    const createdProducts = []

    for (const p of products) {
        // Check if exists
        let product = await prisma.product.findFirst({
            where: { userId: user.id, name: p.name }
        })

        if (!product) {
            product = await prisma.product.create({
                data: {
                    userId: user.id,
                    name: p.name,
                    price: p.price,
                    cost: p.cost,
                    stock: p.stock
                }
            })
        }
        createdProducts.push(product)
    }

    // 2. Create Simulated Sales (Today)
    const today = new Date()

    // Sale 1: 2 Coca Colas
    await prisma.transaction.create({
        data: {
            userId: user.id,
            type: 'SALE',
            amount: 5000,
            quantity: 2,
            description: "Coca Cola 3L",
            productId: createdProducts[0].id,
            category: 'VENTA',
            date: today
        }
    })

    // Sale 2: 1 Kg Pan
    await prisma.transaction.create({
        data: {
            userId: user.id,
            type: 'SALE',
            amount: 2200,
            quantity: 1,
            description: "Pan Hallulla (Kg)",
            productId: createdProducts[1].id,
            category: 'VENTA',
            date: today
        }
    })

    // Sale 3: 3 Galletas (High Margin)
    await prisma.transaction.create({
        data: {
            userId: user.id,
            type: 'SALE',
            amount: 2400,
            quantity: 3,
            description: "Galletas Triton",
            productId: createdProducts[4].id,
            category: 'VENTA',
            date: today
        }
    })

    return NextResponse.json({ success: true, message: "Datos de ejemplo cargados correctamente" })
}
