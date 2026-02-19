"use client"

import { SessionProvider } from "next-auth/react"
import { LicenseGuard } from "./LicenseGuard"
import { MobileSimulatorProvider } from "./MobileSimulatorContext"
import { CartProvider } from "./pos/CartContext"
import { PrivacyProvider } from "./PrivacyContext"
import { VoicePreferencesProvider } from "./voice/VoicePreferencesContext"

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <MobileSimulatorProvider>
                <CartProvider>
                    <PrivacyProvider>
                        <VoicePreferencesProvider>
                            <LicenseGuard>
                                {children}
                            </LicenseGuard>
                        </VoicePreferencesProvider>
                    </PrivacyProvider>
                </CartProvider>
            </MobileSimulatorProvider>
        </SessionProvider>
    )
}
