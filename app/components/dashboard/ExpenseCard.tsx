"use client"

import { useState } from "react"
import { TrendingDown, Sparkles } from "lucide-react"
import { ExpenseInsightModal } from "./ExpenseInsightModal"
import { cn } from "@/lib/utils"

interface ExpenseCardProps {
    amount: number
    variant?: 'default' | 'mobile-horizontal'
    className?: string
}

export function ExpenseCard({ amount, variant = 'default', className }: ExpenseCardProps) {
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
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-rose-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="flex items-center gap-3 relative z-10">
                        <div className="p-2 bg-rose-50 rounded-full group-hover:bg-rose-100 transition-colors">
                            <TrendingDown className="w-5 h-5 text-rose-600" />
                        </div>
                        <div>
                            <p className="text-xs uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                                Gastos Hoy
                                <Sparkles className="w-3 h-3 text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </p>
                            <p className="text-lg font-black text-slate-900">${amount.toLocaleString('es-CL')}</p>
                        </div>
                    </div>
                </div>

                {showModal && <ExpenseInsightModal onClose={() => setShowModal(false)} />}
            </>
        )
    }

    // Default (Responsive Vertical Card)
    return (
        <>
            <div
                onClick={() => setShowModal(true)}
                className={cn(
                    "bg-white p-4 md:p-6 rounded-2xl md:rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group relative overflow-hidden",
                    className
                )}
            >
                <div className="hidden md:block absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0 duration-300">
                    <span className="bg-slate-900 text-white text-[10px] px-2 py-1 rounded-full shadow-lg flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5 text-rose-400" />
                        Analizar
                    </span>
                </div>

                <div className="flex items-center gap-2 mb-2 md:mb-3 text-rose-600">
                    <div className="p-1.5 md:p-2 bg-rose-50 rounded-full group-hover:bg-rose-100 transition-colors">
                        <TrendingDown className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                    <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-400 group-hover:text-rose-700 transition-colors">Gastos</span>
                </div>
                <p className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight privacy-sensitive">
                    ${amount.toLocaleString('es-CL')}
                </p>
            </div>

            {showModal && <ExpenseInsightModal onClose={() => setShowModal(false)} />}
        </>
    )
}
