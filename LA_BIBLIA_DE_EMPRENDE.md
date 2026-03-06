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
4. **Despliegues Automáticos y Certidumbre (La Regla del Push Obligatorio):** Está estrictamente prohibido que el Agente IA informe al usuario que "una mejora ha sido aplicada" si esto solo ocurrió en los archivos locales. TODO fin de ciclo lógico requiere OBLIGATORIAMENTE ejecutar un `npm run build` o `npx prisma generate` local y exitoso para verificar CERO ERRORES de antemano. Solo entonces se hace un `git add .`, un `git commit` semántico y un `git push`. **REGLA DE ORO:** Bajo ningún aspecto y jamás, la IA creará "scripts automáticos que hacen push a ciegas". Todo push se hace tras la verificación humana y testeo local de la IA. Solo con el código transitando a Vercel se notifica completitud.

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

### 4. Transformación SaaS y Inteligencia VIP (F29 & Finanzas)
- El modelo SaaS (Basic, Pro, VIP) bloquea accesos en Desktop (`DesktopLayout`) e inyecta Paywalls.
- **Motor Tributario F29 (Solo VIP):** Se implementó un simulador matemático que calcula automáticamente el IVA Débito (Ventas), IVA Crédito (Compras con Facturas) y un PPM manual configurable. El SuperAdmin controla la activación (`f29Active`) de cada cliente.
- **Inteligencia de Pasarelas (Estricta Separación de Caja Fija):** Los flujos financieros (`/emprende/finanzas`) deben mapear exactamente si un ingreso fue con plástico (SumUp/MercadoPago, donde aplican comisiones automáticas del 3.45%/3.56%) vs si fue `CASH`/Transferencia (0% de fuga, Caja Física real).
- **🚨 LEY DE ARQUITECTURA PULL (Sincronización Emprende -> Finanzas Fácil):** Queda ESTRICTAMENTE PROHIBIDO que `Emprende` instancie conexiones o dependencias (`@prisma/client-finanza`) hacia otras aplicaciones satélites como `Finanza Fácil`. Anteriormente (Febrero 2026), Emprende intentaba "empujar" (hacer Push) de sus retiros hacia Finanzas desde Vercel, provocando que si el DB secundario se congelaba, **la app central (POS) explotaba bloqueando las ventas**. 
  - **La Solución actual:** La integración opera bajo un **Modelo Pull**. Emprende solo se preocupa de registrar su propia tabla `Transaction`. Es la aplicación consumidora (Finanza Fácil) la que aloja un escáner (`@prisma/client-emprende`) instanciado *únicamente* con strings directas via `process.env.EMPRENDE_DATABASE_URL` puras desde Vercel (si se usa `file:./dummy` el build nativo explota). Finanzas absorbe pasivamente los datos al cargar su Dashboard (`page.tsx`), usando la fecha y hora (`date: withdrawal.createdAt`) y monto para evitar duplicados sin ensuciar la glosa (descripción estricta: *"Ingreso desde Emprende"*). 
  - **Limitación Conocida:** Esta desconexión asíncrona significa que las eliminaciones directas de retiros (Hard Deletes) en `Emprende` **NO** se propagan hacia Finanzas Fácil. El agente/usuario asume la **eliminación manual en Finanzas** mediante la papelera del Dashboard para reequilibrar su fondo. NUNCA intentar reconectar Emprende hacia Finanzas.

