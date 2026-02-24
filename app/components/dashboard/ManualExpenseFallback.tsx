"use client"

import { useState } from "react"
import { Pencil, X, CheckCircle2 } from "lucide-react"
import { useCart } from "@/components/pos/CartContext"

export function ManualExpenseFallback({
    isOpen,
    onClose,
    isStandalone = true
}: {
    isOpen?: boolean,
    onClose?: () => void,
    isStandalone?: boolean
}) {
    const { addToCart } = useCart()
    const [localOpen, setLocalOpen] = useState(false)
    const [amount, setAmount] = useState("")
    const [desc, setDesc] = useState("")

    const isModalOpen = isOpen !== undefined ? isOpen : localOpen;
    const closeModal = onClose || (() => setLocalOpen(false));

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault()
        if (!amount) return
        addToCart({
            name: desc || "Venta Manual",
            price: Number(amount),
            quantity: 1,
            isManual: true
        })
        closeModal()
        setAmount("")
        setDesc("")
    }

    return (
        <>
            {/* Standalone Trigger (Lápiz flotante si no hay voz) */}
            {isStandalone && (
                <div className="fixed left-1/2 md:left-[calc(50%+8rem)] -translate-x-1/2 bottom-8 z-50 flex flex-col items-center gap-4">
                    <button
                        onClick={() => setLocalOpen(true)}
                        className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-2xl transition-transform hover:scale-105 active:scale-95 border-4 border-white text-white"
                    >
                        <Pencil className="w-6 h-6" />
                    </button>
                </div>
            )}

            {/* Modal de Ingreso Rápido */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2rem] p-6 shadow-2xl max-w-sm w-full animate-in zoom-in-95 relative border border-slate-100">
                        <button
                            onClick={closeModal}
                            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4 text-blue-600">
                            <Pencil className="w-6 h-6" />
                        </div>

                        <h3 className="text-xl font-black text-slate-800 tracking-tight leading-tight mb-1">
                            Ingreso Manual
                        </h3>
                        <p className="text-sm font-medium text-slate-500 mb-6">
                            Añade una venta rápida al carrito.
                        </p>

                        <form onSubmit={handleAdd} className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-4 mb-1 block">Monto Total ($)</label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="Ej. 5000"
                                    required
                                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-lg font-black text-slate-800 outline-none focus:border-blue-500 transition-colors placeholder:font-medium placeholder:text-slate-300"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-4 mb-1 block">Descripción (Opcional)</label>
                                <input
                                    type="text"
                                    value={desc}
                                    onChange={(e) => setDesc(e.target.value)}
                                    placeholder="Ej. Gasto o Producto"
                                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 transition-colors"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full mt-2 py-4 bg-slate-900 text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-slate-800 hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                <CheckCircle2 className="w-5 h-5" /> Agregar al Carrito
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}
