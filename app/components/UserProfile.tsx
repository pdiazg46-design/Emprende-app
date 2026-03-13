'use client'

import { signOut, useSession } from "next-auth/react"
import { LogOut, Users, RefreshCw, Settings, Mail, Calculator, Wallet, Store, Sparkles } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { AdminUsersModal } from "./AdminUsersModal"
import { InstallButton } from "./InstallButton"
import { HardwareIdFetcher } from "./HardwareIdFetcher"
import { useVoicePreferences } from "./voice/VoicePreferencesContext"
import { VoiceToggle } from "./voice/VoiceToggle"
import { updateActiveFair } from "@/actions/user-settings-actions"

interface UserProfileProps {
    user: {
        name?: string | null
        email?: string | null
        image?: string | null
    }
}

export function UserProfile({ user }: UserProfileProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isAdminOpen, setIsAdminOpen] = useState(false)
    const [activeFair, setActiveFair] = useState<string | null>(null)
    const { data: session } = useSession()
    const menuRef = useRef<HTMLDivElement>(null)

    const isAdmin = (session?.user as any)?.role === 'ADMIN'

    // Detectar clics fuera del menú para cerrarlo automáticamente
    useEffect(() => {
        function handleClickOutside(event: MouseEvent | TouchEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside)
            document.addEventListener("touchstart", handleClickOutside)
            // Check active fair
            setActiveFair(localStorage.getItem('current_fair'))
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
            document.removeEventListener("touchstart", handleClickOutside)
        }
    }, [isOpen])

    // Function to manually trigger the Daily Fair Prompt
    const handleManualFairTrigger = () => {
        localStorage.removeItem('emprende_last_fair_prompt')
        window.location.href = '/emprende'
    }

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-9 h-9 rounded-full bg-slate-100 border-2 border-slate-100 shadow-sm overflow-hidden flex items-center justify-center cursor-pointer hover:border-blue-400 transition-all focus:outline-none"
            >
                {user.image ? (
                    <img src={user.image} alt={user.name || "User"} className="w-full h-full object-cover" />
                ) : (
                    <span className="text-xs font-black text-slate-400">{(user.name || user.email || "U").charAt(0).toUpperCase()}</span>
                )}
            </button>

            {/* Logout Menu */}
            {isOpen && (
                <>
                    <div className="absolute right-0 top-12 md:top-14 z-50 bg-white border border-slate-100 shadow-2xl rounded-2xl p-2 min-w-[200px] animate-in fade-in zoom-in-95 duration-100">
                        <div className="px-3 py-2 border-b border-slate-50 mb-1">
                            <p className="text-[10px] font-black text-slate-800 truncate">{user.name || "Usuario"}</p>
                            <p className="text-[8px] font-medium text-slate-400 truncate mb-1.5">{user.email}</p>

                            {/* Subscription Status Pill */}
                            <div className="flex items-center gap-1.5">
                                {(session?.user as any)?.subscriptionPlan === 'PRO' ? (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-sm">
                                        PRO VIP
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 border border-slate-200">
                                        PLAN BÁSICO
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="px-1 mt-1">
                            {/* Voice Toggle - Moved to top for visibility */}
                            <div className="flex items-center justify-between px-3 py-2 bg-slate-100 rounded-xl mb-2 border border-slate-200 shadow-sm mx-1">
                                <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight">Comandos de Voz</span>
                                <VoiceToggle />
                            </div>

                            {/* Hardware ID Display for Licensing */}
                            <div className="hidden md:block px-3 py-2 bg-slate-50 rounded-lg mb-2 border border-slate-100">
                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">ID de Terminal (Licencia)</p>
                                <p className="text-[9px] font-mono text-slate-600 break-all select-all cursor-pointer hover:text-blue-600 transition-colors"
                                    onClick={() => {
                                        // @ts-ignore
                                        if (typeof window !== 'undefined' && window.electronAPI) {
                                            // @ts-ignore
                                            window.electronAPI.getMachineId().then(id => {
                                                navigator.clipboard.writeText(id);
                                                alert("ID copiado: " + id);
                                            });
                                        } else {
                                            alert("No estás ejecutando la versión de escritorio.");
                                        }
                                    }}
                                >
                                    {/* Render simpler placeholder initially, actual logic handled via click or effect usually, 
                                        but for simplicity/perf we'll just make it clickable to fetch or use a hook if preferred.
                                        Let's try a self-fetching text if electron exists.
                                    */}
                                    <HardwareIdFetcher />
                                </p>
                            </div>

                            <button
                                onClick={() => {
                                    setIsOpen(false)
                                    window.location.href = "/emprende/f29"
                                }}
                                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-50/50 text-indigo-700 hover:bg-blue-100 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest text-center mb-2 border border-blue-200 shadow-sm"
                            >
                                <Calculator className="w-3.5 h-3.5" /> Auto F29
                            </button>

                            <button
                                onClick={() => {
                                    setIsOpen(false)
                                    window.location.href = "/emprende/finanzas"
                                }}
                                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl transition-all text-[10px] font-bold uppercase tracking-widest text-center mb-2 border border-emerald-200 shadow-sm"
                            >
                                <Wallet className="w-3.5 h-3.5" /> Inteligencia Financiera
                            </button>

                            {activeFair ? (
                                <button
                                    onClick={async () => {
                                        if (confirm(`¿Terminaste tu jornada en la feria "${activeFair}"? Las próximas ventas serán normales.`)) {
                                            const today = new Date().toISOString().split('T')[0]
                                            localStorage.setItem('emprende_last_fair_prompt', today)
                                            localStorage.removeItem('current_fair')
                                            await updateActiveFair(null)
                                            setActiveFair(null)
                                            setIsOpen(false)
                                            window.dispatchEvent(new Event('fairUpdated'))
                                            alert("✅ Rastreo de feria detenido. Ventas normales reactivadas.")
                                            window.location.reload()
                                        }
                                    }}
                                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-all text-[10px] font-bold uppercase tracking-widest text-center mb-2 border border-red-200 shadow-sm"
                                >
                                    <Store className="w-3.5 h-3.5" /> Detener Rastreo ({activeFair})
                                </button>
                            ) : (
                                <button
                                    onClick={() => {
                                        setIsOpen(false)
                                        handleManualFairTrigger()
                                    }}
                                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-xl transition-all text-[10px] font-bold uppercase tracking-widest text-center mb-2 border border-purple-200 shadow-sm"
                                >
                                    <Store className="w-3.5 h-3.5" /> Activar Rastreo de Feria
                                </button>
                            )}

                            <button
                                onClick={() => {
                                    setIsOpen(false)
                                    window.location.href = "/emprende/planes"
                                }}
                                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-violet-50 to-fuchsia-50 text-violet-700 hover:opacity-90 rounded-xl transition-all text-[10px] font-bold uppercase tracking-widest text-center mb-2 border border-violet-200 shadow-sm"
                            >
                                <Sparkles className="w-3.5 h-3.5" /> Planes y Suscripción
                            </button>

                            <button
                                onClick={() => {
                                    setIsOpen(false)
                                    window.location.href = "/emprende/settings"
                                }}
                                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-50 text-slate-700 hover:bg-slate-100 rounded-xl transition-all text-[10px] font-bold uppercase tracking-widest text-center mb-2 border border-slate-200"
                            >
                                <Settings className="w-3.5 h-3.5" /> Configuración
                            </button>

                            <a
                                href="mailto:atsittelecom@gmail.com?subject=Soporte%20App%20Emprende"
                                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl transition-all text-[10px] font-bold uppercase tracking-widest text-center mb-2 border border-blue-200 shadow-sm"
                            >
                                <Mail className="w-3.5 h-3.5" /> Contactar Soporte
                            </a>

                            <InstallButton />



                            <button
                                onClick={() => {
                                    if (confirm("Se forzará la descarga de datos nuevos y se limpiará la caché local. ¿Continuar?")) {
                                        localStorage.clear();
                                        sessionStorage.clear();
                                        window.location.reload();
                                    }
                                }}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-blue-50/50 text-blue-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-100 transition-all border border-blue-100 mb-1 active:scale-95"
                            >
                                <RefreshCw className="w-3.5 h-3.5" /> Limpiar Caché y Sincronizar
                            </button>
                        </div>

                        {isAdmin && (
                            <button
                                onClick={() => {
                                    setIsOpen(false)
                                    window.location.href = "/admin"
                                }}
                                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-slate-600 hover:bg-slate-50 rounded-xl transition-all text-[9px] font-bold uppercase tracking-widest text-center mb-1 active:scale-95 border border-slate-100 bg-slate-50/50"
                            >
                                <Users className="w-3.5 h-3.5" /> Administrador VIP
                            </button>
                        )}

                        <button
                            onClick={async () => {
                                try {
                                    await signOut({ redirect: false });
                                } catch (e) {
                                    console.error("Error silencioso en signOut:", e);
                                } finally {
                                    window.location.href = "/api/manual-logout";
                                }
                            }}
                            className="w-full flex items-center justify-center gap-2 px-3 py-3 mt-1 text-red-500 hover:bg-red-50 rounded-xl transition-all text-[10px] font-bold uppercase tracking-widest text-center active:scale-95 border border-transparent hover:border-red-100"
                        >
                            <LogOut className="w-4 h-4" /> Cerrar Sesión
                        </button>
                    </div>
                </>
            )}

            <AdminUsersModal
                isOpen={isAdminOpen}
                onClose={() => setIsAdminOpen(false)}
            />
        </div>
    )
}

// function VoiceToggle() { ... removed ... }
