"use client"

import { useState } from "react"
import { Package, Plus, Search, AlertCircle, Edit2, X, CheckCircle2, Loader2, Save, MoreHorizontal, TrendingUp, Trash2, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCart } from "@/components/pos/CartContext"
import { useRouter } from "next/navigation"
import { addProduct, bulkUpdateStock, deleteProduct } from "@/actions/transaction-actions"

interface Product {
    id: string
    name: string
    price: number
    stock: number
    cost: number
    imageUrl?: string | null
}

interface InventoryGridProps {
    products: Product[]
}

export function InventoryGrid({ products }: InventoryGridProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const { addToCart } = useCart()
    const router = useRouter()

    // Create State
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [isCreating, setIsCreating] = useState(false)
    const [newItem, setNewItem] = useState({ name: "", price: "", stock: "", cost: "" })

    // Edit State
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [editForm, setEditForm] = useState({ price: "", addStock: "", cost: "" })
    const [isSaving, setIsSaving] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    // Prioritize low stock items (Top 5) + Sort by name as secondary
    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => {
        // Logic: Low stock (<5) goes first
        const aLow = a.stock < 5 ? 1 : 0
        const bLow = b.stock < 5 ? 1 : 0
        if (aLow !== bLow) return bLow - aLow // Higher priority first
        return a.name.localeCompare(b.name)
    })

    const handleCreateProduct = async () => {
        if (!newItem.name || !newItem.price) return;

        setIsCreating(true)
        try {
            const cleanPrice = parseInt(newItem.price.replace(/\D/g, '')) || 0
            const cleanStock = parseInt(newItem.stock.replace(/\D/g, '')) || 0
            const cleanCost = parseInt(newItem.cost.replace(/\D/g, '')) || 0

            await addProduct({
                name: newItem.name,
                price: cleanPrice,
                stock: cleanStock,
                cost: cleanCost
            })

            // Reset and Close
            setNewItem({ name: "", price: "", stock: "", cost: "" })
            setIsAddOpen(false)
            router.refresh()
        } catch (error) {
            console.error("Error creating product:", error)
            alert("Error al crear producto")
        } finally {
            setIsCreating(false)
        }
    }

    const openEditSheet = (product: Product) => {
        setSelectedProduct(product)
        setEditForm({
            price: product.price.toString(),
            addStock: "",
            cost: (product.cost || 0).toString()
        })
    }

    const handleSaveEdit = async () => {
        if (!selectedProduct) return;

        setIsSaving(true)
        try {
            const cleanPrice = parseInt(editForm.price.replace(/\D/g, '')) || 0
            const cleanAddStock = parseInt(editForm.addStock.replace(/\D/g, '')) || 0
            const cleanCost = parseInt(editForm.cost.replace(/\D/g, '')) || 0

            // Only send updates if changed
            if (cleanPrice !== selectedProduct.price || cleanAddStock > 0 || cleanCost !== selectedProduct.cost) {
                await bulkUpdateStock([{
                    id: selectedProduct.id,
                    price: cleanPrice,
                    addStock: cleanAddStock,
                    cost: cleanCost,
                    name: selectedProduct.name
                }])
            }

            setSelectedProduct(null)
            router.refresh()
        } catch (error) {
            console.error("Error updating product:", error)
            alert("Error al actualizar")
        } finally {
            setIsSaving(false)
        }
    }

    const handleDeleteProduct = async () => {
        if (!selectedProduct) return;

        const hasStock = selectedProduct.stock > 0;
        const confirmMessage = hasStock
            ? `⚠️ ¡CUIDADO! \n\nEste producto tiene ${selectedProduct.stock} unidades en inventario.\n\nSi lo eliminas, estos items desaparecerán del "Inventario Total" y bajará tu valorización de stock.\n\n¿Estás seguro de eliminarlo?`
            : "¿Estás seguro de eliminar este producto para siempre?";

        if (!confirm(confirmMessage)) return;

        setIsDeleting(true);
        try {
            await deleteProduct(selectedProduct.id);
            setSelectedProduct(null);
            router.refresh();
        } catch (error) {
            alert("Error al eliminar el producto.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Search Bar - Compact */}
            {/* TODO: Implement Search if needed */}

            <div className="grid grid-cols-2 gap-3 pb-44">
                {filteredProducts.map((product) => {
                    const isLowStock = product.stock < 5
                    const isCritical = product.stock === 0

                    return (
                        <div
                            key={product.id}
                            onClick={() => openEditSheet(product)}
                            className={cn(
                                "relative bg-white rounded-2xl p-3 border shadow-sm transition-all active:scale-95 touch-manipulation flex flex-col justify-between h-32 cursor-pointer",
                                isCritical ? "border-red-400 bg-red-50/30" :
                                    isLowStock ? "border-amber-400 bg-amber-50/30" : "border-slate-100"
                            )}
                        >
                            {/* Status Indicator */}
                            {(isLowStock || isCritical) && (
                                <div className={cn(
                                    "absolute top-2 right-2 w-2 h-2 rounded-full",
                                    isCritical ? "bg-red-500 animate-pulse" : "bg-amber-500"
                                )} />
                            )}

                            <div>
                                <h3 className="font-bold text-slate-800 text-sm leading-tight line-clamp-2">
                                    {product.name}
                                </h3>
                                <p className="text-xs text-slate-400 mt-3 font-bold uppercase tracking-wider flex items-center justify-between gap-2">
                                    <span>Stock Disponible:</span>
                                    <span className={cn(
                                        "font-black text-xl px-3 py-1 rounded-lg border",
                                        isLowStock ? "bg-amber-100 text-amber-800 border-amber-200" : "bg-slate-100 text-slate-800 border-slate-200"
                                    )}>
                                        {product.stock}
                                    </span>
                                </p>
                            </div>

                            <div className="flex items-end justify-between mt-2">
                                <span className="font-black text-lg text-slate-900">
                                    ${product.price.toLocaleString("es-CL")}
                                </span>

                                {/* Quick Add Button - Stop Propagation to prevent opening edit sheet */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        addToCart({
                                            id: product.id,
                                            name: product.name,
                                            price: product.price,
                                            quantity: 1,
                                            isManual: true
                                        })
                                    }}
                                    className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-blue-500/30 active:bg-blue-700 active:scale-90 transition-all z-10"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )
                })}

                {/* Create New Button */}
                <button
                    onClick={() => setIsAddOpen(true)}
                    className="bg-slate-50 rounded-2xl p-3 border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 h-32 active:bg-slate-100 transition-colors"
                >
                    <Plus className="w-8 h-8 mb-1 opacity-50" />
                    <span className="text-xs font-medium">Nuevo</span>
                </button>
            </div>

            {/* --- CREATE SHEET --- */}
            {
                isAddOpen && (
                    <>
                        <div
                            className="fixed inset-0 bg-black/40 z-[55] backdrop-blur-sm animate-in fade-in duration-300"
                            onClick={() => setIsAddOpen(false)}
                        />
                        <div className="fixed bottom-0 left-0 right-0 z-[60] bg-white rounded-t-[2rem] shadow-2xl p-6 h-auto animate-in slide-in-from-bottom duration-300 pb-10">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                                    <Package className="w-6 h-6 text-atsit-blue" />
                                    Nuevo Producto
                                </h2>
                                <button
                                    onClick={() => setIsAddOpen(false)}
                                    className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Nombre</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Galletas de Chocolate"
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-900 outline-none focus:border-atsit-blue focus:bg-white transition-all text-lg placeholder:font-normal placeholder:text-slate-300"
                                        value={newItem.name}
                                        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                        autoFocus
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Precio</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                placeholder="0"
                                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl pl-8 pr-4 py-3 font-bold text-slate-900 outline-none focus:border-atsit-blue focus:bg-white transition-all text-lg text-right placeholder:font-normal placeholder:text-slate-300"
                                                value={newItem.price}
                                                onChange={(e) => setNewItem({ ...newItem, price: e.target.value.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ".") })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Costo</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                placeholder="0"
                                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl pl-8 pr-4 py-3 font-bold text-slate-900 outline-none focus:border-atsit-blue focus:bg-white transition-all text-lg text-right placeholder:font-normal placeholder:text-slate-300"
                                                value={newItem.cost}
                                                onChange={(e) => setNewItem({ ...newItem, cost: e.target.value.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ".") })}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Stock Inicial</label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        placeholder="0"
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-900 outline-none focus:border-atsit-blue focus:bg-white transition-all text-lg text-center placeholder:font-normal placeholder:text-slate-300"
                                        value={newItem.stock}
                                        onChange={(e) => setNewItem({ ...newItem, stock: e.target.value.replace(/\D/g, '') })}
                                    />
                                </div>
                                <button
                                    onClick={handleCreateProduct}
                                    disabled={!newItem.name || !newItem.price || isCreating}
                                    className="w-full bg-[#4379F2] text-white rounded-xl py-4 font-black text-lg shadow-xl shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-8 mb-8 disabled:opacity-50 disabled:cursor-not-allowed z-50 relative"
                                >
                                    {isCreating ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                                    CREAR PRODUCTO
                                </button>
                            </div>
                        </div>
                    </>
                )
            }

            {/* --- EDIT SHEET (Option A) --- */}
            {
                selectedProduct && (
                    <>
                        <div
                            className="fixed inset-0 bg-black/40 z-[55] backdrop-blur-sm animate-in fade-in duration-300"
                            onClick={() => setSelectedProduct(null)}
                        />
                        <div className="fixed bottom-0 left-0 right-0 z-[60] bg-white rounded-t-[2rem] shadow-2xl p-6 h-auto animate-in slide-in-from-bottom duration-300 pb-10">
                            <div className="flex items-center justify-between mb-6">
                                <div className="overflow-hidden">
                                    <h2 className="text-xl font-black text-slate-900 truncate pr-2">
                                        {selectedProduct.name}
                                    </h2>
                                    <p className="text-sm text-slate-500 font-medium">Editar Producto</p>
                                </div>
                                <button
                                    onClick={() => setSelectedProduct(null)}
                                    className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 shrink-0"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                                    <div className="text-sm font-bold text-slate-500">Stock Actual</div>
                                    <div className="text-3xl font-black text-slate-900">{selectedProduct.stock} u.</div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-1">
                                            <Edit2 className="w-3 h-3" /> Precio
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl pl-8 pr-4 py-3 font-bold text-slate-900 outline-none focus:border-atsit-blue focus:bg-white transition-all text-lg text-right"
                                                value={editForm.price.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                                                onChange={(e) => setEditForm({ ...editForm, price: e.target.value.replace(/\D/g, '') })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" /> Costo
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl pl-8 pr-4 py-3 font-bold text-slate-900 outline-none focus:border-atsit-blue focus:bg-white transition-all text-lg text-right"
                                                value={editForm.cost.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                                                onChange={(e) => setEditForm({ ...editForm, cost: e.target.value.replace(/\D/g, '') })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-1">
                                        <TrendingUp className="w-3 h-3 text-emerald-500" /> Agregar Stock
                                    </label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        placeholder="+0"
                                        className="w-full bg-emerald-50/50 border-2 border-emerald-100 rounded-xl px-4 py-3 font-bold text-emerald-700 outline-none focus:border-emerald-500 focus:bg-white transition-all text-lg text-center placeholder:text-emerald-300/50"
                                        value={editForm.addStock}
                                        onChange={(e) => setEditForm({ ...editForm, addStock: e.target.value.replace(/\D/g, '') })}
                                    />
                                </div>

                                <div className="space-y-3 pt-4">
                                    <button
                                        onClick={handleSaveEdit}
                                        disabled={isSaving}
                                        className="w-full bg-slate-900 text-white rounded-xl py-4 font-black text-lg shadow-xl shadow-slate-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                                        GUARDAR CAMBIOS
                                    </button>

                                    <button
                                        onClick={handleDeleteProduct}
                                        disabled={isDeleting || isSaving}
                                        className="w-full bg-rose-50 text-rose-500 hover:bg-rose-100 rounded-xl py-3 font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                        Eliminar Producto
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )
            }
        </div >
    )
}
