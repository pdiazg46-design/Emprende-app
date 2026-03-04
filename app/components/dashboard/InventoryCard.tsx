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
                    "col-span-2 md:col-span-1 bg-white p-2 md:p-2.5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer flex items-center justify-between group h-[3.5rem]",
                    className
                )}
            >
                <div className="flex items-center gap-2 md:gap-3 overflow-hidden">
                    <div className="p-1.5 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors shrink-0">
                        <Package className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                    </div>
                    <div className="flex flex-col justify-center min-w-0 pr-2">
                        <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none truncate">Inventario Total</span>
                        <div className="flex items-center gap-2 mt-1 flex-wrap md:flex-nowrap">
                            <p className="text-base md:text-lg font-black text-slate-900 leading-none privacy-sensitive shrink-0">
                                ${totalValue.toLocaleString('es-CL')}
                            </p>
                            <div className="hidden sm:flex text-[9px] md:text-[10px] text-slate-400 font-bold border-l pl-2 border-slate-200 items-center whitespace-nowrap">
                                <span className="text-slate-700 mx-0.5">{totalItems}</span> U.
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showModal && <InventoryInsightModal onClose={() => setShowModal(false)} />}
        </>
    )
}
