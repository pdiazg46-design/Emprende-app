import Link from "next/link"
import { AlertCircle } from "lucide-react"

export const dynamic = 'force-dynamic'

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="text-center space-y-6 max-w-md">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                    <AlertCircle className="w-10 h-10 text-slate-400" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-slate-900">404</h1>
                    <h2 className="text-xl font-bold text-slate-700">Página no encontrada</h2>
                    <p className="text-slate-500">
                        Lo sentimos, la página que buscas no existe o ha sido movida.
                    </p>
                </div>

                <Link
                    href="/emprende"
                    className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors w-full"
                >
                    Volver al Inicio
                </Link>
            </div>
        </div>
    )
}
