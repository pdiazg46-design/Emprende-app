"use client"

import { useState } from "react"
import { Package, Sparkles } from "lucide-react"
import { InventoryInsightModal } from "./InventoryInsightModal"
import { cn } from "@/lib/utils"

interface InventoryCardProps {
    totalValue: number
    totalItems: number
    totalProducts: number
    variant?: 'default' | 'mobile-horizontal'
    className?: string
}

export function InventoryCard({ totalValue, totalItems, totalProducts, variant = 'default', className }: InventoryCardProps) {
    const [showModal, setShowModal] = useState(false)

    if (variant === 'mobile-horizontal') {
        return (
            <>
                <div
                    onClick={() => setShowModal(true)}
                    className={cn(
                        "bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm active:scale-95 transition-transform cursor-pointer group relative overflow-hidden",
                        className
                    )}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-blue-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="flex items-center gap-3 relative z-10">
                        <div className="p-2 bg-blue-50 rounded-full group-hover:bg-blue-100 transition-colors">
                            <Package className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                                Stock Total
                                <Sparkles className="w-3 h-3 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </p>
                            <div className="flex flex-col items-start">
                                <p className="text-lg font-black text-slate-900">${totalValue.toLocaleString('es-CL')}</p>
                                <div className="flex items-baseline gap-1 mt-0.5">
                                    <span className="text-sm font-black text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                                        {totalItems} u.
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                                        Total
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {showModal && <InventoryInsightModal onClose={() => setShowModal(false)} />}
            </>
        )
    }

    // Default (Responsive Vertical Card)
    return (
        <>
            <div
                onClick={() => setShowModal(true)}
                className={cn(
                    "col-span-2 md:col-span-1 bg-white p-4 md:p-6 rounded-2xl md:rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group relative overflow-hidden",
                    className
                )}
            >
                <div className="hidden md:block absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0 duration-300">
                    <span className="bg-slate-900 text-white text-[10px] px-2 py-1 rounded-full shadow-lg flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5 text-blue-400" />
                        Analizar
                    </span>
                </div>

                <div className="flex items-center gap-2 mb-2 text-blue-600">
                    <div className="p-1.5 md:p-2 bg-blue-50 rounded-full group-hover:bg-blue-100 transition-colors">
                        <Package className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                    <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-400 group-hover:text-blue-700 transition-colors">Inventario</span>
                </div>
                <div className="flex items-center justify-between md:block">
                    <p className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight privacy-sensitive group-hover:scale-105 transition-transform origin-left">
                        ${totalValue.toLocaleString('es-CL')}
                    </p>
                    <div className="text-right md:text-left md:mt-2">
                        <p className="text-sm md:text-xl font-black text-slate-800">
                            {totalItems} Unid.
                        </p>
                        <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-wider">
                            {totalProducts} Prods.
                        </p>
                    </div>
                </div>
            </div>

            {showModal && <InventoryInsightModal onClose={() => setShowModal(false)} />}
        </>
    )
}
