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
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <h2 className="text-lg font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
                        Actividad de Hoy
                    </h2>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-200 uppercase tracking-wider">
                        {transactions.length} Mov.
                    </span>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-1 text-xs font-bold text-white bg-atsit-blue hover:bg-blue-700 px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
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
