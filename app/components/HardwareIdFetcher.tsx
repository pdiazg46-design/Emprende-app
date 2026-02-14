'use client';
import { useEffect, useState } from 'react';

export function HardwareIdFetcher() {
    const [id, setId] = useState<string>("Verificando...");

    useEffect(() => {
        // @ts-ignore
        if (typeof window !== 'undefined' && window.electronAPI) {
            // @ts-ignore
            window.electronAPI.getMachineId()
                .then((fetchedId: string) => setId(fetchedId))
                .catch(() => setId("Error"));
        } else {
            setId("Web / No disponible");
        }
    }, []);

    return <span>{id}</span>;
}
