'use client'

import { signOut } from "next-auth/react"
import { LogOut } from "lucide-react"

export function LogoutButton() {
    return (
        <button
            onClick={async () => {
                try {
                    await signOut({ redirect: false });
                } catch (e) {
                    console.error("Error silencioso en signOut:", e);
                } finally {
                    window.location.href = "/api/manual-logout";
                }
            }}
            className="text-slate-500 font-bold hover:text-red-500 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
            <LogOut className="w-5 h-5" /> Cerrar Sesión
        </button>
    )
}
