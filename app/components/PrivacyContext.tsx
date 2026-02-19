"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

interface PrivacyContextType {
    isPrivacyMode: boolean
    togglePrivacyMode: () => void
}

const PrivacyContext = createContext<PrivacyContextType | undefined>(undefined)

export function PrivacyProvider({ children }: { children: React.ReactNode }) {
    const [isPrivacyMode, setIsPrivacyMode] = useState(false)

    useEffect(() => {
        // Check localStorage
        const saved = localStorage.getItem("privacy-mode")
        if (saved === "true") {
            setIsPrivacyMode(true)
            document.documentElement.classList.add("privacy-mode")
        }
    }, [])

    const togglePrivacyMode = () => {
        const newState = !isPrivacyMode
        setIsPrivacyMode(newState)
        localStorage.setItem("privacy-mode", String(newState))

        if (newState) {
            document.documentElement.classList.add("privacy-mode")
        } else {
            document.documentElement.classList.remove("privacy-mode")
        }
    }

    return (
        <PrivacyContext.Provider value={{ isPrivacyMode, togglePrivacyMode }}>
            {children}
        </PrivacyContext.Provider>
    )
}

export function usePrivacyMode() {
    const context = useContext(PrivacyContext)
    if (!context) {
        throw new Error("usePrivacyMode must be used within a PrivacyProvider")
    }
    return context
}
