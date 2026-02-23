"use client"

import { useState } from "react"
import { HelpCircle, ChevronDown, ChevronUp, Mic, ShoppingCart, DollarSign, Package, Plus } from "lucide-react"

export function HelpGuide() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="w-full">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-atsit-blue transition-colors mb-4 mx-auto md:mx-0"
            >
                <HelpCircle className="w-4 h-4" />
                <span>¿Cómo registrar movimientos?</span>
                {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {isOpen && (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-lg animate-in fade-in slide-in-from-top-2 mb-8">
                    <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2">
                        <Mic className="w-5 h-5 text-atsit-blue" />
                        Ejemplos de Comandos de Voz
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Ventas */}
                        <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                            <div className="flex items-center gap-2 mb-2 text-emerald-700 font-bold text-sm">
                                <DollarSign className="w-4 h-4" />
                                Ventas
                            </div>
                            <ul className="text-sm text-slate-600 space-y-2">
                                <li>"Venta de 5000"</li>
                                <li>"Vendí 3 pulseras" <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-md font-bold">Smart</span></li>
                            </ul>
                        </div>

                        {/* Compras/Gastos */}
                        <div className="p-4 bg-rose-50/50 rounded-xl border border-rose-100">
                            <div className="flex items-center gap-2 mb-2 text-rose-700 font-bold text-sm">
                                <ShoppingCart className="w-4 h-4" />
                                Compras / Gastos
                            </div>
                            <ul className="text-sm text-slate-600 space-y-2">
                                <li>"Gasto de 2000 en taxi"</li>
                                <li>"Compré materiales por 15000"</li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                        <p className="text-sm text-slate-500 font-medium">
                            💡 Para <strong>Crear Productos</strong> o <strong>Reponer Stock</strong>, utiliza la tabla de gestión manual más abajo.
                        </p>
                    </div>

                    <button
                        onClick={() => setIsOpen(false)}
                        className="w-full mt-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                        Ocultar Ayuda
                    </button>
                </div>
            )}
        </div>
    )
}
