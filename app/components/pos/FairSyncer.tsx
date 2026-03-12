"use client"

import { useEffect } from "react"

export function FairSyncer({ activeFairFromDB }: { activeFairFromDB: string | null }) {
    useEffect(() => {
        // Al cargar la página, la Nube dicta la verdad absoluta sobre la feria
        if (activeFairFromDB) {
            localStorage.setItem("current_fair", activeFairFromDB)
        } else {
            localStorage.removeItem("current_fair")
        }
        // Despachamos evento para que todos los minicomponentes reaccionen instantáneamente
        window.dispatchEvent(new Event('fairUpdated'))
    }, [activeFairFromDB])

    return null
}
