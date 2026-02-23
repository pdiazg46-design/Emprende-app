# 📖 LA BIBLIA DE EMPRENDE
**Documento Maestro de Arquitectura y Reglas de Desarrollo**

> **🚨 INSTRUCCIÓN CRÍTICA Y OBLIGATORIA PARA CUALQUIER AGENTE DE IA:**
> **ANTES DE ESCRIBIR UNA SOLA LÍNEA DE CÓDIGO** O SUGERIR CAMBIOS ESTRUCTURALES, ESTÁS OBLIGADO A LEER Y RESPETAR LOS PARÁMETROS ESTABLECIDOS EN ESTE DOCUMENTO.
> **REGLA DE ORO:** NO TOMAS INICIATIVAS QUE EL USUARIO NO CONTROLE AL 100%. NO DESTRUYES LÓGICA EXISTENTE PARA RESOLVER UN BUG. ANTE LA DUDA DE CÓMO FUNCIONA UN MÓDULO, PREGUNTAS AL USUARIO ANTES DE REESCRIBIRLO.

---

## 🏛️ PARTE 1: FILOSOFÍA DE DESARROLLO Y LÍMITES DE IA

1. **Estabilidad primero:** Si el proyecto está en un estado 100% estable ("La Versión Dorada"), no se sacrifica la estabilidad por experimentar. Si algo se rompe, el protocolo exige *revertir* primero y *diagnosticar* después, en lugar de encadenar parches ciegos.
2. **Control Humano Absoluto:** El usuario (Pdiaz) posee la visión de negocio. La IA actúa como operador técnico. La IA no cambiará flujos de experiencia de usuario ni eliminará pantallas sin autorización explícita.
3. **Mantenimiento Cotidiano (Actualización de esta Biblia):** Al final de cada sesión de desarrollo exitosa donde se haya integrado una nueva versión funcional o módulo, el agente de IA **debe** proponer actualizar este documento (`LA_BIBLIA_DE_EMPRENDE.md`) para reflejar la "nueva normalidad".

---

## 🏗️ PARTE 2: ARQUITECTURA TÉCNICA (STACK)

El ecosistema de Emprende está construido sobre las siguientes tecnologías base:
- **Framework Principal:** Next.js (App Router, versión 14+). Uso extensivo de Server Components y Server Actions.
- **Base de Datos & ORM:** PostgreSQL hospedado en Supabase, interactuando exclusivamente a través de **Prisma ORM**.
- **Despliegue Web:** Vercel (Producción primaria en `emprende-atsit.vercel.app`).
- **Despliegue Nativo/Escritorio (Entorno Mixto):** El código debe soportar la compilación hacia aplicaciones de escritorio usando **Electron** y dispositivos móviles (PWA/Capacitor). Esto exige cuidado extremo con funciones dependientes exclusivamente del navegador (window) y la sincronización estricta de variables de entorno.
- **Estilos y UI:** Tailwind CSS, componentes funcionales en React puro, e íconos de Lucide-React.

---

## 🗺️ PARTE 3: HITOS FUNCIONALES (ESTADO DE VERDAD ACTUAL)

Esta es la configuración de los componentes críticos al estado actual. Cualquier alteración de estos sistemas requiere confirmación meticulosa.

### 1. Sistema de Autenticación y Control de Usuarios
- **Librería Central:** NextAuth.js (Auth.js v5 beta o v4 configurada para Next.js 14).
- **Proveedor Activo:** **SÓLO CREDENCIALES (Email y Contraseña)**.
  - *Nota Histórica Obligatoria:* El proveedor OAUTH de Google fue **erradicado** del sistema debido a problemas de caché en Vercel y escaneo de secretos en GitHub. No se debe intentar reintroducir Google Auth bajo ninguna circunstancia sin orden expresa. El archivo `app/auth/signin/page.tsx` y `lib/auth.ts` están purificados para usar exclusivamente `bcryptjs` y buscar el usuario en Prisma.
- **Jerarquía y Roles:** El sistema maneja roles (`ADMIN`, `USER`). Ciertos componentes visuales (como accesos VIP en el Sidebar Desktop) se muestran condicionalmente basados en el JWT inyectado en la sesión de NextAuth.
- **Flujo de Logout:** Se requiere especial cuidado para entornos Electron ("Error silencioso de signOut"). El logout estándar usa un fallback hacia la ruta `api/manual-logout` que limpia las cookies forzosamente.

### 2. Sistema de Ventas, Inventario y Costos
- **Catálogo de Productos:** Los usuarios pueden crear productos con `precio`, `costo` (crucial para métricas financieras de utilidad) y `stock`.
- **Stocks Negativos:** El sistema *permite* contabilizar stock negativo para soportar la realidad operativa (cuando un usuario vende y entrega dinero, pero aún no ha alimentado la bodega en el sistema).
- **Módulo POS (Punto de Venta) y Checkout:** El carrito de compras (`CartContext.tsx`) maneja estado local (`localStorage`) para persistencia temporal ante caídas de red o refrescos del navegador.
- **Auditoría y Actividad Reciente:** Panel en vivo (`RecentActivitySection`) y un historial de transacciones (Sales, Expenses).

### 3. Inteligencia Artificial por Voz (NLP Engine / VoiceWrapper)
- Existe una barra intermitente de escucha inteligente ("Control Total") diseñada para registrar ingresos o buscar productos en el carrito simplemente mediante lenguaje natural (Ej: "Vendí 2 pantalones negros").
- Depende críticamente de Server Actions estrictos (`actions/process-voice.ts` y relacionados) acoplados al `CartContext`.

### 4. Transformación SaaS y Cobros (Mercado Pago)
- La aplicación ha evolucionado hacia un modelo SaaS. Cuenta con configuraciones de vinculación para *Mercado Pago* con el fin de emitir cobros QR, gestionar planes (`BASIC`, `PRO`, `VIP`) y rastrear la salud de la suscripción del usuario (`subscriptionStatus`, `subscriptionPlan`).
- Las variables de entorno para esto deben aislarse estrictamente.

---

## 🛡️ PARTE 4: PROCEDIMIENTOS DE RESOLUCIÓN DE CRISIS

Si al aplicar características nuevas ocurre una regresión masiva o la rama de Vercel (Producción) cae a Estado 500:
1. **NO se intentan resolver errores sintácticos en la rama principal en caliente** durante más de dos intentos consecutivos.
2. Si el problema persiste, la instrucción es aplicar un **HARD RESET** al último commit funcional marcado por el usuario en el historial (Ej. el estado estable `7ce63f6`), realizar un `git push --force` limpio de secretos, reconstruir localmente, y notificar al usuario.
3. El Agente tiene terminal abierto siempre. Todo cambio debe validarse localmente mediante `npm run build` o `npx prisma generate` antes de ejecutar pushes críticos.

---
*(Fin del documento fundacional. Fecha de creación base/restauración: Febrero 2026. Al finalizar la lectura, el Agente responderá de forma concisa confirmando la adopción de estas leyes).*
