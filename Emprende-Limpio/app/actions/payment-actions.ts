"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { MercadoPagoConfig, Preference } from 'mercadopago';

// MP SDK needs dynamic import or careful handling in Next.js Server Actions?
// Usually works fine if headers are standard.
// If SDK fails, we use direct fetch.

export async function createPaymentPreference(items: { title: string, unit_price: number, quantity: number }[]) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("No autorizado")

    // 1. Get User Config
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { mpAccessToken: true }
    })

    if (!user?.mpAccessToken) {
        throw new Error("Falta configurar Mercado Pago (Access Token)")
    }

    try {
        // 2. Initialize Client with User's Token
        const client = new MercadoPagoConfig({ accessToken: user.mpAccessToken });
        const preference = new Preference(client);

        // 3. Create Preference
        // TODO: Replace localhost with real domain in production
        const listItems = items.map(item => ({
            title: item.title,
            unit_price: Number(item.unit_price),
            quantity: Number(item.quantity),
            currency_id: 'CLP'
        }))

        const result = await preference.create({
            body: {
                items: listItems,
                back_urls: {
                    success: "http://localhost:3000/emprende/pos?status=success",
                    failure: "http://localhost:3000/emprende/pos?status=failure",
                    pending: "http://localhost:3000/emprende/pos?status=pending"
                },
                auto_return: "approved",
                statement_descriptor: "EMPRENDE POS",
                external_reference: `pos-${session.user.id}-${Date.now()}`,
                expires: false
            }
        })

        return {
            id: result.id,
            init_point: result.init_point,
            sandbox_init_point: result.sandbox_init_point
        }

    } catch (error: any) {
        console.error("MP Error:", error)
        // Extract MP specific error message if available
        const mpMessage = error?.cause?.description || error?.message || "Error desconocido en MP"
        throw new Error(`Error Mercado Pago: ${mpMessage}`)
    }
}
