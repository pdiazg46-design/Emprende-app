"use client"

import { useState, useEffect } from "react"
import { Mic, MicOff, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { parseVoiceCommand } from "@/lib/voice/intentParser"

interface VoiceFloatingButtonProps {
    onCommand: (intent: any) => void;
    feedback: { type: 'success' | 'error' | 'neutral', message: string } | null;
}

export function VoiceFloatingButton({ onCommand, feedback }: VoiceFloatingButtonProps) {
    const [isListening, setIsListening] = useState(false)
    const [transcript, setTranscript] = useState("")
    const [recognition, setRecognition] = useState<any>(null)

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
        <div className="fixed bottom-8 left-1/2 md:left-[calc(50%+8rem)] -translate-x-1/2 z-50 flex flex-col items-center gap-4 pointer-events-none">
            {/* Feedback / Transcript Label - "Beautiful" Style */}
            <div className={cn(
                "px-6 py-4 rounded-2xl text-sm font-bold shadow-xl transition-all duration-300 transform pointer-events-auto min-w-[200px] text-center",
                // State: Listening
                isListening && !transcript && "bg-white text-slate-500 animate-pulse border border-slate-100",
                // State: Processing/Transcript
                isListening && transcript && "bg-white text-slate-800 border border-slate-100",
                // State: Success
                feedback?.type === 'success' && !isListening && "bg-emerald-500 text-white border border-emerald-600 scale-105",
                // State: Error
                feedback?.type === 'error' && !isListening && "bg-rose-500 text-white border border-rose-600",
                // Hidden if inactive and no feedback
                !isListening && !feedback && "opacity-0 translate-y-4 scale-95 pointer-events-none"
            )}>
                {isListening ? (transcript ? `"${transcript}..."` : "Escuchando...") : (feedback?.message || "")}
            </div>

            <div className="pointer-events-auto relative">
                {/* Ripple Effect */}
                {isListening && (
                    <div className="absolute inset-0 rounded-full animate-ping bg-rose-400/30 w-full h-full" />
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
    )
}
