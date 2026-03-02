"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface Product {
    id: string
    name: string
    price: number
    cost: number
    stock: number
    minStock?: number
}

interface EditProductModalProps {
    isOpen: boolean
    onClose: () => void
    product: Product | null
    onSave: (id: string, name: string, price: number, minStock: number, cost: number, stockOperation: number) => Promise<void>
}

export function EditProductModal({ isOpen, onClose, product, onSave }: EditProductModalProps) {
    const [name, setName] = useState("")
    const [priceDisplay, setPriceDisplay] = useState("")
    const [costDisplay, setCostDisplay] = useState("")
    const [minStock, setMinStock] = useState("")
    const [stockInitial, setStockInitial] = useState("")
    const [loading, setLoading] = useState(false)

    const isNew = product?.id === 'new';

    useEffect(() => {
        if (isOpen && product) {
            // Only update state when opening the modal with a valid product
            setName(product.id === 'new' ? "" : product.name)
            setPriceDisplay(product.id === 'new' ? "" : formatNumber(product.price))
            setCostDisplay(product.id === 'new' ? "" : formatNumber(product.cost || 0))
            setMinStock(product.id === 'new' ? "5" : (product.minStock?.toString() || "5"))
            setStockInitial(product.id === 'new' ? "" : product.stock.toString())
        }
    }, [isOpen, product])

    const formatNumber = (num: number | string) => {
        if (!num && num !== 0) return ""
        const clean = num.toString().replace(/\D/g, "")
        return clean.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
    }

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        const clean = value.replace(/\D/g, "")
        setPriceDisplay(formatNumber(clean))
    }

    const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        const clean = value.replace(/\D/g, "")
        setCostDisplay(formatNumber(clean))
    }

    const isValid = Boolean(
        name.trim() &&
        priceDisplay.trim() &&
        costDisplay.trim() &&
        minStock.trim() &&
        stockInitial.trim()
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!product) return

        const cleanPrice = parseInt(priceDisplay.replace(/\./g, "")) || 0
        const cleanCost = parseInt(costDisplay.replace(/\./g, "")) || 0
        const cleanMinStock = parseInt(minStock) || 0
        const cleanStock = parseInt(stockInitial) || 0

        setLoading(true)
        try {
            // Pasamos cleanStock como stockOperation, asumiendo que el componente superior validará
            await onSave(product.id, name, cleanPrice, cleanMinStock, cleanCost, cleanStock)
            // Do not close here, let parent handle it or close on success if parent doesn't throw
            onClose()
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-white/95 backdrop-blur-xl border-slate-200 shadow-2xl rounded-t-2xl sm:rounded-2xl w-full sm:w-[95vw] fixed bottom-0 sm:bottom-auto sm:top-[50%] sm:-translate-y-1/2 translate-y-0 top-auto left-1/2 -translate-x-1/2 flex flex-col">
                <DialogHeader>
                    <DialogTitle className="sr-only">
                        {isNew ? "Nuevo Producto" : "Editar Producto"}
                    </DialogTitle>
                </DialogHeader>
                <div className="w-full flex justify-center pt-3 pb-1 shrink-0 bg-transparent relative">
                    <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
                    <span className="absolute right-4 top-2 text-[8px] text-slate-300 font-mono">v.1b</span>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col flex-grow">
                    <div className="px-4 py-4 space-y-4 flex-grow overflow-y-auto">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre del Producto</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Ej: Bebida 1.5L"
                                className="font-medium"
                                autoFocus={isNew}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="price">Precio Venta</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                                    <Input
                                        id="price"
                                        value={priceDisplay}
                                        onChange={handlePriceChange}
                                        className="pl-7 font-bold text-lg"
                                        inputMode="numeric"
                                        placeholder="0"
                                        onFocus={(e) => e.target.select()}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cost" className="text-slate-600">Costo Unitario</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                    <Input
                                        id="cost"
                                        value={costDisplay}
                                        onChange={handleCostChange}
                                        className="pl-7 font-bold text-lg text-slate-600 border-slate-200"
                                        inputMode="numeric"
                                        placeholder="0"
                                        onFocus={(e) => e.target.select()}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Fila 3: Acciones + Stock Inicial y Stock Mínimo SÍ o SÍ */}
                    <div className="flex items-end justify-between gap-1 pt-2 pb-4 px-4 shrink-0 bg-white border-t border-slate-100/50 mt-1">
                        <Button type="button" variant="ghost" onClick={onClose} className="px-1 font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 h-9 rounded-lg text-xs shrink-0 w-16 sm:w-20">
                            Cancelar
                        </Button>

                        <div className="space-y-0.5 w-[70px]">
                            <Label htmlFor="stock" className="text-[9px] font-bold text-blue-600 uppercase tracking-tight text-center block w-full">Stock</Label>
                            <Input
                                id="stock"
                                value={stockInitial}
                                onChange={(e) => setStockInitial(e.target.value.replace(/\D/g, ""))}
                                className="font-bold text-sm text-blue-700 bg-blue-50/50 border-blue-200 focus:border-blue-400 focus:ring-blue-400 h-9 transition-colors text-center px-1"
                                inputMode="numeric"
                                placeholder="0"
                                onFocus={(e) => e.target.select()}
                                disabled={!isNew}
                            />
                        </div>

                        <div className="space-y-0.5 w-[70px]">
                            <Label htmlFor="minStock" className="text-[9px] font-bold text-amber-600 uppercase tracking-tight text-center block w-full">
                                Alerta
                            </Label>
                            <Input
                                id="minStock"
                                value={minStock}
                                onChange={(e) => setMinStock(e.target.value.replace(/\D/g, ""))}
                                className="font-bold text-sm text-amber-700 bg-amber-50/50 border-amber-200 focus:border-amber-400 focus:ring-amber-400 h-9 transition-colors text-center px-1"
                                inputMode="numeric"
                                placeholder="5"
                                onFocus={(e) => e.target.select()}
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={loading || !isValid}
                            className={`px-1 text-white font-black text-xs shadow-md h-9 rounded-lg transition-all active:scale-95 disabled:opacity-50 shrink-0 w-[70px] sm:w-20 ${isNew ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20'}`}
                        >
                            {loading ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : (isNew ? "Crear" : "Guardar")}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
