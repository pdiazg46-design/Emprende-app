"use client"

import { useState, useEffect } from "react"
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
    const { addToCart, setCatalog } = useCart()

    // RAM-First State (Optimistic UI)
    const [localInventory, setLocalInventory] = useState<Product[]>(inventory)

    useEffect(() => {
        setLocalInventory(inventory)
        setCatalog(inventory) // Alimentar la RAM global para el VoiceWrapper en 0ms
    }, [inventory, setCatalog])

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
                price: localInventory.find(p => p.id === id)?.price || 0,
                addStock: 0,
                name: localInventory.find(p => p.id === id)?.name
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

    const saveSingleUpdate = (id: string) => {
        const data = updates[id];
        if (!data) return;

        const original = localInventory.find(p => p.id === id);
        if (!original) return;

        // 1. Efecto RAM-First: Calcular nuevos valores
        const optimisticProduct = {
            ...original,
            stock: original.stock + (data.addStock || 0),
            price: data.price !== undefined ? data.price : original.price,
            name: data.name || original.name
        };

        // 2. Aplicar instantáneamente a la UI local
        setLocalInventory(prev => prev.map(p => p.id === id ? optimisticProduct : p));

        // 3. Limpiar Input y desaparecer botón OK instantáneamente
        setUpdates(prev => {
            const newUpdates = { ...prev };
            delete newUpdates[id];
            return newUpdates;
        });

        // 4. Background Sync: Enviar al server sin bloquear la UI (Fire & Forget)
        bulkUpdateStock([{
            id,
            price: data.price,
            addStock: data.addStock,
            name: data.name
        }]).then(() => {
            // Refresca la tabla y las tarjetas superiores una vez que BD está OK
            router.refresh();
        }).catch((err) => {
            console.error("Error optimista:", err);
            // Revertir si hay error de red
            setLocalInventory(prev => prev.map(p => p.id === id ? original : p));
            alert("Error de conexión al guardar en BD. Se han revertido los cambios.");
        });
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

    const handleSaveEdit = async (id: string, name: string, price: number, minStock: number, cost: number, stockOperation: number) => {
        try {
            if (id === 'new') {
                console.log("Creating new product...", { name, price, minStock, cost, stock: stockOperation });
                await addProduct({
                    name,
                    price,
                    cost,
                    stock: stockOperation,
                    minStock
                })
            } else {
                console.log("Saving edit...", { id, name, price, minStock, cost, addStock: stockOperation });
                await bulkUpdateStock([{
                    id,
                    name,
                    price,
                    cost,
                    addStock: stockOperation,
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
        const original = localInventory.find(p => p.id === id);
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
            </div>

            <div className="p-0 overflow-x-auto">
                <table className="w-full text-xs md:text-sm text-left">
                    <thead className="text-[10px] md:text-xs text-slate-400 uppercase bg-slate-50 font-bold border-b border-slate-100">
                        <tr>
                            <th className="px-0.5 md:px-1 py-2 w-8 md:w-10 text-center text-atsit-blue">
                                <Plus className="w-3 h-3 md:w-4 md:h-4 mx-auto" />
                            </th>
                            <th className="px-1 py-2 w-auto min-w-[80px] md:min-w-[120px]">Producto</th>
                            <th className="px-0.5 py-2 w-8 md:w-10 text-center">Stock</th>
                            <th className="px-0.5 py-2 w-10 md:w-12 text-center bg-blue-50/50 text-atsit-blue">Input</th>
                            <th className="px-0.5 py-2 w-12 md:w-16 text-center">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {localInventory.map((product) => (
                            <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-0.5 md:px-1 py-1 text-center">
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
                                        className="bg-blue-600 text-white hover:bg-blue-700 p-1.5 md:p-2 rounded-lg transition-all shadow-sm shadow-blue-500/30 flex items-center justify-center mx-auto active:scale-90"
                                        title="Agregar a Venta"
                                        disabled={product.stock <= 0}
                                    >
                                        <Plus className="w-3 h-3 md:w-4 md:h-4" />
                                    </button>
                                </td>
                                <td className="px-1 py-1">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="font-bold text-slate-700 text-[11px] md:text-sm line-clamp-2 leading-tight uppercase">
                                            {product.name}
                                        </span>
                                        <span className="font-bold text-slate-500 text-[10px] md:text-xs">
                                            ${formatNumber(product.price)}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-0.5 py-1 text-center align-middle">
                                    <div className="flex items-center justify-center">
                                        <span className={`px-1 rounded-lg font-black text-sm md:text-lg flex items-center justify-center min-w-[2rem] h-8 md:h-10 shadow-sm border ${product.stock <= 0
                                            ? "bg-rose-100 text-rose-700 border-rose-200"
                                            : product.stock <= (product.minStock || 5)
                                                ? "bg-amber-100 text-amber-700 border-amber-200"
                                                : "bg-slate-50 text-slate-800 border-slate-200"
                                            }`}>
                                            {product.stock}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-0.5 py-1 text-center bg-blue-50/10 align-middle">
                                    <div className="flex items-center justify-center">
                                        <div className="relative w-full max-w-[2.5rem] md:max-w-[3rem]">
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                placeholder="+"
                                                className="w-full h-8 md:h-10 px-0.5 bg-white border border-slate-200 rounded-lg font-bold text-center text-slate-900 focus:border-atsit-blue outline-none transition-all placeholder:text-slate-300 caret-atsit-blue shadow-sm text-sm md:text-lg"
                                                onFocus={(e) => e.target.select()}
                                                value={updates[product.id]?.addStock || ""}
                                                onChange={(e) => handleUpdateChange(product.id, 'addStock', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </td>
                                <td className="px-0 py-1 text-center align-middle">
                                    <div className="flex items-center justify-end gap-0.5 pr-0.5">
                                        {(updates[product.id]?.addStock > 0 || (updates[product.id]?.price !== undefined && updates[product.id]?.price !== product.price)) ? (
                                            <button
                                                onClick={() => saveSingleUpdate(product.id)}
                                                className="bg-[#4379F2] text-white px-2 py-1.5 rounded-lg transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-1.5 w-full min-w-[4rem] text-[10px] md:text-xs font-bold animate-in zoom-in-95 duration-200"
                                                title="Confirmar"
                                            >
                                                <Save className="w-3 h-3 md:w-3.5 md:h-3.5" />
                                                OK
                                            </button>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => handleEditProduct(product)}
                                                    className="text-slate-300 hover:text-blue-500 hover:bg-blue-50 p-1 md:p-1.5 rounded-full transition-all"
                                                    title="Editar"
                                                >
                                                    <Pencil className="w-3 h-3 md:w-4 md:h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    className="text-slate-300 hover:text-rose-500 hover:bg-rose-50 p-1 md:p-1.5 rounded-full transition-all"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                                                </button>
                                            </>
                                        )}
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

            {localInventory.length === 0 && (
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
