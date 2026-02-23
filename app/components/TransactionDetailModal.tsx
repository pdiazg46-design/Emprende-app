"use client"

import { X, Calendar, DollarSign, FileText, ShoppingBag, TrendingDown, Package } from "lucide-react"
import { cn } from "@/lib/utils"

interface TransactionDetailModalProps {
    transaction: any | null
    isOpen: boolean
    onClose: () => void
}

export function TransactionDetailModal({ transaction, isOpen, onClose }: TransactionDetailModalProps) {
    if (!isOpen || !transaction) return null

    const isSale = transaction.type === "SALE"
    const isRestock = transaction.type === "INVENTORY_IN"

    const formatDate = (dateDict: any) => {
        if (!dateDict) return ""
        const date = new Date(dateDict)
        return new Intl.DateTimeFormat('es-CL', {
            dateStyle: 'full',
            timeStyle: 'medium'
        }).format(date)
    }

    const getThemeColor = () => {
        if (isSale) return "bg-emerald-500"
        if (isRestock) return "bg-blue-500"
        return "bg-rose-500"
    }

    const getIcon = () => {
        if (isSale) return <ShoppingBag className="w-10 h-10" />
        if (isRestock) return <Package className="w-10 h-10" />
        return <TrendingDown className="w-10 h-10" />
    }

    const getTitle = () => {
        if (isRestock) return `+${transaction.quantity || transaction.amount} u.`
        return `${isSale ? "+" : "-"}$${transaction.amount.toLocaleString("es-CL")}`
    }

    const getLabel = () => {
        if (isSale) return "Venta Registrada"
        if (isRestock) return "Carga de Inventario"
        return "Gasto / Salida"
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header / Type Indicator */}
                <div className={cn(
                    "p-6 flex flex-col items-center justify-center text-white relative overflow-hidden",
                    getThemeColor()
                )}>
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors backdrop-blur-md"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>

                    <div className="p-4 bg-white/20 rounded-full backdrop-blur-md mb-3 shadow-lg ring-4 ring-white/10">
                        {getIcon()}
                    </div>

                    <h2 className="text-3xl font-black tracking-tight">
                        {getTitle()}
                    </h2>
                    <p className="font-medium opacity-90 uppercase tracking-widest text-xs mt-1">
                        {getLabel()}
                    </p>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {/* Date */}
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-slate-50 rounded-2xl text-slate-400">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fecha y Hora</p>
                            <p className="font-semibold text-slate-700">{formatDate(transaction.createdAt)}</p>
                        </div>
                    </div>

                    {/* Description / Detail List */}
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-slate-50 rounded-2xl text-slate-400">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Detalle de Items</p>

                            <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
                                {transaction.description && transaction.description.includes('=') ? (
                                    // Structured View for parsed format
                                    <div className="divide-y divide-slate-100">
                                        {transaction.description.split('\n').map((line: string, i: number) => {
                                            // Format: "2 x Name ($500) = $1.000"
                                            const parts = line.split(" = ")
                                            const left = parts[0] || line
                                            const right = parts[1] || ""

                                            return (
                                                <div key={i} className="p-3 flex justify-between items-center text-sm">
                                                    <span className="text-slate-700 font-medium">{left}</span>
                                                    {right && <span className="font-bold text-slate-900">{right}</span>}
                                                </div>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    // Legacy view
                                    <div className="p-4 text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                                        {transaction.description || "Sin descripción"}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <button
                        onClick={onClose}
                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 active:scale-95"
                    >
                        Cerrar Detalle
                    </button>
                </div>
            </div>
        </div>
    )
}
