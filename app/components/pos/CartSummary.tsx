"use client"

import { useState, useEffect } from "react"
import { useCart } from "@/components/pos/CartContext"
import { ShoppingCart, X, ChevronUp, ChevronDown, Trash2, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
// import { addTransaction } from "@/actions/transaction-actions" 
import { processSale } from "@/actions/pos-actions"
import { useRouter } from "next/navigation"
import { CheckoutModal } from "@/components/pos/CheckoutModal"
import { getPaymentConfig } from "@/actions/user-settings-actions"

export function CartSummary() {
    const { cart, removeFromCart, clearCart, cartTotal, cartCount, addOptimisticSale, clearOptimisticTransactions, updateQuantity } = useCart()
    const [isOpen, setIsOpen] = useState(false)
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [paymentConfig, setPaymentConfig] = useState<any>(null)
    const router = useRouter()

    useEffect(() => {
        getPaymentConfig().then(setConfig => {
            if (setConfig) setPaymentConfig(setConfig)
        })
    }, [])

    if (cartCount === 0) return null

    const handleConfirmSale = (method: string) => {
        // 1. Guardar foto de los datos (porque limpiaremos la RAM del carro)
        const snapshotCart = [...cart]
        const snapshotTotal = cartTotal

        // 2. Ejecutar Matemáticas de RAM de inmediato (UI Optimista 0ms)
        addOptimisticSale(snapshotTotal, snapshotCart, method)
        clearCart()
        setIsOpen(false)
        setIsCheckoutOpen(false) // Forzar cierre del modal

        // 3. Proceso "Fire-and-Forget" con Desacople Total del Event Loop
        // Usamos setTimeout para salir del "Tick" actual de React. 
        // Esto fuerza a que Next.js DIBUJE en pantalla el modal cerrado INMEDIATAMENTE, 
        // sin agrupar el cierre visual con la tardanza de la base de datos (Server Action Batching).
        setTimeout(() => {
            processSale(snapshotCart, snapshotTotal, method)
                .then(() => {
                    // Cuando Vercel finalice, refrescamos la página invisiblemente.
                    router.refresh()
                })
                .catch((error) => {
                    console.error("Error silencioso procesando la venta:", error)
                    alert("Error al procesar la venta: " + (error.message || "Fallo desconocido"));
                    clearOptimisticTransactions();
                })
        }, 50)
    }

    return (
        <>
            <CheckoutModal
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
                cart={cart}
                total={cartTotal}
                onConfirmSale={handleConfirmSale}
                paymentConfig={paymentConfig}
            />

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Floating Bar / Sheet */}
            <div className={cn(
                "fixed bottom-0 left-0 right-0 z-40 bg-white shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)] transition-all duration-300 rounded-t-[2rem]",
                isOpen ? "h-[90vh]" : "h-24 md:h-auto md:bottom-8 md:right-8 md:left-auto md:w-96 md:rounded-[2rem]"
            )}>
                {/* Handle for dragging (visual only) */}
                <div
                    className="w-full h-6 flex items-center justify-center cursor-pointer"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
                </div>

                <div className="px-6 pb-6 h-full flex flex-col">
                    {/* Header Row */}
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3" onClick={() => setIsOpen(!isOpen)}>
                            <div className="relative">
                                <div className="p-3 bg-blue-600 rounded-full text-white shadow-lg shadow-blue-500/30">
                                    <ShoppingCart className="w-6 h-6" />
                                </div>
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                                    {cartCount}
                                </span>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total venta</p>
                                <p className="text-2xl font-black text-slate-900 leading-none">
                                    ${cartTotal.toLocaleString("es-CL")}
                                </p>
                            </div>
                        </div>

                        {!isOpen && (
                            <button
                                onClick={() => setIsCheckoutOpen(true)}
                                disabled={isProcessing}
                                className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                                {isProcessing ? "..." : <><CheckCircle2 className="w-4 h-4" /> Cobrar</>}
                            </button>
                        )}
                    </div>

                    {/* Expanded Content */}
                    {isOpen && (
                        <div className="flex-1 overflow-y-auto mt-4 space-y-3 pb-40 scrollbar-hide">
                            {cart.map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100 gap-2">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="flex items-center bg-white border border-slate-200 rounded-full h-8 overflow-hidden shadow-sm shrink-0">
                                            <button
                                                onClick={() => updateQuantity(item.id, -1)}
                                                className="w-8 h-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                                                disabled={item.quantity <= 1}
                                            >
                                                -
                                            </button>
                                            <span className="w-6 text-center text-xs font-black text-slate-700 select-none">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => updateQuantity(item.id, 1)}
                                                className="w-8 h-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <div className="flex-1 min-w-0 pr-1">
                                            <p className="font-bold text-slate-800 text-sm truncate">{item.name}</p>
                                            <p className="text-xs text-slate-400 font-medium">
                                                ${item.price.toLocaleString("es-CL")} c/u
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <p className="font-black text-slate-900 text-sm">
                                            ${(item.price * item.quantity).toLocaleString("es-CL")}
                                        </p>
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="text-slate-300 hover:text-red-500 transition-colors p-1 flex-shrink-0"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Footer Actions when Open */}
                    {isOpen && (
                        <div className="absolute bottom-6 left-6 right-6 flex gap-3">
                            <button
                                onClick={clearCart}
                                className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => setIsCheckoutOpen(true)}
                                disabled={isProcessing}
                                className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2"
                            >
                                {isProcessing ? "Procesando..." : (
                                    <>
                                        <span>Cobrar ${cartTotal.toLocaleString("es-CL")}</span>
                                        <CheckCircle2 className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
