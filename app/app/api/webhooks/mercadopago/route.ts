
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

            // Update User based on external_reference (which is User ID)
            const userId = subscription.external_reference
            const status = subscription.status // authorized, paused, cancelled

            if (userId) {
                let newStatus = "INACTIVE"
                if (status === "authorized") newStatus = "ACTIVE"

                await prisma.user.update({
                    where: { id: userId },
                    data: {
                        subscriptionStatus: newStatus,
                        mpPreapprovalId: id,
                        // subscriptionPlan: "PRO" // Optional: enforce plan
                    }
                })
            }
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Webhook error:", error)
        return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
    }
}
