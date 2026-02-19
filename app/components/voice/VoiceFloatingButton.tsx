"use client"

import { useState, useEffect } from "react"
import { Mic, MicOff, Loader2, TriangleAlert, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { parseVoiceCommand } from "@/lib/voice/intentParser"
import { VoiceHelpModal } from "./VoiceHelpModal"

interface VoiceFloatingButtonProps {
    onCommand: (intent: any) => void;
    feedback: { type: 'success' | 'error' | 'neutral', message: string } | null;
    onDismiss?: () => void;
}

export function VoiceFloatingButton({ onCommand, feedback, onDismiss }: VoiceFloatingButtonProps) {
    const [isListening, setIsListening] = useState(false)
    const [transcript, setTranscript] = useState("")
    const [recognition, setRecognition] = useState<any>(null)
    const [showHelp, setShowHelp] = useState(false)

    useEffect(() => {
        if (typeof window !== "undefined" && (window as any).webkitSpeechRecognition) {
            const r = new (window as any).webkitSpeechRecognition()
            r.continuous = false
            r.interimResults = false
            r.lang = "es-CL"

            r.onstart = () => setIsListening(true)
            r.onend = () => setIsListening(false)
            r.onresult = (event: any) => {
                const text = event.results[0][0].transcript
                setTranscript(text)
                const intent = parseVoiceCommand(text)
                onCommand(intent)
            }
            r.onerror = (event: any) => {
                console.error("Speech recognition error", event.error)
                setIsListening(false)
            }

            setRecognition(r)
        }
    }, [onCommand])

    const toggleListen = () => {
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
            <div className="fixed bottom-8 left-1/2 md:left-[calc(50%+8rem)] -translate-x-1/2 z-50 flex flex-col items-center gap-4 pointer-events-none">


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
                                : "bg-[#4379F2] hover:scale-105 active:scale-95 shadow-blue-500/40" // Brand Blue
                        )}
                    >
                        {isListening ? (
                            <div className="space-y-1">
                                <div className="w-8 h-1 bg-white rounded-full animate-[pulse_1s_ease-in-out_infinite]" />
                                <div className="w-5 h-1 bg-white rounded-full animate-[pulse_1.5s_ease-in-out_infinite] mx-auto" />
                                <div className="w-8 h-1 bg-white rounded-full animate-[pulse_0.8s_ease-in-out_infinite]" />
                            </div>
                        ) : (
                            <Mic className="w-8 h-8 text-white drop-shadow-sm" />
                        )}
                    </button>
                </div>
            </div>

            {/* Help Modal - Rendered outside the transformed container */}
            {showHelp && <VoiceHelpModal onClose={() => setShowHelp(false)} />}
        </>
    )
}
