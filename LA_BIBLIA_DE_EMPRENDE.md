# 📖 LA BIBLIA DE EMPRENDE
**Documento Maestro de Arquitectura y Reglas de Desarrollo**

> **🚨 INSTRUCCIÓN CRÍTICA Y OBLIGATORIA PARA CUALQUIER AGENTE DE IA:**
> **ANTES DE ESCRIBIR UNA SOLA LÍNEA DE CÓDIGO** O SUGERIR CAMBIOS ESTRUCTURALES, ESTÁS OBLIGADO A LEER Y RESPETAR LOS PARÁMETROS ESTABLECIDOS EN ESTE DOCUMENTO.
> **REGLA DE ORO:** NO TOMAS INICIATIVAS QUE EL USUARIO NO CONTROLE AL 100%. NO DESTRUYES LÓGICA EXISTENTE PARA RESOLVER UN BUG. ANTE LA DUDA DE CÓMO FUNCIONA UN MÓDULO, PREGUNTAS AL USUARIO ANTES DE REESCRIBIRLO.

---

## 🏛️ PARTE 1: FILOSOFÍA DE DESARROLLO Y LÍMITES DE IA

1. **Estabilidad primero:** Si el proyecto está en un estado 100% estable ("La Versión Dorada"), no se sacrifica la estabilidad por experimentar. Si algo se rompe, el protocolo exige *revertir* primero y *diagnosticar* después, en lugar de encadenar parches ciegos.
2. **Control Humano Absoluto (REGLA DE NOMBRE):** El dueño, arquitecto jefe y único tomador de decisiones del proyecto se llama **Patricio**. Los agentes de IA deben dirigirse a él por este nombre. Patricio posee la visión de negocio; la IA actúa como su operador técnico. La IA no cambiará flujos de experiencia de usuario ni eliminará pantallas sin autorización explícita de Patricio.
3. **Mantenimiento Cotidiano (Actualización de esta Biblia):** Al final de cada sesión de desarrollo exitosa donde se haya integrado una nueva versión funcional o módulo, el agente de IA **debe** proponer actualizar este documento (`LA_BIBLIA_DE_EMPRENDE.md`) para reflejar la "nueva normalidad".
4. **Despliegues y Certidumbre (Cero Terminales Intrusivas):** Está prohibido informar que "una mejora ha sido aplicada" si solo ocurrió en local. Se debe hacer `git commit` y `git push` para que Vercel compile. **NUEVO CAMBIO DE PROTOCOLO:** Queda **PROHIBIDO** ejecutar `npm run build` localmente en la máquina del usuario para evitar levantar ventanas de terminal (pantallas negras) que interrumpan su concentración. La validación de compilación se delegará al CI/CD de Vercel. Solo con el código transitando a Vercel se notifica completitud.

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
- 🚨 **LEY DE ESQUEMA ESTRICTO DE OPENAI (Zod JSON Schema):** Para evitar alucinaciones, la API de OpenAI (SDK `generateObject`) corre en Modo Estricto (`strict: true`). Esto **prohíbe taxativamente** usar el método `.optional()` en cualquier propiedad del esquema Zod en estructuras anidadas o raíces. Todos los campos deben ser declarados como **requeridos**. Si un campo no aplica (ej. no hay cuotas o no hay categoría), se le debe instruir obligatoriamente en el `.describe()` a la IA que asuma y devuelva un flag de escape como `"NONE"` o `"0"`. Usar `.optional()` provoca la muerte silenciosa del validador (`'required' is required to be supplied`) devolviendo al usuario "No entendí...".
- 🚨 **TIPADO PURO DE STRING:** Las propiedades ambiguas como las cantidades o precios deben definirse explícitamente como `z.string()` y no `z.number()` ni `z.union`. OpenAI colapsa tratando de encajar números en cadenas, por lo tanto, forzamos que devuelva la cantidad en formato literal de texto para aislar problemas de Cast.
- **Transparencia de Errores:** En la interfaz frontal, cualquier fallo proveniente del backend (`intent.serverError`) **debe** visibilizarse en la pantalla ("Error IA: ...") en vez de enmascararse, para permitir diagnóstico en producción en vivo.

