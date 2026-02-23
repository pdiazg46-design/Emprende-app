import { getAllUsers, getAdminStats } from "@/actions/admin-actions"
import { AdminUserTable } from "./components/AdminUserTable"
import { Users, TrendingUp, AlertCircle, DollarSign, LogOut } from "lucide-react"

// Force dynamic
export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
    const users = await getAllUsers()
    const stats = await getAdminStats()

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                        Panel de Control
                    </h1>
                    <p className="text-slate-500">
                        Gestión de clientes y suscripciones SaaS.
                    </p>
                </div>
                {/* <button className="bg-slate-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-800 transition-colors">
                    Configurar Webhooks
                </button> */}
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Total Usuarios</p>
                            <h3 className="text-2xl font-black text-slate-900">{stats.totalUsers}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Activos</p>
                            <h3 className="text-2xl font-black text-slate-900">{stats.activeUsers}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">En Prueba/Trial</p>
                            <h3 className="text-2xl font-black text-slate-900">{stats.trialUsers}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">MRR Estimado</p>
                            <h3 className="text-2xl font-black text-slate-900">
                                ${stats.monthlyRevenue.toLocaleString('es-CL')}
                            </h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <AdminUserTable initialUsers={users} />

        </div>
    )
}
