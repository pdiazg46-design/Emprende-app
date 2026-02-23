'use client'

export const dynamic = 'force-dynamic';

import { useState } from "react"
import { KeyRound, Mail, User, Loader2, ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { registerUser } from "@/actions/auth-actions"

export default function Register() {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        const formData = new FormData();
        formData.append("name", name);
        formData.append("email", email);
        formData.append("password", password);

        try {
            const res = await registerUser(formData);

            if (res?.error) {
                setError(res.error)
                setIsLoading(false)
            } else if (res?.success) {
                router.push("/auth/signin?registered=true")
            }
        } catch (err) {
            setError("Error de conexión. Intenta nuevamente.");
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden p-10 border border-slate-100 relative group">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-50 rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-50 rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity"></div>

                <div className="relative z-10 flex flex-col xl:items-center text-center">
                    <div className="relative h-20 w-48 mb-4 mx-auto flex items-center justify-center">
                        <Image
                            src="/logo.png"
                            alt="Emprende"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>

                    <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2 font-[family-name:var(--font-montserrat)]">
                        Únete a Emprende
                    </h1>
                    <p className="text-sm text-slate-400 font-medium mb-8 px-4">
                        Comienza tu camino a la libertad financiera hoy mismo.
                    </p>

                    <form onSubmit={handleSubmit} className="w-full space-y-4">
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-bold mb-4">
                                {error}
                            </div>
                        )}

                        <div className="relative text-left">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-4 mb-1 block">Tu Nombre</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                    <User className="w-5 h-5" />
                                </div>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Ej. Juan Pérez"
                                    required
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-medium focus:border-blue-500 focus:bg-white transition-all outline-none text-slate-700"
                                />
                            </div>
                        </div>

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
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Crea una clave segura"
                                    minLength={6}
                                    required
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-medium focus:border-blue-500 focus:bg-white transition-all outline-none text-slate-700"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full mt-6 bg-[#4379F2] text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all hover:bg-blue-700 active:scale-[0.98] shadow-lg shadow-blue-500/30 disabled:opacity-70"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" /> Creando Cuenta...
                                </>
                            ) : (
                                <>
                                    Crear mi Cuenta Libre <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-sm font-medium text-slate-500">
                        ¿Ya tienes cuenta?{" "}
                        <Link href="/auth/signin" className="text-[#4379F2] font-bold hover:underline">
                            Inicia Sesión aquí
                        </Link>
                    </div>

                    <div className="mt-8 flex items-center justify-center gap-2 text-[10px] font-bold text-slate-300 uppercase tracking-widest mx-auto">
                        <KeyRound className="w-3 h-3" />
                        Privacidad Asegurada por AT-SIT
                    </div>
                </div>
            </div>
        </div>
    )
}
