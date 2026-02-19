"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

export interface CartItem {
    id: string // Can be product ID or a temp ID if not found yet
    name: string
    quantity: number
    price: number
    isManual?: boolean // If added manually or by voice
}

interface CartContextType {
    cart: CartItem[]
    addToCart: (item: Omit<CartItem, "id"> & { id?: string }) => void
    removeFromCart: (id: string) => void
    clearCart: () => void
    cartTotal: number
    cartCount: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([])

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

    const removeFromCart = (id: string) => {
        setCart(prev => prev.filter(item => item.id !== id))
    }

    const clearCart = () => {
        setCart([])
    }

    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, cartTotal, cartCount }}>
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
