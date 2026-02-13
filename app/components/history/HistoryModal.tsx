"use client"

import { useState, useEffect } from "react"
import { X, Calendar, Search } from "lucide-react"
import { getTransactionsByRange } from "@/actions/transaction-actions"
import { TransactionList } from "../TransactionList"

interface HistoryModalProps {
    isOpen: boolean
    onClose: () => void
}

export function HistoryModal({ isOpen, onClose }: HistoryModalProps) {
    const [loading, setLoading] = useState(false)
    const [transactions, setTransactions] = useState<any[]>([])

    // Helper to get local YYYY-MM-DD
    const toLocalDateString = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Default to current month (Local Time)
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)

    const [startDate, setStartDate] = useState(toLocalDateString(firstDay))
    const [endDate, setEndDate] = useState(toLocalDateString(now))

    const fetchHistory = async () => {
        setLoading(true)
        try {
            const data = await getTransactionsByRange(startDate, endDate)
            setTransactions(data)
        } catch (error) {
            console.error("Error fetching history:", error)
        } finally {
            setLoading(false)
        }
    }

    // Fetch on open and on date change
    useEffect(() => {
        if (isOpen) {
            fetchHistory()
        }
    }, [isOpen, startDate, endDate])

    if (!isOpen) return null

    // Helper to format YYYY-MM-DD to DD/MM/YYYY
    const formatDate = (isoString: string) => {
        if (!isoString) return "";
        const [y, m, d] = isoString.split('-');
        return `${d}/${m}/${y}`;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                            <Calendar className="w-6 h-6 text-atsit-blue" />
                            Historial Completo
                        </h2>
                        <p className="text-sm text-slate-400 font-medium">Filtra por fecha para revisar tus registros</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Filters */}
                <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-wrap gap-4 items-center">

                    {/* Start Date Standard Input */}
                    <div className="flex flex-col gap-1 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm hover:border-atsit-blue/50 transition-colors cursor-pointer min-w-[140px]">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Desde</span>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="text-sm font-black text-slate-700 outline-none bg-transparent cursor-pointer w-full"
                        />
                    </div>

                    {/* End Date Standard Input */}
                    <div className="flex flex-col gap-1 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm hover:border-atsit-blue/50 transition-colors cursor-pointer min-w-[140px]">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hasta</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="text-sm font-black text-slate-700 outline-none bg-transparent cursor-pointer w-full"
                        />
                    </div>

                    <div className="ml-auto text-xs font-bold text-slate-400">
                        {loading ? "Cargando..." : `${transactions.length} registros encontrados`}
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-40 gap-3 text-slate-400">
                            <Search className="w-8 h-8 animate-bounce opacity-50" />
                            <p className="text-sm font-medium">Buscando movimientos...</p>
                        </div>
                    ) : (
                        <TransactionList transactions={transactions} />
                    )}
                </div>
            </div>
        </div>
    )
}