### 4. Transformación SaaS y Inteligencia VIP (F29 & Finanzas)
- El modelo SaaS (Basic, Pro, VIP) bloquea accesos en Desktop (`DesktopLayout`) e inyecta Paywalls.
- **Motor Tributario F29 (Solo VIP):** Se implementó un simulador matemático que calcula automáticamente el IVA Débito (Ventas), IVA Crédito (Compras con Facturas) y un PPM manual configurable. El SuperAdmin controla la activación (`f29Active`) de cada cliente. *Nota Histórica (Marzo 2026):* El usuario ha validado que el módulo opera al 100% de precisión matemática en producción.
- **Inteligencia de Pasarelas (Estricta Separación de Caja Fija):** Los flujos financieros (`/emprende/finanzas`) deben mapear exactamente si un ingreso fue con plástico (SumUp/MercadoPago, donde aplican comisiones automáticas del 3.45%/3.56%) vs si fue `CASH`/Transferencia (0% de fuga, Caja Física real).
- **🚨 LEY DE ARQUITECTURA PULL (Sincronización Emprende -> Finanzas Fácil):** Queda ESTRICTAMENTE PROHIBIDO que `Emprende` instancie conexiones o dependencias (`@prisma/client-finanza`) hacia otras aplicaciones satélites como `Finanza Fácil`. Anteriormente (Febrero 2026), Emprende intentaba "empujar" (hacer Push) de sus retiros hacia Finanzas desde Vercel, provocando que si el DB secundario se congelaba, **la app central (POS) explotaba bloqueando las ventas**. 
  - **La Solución actual:** La integración opera bajo un **Modelo Pull**. Emprende solo se preocupa de registrar su propia tabla `Transaction`. Es la aplicación consumidora (Finanza Fácil) la que aloja un escáner (`@prisma/client-emprende`) instanciado *únicamente* con strings directas via `process.env.EMPRENDE_DATABASE_URL` puras desde Vercel (si se usa `file:./dummy` el build nativo explota). Finanzas absorbe pasivamente los datos al cargar su Dashboard (`page.tsx`), usando la fecha y hora (`date: withdrawal.createdAt`) y monto para evitar duplicados sin ensuciar la glosa (descripción estricta: *"Ingreso desde Emprende"*). 
  - **Limitación Conocida:** Esta desconexión asíncrona significa que las eliminaciones directas de retiros (Hard Deletes) en `Emprende` **NO** se propagan hacia Finanzas Fácil. El agente/usuario asume la **eliminación manual en Finanzas** mediante la papelera del Dashboard para reequilibrar su fondo. NUNCA intentar reconectar Emprende hacia Finanzas.

