import { Suspense } from "react"
import VentasClient from "./VentasClient"

export const dynamic = 'force-dynamic'

export default function SalesPage() {
    return (
        <Suspense fallback={<div className="p-10 text-center">Cargando métricas...</div>}>
            <VentasClient />
        </Suspense>
    )
}
