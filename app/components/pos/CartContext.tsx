"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

export interface CartItem {
    id: string // Can be product ID or a temp ID if not found yet
    name: string
    quantity: number
    price: number
    isManual?: boolean // If added manually or by voice
    isOptimistic?: boolean // RAM-First flag
}

interface CartContextType {
    cart: CartItem[]
    addToCart: (item: Omit<CartItem, "id"> & { id?: string }) => void
    replaceCartItem: (tempId: string, realItem: CartItem) => void
    updateQuantity: (id: string, delta: number) => void
    removeFromCart: (id: string) => void
    clearCart: () => void
    cartTotal: number
    cartCount: number
    optimisticSalesToday: number
    optimisticTransactions: any[]
    addOptimisticSale: (amount: number, cartSnapshot: CartItem[], method: string) => void
    clearOptimisticTransactions: () => void
    catalogRAM: any[] // Caché de productos en memoria para voz instantánea
    setCatalog: (products: any[]) => void // Función para inyectar desde el servidor/InventoryManager
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([])
    // Estado transitorio para sumar a las ventas visuales del Dashboard. Se limpia on unmount o real reload.
    const [optimisticSalesToday, setOptimisticSalesToday] = useState(0)
    const [optimisticTransactions, setOptimisticTransactions] = useState<any[]>([])

    // Caché de Productos para búsquedas en 0ms
    const [catalogRAM, setCatalogState] = useState<any[]>([])

    const setCatalog = (products: any[]) => {
        setCatalogState(products)
    }

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem("pos-cart")
        if (saved) {
            try {
                setCart(JSON.parse(saved))
            } catch (e) {
                console.error("Error loading cart", e)
            }
        }
    }, [])

    // Save to localStorage on change
    useEffect(() => {
        localStorage.setItem("pos-cart", JSON.stringify(cart))
    }, [cart])

    const addToCart = (newItem: Omit<CartItem, "id"> & { id?: string }) => {
        setCart((prev) => {
            // Check if item exists (by exact name match for now, or ID if provided)
            const existingIndex = prev.findIndex(item =>
                (newItem.id && item.id === newItem.id) ||
                (!newItem.id && item.name.toLowerCase() === newItem.name.toLowerCase())
            )

            if (existingIndex >= 0) {
                // Update quantity
                const newCart = [...prev]
                newCart[existingIndex] = {
                    ...newCart[existingIndex],
                    quantity: newCart[existingIndex].quantity + newItem.quantity
                }
                return newCart
            } else {
                // Add new
                return [...prev, { ...newItem, id: newItem.id || crypto.randomUUID() }]
            }
        })
    }

    // Funcionalidad RAM-First: Reemplaza un item temporal (optimista) por el definitivo de la BD
    const replaceCartItem = (tempId: string, realItem: CartItem) => {
        setCart((prev) => {
            return prev.map(item => {
                if (item.id === tempId) {
                    // Mantenemos la cantidad actual por si el usuario la modificó mientras cargaba
                    return { ...realItem, quantity: item.quantity, isOptimistic: false }
                }
                return item
            })
        })
    }

    const updateQuantity = (id: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQuantity = Math.max(1, item.quantity + delta) // Prevent going below 1
                return { ...item, quantity: newQuantity }
            }
            return item
        }))
    }

    const removeFromCart = (id: string) => {
        setCart(prev => prev.filter(item => item.id !== id))
    }

    const clearCart = () => {
        setCart([])
    }

    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

    const addOptimisticSale = (amount: number, cartSnapshot: CartItem[], method: string) => {
        setOptimisticSalesToday(prev => prev + amount)

        const groupId = 'opt-group-' + crypto.randomUUID()
        const newTx = cartSnapshot.map(item => ({
            id: 'opt-' + crypto.randomUUID(),
            type: 'SALE',
            amount: item.price * item.quantity,
            quantity: item.quantity,
            description: `Venta POS: ${item.quantity}x ${item.name}`,
            paymentMethod: method,
            date: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            groupId,
            product: { name: item.name }
        }))

        setOptimisticTransactions(prev => [...newTx, ...prev])
    }

    const clearOptimisticTransactions = () => {
        setOptimisticTransactions([])
    }

    return (
        <CartContext.Provider value={{
            cart, addToCart, replaceCartItem, updateQuantity, removeFromCart, clearCart, cartTotal, cartCount,
            optimisticSalesToday, addOptimisticSale,
            optimisticTransactions, clearOptimisticTransactions,
            catalogRAM, setCatalog
        }}>
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const context = useContext(CartContext)
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider")
    }
    return context
}