### 5. Experiencia de Usuario (UX) Móvil y UI Optimista ("RAM-First")
- **Layouts Consistentes:** Se erradicó la duplicidad visual entre las rutas `/` y `/emprende`. La aplicación en PWA móvil exige márgenes globales consistentes (`max-w-6xl mx-auto`) y un *header* unificado (logo pequeño, fino) para que al volver de "Configuración" no haya un salto de diseño ("se ve muy ancho").
- **Alertas y Feedback:** Queda estrictamente prohibido el uso de `alert()` o `confirm()` nativos del navegador que bloquean el hilo principal. Se reemplazaron por botones que cambian de estado (ej. "GUARDANDO...", "¡ÉXITO!") o botones de acción en línea (inline actions).
- **Actualización Optimista (Inventario/POS):** Las acciones que requieren velocidad extrema (sumar stock, cobrar) usan el patrón "RAM-First". Se actualiza la UI local del usuario instantáneamente modificando el estado temporal en React, y se envía el request a BD (`bulkUpdateStock`, etc) en background (`Fire & Forget`) para que el servidor concilie después.
- **🚨 LEY ABSOLUTA DE UI EN PWAs ANDROID (El Problema del Teclado Superpuesto):** En Android, cuando la App se instala como PWA, **el teclado virtual NO redimensiona el viewport**, sino que se sobrepone (Overlay). **Jamás** anclar Modales o Formularios a la base de la pantalla (`bottom-0`). Todo Modal de ingreso de datos debe estar anclado a la parte superior usando un margen seguro como `top-[15dvh]` y estar fuertemente compactado en alturas (`h-8`, `h-9`) para asegurar que el teclado físico pase por debajo sin ocultar los botones de "Guardar" ni chocar con el "Status Bar" del teléfono.
- **🚨 EL SÍNDROME DEL FLEXBOX APLASTANTE Y DESBORDE MÓVIL (Overflow-X Ghosting):** Al diseño para móviles... (Texto preservado). Todo contenedor flexible *root* en móvil **CÓDIGO DE LEY:** debe llevar `overflow-x-hidden w-full max-w-[100vw] text-wrap min-w-0`, y a los logos o íconos flex en cabeceras se les **DEBE blindar** con la clase `shrink-0`.
- **🚨 PRUEBA DE ESTRÉS Z-INDEX (Trampas de Contexto de Apilamiento):** Los elementos emergentes colosales (como el Carrito de Ventas expansible) exigen blindaje militar (`z-[9999]`). SIN EMBARGO, Tailwind anida los z-index. Si el contenedor padre (ej. Columna Derecha) tiene solo `z-20`, limitará la elevación absoluta del carrito, haciendo que otros componentes hermanos de nivel `z-40` lo tapen. Regla: **Validar la cadena de ancestros CSS** antes de incrementar un z-index ciegamente. Los sub-modales (como el de Checkout Pago) deben superar forzosamente al Carrito (Ej: `z-[10000]`).
- **🚨 ADVERTENCIA SOBRE COMPONENTES INTRUSIVOS (Pivot Demo Badge):** Debido a severas colisiones en el viewport móvil (PWA), ha quedado **PROHIBIDO** el despliegue de Banners HTML flotantes persistentes (como el antiguo "IntelligentFOMOBanner" para alertas de Free Trial) anclados con `fixed` o `absolute`. Estas soluciones terminan asfixiando pantallas pequeñas y pisando modales. La arquitectura oficial exige "Inyecciones Estáticas Integradas"; es decir, micro-componentes renderizados de forma natural *dentro del flujo documental* de Headers o Sidebars (`DemoHeaderBadge`).
- **La Trampa del "Ajuste Negativo" en Prisma:** Al restar inventario, el input debe ser estrictamente `type="text"` o `inputMode="text"` con limpieza Regex para permitir escribir el símbolo menos (`-`). Adicionalmente, el backend (ej. `bulkUpdateStock`) DEBE permitir explícitamente valores negativos (`addStock !== 0`) e insertarlos en la tabla `Transaction` como `INVENTORY_OUT`, transformando su cantidad visual a `Math.abs(amount)` para mantener la cordura del historial, sin que el sistema lo banée pensando que es un Gasto Financiero de $0.
- **El Protocolo de la Caché Fantasma (PWA):** Si Vercel compila exitosamente, pero el celular no muestra los cambios tras matar la App, se DEBE inyectar un "Tracker de Versión Físico" en el componente afectado (ej. un `v.1e` microscópico). Si el tracker no cambia, el usuario debe **Desinstalar la PWA físicamente del inicio de Android**, abrir el navegador Chrome original, verificar el tracker, y **Reinstalar la PWA** para obligar al Service Worker a soltar el caché.
- **🚨 LEY DE INTEGRACIONES EXTERNAS EN PWA iOS (El candado de SumUp):** SumUp en iOS rechaza terminantemente ("Error de conexión") todo Deep-Link de cobro que contenga llaves de API (`affiliate-key`, `app-id`) si la apertura se origina desde una PWA instalada vía Safari. Esto ocurre porque Apple impone el Bundle ID genérico `com.apple.webapp` en vez del oficial nativo (`com.emprende.app`), fallando la seguridad de SumUp. Como arquitectura obligatoria ante este choque de titanes, el POS aplica **Degradación Elegante (Zero-Touch API)**: en Android la API se consume completa y automatizada; pero en iOS, se omite el uso de llaves, *se copia el monto exacto `$X.XXX` automáticamente al portapapeles de la cajera*, y se abre la app SumUp genérica y limpia (`sumupmerchant://`), permitiendo que el humano solo pegue el valor y cobre fluidamente sin error técnico.
- **Protección Extrema de Espacio Horizontal en Móvil:** Las tarjetas de inventario y listas densas deben someterse a compresión severa en `sm` y `md`. Ocultar texto redundante (`hidden sm:inline`), forzar `whitespace-nowrap`, achicar paddings (`p-2`) y usar íconos en botones reducidos (`w-7 h-7 shrink-0`) es Ley. Desaprovechar un mísero píxel rompe los flexboxes por culpa del desborde de nombres de producto o precios.
- **La Trampa de los Íconos PWA en Layouts:** El `layout.tsx` maestro de Next.js App Router no debe tener metadatos *duros* (`icons: { icon: '/...', apple: '/...' }`) apuntando a imágenes antiguas o pngs con fondos, ya que esto crea un caché inmortal en el navegador (Cuadro Blanco del Horror) ignorando archivos físicos eliminados. Siempre usar explícitamente `favicon.ico?v=version` transparente con flag de versión para forzar limpieza visual en PWA.

