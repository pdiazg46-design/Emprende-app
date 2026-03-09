"use client"

import { useState } from "react"
import { grantProAccess, grantBasicAccess, updateUserF29, deleteUser } from "@/actions/admin-actions"
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
            setUsers(users.map(u => u.id === userId ? { ...u, subscriptionStatus: 'ACTIVE', subscriptionPlan: 'PRO', notes: 'GIFT' } : u))
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
            setUsers(users.map(u => u.id === userId ? { ...u, subscriptionStatus: 'ACTIVE', subscriptionPlan: 'BASIC', notes: 'GIFT' } : u))
        } else {
            alert("Error al otorgar acceso móvil");
        }
        setLoading(null);
    }

    const handleToggleF29 = async (user: any) => {
        const newValue = !user.f29Active;
        let newPpm = user.ppmRate || 1.0;

        if (newValue) {
            const ppmInput = prompt(`Activar Motor F29: Introduce la tasa PPM para ${user.name || 'el negocio'}. (Ej: 1.5 para 1.5%)`, String(newPpm));
            if (ppmInput === null) return; // Canceló el prompt
            const parsed = parseFloat(ppmInput.replace(',', '.'));
            if (isNaN(parsed) || parsed < 0) {
                alert("Tasa inválida. Debe ser un número.");
                return;
            }
            newPpm = parsed;
        } else {
            if (!confirm(`¿Estás seguro de desactivar el Motor Tributario F29 para ${user.name || 'este usuario'}?`)) return;
        }

        setLoading(user.id);
        setActionMenuOpen(null);

        const res = await updateUserF29(user.id, newValue, newPpm);
        if (res.success) {
            setUsers(users.map(u => u.id === user.id ? { ...u, f29Active: newValue, ppmRate: newPpm } : u));
        } else {
            alert(res.error || "Error al actualizar la configuración tributaria");
        }
        setLoading(null);
    }

    const handleDeleteUser = async (user: any) => {
        const confirm1 = confirm(`PELIGRO: Estás a punto de eliminar a ${user.name || user.email} y todos sus datos (Ventas, Inventario, Cuenta). ¿Continuar?`);
        if (!confirm1) return;

        const confirm2 = prompt(`Escribe "ELIMINAR" para confirmar la destrucción de los datos de ${user.email} y la cancelación de su suscripción de MercadoPago si la tuviera.`);
        if (confirm2 !== "ELIMINAR") {
            alert("Eliminación cancelada.");
            return;
        }

        setLoading(user.id);
        setActionMenuOpen(null);

        const res = await deleteUser(user.id);
        if (res.success) {
            setUsers(users.filter(u => u.id !== user.id));
            alert("Usuario eliminado correctamente de la base de datos.");
        } else {
            alert(res.error || "Error al eliminar usuario.");
        }
        setLoading(null);
    }

    return (
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto max-h-[600px] scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                <table className="w-full text-left text-sm text-slate-900 font-medium">
                    <thead className="bg-slate-50/80 backdrop-blur-sm text-sm uppercase font-black text-slate-900 tracking-wider sticky top-0 z-10 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4">Usuario</th>
                            <th className="px-6 py-4 text-center">Rol</th>
                            <th className="px-6 py-4">Ingreso</th>
                            <th className="px-6 py-4">Estado</th>
                            <th className="px-6 py-4">Plan (B2B)</th>
                            <th className="px-6 py-4">Tributario (F29)</th>
                            <th className="px-6 py-4">Uso</th>
                            <th className="px-6 py-4">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center font-black text-blue-800 shadow-inner border border-blue-200 text-lg">
                                            {user.image ? (
                                                <img src={user.image} alt="" className="w-8 h-8 rounded-full" />
                                            ) : (
                                                user.name?.[0] || "?"
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <div className="font-black text-slate-900 text-xl">{user.name}</div>
                                            <div className="text-base font-black text-blue-900">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-slate-100 text-slate-500 border border-slate-200'
                                        }`}>
                                        {user.role === 'ADMIN' ? <Shield className="w-3 h-3" /> : null}
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-base font-bold text-slate-900">
                                        {new Intl.DateTimeFormat('es-CL', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(user.createdAt))}
                                    </div>
                                    <div className="text-xs text-slate-600 font-bold">
                                        {new Intl.DateTimeFormat('es-CL', { hour: '2-digit', minute: '2-digit' }).format(new Date(user.createdAt))}
                                    </div>
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
                                    {user.notes === 'GIFT' ? (
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black tracking-widest uppercase shadow-sm border ${user.subscriptionPlan === 'PRO' ? 'bg-violet-50 text-violet-700 border-violet-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                            <Gift className="w-3.5 h-3.5" />
                                            {user.subscriptionPlan === 'PRO' ? 'REGALO VIP' : 'REGALO BÁSICO'}
                                        </span>
                                    ) : (
                                        <span
                                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black tracking-widest uppercase shadow-sm ${user.subscriptionPlan === 'PRO'
                                                ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white border-none'
                                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                }`}
                                        >
                                            <CreditCard className="w-3.5 h-3.5" />
                                            {user.subscriptionPlan === 'PRO' ? 'PRO VIP' : 'PAGO ÚNICO'}
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <span
                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black tracking-widest uppercase shadow-sm ${user.f29Active
                                            ? 'bg-blue-600 text-white border-none'
                                            : 'bg-slate-100 text-slate-400 border border-slate-200'
                                            }`}
                                    >
                                        <Shield className="w-3.5 h-3.5" />
                                        {user.f29Active ? `ON (${user.ppmRate}%)` : 'OFF'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-1.5 text-sm font-bold text-slate-900">
                                        <span>📦 {user._count?.products || 0} Prod.</span>
                                        <span>💰 {user._count?.transactions || 0} Txs</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 relative">
                                    <button onClick={() => setActionMenuOpen(actionMenuOpen === user.id ? null : user.id)} className="p-3 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-900 font-black transition-colors">
                                        <MoreHorizontal className="w-5 h-5" />
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
                                                    <div className="my-2 border-t border-slate-100"></div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-1">Poderes Nivel Dios</p>
                                                    <button
                                                        onClick={() => handleToggleF29(user)}
                                                        disabled={loading === user.id}
                                                        className={`w-full text-left px-3 py-2 text-xs font-semibold flex items-center gap-2 rounded-lg 
                                                            ${user.f29Active ? 'hover:bg-red-50 text-red-700' : 'hover:bg-blue-50 text-blue-700'}`}
                                                    >
                                                        <Shield className="w-3.5 h-3.5" />
                                                        {user.f29Active ? "Apagar Motor Tributario" : "Encender Motor F29 (VIP)"}
                                                    </button>
                                                    <div className="my-2 border-t border-slate-100"></div>
                                                    <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest px-2 mb-1">Zona de Peligro</p>
                                                    <button
                                                        onClick={() => handleDeleteUser(user)}
                                                        disabled={loading === user.id}
                                                        className="w-full text-left px-3 py-2 text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-700 flex items-center gap-2 rounded-lg transition-colors"
                                                    >
                                                        <X className="w-3.5 h-3.5" />
                                                        Eliminar Usuario (Wipe)
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
