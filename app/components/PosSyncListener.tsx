'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

// Listener Global de Sincronización Inventario (E-Commerce -> POS)
export default function PosSyncListener({ storeId }: { storeId: string }) {
  const router = useRouter()

  useEffect(() => {
    // Validación de seguridad para que no intente conectarse si no hay variables de entorno en build time
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    // Suscripción directa a cambios en la tabla Product donde el dueño es 'storeId'
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Escucha inserts, updates o deletes
          schema: 'public',
          table: 'Product',
          filter: `userId=eq.${storeId}`, 
        },
        (payload) => {
          console.log('[PosSync]: Alteración de inventario detectada vía Realtime.', payload)
          // La magia de Next.js: Forzar un refresh del servidor sin recargar la página visualmente
          router.refresh()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [storeId, router])

  return null // Renderiza silenciosamente en background
}
