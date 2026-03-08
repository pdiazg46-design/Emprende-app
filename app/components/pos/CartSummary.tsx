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
    const { cart, removeFromCart, clearCart, cartTotal, cartCount, addOptimisticSale, clearOptimisticTransactions, updateQuantity, isCheckoutOpen, setIsCheckoutOpen, setIsCartExpanded } = useCart()
    const [isOpen, setIsOpen] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [paymentConfig, setPaymentConfig] = useState<any>(null)
    const router = useRouter()
    
    // Al montar (cuando cartCount pasa de 0 a 1), nos aseguramos de que el contexto se informe que está cerrado.
    useEffect(() => {
        setIsCartExpanded(false)
        return () => setIsCartExpanded(false)
    }, [setIsCartExpanded])

    useEffect(() => {
        getPaymentConfig().then(setConfig => {
            if (setConfig) setPaymentConfig(setConfig)
        })
    }, [])

    if (cartCount === 0) {
        return (
            <div className="hidden md:flex w-full bg-slate-50/50 border-2 border-slate-200 border-dashed rounded-[2rem] p-8 flex-col items-center justify-center text-slate-400 transition-all shrink-0 animate-in fade-in">
                <ShoppingCart className="w-10 h-10 opacity-20 mb-3" />
                <p className="font-black text-sm text-slate-500 uppercase tracking-wide">El carrito está vacío</p>
                <p className="text-xs mt-1 text-slate-400">Clickea [+] en un producto a la izquierda para cobrar.</p>
            </div>
        )
    }

    const handleConfirmSale = (method: string) => {
        if (isProcessing) return;
        setIsProcessing(true);

        // 1. Guardar foto de los datos (porque limpiaremos la RAM del carro)
        const snapshotCart = [...cart]
        const snapshotTotal = cartTotal

        // 2. Ejecutar Matemáticas de RAM de inmediato (UI Optimista 0ms)
        addOptimisticSale(snapshotTotal, snapshotCart, method)
        clearCart()
        setIsOpen(false)
        setIsCartExpanded(false)
        setIsCheckoutOpen(false) // Forzar cierre del modal

        // 3. Proceso "Fire-and-Forget" con Desacople Total del Event Loop
        setTimeout(() => {
            processSale(snapshotCart, snapshotTotal, method)
                .then((res: any) => {
                    if (res?.error) {
                        alert("Error al procesar la venta: " + res.error);
                        clearOptimisticTransactions();
                    } else {
                        // Cuando Vercel finalice, refrescamos la página invisiblemente.
                        router.refresh()
                    }
                })
                .catch((error) => {
                    console.error("Error silencioso procesando la venta:", error)
                    alert("Error al procesar la venta: " + (error.message || "Fallo desconocido"));
                    clearOptimisticTransactions();
                })
                .finally(() => {
                    setIsProcessing(false);
                });
        }, 50)
    }

    const toggleOpen = () => {
        const newState = !isOpen;
        setIsOpen(newState);
        setIsCartExpanded(newState);
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
                    onClick={() => {
                        setIsOpen(false);
                        setIsCartExpanded(false);
                    }}
                />
            )}

            {/* Floating Bar / Sheet */}
            <div className={cn(
                "fixed bottom-0 left-0 right-0 z-40 bg-white shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)] transition-all duration-300 rounded-t-[2rem]",
                isOpen ? "h-[90vh] md:h-auto" : "h-24 md:h-auto",
                "md:relative md:bottom-auto md:right-auto md:left-auto md:w-full md:rounded-[2rem] md:border md:border-slate-100 md:shadow-sm" // Anular clases fixed en Desktop para que encaje en el layout RightSide
            )}>
                {/* Handle for dragging (visual only - hidden on Desktop) */}
                <div
                    className="w-full h-6 flex items-center justify-center cursor-pointer md:hidden"
                    onClick={toggleOpen}
                >
                    <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
                </div>

                <div className="px-6 pb-6 h-full flex flex-col">
                    {/* Header Row */}
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3 cursor-pointer" onClick={toggleOpen}>
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
                                onClick={(e) => {
                                    e.stopPropagation(); // Avoid triggering toggleOpen if nested somehow
                                    setIsCheckoutOpen(true);
                                }}
                                disabled={isProcessing}
                                className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center gap-2 relative z-10"
                            >
                                {isProcessing ? "..." : <><CheckCircle2 className="w-4 h-4" /> Cobrar</>}
                            </button>
                        )}
                    </div>

                    {/* Expanded Content */}
                    <div className={cn(
                        "flex-1 overflow-y-auto mt-4 space-y-3 pb-4 md:pb-6 scrollbar-hide",
                        !isOpen ? "hidden md:block md:max-h-[60vh]" : "max-h-[60vh] md:max-h-[60vh]"
                    )}>
                        {cart.map((item) => (
                            <div key={item.id} className={cn(
                                "flex items-center justify-between p-1.5 md:p-2.5 rounded-xl border gap-2 transition-all",
                                item.isOptimistic
                                    ? "bg-slate-100/50 border-slate-200 animate-pulse ring-1 ring-blue-500/20"
                                    : "bg-slate-50 border-slate-200/60 shadow-sm"
                            )}>
                                <div className="flex flex-col flex-1 min-w-0 pr-1">
                                    <div className="flex items-center gap-2">
                                        <p className={cn(
                                            "font-bold text-xs md:text-[13px] leading-tight truncate",
                                            item.isOptimistic ? "text-slate-500" : "text-slate-800"
                                        )}>
                                            {item.name}
                                        </p>
                                        {item.isOptimistic && (
                                            <span className="text-[8px] uppercase font-black tracking-widest text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded-full shrink-0">
                                                ...
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[9px] md:text-[10px] text-slate-400 font-medium truncate mt-0.5">
                                        {item.isOptimistic ? "Calculando..." : `$${item.price.toLocaleString("es-CL")} c/u`}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 md:gap-3 shrink-0">
                                    <div className="flex items-center bg-white border border-slate-200 rounded-md h-6 md:h-7 overflow-hidden shadow-sm shrink-0">
                                        <button
                                            onClick={() => updateQuantity(item.id, -1)}
                                            className="w-6 md:w-7 h-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-30"
                                            disabled={item.quantity <= 1}
                                        >
                                            -
                                        </button>
                                        <span className="w-4 md:w-5 text-center text-[10px] md:text-[11px] font-black text-slate-700 select-none">
                                            {item.quantity}
                                        </span>
                                        <button
                                            onClick={() => updateQuantity(item.id, 1)}
                                            className="w-6 md:w-7 h-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
                                            disabled={item.isOptimistic}
                                        >
                                            +
                                        </button>
                                    </div>

                                    <div className="text-right w-14 md:w-16 shrink-0">
                                        <p className="font-black text-slate-900 text-xs md:text-sm leading-none">
                                            {item.isOptimistic ? "..." : `$${(item.price * item.quantity).toLocaleString("es-CL")}`}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="text-slate-300 hover:text-red-500 transition-colors p-1 flex-shrink-0"
                                        disabled={item.isOptimistic}
                                    >
                                        <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer Actions when Open */}
                    <div className={cn(
                        "flex gap-3 mt-4 md:mt-6 w-full relative z-10 bg-white pt-2",
                        !isOpen ? "hidden md:flex" : "absolute md:relative bottom-6 md:bottom-auto left-6 md:left-auto right-6 md:right-auto w-[calc(100%-3rem)] md:w-full"
                    )}>
                        <button
                            onClick={clearCart}
                            className="flex-1 py-3 md:py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={() => setIsCheckoutOpen(true)}
                            disabled={isProcessing}
                            className="flex-[2] py-3 md:py-4 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2"
                        >
                            {isProcessing ? "Procesando..." : (
                                <>
                                    <span>Cobrar ${cartTotal.toLocaleString("es-CL")}</span>
                                    <CheckCircle2 className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </div>

                </div>
            </div>
        </>
    )
}
