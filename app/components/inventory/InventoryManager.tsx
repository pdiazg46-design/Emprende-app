"use client"

import { useState } from "react"
import { Save, Plus, Package, RefreshCw, Trash2, Pencil } from "lucide-react"
import { bulkUpdateStock, addProduct, deleteProduct } from "@/actions/transaction-actions"
import { useRouter } from "next/navigation"
import { EditProductModal } from "./EditProductModal"
import { useCart } from "@/components/pos/CartContext"

interface Product {
    id: string
    name: string
    price: number
    stock: number
    minStock: number
    cost: number
}

export function InventoryManager({ inventory }: { inventory: Product[] }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const { addToCart } = useCart()

    // State for bulk updates: Map productId -> { price, addStock, name }
    const [updates, setUpdates] = useState<Record<string, { price: number, addStock: number, name?: string }>>({})

    // State for new product
    const [newItem, setNewItem] = useState({ name: "", price: "", minStock: "" })

    // State for modal editing
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)

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

    const handleEditProduct = (product: Product) => {
        setEditingProduct(product)
    }

    const handleSaveEdit = async (id: string, name: string, price: number, minStock: number, cost: number) => {
        try {
            if (id === 'new') {
                console.log("Creating new product...", { name, price, minStock, cost });
                await addProduct({
                    name,
                    price,
                    cost,
                    stock: 0,
                    minStock
                })
            } else {
                console.log("Saving edit...", { id, name, price, minStock, cost });
                await bulkUpdateStock([{
                    id,
                    name,
                    price,
                    cost,
                    addStock: 0,
                    minStock
                }])
            }
            setEditingProduct(null)
            router.refresh()
        } catch (error) {
            console.error("Failed to save/create product:", error);
            alert("Error al guardar. Revisa la consola.");
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
                            <th className="px-1 py-3 w-10 text-center text-atsit-blue">
                                <Plus className="w-4 h-4 mx-auto" />
                            </th>
                            <th className="px-1 py-3 w-auto min-w-[120px]">Producto</th>
                            <th className="px-1 py-3 w-10 text-center">Stock</th>
                            <th className="px-1 py-3 w-12 text-center bg-blue-50/50 text-atsit-blue">Input</th>
                            <th className="px-1 py-3 w-16 text-center">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {inventory.map((product) => (
                            <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-1 py-2 text-center">
                                    <button
                                        onClick={() => {
                                            if (product.stock <= 0) {
                                                alert("No hay stock disponible");
                                                return;
                                            }
                                            addToCart({
                                                name: product.name,
                                                price: product.price,
                                                quantity: 1,
                                                id: product.id
                                            })
                                        }}
                                        className="bg-blue-600 text-white hover:bg-blue-700 p-2 rounded-lg transition-all shadow-sm shadow-blue-500/30 flex items-center justify-center mx-auto active:scale-90"
                                        title="Agregar a Venta"
                                        disabled={product.stock <= 0}
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </td>
                                <td className="px-1 py-2">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="font-bold text-slate-700 text-xs md:text-sm line-clamp-2 leading-tight uppercase">
                                            {product.name}
                                        </span>
                                        <span className="font-bold text-slate-500 text-xs">
                                            ${formatNumber(product.price)}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-1 py-1 text-center align-middle">
                                    <div className="flex items-center justify-center">
                                        <span className={`px-2 rounded-lg font-black text-lg flex items-center justify-center min-w-[3rem] h-10 shadow-sm border ${product.stock <= 0
                                            ? "bg-rose-100 text-rose-700 border-rose-200"
                                            : product.stock <= (product.minStock || 5)
                                                ? "bg-amber-100 text-amber-700 border-amber-200"
                                                : "bg-slate-50 text-slate-800 border-slate-200"
                                            }`}>
                                            {product.stock}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-1 py-1 text-center bg-blue-50/10 align-middle">
                                    <div className="flex items-center justify-center">
                                        <div className="relative w-full max-w-[3rem]">
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                placeholder="+"
                                                className="w-full h-10 px-0.5 bg-white border border-slate-200 rounded-lg font-bold text-center text-slate-900 focus:border-atsit-blue outline-none transition-all placeholder:text-slate-300 caret-atsit-blue shadow-sm text-lg"
                                                onFocus={(e) => e.target.select()}
                                                value={updates[product.id]?.addStock || ""}
                                                onChange={(e) => handleUpdateChange(product.id, 'addStock', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </td>
                                <td className="px-0 py-2 text-center align-top pt-2 md:align-middle">
                                    <div className="flex items-center justify-end gap-0.5 pr-1">
                                        <button
                                            onClick={() => handleEditProduct(product)}
                                            className="text-slate-300 hover:text-blue-500 hover:bg-blue-50 p-1.5 rounded-full transition-all"
                                            title="Editar"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product.id)}
                                            className="text-slate-300 hover:text-rose-500 hover:bg-rose-50 p-1.5 rounded-full transition-all"
                                            title="Eliminar"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {/* Row to add new product - Button Only */}
                        <tr className="bg-slate-50 border-t-2 border-slate-100 border-dashed">
                            <td colSpan={5} className="px-2 py-3">
                                <button
                                    onClick={() => {
                                        setEditingProduct({ id: 'new', name: '', price: 0, stock: 0, minStock: 5, cost: 0 } as Product)
                                    }}
                                    className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-slate-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 transform active:scale-95 group"
                                >
                                    <div className="bg-white/20 p-1 rounded-full group-hover:bg-white/30 transition-colors">
                                        <Plus className="w-4 h-4" />
                                    </div>
                                    CREAR NUEVO PRODUCTO
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

            {editingProduct && (
                <EditProductModal
                    key={editingProduct.id}
                    isOpen={true}
                    onClose={() => setEditingProduct(null)}
                    product={editingProduct}
                    onSave={handleSaveEdit}
                />
            )}
        </div>
    )
}
