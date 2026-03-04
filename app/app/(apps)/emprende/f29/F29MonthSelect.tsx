"use client"

import { useRouter } from "next/navigation"
import { Calendar } from "lucide-react"

export default function F29MonthSelect({ currentMonth, currentYear }: { currentMonth: number, currentYear: number }) {
    const router = useRouter()
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value
        router.push(`/emprende/f29?month=${val}&year=${currentYear}`)
        router.refresh()
    }

    return (
        <div className="flex items-center gap-3 bg-white border border-slate-200 p-2 rounded-2xl shadow-sm">
            <Calendar className="w-5 h-5 text-slate-400 ml-2" />
            <select
                className="bg-transparent font-bold text-slate-700 outline-none pr-4 text-sm focus:ring-0 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%208l5%205%205-5%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-[position:right_0_center] bg-no-repeat"
                value={currentMonth}
                onChange={handleChange}
            >
                {monthNames.map((name, i) => (
                    <option key={i} value={i}>{name} {currentYear}</option>
                ))}
            </select>
        </div>
    )
}
