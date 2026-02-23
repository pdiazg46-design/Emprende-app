'use client'

import { useState, useEffect } from "react"
import { getUsers, switchUserPlan, toggleMachineAccess } from "../app/actions/user-actions"
import { X, Users, Sparkles, Shield, Search, RefreshCw, Calendar, Monitor, Laptop } from "lucide-react"
import { createPortal } from "react-dom"

interface User {
    id: string
    name: string | null
    email: string | null
    image: string | null
    plan: string
    createdAt: Date
    allowedMachineIds: string | null
}

interface AdminUsersModalProps {
    isOpen: boolean
    onClose: () => void
}

export function AdminUsersModal({ isOpen, onClose }: AdminUsersModalProps) {
    const [users, setUsers] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [updatingEmail, setUpdatingEmail] = useState<string | null>(null)
    const [currentMachineId, setCurrentMachineId] = useState<string | null>(null)

    useEffect(() => {
        if (isOpen) {
            fetchUsers()
            // @ts-ignore
            if (typeof window !== 'undefined' && window.electronAPI) {
                // @ts-ignore
                window.electronAPI.getMachineId().then(id => setCurrentMachineId(id))
            }
        }
    }, [isOpen])

    const fetchUsers = async () => {
        setIsLoading(true)
        const data = await getUsers()
        setUsers(data as any)
        setIsLoading(false)
    }

    const handleTogglePlan = async (email: string, currentPlan: string) => {
        setUpdatingEmail(email)
        const newPlan = currentPlan === "FREE" ? "PREMIUM" : "FREE"
        const result = await switchUserPlan(email, newPlan)
        if (result.success) {
            setUsers(users.map(u => u.email === email ? { ...u, plan: newPlan } : u))
        }
        setUpdatingEmail(null)
    }

    const handleToggleMachine = async (email: string, machineId: string) => {
        setUpdatingEmail(email)
        const result = await toggleMachineAccess(email, machineId)
        if (result.success) {
            // Refresh users to get updated list
            fetchUsers()
        }
        setUpdatingEmail(null)
    }

    const filteredUsers = users.filter(u =>
        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (!isOpen) return null

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-slate-900 leading-tight">Control de Usuarios</h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{users.length} Registrados</p>
                        </div>
                    </div>
                    {currentMachineId && (
                        <div className="px-3 py-1 bg-slate-100 rounded-lg border border-slate-200">
                            <p className="text-[8px] font-bold text-slate-400 uppercase">Tu ID Terminal</p>
                            <p className="text-[10px] font-mono font-bold text-slate-600">{currentMachineId}</p>
                        </div>
                    )}
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                {/* Search */}
                <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
                        />
                    </div>
                </div>

                {/* Users List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
                            <RefreshCw className="w-8 h-8 animate-spin" />
                            <p className="text-xs font-bold uppercase tracking-widest">Cargando comunidad...</p>
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="text-center py-20 text-slate-400">
                            <p className="text-sm font-medium">No se encontraron usuarios</p>
                        </div>
                    ) : (
                        filteredUsers.map((user) => {
                            const allowedIds = user.allowedMachineIds ? user.allowedMachineIds.split(',') : []
                            const isCurrentMachineAllowed = currentMachineId && allowedIds.includes(currentMachineId)

                            return (
                                <div key={user.id} className="p-3 bg-white border border-slate-100 rounded-2xl flex flex-col gap-3 hover:border-blue-100 hover:shadow-md hover:shadow-blue-500/5 transition-all">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-100 overflow-hidden flex-shrink-0">
                                                {user.image ? (
                                                    <img src={user.image} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-xs font-black text-slate-400 uppercase">
                                                        {(user.name || user.email || "U").charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                    <p className="text-sm font-black text-slate-900 truncate">{user.name || 'Sin nombre'}</p>
                                                    {user.plan === 'PREMIUM' && (
                                                        <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" />
                                                    )}
                                                </div>
                                                <div className="flex flex-col gap-0.5">
                                                    <p className="text-[10px] font-medium text-slate-400 truncate">{user.email}</p>
                                                    <div className="flex items-center gap-1 text-[9px] font-bold text-slate-300 uppercase tracking-tighter">
                                                        <Calendar className="w-2.5 h-2.5" />
                                                        <span>Desde {new Date(user.createdAt).toLocaleDateString('es-CL')}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {/* Plan Toggle */}
                                            <button
                                                onClick={() => handleTogglePlan(user.email!, user.plan)}
                                                disabled={updatingEmail === user.email}
                                                className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all active:scale-95 flex items-center gap-1.5 ${user.plan === 'PREMIUM'
                                                    ? 'bg-amber-50 text-amber-600 border border-amber-100 hover:bg-amber-100'
                                                    : 'bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100'
                                                    }`}
                                            >
                                                {updatingEmail === user.email ? (
                                                    <RefreshCw className="w-3 h-3 animate-spin" />
                                                ) : (
                                                    <>
                                                        <Shield className="w-3 h-3" />
                                                        {user.plan === 'PREMIUM' ? 'Hacer Gratis' : 'Hacer Premium'}
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Licensing Section */}
                                    <div className="pl-[52px]">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="h-px bg-slate-100 flex-1" />
                                            <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Licencias de Hardware</span>
                                            <div className="h-px bg-slate-100 flex-1" />
                                        </div>

                                        <div className="flex flex-wrap gap-2 items-center">
                                            {allowedIds.length === 0 && (
                                                <span className="text-[10px] text-slate-400 italic">Sin terminales autorizadas</span>
                                            )}

                                            {allowedIds.map(id => (
                                                <div key={id} className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                                                    <Monitor className="w-3 h-3 text-slate-400" />
                                                    <span className="text-[9px] font-mono text-slate-600">{id}</span>
                                                    <button
                                                        onClick={() => handleToggleMachine(user.email!, id)}
                                                        disabled={updatingEmail === user.email}
                                                        className="w-4 h-4 flex items-center justify-center hover:bg-red-50 hover:text-red-500 rounded transition-colors"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}

                                            {currentMachineId && !isCurrentMachineAllowed && (
                                                <button
                                                    onClick={() => handleToggleMachine(user.email!, currentMachineId)}
                                                    disabled={updatingEmail === user.email}
                                                    className="flex items-center gap-1.5 bg-green-50 border border-green-200 hover:bg-green-100 text-green-700 rounded-lg px-2 py-1 transition-all active:scale-95"
                                                >
                                                    <Laptop className="w-3 h-3" />
                                                    <span className="text-[9px] font-bold uppercase">Autorizar ESTA PC</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>
        </div>,
        document.body
    )
}
