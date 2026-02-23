"use client"

import { useState, useEffect } from "react"
import { TriangleAlert, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"
// import { parseVoiceCommand } from "@/lib/voice/intentParser"
import { processVoiceCommand } from "@/app/actions/process-voice"
import { VoiceHelpModal } from "./VoiceHelpModal"
import { useCart } from "../pos/CartContext"
import { useSession } from "next-auth/react"
import { Sparkles, X } from "lucide-react"

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

    useEffect(() => {
        if (typeof window !== "undefined" && (window as any).webkitSpeechRecognition) {
            const r = new (window as any).webkitSpeechRecognition()
            r.continuous = false
            r.interimResults = false
            r.lang = "es-CL"

            r.onstart = () => setIsListening(true)
            r.onend = () => setIsListening(false)
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
                setIsListening(false)
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


                <div className="pointer-events-auto relative flex items-center gap-4">
                    {/* Help Button (Left of Mic) */}
                    <button
                        onClick={() => setShowHelp(true)}
                        className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg border border-slate-100 text-slate-400 hover:text-blue-600 hover:scale-110 transition-all hover:shadow-xl"
                        title="Ejemplos de voz"
                    >
                        <HelpCircle className="w-6 h-6" />
                    </button>

                    {/* Ripple Effect */}
                    {isListening && (
                        <div className="absolute left-[3.5rem] rounded-full animate-ping bg-rose-400/30 w-20 h-20 pointer-events-none" />
                    )}

                    <button
                        onClick={toggleListen}
                        className={cn(
                            "w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 relative z-10 border-4 border-white",
                            isListening
                                ? "bg-[#E63946] scale-110 shadow-rose-500/40" // Rose Red
                                : isProcessing
                                    ? "bg-slate-700 shadow-slate-500/40"
                                    : "bg-[#4379F2] hover:scale-105 active:scale-95 shadow-blue-500/40" // Brand Blue
                        )}
                        disabled={isProcessing}
                    >
                        {isProcessing ? (
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                        ) : isListening ? (
                            <div className="space-y-1">
                                <div className="w-8 h-1 bg-white rounded-full animate-[pulse_1s_ease-in-out_infinite]" />
                                <div className="w-5 h-1 bg-white rounded-full animate-[pulse_1.5s_ease-in-out_infinite] mx-auto" />
                                <div className="w-8 h-1 bg-white rounded-full animate-[pulse_0.8s_ease-in-out_infinite]" />
                            </div>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white drop-shadow-sm"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="22" /></svg>
                        )}
                    </button>
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

                        <a
                            href="https://wa.me/56912345678?text=Hola,%20quiero%20mejorar%20mi%20App%20a%20PRO" // Remplazar con el WS de Patricio
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-2xl font-black text-sm tracking-widest uppercase hover:opacity-90 transition-all shadow-xl shadow-violet-500/20 transform hover:-translate-y-0.5 flex items-center justify-center gap-2 relative z-10"
                            onClick={() => setShowPaywall(false)}
                        >
                            <Sparkles className="w-4 h-4" />
                            Mejorar a PRO
                        </a>
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
