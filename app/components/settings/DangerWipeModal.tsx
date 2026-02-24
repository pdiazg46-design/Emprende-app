"use client"

import { useState, useEffect } from "react"
import { AlertOctagon, X, Trash2, Loader2 } from "lucide-react"
import { getUserDataCount, wipeUserData } from "@/actions/user-settings-actions"
import { useRouter } from "next/navigation"

interface DangerWipeModalProps {
    isOpen: boolean
    onClose: () => void
}

export function DangerWipeModal({ isOpen, onClose }: DangerWipeModalProps) {
    const router = useRouter()
    const [counts, setCounts] = useState({ products: 0, transactions: 0 })
    const [loadingCounts, setLoadingCounts] = useState(true)
    const [confirmText, setConfirmText] = useState("")
    const [isWiping, setIsWiping] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        if (isOpen) {
            setLoadingCounts(true)
            setError("")
            setConfirmText("")
            setIsWiping(false)
            getUserDataCount()
                .then(setCounts)
                .catch(err => {
                    console.error("Count error", err)
                    setError("Error al contar los registros.")
                })
                .finally(() => setLoadingCounts(false))
        }
    }, [isOpen])

    if (!isOpen) return null

    const handleWipe = async () => {
        if (confirmText.trim().toUpperCase() !== "BORRAR MIS DATOS") return
        setIsWiping(true)
        setError("")
        try {
            await wipeUserData()
            alert("✅ Base de Datos Eliminada con Éxito. Reiniciando Área de Trabajo.")
            router.push("/emprende") // Re-direct to dashboard
            router.refresh()
            onClose() // We close, though redirection usually handles it
        } catch (err: any) {
            console.error(err)
            setError(err.message || "Ocurrió un error inesperado al borrar los datos.")
            setIsWiping(false)
        }
    }

    const isConfirmed = confirmText.trim().toUpperCase() === "BORRAR MIS DATOS"

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-2xl max-w-lg w-full text-center border-t-8 border-rose-600 animate-in zoom-in-95 duration-300 relative">

                <button
                    onClick={onClose}
                    disabled={isWiping}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors z-10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner text-rose-600 ring-8 ring-rose-50/50">
                    <AlertOctagon className="w-10 h-10" />
                </div>

                <h3 className="text-2xl font-black text-rose-700 mb-2 leading-tight tracking-tight">
                    Amnesia de Base de Datos
                </h3>

                {loadingCounts ? (
                    <div className="py-8 flex flex-col items-center justify-center gap-3">
                        <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
                        <p className="text-sm text-slate-500 font-medium">Calculando impacto destructivo...</p>
                    </div>
                ) : (
                    <>
                        <p className="text-slate-600 font-medium mb-6 leading-relaxed">
                            Estás a punto de eliminar permanentemente <strong className="text-rose-600">{counts.products} Productos</strong> del inventario y <strong className="text-rose-600">{counts.transactions} Transacciones</strong> de tu historial comercial. Esta acción <span className="underline decoration-rose-500 font-bold">no se puede deshacer</span>.
                        </p>

                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-6 text-left">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                                Para continuar, escribe exactamente:
                            </label>
                            <div className="flex bg-white border-2 border-slate-200 rounded-xl overflow-hidden focus-within:border-rose-500 focus-within:ring-4 focus-within:ring-rose-500/10 transition-all">
                                <div className="bg-slate-100 px-4 py-3 border-r border-slate-200 text-slate-500 font-mono text-sm font-bold flex items-center select-none">
                                    BORRAR MIS DATOS
                                </div>
                                <input
                                    type="text"
                                    value={confirmText}
                                    onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                                    placeholder="Escribe aquí..."
                                    disabled={isWiping}
                                    className="flex-1 w-full px-4 py-3 outline-none text-slate-800 font-mono font-bold text-sm tracking-wide disabled:opacity-50"
                                    autoComplete="off"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-rose-50 text-rose-700 text-sm font-bold rounded-xl border border-rose-200 animate-in shake">
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handleWipe}
                            disabled={!isConfirmed || isWiping}
                            className={`w-full py-4 rounded-xl font-black text-sm tracking-widest uppercase transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5
                                ${!isConfirmed
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none hover:translate-y-0'
                                    : 'bg-rose-600 text-white hover:bg-rose-700 shadow-rose-600/30'
                                }
                            `}
                        >
                            {isWiping ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    DESTROYING DATA...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="w-5 h-5" />
                                    SÍ, DESTRUIR MIS DATOS
                                </>
                            )}
                        </button>

                        <button
                            onClick={onClose}
                            disabled={isWiping}
                            className="w-full mt-4 py-3 text-slate-500 font-bold text-sm hover:text-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancelar y Volver Seguro
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}
