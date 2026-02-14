'use client'

import { useState, useEffect } from 'react'
import { getMyAllowedIds } from '../app/actions/user-actions'
import { Lock, ShieldAlert, Monitor } from 'lucide-react'
import { useSession } from 'next-auth/react'

export function LicenseGuard({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession()
    const [isBlocked, setIsBlocked] = useState(false)
    const [machineId, setMachineId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const checkLicense = async () => {
            // Only check if logged in
            if (status !== "authenticated") {
                setLoading(false)
                return
            }

            // @ts-ignore
            if (typeof window !== 'undefined' && window.electronAPI) {
                try {
                    // @ts-ignore
                    const id = await window.electronAPI.getMachineId()
                    setMachineId(id)

                    const allowedIds = await getMyAllowedIds()

                    if (allowedIds && allowedIds.length > 0) {
                        if (!allowedIds.includes(id)) {
                            setIsBlocked(true)
                        }
                    } else {
                        // If no IDs are set, we might default to BLOCK or ALLOW.
                        // "Safe Default": Block if explicit list exists? 
                        // Prompt said: "Si el ID no está autorizado, la app mostrará una pantalla de bloqueo."
                        // Strategy: If user has ANY allowed ID, strict check. 
                        // If user has NO allowed IDs (empty), assume web user OR first time setup?
                        // Let's be strict: If using Electron, MUST be in allowed list. 
                        setIsBlocked(true)
                    }
                } catch (e) {
                    console.error("License check failed", e)
                }
            }
            setLoading(false)
        }

        checkLicense()
    }, [status]) // Re-run when session status changes

    if (loading) return <>{children}</> // Or a loader

    if (isBlocked && machineId) {
        return (
            <div className="fixed inset-0 z-[9999] bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mb-6 animate-pulse">
                    <ShieldAlert className="w-10 h-10 text-red-500" />
                </div>

                <h1 className="text-2xl font-black text-white mb-2">Terminal No Autorizada</h1>
                <p className="text-slate-400 mb-8 max-w-md">
                    Por seguridad, este dispositivo no tiene registro de acceso para tu cuenta.
                    Solicita al administrador que habilite este terminal.
                </p>

                <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 w-full max-w-sm mb-8">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">ID DE HARDWARE</p>
                    <div
                        className="flex items-center justify-between gap-3 bg-slate-900/50 rounded-lg p-3 cursor-pointer hover:bg-slate-900 transition-colors group"
                        onClick={() => {
                            navigator.clipboard.writeText(machineId)
                            alert("ID Copiado")
                        }}
                    >
                        <code className="font-mono text-blue-400 font-bold text-lg tracking-wider">{machineId}</code>
                        <Monitor className="w-4 h-4 text-slate-600 group-hover:text-blue-400" />
                    </div>
                    <p className="text-[10px] text-slate-600 mt-2">Haz clic para copiar y enviarlo.</p>
                </div>

                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-bold rounded-xl transition-all"
                >
                    Reintentar Validación
                </button>
            </div>
        )
    }

    return <>{children}</>
}
