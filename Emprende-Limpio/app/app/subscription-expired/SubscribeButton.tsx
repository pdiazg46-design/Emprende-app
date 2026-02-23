"use client"

import { createSubscription } from "@/actions/subscription-actions"
import { CreditCard, Loader2 } from "lucide-react"
import { useState } from "react"

export function SubscribeButton() {
    const [loading, setLoading] = useState(false)

    const handleSubscribe = async () => {
        setLoading(true)
        try {
            const url = await createSubscription()
            if (url) {
                window.location.href = url
            }
        } catch (error) {
            console.error(error)
            alert("Error al iniciar suscripción. Intenta nuevamente.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
                <CreditCard className="w-5 h-5" />
            )}
            {loading ? "Procesando..." : "Suscribirse Ahora"}
        </button>
    )
}
