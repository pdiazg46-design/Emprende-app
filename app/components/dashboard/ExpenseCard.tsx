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
                                Gastos de Hoy
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
                    "bg-white p-2 md:p-2.5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer flex items-center justify-between group h-[3.5rem]",
                    className
                )}
            >
                <div className="flex items-center gap-2 md:gap-3">
                    <div className="p-1.5 bg-rose-50 rounded-lg group-hover:bg-rose-100 transition-colors">
                        <TrendingDown className="w-4 h-4 md:w-5 md:h-5 text-rose-600" />
                    </div>
                    <div className="flex flex-col justify-center">
                        <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none">Gastos Día</span>
                        <p className="text-base md:text-lg font-black text-slate-900 leading-none mt-1 privacy-sensitive">
                            ${amount.toLocaleString('es-CL')}
                        </p>
                    </div>
                </div>
            </div>

            {showModal && <ExpenseInsightModal onClose={() => setShowModal(false)} />}
        </>
    )
}
