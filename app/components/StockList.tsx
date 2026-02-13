"use client"

import { Package, Trash2 } from "lucide-react"
import { deleteProduct } from "@/actions/transaction-actions"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface Product {
    id: string
    name: string
    price: number
    stock: number
    updatedAt: Date
}

export function StockList({ inventory }: { inventory: Product[] }) {
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const router = useRouter()

    const handleDelete = async (id: string) => {
        if (!confirm("¿Borrar este producto del inventario?")) return

        setDeletingId(id)
        try {
            await deleteProduct(id)
            router.refresh()
        } catch (error) {
            alert("Error al borrar producto")
        } finally {
            setDeletingId(null)
        }
    }

    if (inventory.length === 0) {
        return (
            <div className="text-center py-10 text-slate-500 text-sm bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
                <p>No hay productos en inventario.</p>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {inventory.map((prod) => (
                <div
                    key={prod.id}
                    className={`bg-white border border-slate-200 p-4 rounded-xl flex justify-between items-center shadow-sm transition-all duration-300 hover:shadow-md ${deletingId === prod.id ? 'opacity-50 scale-95' : ''}`}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-50 text-atsit-blue shrink-0">
                            <Package className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-bold text-sm text-slate-800">
                                {prod.name}
                            </p>
                            {/* Format: Date + "Stock" + Product (Already in title) + Qty */}
                            <p className="text-[11px] font-medium text-slate-400">
                                {new Date(prod.updatedAt).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit' })} • Stock: {prod.stock} u.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Value representation */}
                        <span className="font-black tracking-tight text-slate-700">
                            ${prod.price.toLocaleString('es-CL')} c/u
                        </span>
                        <button
                            onClick={() => handleDelete(prod.id)}
                            disabled={deletingId === prod.id}
                            className="text-slate-400 hover:text-rose-500 p-2 rounded-full hover:bg-rose-50 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    )
}
