// Add Package icon import
import { TrendingUp, TrendingDown, Trash2, Package } from "lucide-react"
import { deleteTransaction } from "@/actions/transaction-actions"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface Transaction {
    id: string
    type: string
    amount: number
    quantity: number
    description: string | null
    createdAt: Date
}

export function TransactionList({ transactions }: { transactions: Transaction[] }) {
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const router = useRouter()

    const handleDelete = async (id: string) => {
        if (!confirm("¿Borrar este registro?")) return

        setDeletingId(id)
        try {
            await deleteTransaction(id)
            router.refresh()
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
        <div className="space-y-3">
            {transactions.map((tx) => {
                const isSale = tx.type === 'SALE';
                const isInventory = tx.type === 'INVENTORY_IN';
                // If not sale or inventory, assume expense

                let icon = <TrendingDown className="w-5 h-5" />;
                let colorClass = "text-rose-600";
                let bgClass = "bg-rose-50";
                let typeLabel = "Gasto";
                let sign = "-";

                if (isSale) {
                    icon = <TrendingUp className="w-5 h-5" />;
                    colorClass = "text-emerald-600";
                    bgClass = "bg-emerald-50";
                    typeLabel = "Venta";
                    sign = "+";
                } else if (isInventory) {
                    icon = <Package className="w-5 h-5" />;
                    colorClass = "text-blue-600";
                    bgClass = "bg-blue-50";
                    typeLabel = "Inventario";
                    sign = "+";
                }

                return (
                    <div
                        key={tx.id}
                        className={`bg-white border border-slate-200 p-4 rounded-xl flex justify-between items-center shadow-sm transition-all duration-300 hover:shadow-md ${deletingId === tx.id ? 'opacity-50 scale-95' : ''}`}
                    >
                        <div className="flex items-center gap-3 w-full">
                            <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center ${bgClass} ${colorClass}`}>
                                {icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                {/* Format: DD/MM - Venta/Gasto/Inv - Producto/Desc - $Monto */}
                                <p className="font-bold text-sm text-slate-800 truncate flex items-center gap-2">
                                    <span className="text-slate-400 font-medium text-xs">
                                        {new Date(tx.createdAt).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit' })}
                                    </span>
                                    <span className="text-slate-300">|</span>
                                    <span className={colorClass}>
                                        {typeLabel}
                                    </span>
                                    <span className="text-slate-300">|</span>
                                    <span className="truncate">
                                        {tx.description || 'General'}
                                        {/* Show Quantity Badge for Sales if > 1 */}
                                        {isSale && tx.quantity > 1 && (
                                            <span className="ml-2 px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-black border border-slate-200">
                                                x{tx.quantity}
                                            </span>
                                        )}
                                    </span>
                                </p>
                                <p className="text-[11px] font-medium text-slate-400">
                                    {new Date(tx.createdAt).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>

                            {/* Amount Display */}
                            <div className={`font-black tracking-tight whitespace-nowrap ${colorClass}`}>
                                {isInventory ? (
                                    <span className="text-xs font-bold bg-blue-100/50 px-2 py-1 rounded-lg">
                                        +{tx.quantity} un.
                                    </span>
                                ) : (
                                    <span>{sign}${tx.amount.toLocaleString('es-CL')}</span>
                                )}
                            </div>

                            <button
                                onClick={() => handleDelete(tx.id)}
                                disabled={deletingId === tx.id}
                                className="text-slate-400 hover:text-rose-500 p-2 rounded-full hover:bg-rose-50 transition-colors ml-2"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    )
}
