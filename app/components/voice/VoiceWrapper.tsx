"use client"

import { useState } from "react"
import { VoiceFloatingButton } from "./VoiceFloatingButton"
import { addTransaction, addProduct } from "@/actions/transaction-actions"
import { useRouter } from "next/navigation"

export function VoiceWrapper() {
    const router = useRouter()
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'neutral', message: string } | null>(null)

    const showFeedback = (type: 'success' | 'error', message: string) => {
        setFeedback({ type, message })
        setTimeout(() => setFeedback(null), 3500)
    }

    const handleCommand = async (intent: any) => {
        console.log("Comando recibido:", intent)

        try {
            if (intent.type === 'SALE') {
                const result = await addTransaction({
                    type: 'SALE',
                    amount: intent.amount || 0,
                    description: intent.product || "Venta General",
                    productId: undefined,
                    isQuantity: intent.isQuantity
                })

                if (result.message) {
                    showFeedback('success', "📦 " + result.message);
                } else {
                    showFeedback('success', `💰 ¡Venta de $${(result.amount || intent.amount).toLocaleString('es-CL')} registrada!`)
                }
            }
            else if (intent.type === 'EXPENSE') {
                await addTransaction({
                    type: 'EXPENSE',
                    amount: intent.amount || 0,
                    description: intent.description
                })
                showFeedback('success', `📉 Gasto de $${intent.amount.toLocaleString('es-CL')} registrado.`)
            }
            else if (intent.type === 'INVENTORY_ADD') {
                await addProduct({
                    name: intent.product,
                    price: intent.price || 0,
                    stock: intent.stock || 0
                })
                const stockMsg = intent.stock ? ` con ${intent.stock} u.` : "";
                showFeedback('success', `📦 Producto "${intent.product}" creado${stockMsg}.`)
            }
            else if (intent.type === 'INVENTORY_RESTOCK') {
                const result = await addTransaction({
                    type: 'INVENTORY_RESTOCK', // Special type handled in action
                    amount: intent.amount || 0,
                    description: intent.product,
                })
                showFeedback('success', "🔄 " + (result.message || "Stock actualizado."))
            }
            else {
                showFeedback('error', `😓 No entendí: "${intent.original}". Intenta: 'Venta de 5000' o 'Vendí 3 Pulseras'`)
            }

            router.refresh()
        } catch (error: any) {
            console.error("Error ejecutando comando:", error)
            // Show specific error message from server if possible
            const errorMsg = error.message.includes("No encontré el producto")
                ? error.message
                : "❌ Error al guardar. Intenta nuevamente.";
            showFeedback('error', errorMsg)
        }
    }

    return <VoiceFloatingButton onCommand={handleCommand} feedback={feedback} />
}