### 5. Experiencia de Usuario (UX) Móvil y UI Optimista ("RAM-First")
- **Layouts Consistentes:** Se erradicó la duplicidad visual entre las rutas `/` y `/emprende`. La aplicación en PWA móvil exige márgenes globales consistentes (`max-w-6xl mx-auto`) y un *header* unificado (logo pequeño, fino) para que al volver de "Configuración" no haya un salto de diseño ("se ve muy ancho").
- **Alertas y Feedback:** Queda estrictamente prohibido el uso de `alert()` o `confirm()` nativos del navegador que bloquean el hilo principal. Se reemplazaron por botones que cambian de estado (ej. "GUARDANDO...", "¡ÉXITO!") o botones de acción en línea (inline actions).
- **Actualización Optimista (Inventario/POS):** Las acciones que requieren velocidad extrema (sumar stock, cobrar) usan el patrón "RAM-First". Se actualiza la UI local del usuario instantáneamente modificando el estado temporal en React, y se envía el request a BD (`bulkUpdateStock`, etc) en background (`Fire & Forget`) para que el servidor concilie después.
- **🚨 LEY ABSOLUTA DE UI EN PWAs ANDROID (El Problema del Teclado Superpuesto):** En Android, cuando la App se instala como PWA, **el teclado virtual NO redimensiona el viewport**, sino que se sobrepone (Overlay). **Jamás** anclar Modales o Formularios a la base de la pantalla (`bottom-0`). Todo Modal de ingreso de datos debe estar anclado a la parte superior usando un margen seguro como `top-[15dvh]` y estar fuertemente compactado en alturas (`h-8`, `h-9`) para asegurar que el teclado físico pase por debajo sin ocultar los botones de "Guardar" ni chocar con el "Status Bar" del teléfono.
- **🚨 EL SÍNDROME DEL FLEXBOX APLASTANTE Y DESBORDE MÓVIL (Overflow-X Ghosting):** Al diseñar para móviles, si un título muy grande no puede envolverse (`whitespace-nowrap`) y desborda el ancho general (`100vw`), Tailwind destruye el Layout estirando el Canvas invisible. Esto provoca que componentes ocultos en móvil (ej. el menú izquierdo `DesktopSidebar`) vuelvan a aparecer "aplastando" la pantalla. Todo contenedor flexible *root* en móvil **CÓDIGO DE LEY:** debe llevar `overflow-x-hidden w-full max-w-[100vw] text-wrap min-w-0`, y a los logos o íconos flex en cabeceras se les **DEBE blindar** con la clase `shrink-0` para evitar que el renderizado de Next.js los vuelva ovalados al recuperar vistas cacheadas. Asimismo, el registro del usuario exige doble verificación de clave y el botón (Eye/EyeOff) para asegurar cero fricción.
- **La Trampa del "Ajuste Negativo" en Prisma:** Al restar inventario, el input debe ser estrictamente `type="text"` o `inputMode="text"` con limpieza Regex para permitir escribir el símbolo menos (`-`). Adicionalmente, el backend (ej. `bulkUpdateStock`) DEBE permitir explícitamente valores negativos (`addStock !== 0`) e insertarlos en la tabla `Transaction` como `INVENTORY_OUT`, transformando su cantidad visual a `Math.abs(amount)` para mantener la cordura del historial, sin que el sistema lo banée pensando que es un Gasto Financiero de $0.
- **El Protocolo de la Caché Fantasma (PWA):** Si Vercel compila exitosamente, pero el celular no muestra los cambios tras matar la App, se DEBE inyectar un "Tracker de Versión Físico" en el componente afectado (ej. un `v.1e` microscópico). Si el tracker no cambia, el usuario debe **Desinstalar la PWA físicamente del inicio de Android**, abrir el navegador Chrome original, verificar el tracker, y **Reinstalar la PWA** para obligar al Service Worker a soltar el caché.
- **🚨 TAREA CRÍTICA PENDIENTE (Bug de Inteligencia Financiera):** A la fecha (Marzo 2026), el filtro "Mes Anterior" en la ruta `/emprende/finanzas` **NO MUESTRA DATOS EN LA UI DEL USUARIO ADMIN**, a pesar de que el backend de Prisma SÍ encuentra registros. El próximo agente DEBE diagnosticar si esto es producto de una Regresión del App Router Cache (`router.refresh()` insuficiente) o un fallo de renderizado al procesar arreglos vacíos de pasarelas. **ESTA ES LA PRIORIDAD #1 DE LA PRÓXIMA SESIÓN.**

### 6. Preparación y Despliegue en Google Play Store (Estado Actual)
- **Status Legal/Administrativo:** 100% COMPLETADO (Febrero 2026). La aplicación `com.emprende.app` tiene aprobadas todas las declaraciones.
- **Flujo de Actualización Dual (Vercel vs Play Store):**
  - **95% de los casos (Web):** Hacemos push y Vercel despliega. Como la aplicación usa Capacitor PWA, al abrir el celular Android de los usuarios se descargará la URL actualizada sin que tengamos que hacer nada en la Play Store.
  - **5% de los casos (Nativo):** Sólo crearemos y subiremos un nuevo paquete a la Play Store cuando modifiquemos *features nativas* (Capacitor Plugins, Push Notifications, íconos de sistema). 
- **Compilador AAB Completado:** Ya superamos los problemas del BOM de Java 21 y `gradle`. El flujo correcto de compilación es: 1. `npm run build`, 2. `npx cap sync android` (sella la web en el código base nativo), 3. entrar a `\android` y correr `.\gradlew.bat bundleRelease` para generar el archivo Android App Bundle.
- **Artefactos Locales:** El usuario cuenta con un documento maestro (`play_store_prep.md`) con textos ASO para la Ficha de Tienda y dimensiones de imágenes necesarias.

---

## 🛡️ PARTE 4: PROCEDIMIENTOS DE RESOLUCIÓN DE CRISIS!

Si al aplicar características nuevas ocurre una regresión masiva o la rama de Vercel (Producción) cae a Estado 500:
1. **NO se intentan resolver errores sintácticos en la rama principal en caliente** durante más de dos intentos consecutivos.
2. Si el problema persiste, la instrucción es aplicar un **HARD RESET** al último commit funcional marcado por el usuario en el historial (Ej. el estado estable `7ce63f6`), realizar un `git push --force` limpio de secretos, reconstruir localmente, y notificar al usuario.
6. El Agente tiene terminal abierto siempre. Todo cambio debe validarse localmente mediante `npm run build` o `npx prisma generate` antes de ejecutar pushes críticos.
7. **Control Estricto de Commits y Binarios (Peligro de Bloqueo en Vercel):** Queda TERRIBLEMENTE PROHIBIDO incluir en los commits rastreados por Git archivos generados como `.aab`, `.apk`, carpetas del JDK (`jdk-21`), `.jar`, `.zip` o ejecutables `.exe/dll/7z`. En Febrero 2026, un commit accidental del entorno Java (350+ MB) ocasionó el rebote de la cola de subidas en GitHub, dejando a Vercel ahogado y estancado. Hubo que ejecutar una purga histórica radical con `bfg.repo-cleaner` y aplicar `git push -f`. **Regla:** El `.gitignore` es intocable y sagrado. Antes de hacer `git add .`, la IA está OBLIGADA a verificar el estado e ignorar la "basura" binaria y los archivos `.aab` de Android. Solo se sube código fuente.

---
*(Fin del documento fundacional. Última actualización: Sesión Marzo 2026 - Certificación Play Store Console, PWA Ghost Cache y UI Absolute Anchors contra Teclados Nativos. Al finalizar la lectura, el Agente responderá de forma concisa confirmando la adopción de estas leyes).*
