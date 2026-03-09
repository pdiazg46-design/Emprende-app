"use client"

import { useState, useEffect } from "react"
import { Save, Plus, Package, Trash2, Search, Activity, Tag, Hash, Store, Pencil, RefreshCw } from "lucide-react"
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
    const [searchTerm, setSearchTerm] = useState("")
    const [activeFair, setActiveFair] = useState<string | null>(null)

    useEffect(() => {
        // Listen to active fair
        setActiveFair(localStorage.getItem('current_fair'))
    }, [])

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
                <div className="flex flex-col">
                    <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                        <Package className="w-5 h-5 text-atsit-blue" />
                        Gestión de Inventario
                    </h2>
                    {activeFair && (
                        <div className="flex items-center gap-1.5 mt-1 animate-in fade-in slide-in-from-top-1">
                            <Store className="w-3.5 h-3.5 text-purple-600" />
                            <span className="text-[10px] font-bold text-purple-700 uppercase tracking-widest bg-purple-100 px-2 py-0.5 rounded-full border border-purple-200 shadow-sm">
                                Feria {activeFair}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Cabeceras simuladas para desktop (ocultas en mobile para simplificar) */}
            <div className="hidden xl:grid grid-cols-2 gap-4 px-5 py-2 bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase">
                <div className="flex justify-between items-center pr-2">
                    <span className="flex-1 ml-10">Producto</span>
                    <div className="flex gap-4 items-center pl-2">
                        <span className="w-8 text-center">Stock</span>
                        <span className="w-12 text-center text-atsit-blue">Input</span>
                        <span className="w-16 text-center">Acción</span>
                    </div>
                </div>
                <div className="flex justify-between items-center pr-2">
                    <span className="flex-1 ml-10">Producto</span>
                    <div className="flex gap-4 items-center pl-2">
                        <span className="w-8 text-center">Stock</span>
                        <span className="w-12 text-center text-atsit-blue">Input</span>
                        <span className="w-16 text-center">Acción</span>
                    </div>
                </div>
            </div>

            <div className="p-2 md:p-4 overflow-y-auto">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-2 md:gap-3">
                    {localInventory.map((product) => (
                        <div key={product.id} className="flex items-center justify-between p-2 rounded-xl border border-slate-100 bg-white hover:bg-slate-50 transition-colors group shadow-sm">
                            <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
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
                                    className="bg-blue-600 text-white hover:bg-blue-700 p-1.5 md:p-2 rounded-lg transition-all shadow-sm shadow-blue-500/30 active:scale-95 shrink-0"
                                    title="Agregar a Venta"
                                    disabled={product.stock <= 0}
                                >
                                    <Plus className="w-3 h-3 md:w-3.5 md:h-3.5" />
                                </button>

                                <div className="flex flex-col min-w-0 pr-1">
                                    <span className="font-bold text-slate-700 text-[11px] md:text-[13px] line-clamp-1 leading-tight uppercase truncate">
                                        {product.name}
                                    </span>
                                    <span className="font-bold text-slate-500 text-[10px] md:text-[11px] mt-0.5">
                                        ${formatNumber(product.price)}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 md:gap-3 shrink-0">
                                <span className={`px-1 rounded-lg font-black text-[11px] md:text-xs flex items-center justify-center min-w-[1.5rem] h-6 border shadow-sm ${product.stock <= 0
                                    ? "bg-rose-100 text-rose-700 border-rose-200"
                                    : product.stock <= (product.minStock || 5)
                                        ? "bg-amber-100 text-amber-700 border-amber-200"
                                        : "bg-slate-50 text-slate-800 border-slate-200"
                                    }`}>
                                    {product.stock}
                                </span>

                                <div className="relative w-10 md:w-12 shrink-0">
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        placeholder="+"
                                        className="w-full h-6 px-1 bg-blue-50/10 border border-slate-200 rounded-md font-bold text-center text-slate-900 focus:border-atsit-blue outline-none transition-all placeholder:text-slate-300 caret-atsit-blue shadow-sm text-xs md:text-sm"
                                        onFocus={(e) => e.target.select()}
                                        value={updates[product.id]?.addStock || ""}
                                        onChange={(e) => handleUpdateChange(product.id, 'addStock', e.target.value)}
                                    />
                                </div>

                                <div className="flex items-center justify-end gap-1 w-[4.5rem] md:w-[5rem] shrink-0">
                                    {(updates[product.id]?.addStock > 0 || (updates[product.id]?.price !== undefined && updates[product.id]?.price !== product.price)) ? (
                                        <button
                                            onClick={() => saveSingleUpdate(product.id)}
                                            className="bg-[#4379F2] text-white px-2 py-1 rounded-lg transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-1 w-full text-[10px] md:text-xs font-bold animate-in zoom-in-95 duration-200"
                                            title="Confirmar"
                                        >
                                            <Save className="w-3 h-3 md:w-3.5 md:h-3.5" />
                                            OK
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => handleEditProduct(product)}
                                                className="text-slate-300 hover:text-blue-500 hover:bg-blue-50 p-1 md:p-1.5 rounded-lg transition-all"
                                                title="Editar"
                                            >
                                                <Pencil className="w-3 h-3 md:w-3.5 md:h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                className="text-slate-300 hover:text-rose-500 hover:bg-rose-50 p-1 md:p-1.5 rounded-lg transition-all"
                                                title="Eliminar"
                                            >
                                                <Trash2 className="w-3 h-3 md:w-3.5 md:h-3.5" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Nuevo Producto Button */}
                <div className="mt-4 pb-2">
                    <button
                        onClick={() => {
                            setEditingProduct({ id: 'new', name: '', price: 0, stock: 0, minStock: 5, cost: 0 } as Product)
                        }}
                        className="w-full py-3 md:py-4 bg-slate-800 text-white rounded-xl font-bold text-xs md:text-sm hover:bg-slate-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 transform active:scale-95 group"
                    >
                        <div className="bg-white/20 p-1 rounded-full group-hover:bg-white/30 transition-colors">
                            <Plus className="w-4 h-4" />
                        </div>
                        CREAR NUEVO PRODUCTO
                    </button>
                </div>
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
