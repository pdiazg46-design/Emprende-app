'use client'

export const dynamic = 'force-dynamic';

import { signIn } from "next-auth/react"
import { useState, Suspense } from "react"
import { KeyRound, Mail, Loader2, ArrowRight, Eye, EyeOff } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

function SignInForm() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const searchParams = useSearchParams()

    // Check if coming from registration or URL errors
    const isRegistered = searchParams.get("registered") === "true"
    const urlError = searchParams.get("error")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        const res = await signIn("credentials", {
            email,
            password,
            redirect: false,
        })

        if (res?.error) {
            setError(res.error)
            setIsLoading(false)
        } else {
            // Force reload to dashboard on successful login
            window.location.href = "/"
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden p-10 border border-slate-100 relative group">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-50 rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-50 rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity"></div>

                <div className="relative z-10 flex flex-col xl:items-center text-center">
                    <div className="relative h-20 w-48 mb-6 mx-auto flex items-center justify-center">
                        <Image
                            src="/logo.png"
                            alt="Emprende"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>

                    <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2 font-[family-name:var(--font-montserrat)]">
                        Control Total
                    </h1>
                    <p className="text-sm text-slate-400 font-medium mb-8 px-4">
                        Tu libertad financiera comienza aquí. <br />Accede a tu cuenta de Emprende.
                    </p>

                    <form onSubmit={handleSubmit} className="w-full space-y-4">
                        {(error || urlError) && (
                            <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-bold mb-4">
                                {error || "Error al iniciar sesión. Verifica tus credenciales."}
                            </div>
                        )}

                        {isRegistered && !error && !urlError && (
                            <div className="p-3 bg-green-50 border border-green-100 text-green-700 rounded-xl text-xs font-bold mb-4">
                                Cuenta creada con éxito. Inicia sesión.
                            </div>
                        )}

                        <div className="relative text-left">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-4 mb-1 block">Correo Electrónico</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="tu@correo.com"
                                    required
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-medium focus:border-blue-500 focus:bg-white transition-all outline-none text-slate-700"
                                />
                            </div>
                        </div>

                        <div className="relative text-left">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-4 mb-1 block">Contraseña</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                    <KeyRound className="w-5 h-5" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Ingresa tu clave"
                                    required
                                    className="w-full pl-12 pr-12 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-medium focus:border-blue-500 focus:bg-white transition-all outline-none text-slate-700"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-blue-500 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full mt-6 bg-[#4379F2] text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all hover:bg-blue-700 active:scale-[0.98] shadow-lg shadow-blue-500/30 disabled:opacity-70"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" /> Conectando...
                                </>
                            ) : (
                                <>
                                    Entrar a mi Cuenta <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-sm font-medium text-slate-500">
                        ¿No tienes cuenta?{" "}
                        <Link href="/auth/register" className="text-[#4379F2] font-bold hover:underline">
                            Regístrate aquí
                        </Link>
                    </div>

                    <div className="mt-8 flex items-center justify-center gap-2 text-[10px] font-bold text-slate-300 uppercase tracking-widest mx-auto">
                        <KeyRound className="w-3 h-3" />
                        Asegurado por AT-SIT Cloud
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function SignIn() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-50 flex justify-center items-center"><Loader2 className="animate-spin text-blue-500 w-8 h-8" /></div>}>
            <SignInForm />
        </Suspense>
    )
}
