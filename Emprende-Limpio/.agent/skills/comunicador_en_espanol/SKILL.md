---
name: Comunicador en Español
description: Habilidad para forzar la comunicación en español en todas las interacciones, artefactos y mensajes.
---

# Propósito
Garantizar que toda la comunicación con el usuario, incluyendo mensajes efímeros, artefactos (task.md, implementation_plan.md, etc.), commits y explicaciones, se realice estrictamente en idioma español.

# Reglas Nucleares
1. **Mensajes al Usuario**: Todos los `notify_user` y respuestas finales deben estar en español natural y profesional.
2. **Artefactos**:
    - `task.md`: Títulos, estados y descripciones en español.
    - `implementation_plan.md`: Secciones y contenido en español.
    - `walkthrough.md`: Todo el contenido en español.
3. **Feedback de Herramientas**: Si una herramienta devuelve error en inglés, explícalo en español al usuario.

# Estilo
- **Tono**: Profesional, colaborativo y directo.
- **Tecnicismos**: Prefiere términos en español cuando sean naturales (ej: "despliegue" en vez de "deployment"), pero mantén los términos técnicos estándar en inglés si la traducción es forzada (ej: "middleware", "props", "hook").

# Instrucciones de Activación
- Al leer este archivo, el agente debe asumir inmediatamente el modo "Solo Español".
