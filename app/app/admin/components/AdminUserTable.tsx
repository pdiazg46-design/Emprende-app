"use client"

import { useState } from "react"
import { updateUserStatus, updateUserPlan } from "@/actions/admin-actions"
import { MoreHorizontal, Check, X, Shield, Lock, CreditCard } from "lucide-react"

export function AdminUserTable({ initialUsers }: { initialUsers: any[] }) {
    const [users, setUsers] = useState(initialUsers)
    const [loading, setLoading] = useState<string | null>(null)

    const handleStatusChange = async (userId: string, currentStatus: string) => {
        const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE"
        setLoading(userId)

        const res = await updateUserStatus(userId, newStatus)

        if (res.success) {
            setUsers(users.map(u => u.id === userId ? { ...u, subscriptionStatus: newStatus } : u))
        } else {
            alert("Error updating status")
        }
        setLoading(null)
    }

    const handlePlanChange = async (userId: string, currentPlan: string) => {
        const newPlan = currentPlan === "PRO" ? "BASIC" : "PRO"
        setLoading(userId)

        const res = await updateUserPlan(userId, newPlan)

        if (res.success) {
            setUsers(users.map(u => u.id === userId ? { ...u, subscriptionPlan: newPlan } : u))
        } else {
            alert("Error updating plan")
        }
        setLoading(null)
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
                                    <button
                                        onClick={() => handleStatusChange(user.id, user.subscriptionStatus)}
                                        disabled={loading === user.id || user.role === 'ADMIN'}
                                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border transition-colors ${user.subscriptionStatus === 'ACTIVE'
                                                ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                                                : user.subscriptionStatus === 'TRIAL'
                                                    ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                                                    : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                                            }`}
                                    >
                                        {user.subscriptionStatus === 'ACTIVE' && <Check className="w-3 h-3" />}
                                        {user.subscriptionStatus !== 'ACTIVE' && <X className="w-3 h-3" />}
                                        {user.subscriptionStatus}
                                    </button>
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => handlePlanChange(user.id, user.subscriptionPlan)}
                                        disabled={loading === user.id}
                                        className="flex items-center gap-1 text-slate-600 hover:text-blue-600"
                                    >
                                        <CreditCard className="w-4 h-4" />
                                        {user.subscriptionPlan}
                                    </button>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-1 text-xs">
                                        <span>📦 {user._count?.products || 0} productos</span>
                                        <span>💰 {user._count?.transactions || 0} txs</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <button className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