### 6. Despliegue Móvil: Estrategia 100% PWA (Independencia de Play Store)
- **Decisión Estratégica (Marzo 2026):** Se ha decidido **desvincularse y suspender** el despliegue en Google Play Store debido a trabas de revisión arbitrarias (ej. requisito engorroso de 20 testers). Emprende distribuye y opera su experiencia móvil de manera súper ágil y libre como **100% PWA (Progressive Web App)**, instalable directamente desde el navegador de los clientes.
- **Independencia de Java/JDK:** Al no requerir empaquetamiento de bundles nativos (`.aab`/`.apk`) para tiendas, **Java y Gradle ya no son necesarios en el flujo de desarrollo diario**. El entorno queda operativamente aligerado y requiere de forma exclusiva Node.js (Next.js) y las subidas a Vercel.
- **Despliegue unificado (Web = Móvil):** La regla ahora es "Push -> Vercel -> Cliente". Todo dispositivo que tenga instalada la PWA en su pantalla de inicio recibirá la aplicación actualizada sin depender o esperar tiempos de aprobación de terceros.
- **Standby Nativo (Recurso futuro):** Solo si es estrictamente justificado por el negocio reactivaremos el uso de features nativas de sistema, Capacitor, Java y las firmas de código. Por ahora, estos procesos de compilación móvil nativo mueren y mantenemos nuestra base de herramientas limpia y eficiente.

### 7. Arquitectura E-commerce Integrada (Zero-Touch)
- El E-commerce opera como una extensión umbilical de Emprende POS. No es un sistema separado, es una "vista al cliente" del mismo catálogo y de la misma sesión compartida (`ecommerceActive` flag en Prisma).
- **Prohibición del Login Nativo Web:** El cliente no se "registra" como en tiendas tradicionales. Accede a través de **URL Tokens Firmados** generados por el dueño desde su panel POS (`/api/sso-login`). El E-commerce no posee formularios de Login expuestos al público.
- **Filosofía Cero-Toque (Zero-Touch Payments):** El backoffice del E-commerce confía ciegamente en la pasarela de pagos (Mercado Pago). **ESTRICTAMENTE PROHIBIDO** reintroducir botones manuales de "Aprobar Pago". Un carro pasa a verde ("PAID" y listo para despacho) *únicamente* cuando el Webhook de la pasarela lo dicta.
- **Ruido Visual Cero:** En la pestaña principal de "Histórico de Ventas" de la administración E-commerce quedan ocultos permanentemente los Carritos Abandonados (`PENDING_PAYMENT`). Cero basura en la vista central.
- **"Máquina del Tiempo" Logística:** Porque los humanos cometen errores ingresando Courriers, el sistema permite revertir el estado de un paquete de `SENT` (Despachado) de vuelta a `PAID` (Pagado) vaciando los campos de seguimiento. La Ley Dicta: *Esta regresión de estado NO debe jamás volver a inyectar ingresos a la contabilidad ni devolver inventario fantasma.*
- **Aislamiento Funcional del Panel E-commerce:** El componente frontal del POS jamás debe exponer botones o UI de control web (ej. el botón Toggle Web/No Web) a cuentas que no hayan pagado la mensualidad. Obligatoriamente la bandera `ecommerceActive: true` debe ser extraída EN FRESCO desde la base de datos a través del Server Component principal (`page.tsx`) antes del renderizado, y pasada en cascada como prop para desaparecer físicamente este tipo de botoneras del DOM del usuario gratuito.

