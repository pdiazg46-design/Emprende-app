"use client"

import { TrendingUp, TrendingDown, Trash2, Package, ChevronRight, X, Clock, Receipt } from "lucide-react"
import { deleteTransaction } from "@/actions/transaction-actions"
import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"

interface Transaction {
    id: string
    type: string
    amount: number
    quantity: number
    description: string | null
    createdAt: Date
    groupId?: string | null
}

interface GroupedTransaction {
    groupId: string | null
    id: string // primary ID (first item or group ID)
    items: Transaction[]
    totalAmount: number
    date: Date
    type: string
}

export function TransactionList({ transactions }: { transactions: Transaction[] }) {
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [selectedGroup, setSelectedGroup] = useState<GroupedTransaction | null>(null)
    const router = useRouter()

    // Group transactions logic
    const groupedTransactions = useMemo(() => {
        const groups: GroupedTransaction[] = []
        const contentMap = new Map<string, number>() // groupId -> index in groups

        transactions.forEach(tx => {
            if (tx.groupId) {
                if (contentMap.has(tx.groupId)) {
                    const index = contentMap.get(tx.groupId)!
                    groups[index].items.push(tx)
                    groups[index].totalAmount += tx.amount
                } else {
                    const newIndex = groups.length
                    contentMap.set(tx.groupId, newIndex)
                    groups.push({
                        groupId: tx.groupId,
                        id: tx.groupId,
                        items: [tx],
                        totalAmount: tx.amount,
                        date: new Date(tx.createdAt), // Use first item's date
                        type: tx.type
                    })
                }
            } else {
                // Standalone transaction
                groups.push({
                    groupId: null,
                    id: tx.id,
                    items: [tx],
                    totalAmount: tx.amount,
                    date: new Date(tx.createdAt),
                    type: tx.type
                })
            }
        })

        return groups
    }, [transactions])

    const handleDelete = async (id: string) => {
        if (!confirm("¿Borrar este registro?")) return

        setDeletingId(id)
        try {
            await deleteTransaction(id)
            router.refresh()
            // If inside modal and it was the last item, close modal
            if (selectedGroup && selectedGroup.items.length === 1 && selectedGroup.items[0].id === id) {
                setSelectedGroup(null)
            }
        } catch (error) {
            alert("Error al borrar")
        } finally {
            setDeletingId(null)
        }
    }

    if (transactions.length === 0) {
        return (
            <div className="text-center py-10 text-slate-500 text-sm bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
                <p>No hay registros recientes.</p>
            </div>
        )
    }

    return (
        <>
            <div className="space-y-3">
                {groupedTransactions.map((group) => {
                    const isGroup = group.items.length > 1
                    const firstTx = group.items[0]
                    const isSale = group.type === 'SALE';
                    const isInventory = group.type === 'INVENTORY_IN';

                    const shortId = group.id.slice(-4).toUpperCase();

                    // Default values (Expense)
                    let iconContent: React.ReactNode = <TrendingDown className="w-5 h-5" />;
                    let colorClass = "text-rose-600";
                    let bgClass = "bg-rose-50";
                    let typeLabel = "Gasto";
                    let sign = "-";

                    if (isSale) {
                        // Restore Icon
                        iconContent = isGroup ? <Receipt className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />;
                        colorClass = "text-emerald-600";
                        bgClass = "bg-emerald-50";
                        typeLabel = "Venta";
                        sign = "+";
                    } else if (isInventory) {
                        iconContent = <Package className="w-5 h-5" />;
                        colorClass = "text-blue-600";
                        bgClass = "bg-blue-50";
                        typeLabel = "Inventario";
                        sign = "+";
                    }

                    return (
                        <div
                            key={group.id}
                            onClick={() => {
                                if (isGroup || group.groupId) { // Open modal
                                    setSelectedGroup(group)
                                }
                            }}
                            className={`bg-white border border-slate-200 px-3 py-3 sm:p-4 rounded-xl flex justify-between items-center shadow-sm transition-all duration-300 hover:shadow-md cursor-pointer relative overflow-hidden`}
                        >
                            {/* Visual indicator multiple items */}
                            {isGroup && (
                                <div className="absolute top-0 right-0 w-3 h-3 bg-blue-500/20 rounded-bl-lg" />
                            )}

                            <div className="flex items-center gap-3 w-full">
                                <div className={`w-10 h-10 sm:w-11 sm:h-11 shrink-0 rounded-full flex items-center justify-center ${bgClass} ${colorClass}`}>
                                    {iconContent}
                                </div>

                                <div className="flex-1 min-w-0 flex flex-col justify-center px-1">
                                    <div className="flex items-center gap-1.5 leading-none mb-1">
                                        <span className={`${colorClass} font-black text-xs whitespace-nowrap uppercase tracking-wide flex items-center gap-1`}>
                                            {// Show ID next to Label
                                                isSale ? (
                                                    <>
                                                        {typeLabel} <span className="text-slate-800 font-bold">#{shortId}</span>
                                                    </>
                                                ) : (
                                                    typeLabel
                                                )
                                            }
                                        </span>
                                        <span className="text-slate-300 text-[10px]">|</span>
                                        <span className="text-slate-700 font-bold text-[10px] whitespace-nowrap">
                                            {group.date.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit' })}
                                        </span>
                                        {!isGroup && group.groupId && <span className="text-[8px] bg-slate-100 px-1 rounded text-slate-400">POS</span>}
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                                        <span className="font-medium text-slate-700 text-xs leading-snug break-words whitespace-normal">
                                            {isGroup
                                                ? `(${group.items.length} productos)`
                                                : (firstTx.description || 'General')
                                            }
                                        </span>
                                        <span className="text-[10px] text-slate-500 flex items-center gap-0.5 mt-0.5 sm:mt-0 font-medium">
                                            <Clock className="w-3 h-3" />
                                            {group.date.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>

                                <div className={`flex flex-col items-end ${colorClass}`}>
                                    {isInventory ? (
                                        <span className="text-xs font-bold bg-blue-100/50 px-2 py-1 rounded-lg whitespace-nowrap">
                                            +{group.items.reduce((sum, i) => sum + i.quantity, 0)}
                                        </span>
                                    ) : (
                                        <span className="privacy-sensitive text-sm sm:text-base font-black tracking-tight whitespace-nowrap">{sign}${group.totalAmount.toLocaleString('es-CL')}</span>
                                    )}
                                    {(isGroup || group.groupId) && <ChevronRight className="hidden sm:block w-4 h-4 text-slate-300 mt-1" />}
                                </div>

                                {!isGroup && !group.groupId && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleDelete(firstTx.id)
                                        }}
                                        disabled={deletingId === firstTx.id}
                                        className="text-slate-400 hover:text-rose-500 p-2 rounded-full hover:bg-rose-50 transition-colors ml-1 z-10 relative"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Detail Modal */}
            {selectedGroup && (
                <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 sm:p-6" style={{ zIndex: 9999 }}>
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                        onClick={() => setSelectedGroup(null)}
                    />

                    <div className="relative w-full max-w-lg bg-white rounded-t-2xl md:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-bottom duration-300">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h3 className="text-lg font-black text-slate-800">
                                    Venta #{selectedGroup.id.slice(-4).toUpperCase()}
                                </h3>
                                <p className="text-xs text-slate-500 flex items-center gap-2">
                                    <Clock className="w-3 h-3" />
                                    {selectedGroup.date.toLocaleString('es-CL')}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedGroup(null)}
                                className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-600 shadow-sm border border-slate-100"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Order Content */}
                        <div className="p-6 overflow-y-auto space-y-4">
                            {selectedGroup.items.map((item, idx) => (
                                <div key={item.id} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 rounded-lg px-2 -mx-2 transition-colors group">
                                    <div className="flex items-start gap-4">
                                        <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs">
                                            {item.quantity}x
                                        </div>
                                        <div>
                                            {/* Extract product name from description if simple */}
                                            <p className="font-bold text-slate-800 text-sm">
                                                {item.description?.replace(/Venta POS: \d+x /, '') || item.description || 'Ítem sin nombre'}
                                            </p>
                                            <p className="text-xs text-slate-400 font-mono mt-0.5">
                                                ID: {item.id.slice(0, 8)}...
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <p className="font-bold text-slate-700 privacy-sensitive">
                                            ${item.amount.toLocaleString('es-CL')}
                                        </p>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            disabled={deletingId === item.id}
                                            className="text-slate-300 hover:text-rose-500 p-2 rounded-lg hover:bg-rose-50 transition-colors"
                                            title="Eliminar este ítem"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                            <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Total Venta</span>
                            <span className="text-2xl font-black text-slate-900 privacy-sensitive">
                                ${selectedGroup.totalAmount.toLocaleString('es-CL')}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
