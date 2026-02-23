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
    minStock: number
}

interface EditProductModalProps {
    isOpen: boolean
    onClose: () => void
    product: Product | null
    onSave: (id: string, name: string, price: number, minStock: number, cost: number) => Promise<void>
}

export function EditProductModal({ isOpen, onClose, product, onSave }: EditProductModalProps) {
    const [name, setName] = useState("")
    const [priceDisplay, setPriceDisplay] = useState("")
    const [costDisplay, setCostDisplay] = useState("")
    const [minStock, setMinStock] = useState("")
    const [loading, setLoading] = useState(false)

    const isNew = product?.id === 'new';

    useEffect(() => {
        if (isOpen && product) {
            // Only update state when opening the modal with a valid product
            setName(product.id === 'new' ? "" : product.name)
            setPriceDisplay(product.id === 'new' ? "" : formatNumber(product.price))
            setCostDisplay(product.id === 'new' ? "" : formatNumber(product.cost || 0))
            setMinStock(product.id === 'new' ? "5" : (product.minStock?.toString() || "5"))
        }
    }, [isOpen, product]) // Keep dependency but ensure logic inside is stable

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!product) return

        const cleanPrice = parseInt(priceDisplay.replace(/\./g, "")) || 0
        const cleanCost = parseInt(costDisplay.replace(/\./g, "")) || 0
        const cleanMinStock = parseInt(minStock) || 0

        setLoading(true)
        try {
            await onSave(product.id, name, cleanPrice, cleanMinStock, cleanCost)
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
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{isNew ? "Nuevo Producto" : "Editar Producto"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
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

                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="minStock" className="text-amber-600 font-bold">Alerta Stock Bajo</Label>
                            <Input
                                id="minStock"
                                value={minStock}
                                onChange={(e) => setMinStock(e.target.value.replace(/\D/g, ""))}
                                className="font-bold text-lg text-amber-600 border-amber-200 focus:border-amber-500 focus:ring-amber-500"
                                inputMode="numeric"
                                placeholder="5"
                            />
                        </div>
                    </div>

                    <DialogFooter className="pt-4 flex flex-col gap-2 sm:flex-row">
                        <Button type="submit" disabled={loading} className="bg-[#4379F2] hover:bg-blue-600 font-bold w-full sm:w-auto">
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {isNew ? "Crear Producto" : "Guardar Cambios"}
                        </Button>
                        <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto mt-2 sm:mt-0">
                            Cancelar
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