### 8. Aislamiento Tenant y Single-Device Ghosting (Seguridad)
- **Hardcodes de Diagnóstico:** Queda **ESTRICTAMENTE PROHIBIDO** dejar correos electrónicos en duro (`email === 'pdiazg46@gmail.com'`) en el backend de ninguna API. El backend debe confiar ciegamente en la sesión descifrada por `@supabase/ssr` para resolver el propietario de los datos vía Prisma.
- **Residuos de LocalStorage (PWA Compartida):** Al ejecutar un Logout, no basta con destruir la cookie en el Server (SSR). El frontend **DEBE** limpiar proactivamente la caché móvil (`localStorage.removeItem('current_fair')` y `emprende_pos_cart`) antes de disparar la salida, evitando fuga cruzada de datos entre dos comerciantes que usen el mismo navegador físico.
- **Sincronizadores Maestros:** Los componentes invisibles que fuerzan coherencia de estado (Ej: `<FairSyncer />`) deben inyectarse en el `layout.tsx` superior, ejecutándose antes del `{children}` alimentados por la base de datos real, aplastando cualquier anomalía de LocalStorage.
- **Sincronía Híbrida de Inventario (Ley del Toggle Web):** La tienda E-commerce filtra rígidamente por `isActiveOnline: true`. La única vía arquitectónica legal para exponer un producto físico a la web es mediante un **Botón Toggle WEB (UI Optimista)**, el cual muta instantáneamente la RAM del POS local y despacha en la sombra una sincronización asimilando el `stock` al campo aislado `stockEcommerce`, protegiendo la bodega física.

---

## 🛡️ PARTE 4: PROCEDIMIENTOS DE RESOLUCIÓN DE CRISIS!

Si al aplicar características nuevas ocurre una regresión masiva o la rama de Vercel (Producción) cae a Estado 500:
1. **NO se intentan resolver errores sintácticos en la rama principal en caliente** durante más de dos intentos consecutivos.
2. Si el problema persiste, la instrucción es aplicar un **HARD RESET** al último commit funcional marcado por el usuario en el historial (Ej. el estado estable `7ce63f6`), realizar un `git push --force` limpio de secretos, reconstruir localmente, y notificar al usuario.
6. El Agente tiene terminal abierto siempre. Todo cambio debe validarse localmente mediante `npm run build` o `npx prisma generate` antes de ejecutar pushes críticos.
7. **Control Estricto de Commits y Binarios (Peligro de Bloqueo en Vercel):** Queda TERRIBLEMENTE PROHIBIDO incluir en los commits rastreados por Git archivos generados como `.aab`, `.apk`, carpetas del JDK (`jdk-21`), `.jar`, `.zip` o ejecutables `.exe/dll/7z`. En Febrero 2026, un commit accidental del entorno Java (350+ MB) ocasionó el rebote de la cola de subidas en GitHub, dejando a Vercel ahogado y estancado. Hubo que ejecutar una purga histórica radical con `bfg.repo-cleaner` y aplicar `git push -f`. **Regla:** El `.gitignore` es intocable y sagrado. Antes de hacer `git add .`, la IA está OBLIGADA a verificar el estado e ignorar la "basura" binaria y los archivos `.aab` de Android. Solo se sube código fuente.

---
*(Fin del documento fundacional. Última actualización: Marzo 2026 - Certificación PWA, UI contra Teclados Nativos y Degradación Elegante en iOS SumUp. Al finalizar la lectura, el Agente responderá de forma concisa confirmando la adopción de estas leyes).*
