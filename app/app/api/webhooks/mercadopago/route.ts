
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import MercadoPagoConfig, { PreApproval } from "mercadopago"

const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN!
});

export async function POST(request: Request) {
    try {
        const url = new URL(request.url)
        const topic = url.searchParams.get("topic") || url.searchParams.get("type")
        const id = url.searchParams.get("id") || url.searchParams.get("data.id")

        if (topic === "subscription_preapproval" && id) {
            const preapproval = new PreApproval(client);
            const subscription = await preapproval.get({ id })

            const userId = subscription.external_reference
            const status = subscription.status // authorized, paused, cancelled
            const planId = (subscription as any).preapproval_plan_id

            if (userId) {
                let newStatus = "INACTIVE"
                if (status === "authorized") newStatus = "ACTIVE"

                // Identificadores de Planes de Suscripción desde Variables de Entorno
                const EMPRENDE_PRO_PLAN_ID = process.env.MP_PRO_PLAN_ID || '4cb1a5c9597d4bea924afdc82a1ef778'
                const F29_ADDON_PLAN_ID = process.env.MP_F29_PLAN_ID
                const ECOMMERCE_ADDON_PLAN_ID = process.env.MP_ECOMMERCE_PLAN_ID

                if (planId === EMPRENDE_PRO_PLAN_ID) {
                    // Actualiza la Suscripción Principal
                    await prisma.user.update({
                        where: { id: userId },
                        data: {
                            subscriptionStatus: newStatus,
                            mpPreapprovalId: id,
                            subscriptionPlan: "PRO"
                        }
                    })
                }

                // Automatización Add-on F29
                if (planId === F29_ADDON_PLAN_ID && F29_ADDON_PLAN_ID) {
                    await prisma.user.update({
                        where: { id: userId },
                        data: { f29Active: status === "authorized" }
                    })
                }

                // Automatización Add-on E-Commerce SaaS
                if (planId === ECOMMERCE_ADDON_PLAN_ID && ECOMMERCE_ADDON_PLAN_ID) {
                    await prisma.user.update({
                        where: { id: userId },
                        data: { ecommerceActive: status === "authorized" }
                    })
                }
            }
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Webhook error:", error)
        return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
    }
}
