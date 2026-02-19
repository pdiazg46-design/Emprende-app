"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, XCircle, ArrowRight, ShieldAlert } from "lucide-react"
import { getRiskAnalysis } from "@/actions/transaction-actions"
import { useRouter } from "next/navigation"

export function RiskManager() {
    const [risk, setRisk] = useState<any>(null)
    const [visible, setVisible] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const checkRisk = async () => {
            const analysis = await getRiskAnalysis()

            if (analysis) {
                // Check if dismissed recently (e.g. today or last hour)
                // Simple version: if dismissed, don't show same ID again today?
                // Or completely dismissed until ID changes (stock changes).
                // My ID logic includes stock count: `inventory-${id}-${stock}`.
                // So if stock changes, ID changes -> Re-alert. PERFECT.

                const dismissed = localStorage.getItem('dismissed_risks')
                if (dismissed) {
                    const dismissedList = JSON.parse(dismissed)
                    if (dismissedList.includes(analysis.id)) {
                        return // Don't show
                    }
                }

                // Intro delay for dramatic effect
                setTimeout(() => {
                    setRisk(analysis)
                    setVisible(true)
                }, 1000)
            }
        }
        checkRisk()
    }, [])

    if (!visible || !risk) return null

    const handleAction = () => {
        setVisible(false)
        const elementId = risk.actionType === 'INVENTORY' ? 'inventory-section' : 'expenses-section'
        const element = document.getElementById(elementId)
        if (element) element.scrollIntoView({ behavior: 'smooth' })
    }

    const handleDismiss = () => {
        setVisible(false)
        // Persist dismissal
        const dismissed = localStorage.getItem('dismissed_risks')
        const dismissedList = dismissed ? JSON.parse(dismissed) : []
        dismissedList.push(risk.id)
        localStorage.setItem('dismissed_risks', JSON.stringify(dismissedList))
    }

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 animate-in fade-in duration-500">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border-2 border-red-500 relative">

                {/* Header De Alerta */}
                <div className="bg-red-500 p-6 text-white flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-full animate-pulse">
                        <ShieldAlert className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-wide leading-none">
                            Atención Requerida
                        </h3>
                        <p className="text-xs font-bold text-red-100 mt-1 uppercase tracking-widest opacity-80">
                            Sistema de Protección Activa
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8">
                    <div className="flex items-start gap-4 mb-6">
                        <AlertTriangle className="w-6 h-6 text-red-500 shrink-0 mt-1" />
                        <div>
                            <h4 className="text-lg font-black text-slate-900 mb-2 leading-tight">
                                {risk.title}
                            </h4>
                            <p className="text-slate-600 leading-relaxed font-medium">
                                {risk.description}
                            </p>

                            {/* Highlight Big Number */}
                            {risk.highlightValue && (
                                <div className="mt-4 flex flex-col items-center justify-center bg-red-50/50 py-3 rounded-xl border border-red-100/50">
                                    <span className="text-4xl font-black text-red-600 tracking-tight">
                                        {risk.stockCount}
                                    </span>
                                    <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">
                                        Unidades
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={handleAction}
                            className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl shadow-lg shadow-red-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            {risk.actionLabel}
                            <ArrowRight className="w-5 h-5" />
                        </button>

                        <button
                            onClick={handleDismiss}
                            className="w-full py-3 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-slate-600 transition-colors"
                        >
                            Asumir el Riesgo (Cerrar)
                        </button>
                    </div>
                </div>

                {/* Footer Decorativo */}
                <div className="bg-slate-50 p-3 text-center border-t border-slate-100">
                    <p className="text-[10px] text-slate-400 font-medium">
                        Tu "Cerebro Digital" detectó esta anomalía basada en tus datos reales.
                    </p>
                </div>

            </div>
        </div>
    )
}
