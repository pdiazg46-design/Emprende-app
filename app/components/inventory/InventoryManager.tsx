"use client"

import { useState } from "react"
import { Save, Plus, Package, RefreshCw, Trash2 } from "lucide-react"
import { bulkUpdateStock, addProduct, deleteProduct } from "@/actions/transaction-actions"
import { useRouter } from "next/navigation"

interface Product {
    id: string
    name: string
    price: number
    stock: number
}

export function InventoryManager({ inventory }: { inventory: Product[] }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    // State for bulk updates: Map productId -> { price, addStock, name }
    const [updates, setUpdates] = useState<Record<string, { price: number, addStock: number, name?: string }>>({})

    // State for new product
    const [newItem, setNewItem] = useState({ name: "", price: "" })

    // Helper for display
    const formatNumber = (num: number | string) => {
        if (!num && num !== 0) return ""; // Handle empty string or null/undefined
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    const handleUpdateChange = (id: string, field: 'price' | 'addStock' | 'name', value: string) => {
        let finalValue: string | number = value;

        if (field !== 'name') {
            // Remove non-numeric characters (keep only digits) to store clean number
            const cleanValue = value.replace(/\D/g, '');
            finalValue = parseInt(cleanValue) || 0;
        }

        setUpdates(prev => {
            const current = prev[id] || {
                price: inventory.find(p => p.id === id)?.price || 0,
                addStock: 0,
                name: inventory.find(p => p.id === id)?.name
            };

            return {
                ...prev,
                [id]: { ...current, [field]: finalValue }
            }
        })
    }

    const saveUpdates = async () => {
        setLoading(true)
        try {
            // Convert simple map to array for server action
            const updateList = Object.entries(updates)
                .map(([id, data]) => ({
                    id,
                    price: data.price,
                    addStock: data.addStock,
                    name: data.name
                }))
                .filter(item => {
                    const original = inventory.find(p => p.id === item.id);
                    if (!original) return false;
                    return item.addStock > 0 || item.price !== original.price || (item.name && item.name !== original.name);
                });

            await bulkUpdateStock(updateList)
            setUpdates({}) // Clear changes
            router.refresh() // Refresh data
        } catch (error) {
            alert("Error al actualizar inventario")
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("¿Eliminar este producto permanentemente?")) return;
        setLoading(true);
        try {
            await deleteProduct(id);
            router.refresh();
        } catch (error) {
            alert("Error al eliminar");
        } finally {
            setLoading(false);
        }
    }

    const handleCreateProduct = async () => {
        if (!newItem.name || !newItem.price) return;
        const cleanPrice = parseInt(newItem.price.replace(/\D/g, '')) || 0;

        setLoading(true)
        try {
            await addProduct({
                name: newItem.name,
                price: cleanPrice,
                stock: 0
            })
            setNewItem({ name: "", price: "" })
            router.refresh()
        } catch (error) {
            alert("Error al crear producto")
        } finally {
            setLoading(false)
        }
    }

    // Show button if ANY stock is added OR ANY price/name is changed
    const hasPendingUpdates = Object.entries(updates).some(([id, u]) => {
        const original = inventory.find(p => p.id === id);
        if (!original) return false;
        return u.addStock > 0 || u.price !== original.price || (u.name && u.name !== original.name);
    });

    return (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                    <Package className="w-5 h-5 text-atsit-blue" />
                    Gestión de Inventario
                </h2>
                {hasPendingUpdates && (
                    <button
                        onClick={saveUpdates}
                        disabled={loading}
                        className="flex items-center gap-2 bg-[#4379F2] text-white px-6 py-3 rounded-xl font-black hover:bg-blue-600 transition-all shadow-xl shadow-blue-500/20 text-sm tracking-wide transform active:scale-95 border border-blue-600/20"
                    >
                        {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        CONFIRMAR INGRESO
                    </button>
                )}
            </div>

            <div className="p-0 overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-400 uppercase bg-slate-50 font-bold border-b border-slate-100">
                        <tr>
                            <th className="px-5 py-4 w-auto min-w-[200px]">Producto</th>
                            <th className="px-2 py-4 w-28 text-right">Precio</th>
                            <th className="px-2 py-4 w-20 text-center">Stock</th>
                            <th className="px-2 py-4 w-32 text-center bg-blue-50/50 text-atsit-blue">Ingresar (+)</th>
                            <th className="px-2 py-4 w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {inventory.map((product) => (
                            <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-5 py-3">
                                    <input
                                        type="text"
                                        className="w-full bg-transparent font-bold text-slate-700 outline-none border-b border-transparent focus:border-atsit-blue focus:bg-white rounded-sm px-1 transition-all caret-atsit-blue truncate"
                                        title={product.name}
                                        onFocus={(e) => e.target.select()}
                                        value={updates[product.id]?.name ?? product.name}
                                        onChange={(e) => handleUpdateChange(product.id, 'name', e.target.value)}
                                    />
                                </td>
                                <td className="px-2 py-3">
                                    <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus-within:border-atsit-blue transition-all shadow-sm w-full">
                                        <span className="text-slate-400 font-bold">$</span>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            className="w-full bg-transparent font-bold text-slate-900 outline-none caret-atsit-blue text-right"
                                            onFocus={(e) => e.target.select()}
                                            value={formatNumber(updates[product.id]?.price ?? product.price)}
                                            onChange={(e) => handleUpdateChange(product.id, 'price', e.target.value)}
                                        />
                                    </div>
                                </td>
                                <td className="px-2 py-3 text-center">
                                    <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-bold text-xs inline-block min-w-[2.5rem]">
                                        {product.stock}
                                    </span>
                                </td>
                                <td className="px-2 py-3 text-center bg-blue-50/10">
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="relative w-full max-w-[6rem]">
                                            <Plus className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-atsit-blue pointer-events-none" />
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                placeholder="0"
                                                className="w-full pl-6 pr-2 py-1.5 bg-white border-2 border-slate-200 rounded-lg font-black text-center text-slate-900 focus:border-atsit-blue outline-none transition-all placeholder:text-slate-300 caret-atsit-blue shadow-sm text-sm"
                                                onFocus={(e) => e.target.select()}
                                                value={formatNumber(updates[product.id]?.addStock || "")}
                                                onChange={(e) => handleUpdateChange(product.id, 'addStock', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </td>
                                <td className="px-2 py-3 text-center">
                                    <button
                                        onClick={() => handleDelete(product.id)}
                                        className="text-slate-300 hover:text-rose-500 hover:bg-rose-50 p-2 rounded-full transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}

                        {/* Row to add new product */}
                        <tr className="bg-slate-50 border-t-2 border-slate-100 border-dashed">
                            <td className="px-5 py-4">
                                <input
                                    type="text"
                                    placeholder="Nombre Nuevo Producto..."
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-atsit-blue caret-atsit-blue text-slate-900 font-medium shadow-sm transition-all"
                                    value={newItem.name}
                                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                />
                            </td>
                            <td className="px-2 py-4">
                                <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-2 focus-within:border-atsit-blue transition-all shadow-sm w-full">
                                    <span className="text-slate-400 font-bold">$</span>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        placeholder="Precio"
                                        className="w-full bg-transparent font-bold text-slate-900 outline-none caret-atsit-blue text-right"
                                        value={newItem.price}
                                        onChange={(e) => setNewItem({ ...newItem, price: e.target.value.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ".") })}
                                    />
                                </div>
                            </td>
                            <td colSpan={3} className="px-5 py-4">
                                <button
                                    onClick={handleCreateProduct}
                                    disabled={!newItem.name || !newItem.price || loading}
                                    className="w-full py-2.5 bg-slate-800 text-white rounded-lg font-bold text-xs hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm tracking-wide uppercase"
                                >
                                    + Crear Item
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {inventory.length === 0 && (
                <div className="p-8 text-center text-slate-400 text-sm">
                    No tienes productos. Usa la última fila para agregar el primero.
                </div>
            )}
        </div>
    )
}
