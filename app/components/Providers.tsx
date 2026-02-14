'use client'

import { SessionProvider } from "next-auth/react"
import { LicenseGuard } from "./LicenseGuard"

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <LicenseGuard>
                {children}
            </LicenseGuard>
        </SessionProvider>
    )
}
