"use server"

import { auth } from "@/lib/auth"
import MercadoPagoConfig, { PreApproval } from "mercadopago"
import { redirect } from "next/navigation"

// Initialize MP Client (Use YOUR Admin Credentials here, not the user's)
// Ideally these should be in env vars for the SaaS owner
const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN!
});

export async function createSubscription() {
    const session = await auth()
    if (!session?.user?.email) {
        throw new Error("User not authenticated")
    }

    try {
        const preapproval = new PreApproval(client);

        const response = await preapproval.create({
            body: {
                reason: "Suscripción Emprende Pro",
                external_reference: session.user.id, // Bind subscription to User ID
                payer_email: session.user.email,
                auto_recurring: {
                    frequency: 1,
                    frequency_type: "months",
                    transaction_amount: 4990,
                    currency_id: "CLP"
                },
                back_url: "https://tudominio.com/emprende", // TODO: Update with real domain
                status: "pending"
            }
        })

        if (response.init_point) {
            return response.init_point
        } else {
            throw new Error("No init_point returned")
        }

    } catch (error) {
        console.error("Error creating subscription:", error)
        throw new Error("Failed to create subscription")
    }
}
