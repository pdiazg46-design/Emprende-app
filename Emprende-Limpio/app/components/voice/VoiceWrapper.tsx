"use client"

import { useState } from "react"
import { VoiceFloatingButton } from "./VoiceFloatingButton"
import { addTransaction, addProduct } from "@/actions/transaction-actions"
import { getProductsForVoiceCart } from "@/actions/voice-pos-actions"
import { useRouter } from "next/navigation"
import { TriangleAlert } from "lucide-react"
import { useVoicePreferences } from "./VoicePreferencesContext"
import { ManualExpenseFallback } from "../dashboard/ManualExpenseFallback"
import { useCart } from "../pos/CartContext"

export function VoiceWrapper() {
    const router = useRouter()
    const { isVoiceEnabled } = useVoicePreferences()
    const { addToCart } = useCart()
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'neutral', message: string } | null>(null)

    if (!isVoiceEnabled) return <ManualExpenseFallback />; // Fallback a Gasto Manual

    const showFeedback = (type: 'success' | 'error', message: string) => {
        setFeedback({ type, message })

        // Only auto-hide success messages
        if (type === 'success') {
            setTimeout(() => setFeedback(null), 3500)
        }
    }

    const clearFeedback = () => setFeedback(null);

    const handleCommand = async (intent: any) => {
        console.log("Comando recibido:", intent)

        try {
            if (intent.type === 'SALE') {
                try {
                    // Normalizar al esquema MULTI_SALE crudo para usar la misma tubería de pre-fetching
                    const items = [{ product: intent.product || "Venta General", amount: intent.amount || 1, isQuantity: intent.isQuantity }];
                    const cartItems = await getProductsForVoiceCart(items);

                    cartItems.forEach(item => addToCart(item));
                    showFeedback('success', "🛒 Producto agregado al carrito. ¡Procede al Cobro!");
                } catch (err: any) {
                    showFeedback('error', "❌ " + (err.message || "Error al agregar producto."));
                }
            }
            else if (intent.type === 'MULTI_SALE') {
                try {
                    const cartItems = await getProductsForVoiceCart(intent.items);
                    cartItems.forEach(item => addToCart(item));
                    showFeedback('success', "🛒 Productos agregados al carrito. ¡Procede al Cobro!");
                } catch (err: any) {
                    console.error("Error fetching multi-sale items:", err);
                    const errorMessage = err.message && err.message.length < 100
                        ? err.message
                        : "Error inesperado al buscar productos.";

                    showFeedback('error', "❌ " + errorMessage);
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
            else if (intent.type === 'CONFIG' || intent.type === 'CONTRIBUTION') {
                showFeedback('success', "✨ " + (intent.message || "Operación procesada exitosamente."));
            }
            else {
                showFeedback('error', `😓 No entendí: "${intent.original}". Intenta: 'Venta de 5000' o 'Vendí 3 Pulseras'`)
            }

            router.refresh()
        } catch (error: any) {
            console.error("Error ejecutando comando:", error)
            // Show specific error message from server if possible
            // Show specific error message from server
            const errorMsg = error.message && error.message.length < 150
                ? error.message
                : "❌ Error inesperado. Intenta nuevamente.";
            showFeedback('error', errorMsg)
        }
    }

    return (
        <>
            {/* Pass feedback ONLY if it's NOT an error, to avoid VoiceFloatingButton showing it too */}
            <VoiceFloatingButton
                onCommand={handleCommand}
                feedback={feedback?.type !== 'error' ? feedback : null}
            />

            {/* GLOBAL ERROR MODAL (Moved out of VoiceFloatingButton to avoid resize issues) */}
            {feedback?.type === 'error' && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full text-center border-t-8 border-rose-500 animate-in zoom-in-95 slide-in-from-bottom-8 duration-300 relative">
                        <button
                            onClick={clearFeedback}
                            className="absolute top-2 right-2 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                        </button>

                        <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-5 border-4 border-white shadow-sm text-rose-500">
                            <TriangleAlert className="w-10 h-10" />
                        </div>
                        <h3 className="text-2xl font-black text-rose-950 mb-3 leading-tight tracking-tight">
                            ¡Algo pasó!
                        </h3>
                        <p className="text-slate-600 font-medium text-lg mb-8 leading-relaxed">
                            {feedback.message.replace(/^❌ /, '')}
                        </p>

                        <button
                            onClick={clearFeedback}
                            className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold text-sm tracking-widest uppercase hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            Entendido
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}
