"use client"

import { useState } from "react"
import { TransactionList } from "./TransactionList"
import { HistoryModal } from "./history/HistoryModal"
import { ArrowUpRight } from "lucide-react"

interface RecentActivitySectionProps {
    transactions: any[]
}

export function RecentActivitySection({ transactions }: RecentActivitySectionProps) {
    const [isModalOpen, setIsModalOpen] = useState(false)

    return (
        <section className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm h-full flex flex-col">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <h2 className="text-lg font-black text-slate-800 uppercase tracking-wide flex items-center gap-2 whitespace-nowrap">
                        Actividad de Hoy
                    </h2>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-200 uppercase tracking-wider whitespace-nowrap">
                        {transactions.length} Mov.
                    </span>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full md:w-auto flex items-center justify-center gap-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95"
                >
                    Ver Todo
                    <ArrowUpRight className="w-3 h-3" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto min-h-[300px]">
                <TransactionList transactions={transactions} />
            </div>

            <HistoryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </section>
    )
}
