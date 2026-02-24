"use client"

import { useState } from "react"
import { grantProAccess, grantBasicAccess } from "@/actions/admin-actions"
import { MoreHorizontal, Check, X, Shield, Lock, CreditCard, Gift, Smartphone } from "lucide-react"

export function AdminUserTable({ initialUsers }: { initialUsers: any[] }) {
    const [users, setUsers] = useState(initialUsers)
    const [loading, setLoading] = useState<string | null>(null)
    const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null)

    const handleGrantPro = async (userId: string) => {
        if (!confirm("¿Estás 100% seguro de regalarle el Plan PRO y activarlo manualmente? No se cobrará por MercadoPago.")) return;
        setLoading(userId);
        setActionMenuOpen(null);
        const res = await grantProAccess(userId);
        if (res.success) {
            setUsers(users.map(u => u.id === userId ? { ...u, subscriptionStatus: 'ACTIVE', subscriptionPlan: 'PRO' } : u))
        } else {
            alert("Error al otorgar acceso");
        }
        setLoading(null);
    }

    const handleGrantBasic = async (userId: string) => {
        if (!confirm("¿Seguro de regalarle el Plan Básico de por vida? Tendrá la App Móvil ilimitada.")) return;
        setLoading(userId);
        setActionMenuOpen(null);
        const res = await grantBasicAccess(userId);
        if (res.success) {
            setUsers(users.map(u => u.id === userId ? { ...u, subscriptionStatus: 'ACTIVE', subscriptionPlan: 'BASIC' } : u))
        } else {
            alert("Error al otorgar acceso móvil");
        }
        setLoading(null);
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
                        <tr>
                            <th className="px-6 py-4">Usuario</th>
                            <th className="px-6 py-4">Rol</th>
                            <th className="px-6 py-4">Estado</th>
                            <th className="px-6 py-4">Plan</th>
                            <th className="px-6 py-4">Uso</th>
                            <th className="px-6 py-4">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                                            {user.image ? (
                                                <img src={user.image} alt="" className="w-8 h-8 rounded-full" />
                                            ) : (
                                                user.name?.[0] || "?"
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-medium text-slate-900">{user.name}</div>
                                            <div className="text-xs text-slate-400">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
                                        }`}>
                                        {user.role === 'ADMIN' ? <Shield className="w-3 h-3" /> : null}
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span
                                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${user.subscriptionStatus === 'ACTIVE'
                                            ? 'bg-green-50 text-green-700 border-green-200'
                                            : user.subscriptionStatus === 'TRIAL'
                                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                                : 'bg-red-50 text-red-700 border-red-200'
                                            }`}
                                    >
                                        {user.subscriptionStatus === 'ACTIVE' && <Check className="w-3 h-3" />}
                                        {user.subscriptionStatus !== 'ACTIVE' && <X className="w-3 h-3" />}
                                        {user.subscriptionStatus}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span
                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${user.subscriptionPlan === 'PRO'
                                            ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white'
                                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                                            }`}
                                    >
                                        <CreditCard className="w-3.5 h-3.5" />
                                        {user.subscriptionPlan === 'PRO' ? 'PRO VIP' : 'BÁSICO'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-1 text-xs">
                                        <span>📦 {user._count?.products || 0} productos</span>
                                        <span>💰 {user._count?.transactions || 0} txs</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 relative">
                                    <button onClick={() => setActionMenuOpen(actionMenuOpen === user.id ? null : user.id)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </button>

                                    {actionMenuOpen === user.id && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setActionMenuOpen(null)} />
                                            <div className="absolute right-10 top-1/2 -translate-y-1/2 bg-white border border-slate-200 shadow-xl rounded-xl w-64 z-50 py-2">

                                                <div className="p-2">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-1">Padrinazgo (Regalar Accesos)</p>
                                                    <button
                                                        onClick={() => handleGrantBasic(user.id)}
                                                        disabled={loading === user.id}
                                                        className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-blue-50 text-blue-700 flex items-center gap-2 rounded-lg"
                                                    >
                                                        <Smartphone className="w-3.5 h-3.5" />
                                                        Regalar App Móvil (De Por Vida)
                                                    </button>
                                                    <button
                                                        onClick={() => handleGrantPro(user.id)}
                                                        disabled={loading === user.id}
                                                        className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-violet-50 text-violet-700 flex items-center gap-2 rounded-lg mt-1"
                                                    >
                                                        <Gift className="w-3.5 h-3.5" />
                                                        Regalar Plan PRO VIP (Mensual)
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
