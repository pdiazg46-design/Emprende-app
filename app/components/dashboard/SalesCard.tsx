"use client"

import { useState } from "react"
import { TrendingUp, Sparkles } from "lucide-react"
import { SalesInsightModal } from "./SalesInsightModal"
import { cn } from "@/lib/utils"
import { useCart } from "../pos/CartContext"

interface SalesCardProps {
    amount: number
    variant?: 'default' | 'mobile-horizontal'
    className?: string
}

export function SalesCard({ amount, variant = 'default', className }: SalesCardProps) {
    const [showModal, setShowModal] = useState(false)
    const { optimisticSalesToday } = useCart()

    // Sumamos la RAM local para velocidad instantánea
    const displayAmount = amount + optimisticSalesToday

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
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-emerald-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="flex items-center gap-3 relative z-10">
                        <div className="p-2 bg-emerald-50 rounded-full group-hover:bg-emerald-100 transition-colors">
                            <TrendingUp className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-xs uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                                Ventas del Día
                                {optimisticSalesToday > 0 && <span className="ml-1 px-1.5 py-0.5 rounded text-[8px] bg-emerald-100 text-emerald-700 animate-pulse">RAM</span>}
                                <Sparkles className="w-3 h-3 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </p>
                            <p className="text-lg font-black text-slate-900">${displayAmount.toLocaleString('es-CL')}</p>
                        </div>
                    </div>
                </div>

                {showModal && <SalesInsightModal onClose={() => setShowModal(false)} />}
            </>
        )
    }

    // Default (Responsive Vertical Card)
    return (
        <>
            <div
                onClick={() => setShowModal(true)}
                className={cn(
                    "bg-white p-2 md:p-2.5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer flex items-center justify-between group h-[3.5rem]",
                    className
                )}
            >
                <div className="flex items-center gap-2 md:gap-3">
                    <div className="p-1.5 bg-emerald-50 rounded-lg group-hover:bg-emerald-100 transition-colors">
                        <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-emerald-600" />
                    </div>
                    <div className="flex flex-col justify-center">
                        <div className="flex items-center gap-1.5">
                            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none">Ventas Día</span>
                            {optimisticSalesToday > 0 && <span className="px-1 py-[1px] rounded text-[7px] bg-emerald-100 text-emerald-700 font-bold leading-none animate-pulse">RAM</span>}
                        </div>
                        <p className="text-base md:text-lg font-black text-slate-900 leading-none mt-1 privacy-sensitive">
                            ${displayAmount.toLocaleString('es-CL')}
                        </p>
                    </div>
                </div>
            </div>

            {showModal && <SalesInsightModal onClose={() => setShowModal(false)} />}
        </>
    )
}
