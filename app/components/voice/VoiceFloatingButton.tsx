"use client"

import { useState, useEffect } from "react"
import { TriangleAlert, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"
// import { parseVoiceCommand } from "@/lib/voice/intentParser"
import { processVoiceCommand } from "@/app/actions/process-voice"
import { VoiceHelpModal } from "./VoiceHelpModal"
import { useCart } from "../pos/CartContext"
import { useSession } from "next-auth/react"
import { requestProUpgrade } from "@/actions/user-settings-actions"
import { Sparkles, X, CheckCircle2, Loader2 } from "lucide-react"

interface VoiceFloatingButtonProps {
    onCommand: (intent: any) => void;
    feedback: { type: 'success' | 'error' | 'neutral', message: string } | null;
    onDismiss?: () => void;
}

export function VoiceFloatingButton({ onCommand, feedback, onDismiss }: VoiceFloatingButtonProps) {
    const { data: session } = useSession()
    const { cartCount } = useCart()
    const [isListening, setIsListening] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [transcript, setTranscript] = useState("")
    const [recognition, setRecognition] = useState<any>(null)
    const [showHelp, setShowHelp] = useState(false)
    const [showPaywall, setShowPaywall] = useState(false)
    const [isRequestingUpgrade, setIsRequestingUpgrade] = useState(false)
    const [upgradeRequested, setUpgradeRequested] = useState((session?.user as any)?.subscriptionStatus === 'UPGRADE_REQUESTED')

    const handleUpgradeRequest = async () => {
        setIsRequestingUpgrade(true)
        try {
            await requestProUpgrade()
            setUpgradeRequested(true)
        } catch (error) {
            console.error(error)
            alert("No se pudo procesar la solicitud. Intenta nuevamente.")
        } finally {
            setIsRequestingUpgrade(false)
        }
    }

    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (typeof window !== "undefined" && SpeechRecognition) {
            const r = new SpeechRecognition()
            r.continuous = false
            r.interimResults = false
            r.lang = "es-CL"

            r.onstart = () => setIsListening(true)
            r.onend = () => {
                // Safari a veces corta silenciosamente. Aseguramos que el UI se apague.
                setIsListening(false)
            }
            r.onresult = async (event: any) => {
                const text = event.results[0][0].transcript
                setTranscript(text)
                setIsProcessing(true)
                try {
                    const response = await processVoiceCommand(text)
                    if (response.success && response.intent) {
                        onCommand(response.intent)
                    } else {
                        onCommand({ type: 'UNKNOWN', original: text })
                        if (response.error) console.error(response.error)
                    }
                } catch (error) {
                    console.error("Error processing voice:", error)
                    onCommand({ type: 'UNKNOWN', original: text })
                } finally {
                    setIsProcessing(false)
                }
            }
            r.onerror = (event: any) => {
                console.error("Speech recognition error", event.error)
                // En móviles, "no-speech" o "network" son comunes si hay ruido o mala señal.
                setIsListening(false)
                setIsProcessing(false)
                if (event.error !== 'no-speech') {
                    // Solo alertar si no es un simple silencio.
                    console.warn(`Voz falló con error: ${event.error}.`);
                }
            }

            setRecognition(r)
        }
    }, [onCommand])

    const toggleListen = () => {
        const plan = (session?.user as any)?.subscriptionPlan || 'BASIC'

        if (plan === 'BASIC') {
            setShowPaywall(true)
            return
        }

        if (!recognition) {
            alert("Tu navegador no soporta reconocimiento de voz nativo.")
            return
        }
        if (isListening) {
            recognition.stop()
        } else {
            setTranscript("")
            recognition.start()
        }
    }

    return (
        <>
            <div className={cn(
                "fixed left-1/2 md:left-[calc(50%+8rem)] -translate-x-1/2 z-50 flex flex-col items-center gap-4 pointer-events-none transition-all duration-300",
                cartCount > 0 ? "bottom-[100px] sm:bottom-28" : "bottom-8"
            )}>


                <div className="pointer-events-auto relative flex items-center gap-3">
                    {/* Help Button (Left of Mic) */}
                    <button
                        onClick={() => setShowHelp(true)}
                        className={cn(
                            "w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg border border-slate-100 text-slate-500 hover:text-blue-600 transition-all duration-300",
                            isListening && "opacity-0 scale-75 pointer-events-none"
                        )}
                        title="Ejemplos de voz"
                    >
                        <HelpCircle className="w-6 h-6" />
                    </button>

                    <div className="relative flex items-center justify-center">
                        {/* Ripple Effect */}
                        {isListening && (
                            <div className="absolute rounded-full animate-ping bg-rose-400/40 w-20 h-20 pointer-events-none" />
                        )}

                        <button
                            onPointerDown={(e) => {
                                e.stopPropagation()
                                e.preventDefault()
                                toggleListen()
                            }}
                            className={cn(
                                "w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 relative z-10 border-4 border-white pointer-events-auto",
                                isListening
                                    ? "bg-[#E63946] scale-110 shadow-rose-500/40" // Rose Red
                                    : isProcessing
                                        ? "bg-slate-700 shadow-slate-500/40"
                                        : "bg-[#4379F2] hover:scale-105 active:scale-95 shadow-blue-500/40" // Brand Blue
                            )}
                            disabled={isProcessing}
                        >
                            {isProcessing ? (
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white pointer-events-none"></div>
                            ) : isListening ? (
                                <div className="space-y-1 block pointer-events-none">
                                    <div className="w-8 h-1 bg-white rounded-full animate-[pulse_1s_ease-in-out_infinite]" />
                                    <div className="w-5 h-1 bg-white rounded-full animate-[pulse_1.5s_ease-in-out_infinite] mx-auto" />
                                    <div className="w-8 h-1 bg-white rounded-full animate-[pulse_0.8s_ease-in-out_infinite]" />
                                </div>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white drop-shadow-sm pointer-events-none"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="22" /></svg>
                            )}
                        </button>
                    </div>

                </div>
            </div>

            {/* Help Modal - Rendered outside the transformed container */}
            {showHelp && <VoiceHelpModal onClose={() => setShowHelp(false)} />}

            {/* Paywall Modal */}
            {showPaywall && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl p-6 shadow-2xl max-w-sm w-full text-center border-t-8 border-violet-500 animate-in zoom-in-95 duration-300 relative overflow-hidden">
                        {/* Background Sparkles Effect */}
                        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-violet-100 rounded-full blur-3xl opacity-50 pointer-events-none" />
                        <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 bg-fuchsia-100 rounded-full blur-3xl opacity-50 pointer-events-none" />

                        <button
                            onClick={() => setShowPaywall(false)}
                            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors z-10"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="relative w-20 h-20 bg-gradient-to-tr from-violet-500 to-fuchsia-500 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-violet-500/30 transform -rotate-12">
                            <Sparkles className="w-10 h-10 text-white transform rotate-12" />
                        </div>

                        <h3 className="text-2xl font-black text-slate-900 mb-3 leading-tight tracking-tight relative z-10">
                            La Inteligencia Artificial es <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-fuchsia-600">Premium</span>
                        </h3>
                        <p className="text-slate-600 font-medium text-sm md:text-base mb-8 leading-relaxed relative z-10">
                            Dicta tus ventas y administra tu negocio con nuestra Inteligencia Artificial que ordena todo mágicamente. Esta función es exclusiva del <strong className="text-slate-900">Plan Emprende PRO</strong>.
                        </p>

                        {upgradeRequested ? (
                            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl mb-4 relative z-10 animate-in fade-in slide-in-from-bottom-2 flex flex-col items-center">
                                <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
                                <p className="text-emerald-800 font-bold text-sm">
                                    ¡Solicitud Recibida!
                                </p>
                                <p className="text-emerald-600 text-xs mt-1">
                                    Un administrador habilitará el pago en tu Panel muy pronto.
                                </p>
                            </div>
                        ) : (
                            <button
                                onClick={handleUpgradeRequest}
                                disabled={isRequestingUpgrade}
                                className="w-full py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-2xl font-black text-sm tracking-widest uppercase hover:opacity-90 transition-all shadow-xl shadow-violet-500/20 transform hover:-translate-y-0.5 flex items-center justify-center gap-2 relative z-10 disabled:opacity-70 disabled:hover:translate-y-0"
                            >
                                {isRequestingUpgrade ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Procesando...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4" />
                                        Solicitar Mejora a PRO
                                    </>
                                )}
                            </button>
                        )}

                        <button
                            onClick={() => setShowPaywall(false)}
                            className="w-full mt-3 py-3 text-slate-500 font-bold text-sm hover:text-slate-700 transition-colors relative z-10"
                        >
                            Quizás más tarde
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}
