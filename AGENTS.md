# AGENTS.md — Directrices Maestras para Agentes de Codificación IA

> Este documento es la guía de referencia obligatoria para cualquier agente de codificación por IA (**Antigravity**, **OpenCode**, **Codex**, **Cursor**, etc.) que trabaje en este repositorio.

---

## 1. Visión, Modelo de Negocio y Tesis de Producto (Quack)

**Quack** es una plataforma EdTech de aprendizaje activo orientada a educación superior y carreras **STEM y Ciencias** (Programación, Algoritmia, Estructuras de Datos, Química, Biología, Física, Cálculo, Álgebra, etc.) diseñada para erradicar la **"ilusión de competencia"** (el falso aprendizaje producto del consumo pasivo de respuestas generadas por LLMs convencionales).

### Principios Fundamentales del Producto
1. **IA Invertida (Método Feynman Oral)**: La IA no le explica al estudiante; el estudiante le explica al agente ("Quack"). Quack asume el rol de una compañera curiosa ("alumna despistada") que hace preguntas socráticas, detecta saltos lógicos y **JAMÁS regala la respuesta correcta directamente**.
2. **Validación Autónoma a Papel y Lápiz (Parcial a Ciegas OCR)**: El estudiante resuelve a mano bajo un cronómetro estricto a libro cerrado (simulacro de examen), sube una foto y el sistema audita su procedimiento **paso a paso**, otorgando crédito parcial y clasificando errores conceptuales, algebraicos o arrastrados.
3. **Amplitud Disciplinaria (Más allá de Matemáticas)**: Quack no se limita a cálculo; abarca **Programación, Algoritmia, Química, Biología, Biofísica, Física e Ingeniería**.
4. **Doble Modalidad de Operación y Monetización**:
   - **Para Instituciones Educativas (`Quack Campus` B2B — `$12 USD` Piloto / `$15 USD` anual por estudiante)**:
     - **Experiencia *Ready-to-Go***: Integrada vía LTI (Bloque Neón, Canvas, Brightspace); el estudiante entra y ya encuentra todas sus materias matriculadas, unidades y temas que se evalúan listos para practicar sin configurar prompts ni subir archivos.
     - **Estadísticas Estratégicas de Éxito Estudiantil**: Proporciona a las universidades y facultades analítica agregada de alto valor sobre el éxito de sus estudiantes impulsado por Quack (evolución de tasas de aprobación, dominio por cohorte, detección temprana de cuellos de botella conceptuales y retención estudiantil).
   - **Para Estudiantes Individuales (`Quack Free` `$0` y `Quack Pro` B2C — `$19.900 COP/mes` o `$149.000 COP/año`)**:
     - El estudiante sube su propio material de estudio (apuntes, diapositivas, código fuente, guías en PDF) y Quack se adapta dinámicamente a lo que suba.
   - **Certificaciones de Dominio Autónomo (Pay-per-Use — `$100.000 COP` / `$25 USD`)**: Exámenes auditados con credencial verificable para monitorías y pasantías.
5. **Hoja de Ruta — Memorización por Repetición Espaciada (*Veremos / Próximamente*)**:
   - Se contempla como fase previa ("Fase 0") antes de la evaluación con Feynman Oral y Parcial OCR un módulo de tarjetas de repetición espaciada donde el estudiante califica la dificultad de recordar cada concepto antes de pasar a la validación profunda.

---

## 2. Convenciones Técnicas y Stack Tecnológico

Cualquier cambio de código debe respetar de manera estricta el siguiente stack:

- **Framework**: React `18.3.x` con Vite.
- **Lenguaje**: TypeScript en **modo estricto** (`"strict": true`, sin `any` implícitos ni variables no utilizadas).
- **Estilos**: Tailwind CSS + utilidades `clsx` y `tailwind-merge` (`cn(...)`).
- **Componentes UI**: Componentes de `shadcn/ui` basados en primitivas de Radix UI en `@/components/ui`.
- **Enrutamiento**: `react-router-dom` v6+ utilizando `createBrowserRouter` con carga diferida (`React.lazy`) para optimizar el tiempo de carga inicial (`< 2s`).
- **Renderizado Matemático**: `KaTeX` a través del componente reutilizable `@/components/common/MathRenderer`.
- **Iconografía**: `lucide-react`.
- **Analítica y Experimentación**: Soporte para Google Analytics 4 (`VITE_GA_MEASUREMENT_ID`), captura de parámetros UTM y pruebas A/B en `@/lib/analytics` y `@/hooks/useABVariant`.

---

## 3. Uso de Skills de Agentes (`.agents/skills/`)

| Tarea / Contexto | Skill a Consultar | Ruta del Skill |
| :--- | :--- | :--- |
| Creación y estilizado de nuevos componentes UI | `shadcn` & `frontend-design` | `.agents/skills/shadcn/SKILL.md` |
| Patrones de clases, utilidades y responsive design | `tailwind-css-patterns` | `.agents/skills/tailwind-css-patterns/SKILL.md` |
| Tipado avanzado, genéricos, discriminated unions | `typescript-advanced-types` | `.agents/skills/typescript-advanced-types/SKILL.md` |
| Arquitectura y composición de componentes React | `composition-patterns` | `.agents/skills/composition-patterns/SKILL.md` |
| Rendimiento y optimizaciones React | `react-best-practices` | `.agents/skills/react-best-practices/SKILL.md` |
| Accesibilidad (a11y, ARIA, teclado) | `accessibility` | `.agents/skills/accessibility/SKILL.md` |
| Configuración de Vite y optimización de bundles | `vite` | `.agents/skills/vite/SKILL.md` |

---

## 4. Reglas de Arquitectura Innegociables

### A. Resiliencia Operativa y Adaptador Dual
- **Audio (STT, TTS y Efecto "¡Quack!")**: 100% nativo mediante la Web Speech API (`window.SpeechRecognition` / `window.speechSynthesis`) y Web Audio API (`@/lib/quackSound`). Si el navegador no soporta STT, renderiza `<SpeechFallbackInput />` sin lanzar excepciones.
- **LLM / Visión**:
  - Se utiliza el SDK oficial `@google/genai` a través de `VITE_GEMINI_API_KEY`.
  - **Fallback Obligatorio a Mocks Locales**: Si la clave no está configurada o la API retorna error (`429 Too Many Requests`), el servicio conmuta transparentemente a `@/mocks`.

### B. Identidad de Marca y Estilo (BrandBook Oficial)
- **Mascota/Logo**: Patito de goma amarillo en `public/brand/quack-logo.png` (al hacer clic sobre el logo reproduce el sonido sintetizado *"¡Quack!"*).
- **Tipografía de Marca**: `Comfortaa` (`font-brand`) para títulos y llamadas a la acción; `Inter` (`font-sans`) para cuerpo y texto técnico.
- **Paleta Oficial Quack**:
  - `Amber Yellow` (`#FFC800`): Primario de marca y CTAs principales.
  - `Dandelion Yellow` (`#FFE978`): Secundario, fondos suaves y highlights.
  - `Caramel Brown` (`#D96B43`): Pico del pato y contrastes cálidos.
  - `Sandy Orange` (`#F89D4F`): Ala del pato y estados hover.
  - `Gunmetal Gray` (`#3B4151`): Tipografía neutra principal y bordes de alto contraste.

---

## 5. Documentación Complementaria

- [`docs/PRODUCT_SPEC.md`](file:///c:/Users/dinoc/OneDrive/Escritorio/Uniandes/7%20-%20Septimo%20Semestre/DISE%C3%91O%20DE%20PRODUCTOS%20E%20INNOVACI%C3%93N%20EN%20TI%20%28ISIS-2007%29/Proyectos/Quack-MVP/docs/PRODUCT_SPEC.md): Especificación funcional, modelo de negocio B2B/B2C, precios y historias de usuario.
- [`docs/ENTREGA_SEMANA_12_LANDING_Y_TRACCION.md`](file:///c:/Users/dinoc/OneDrive/Escritorio/Uniandes/7%20-%20Septimo%20Semestre/DISE%C3%91O%20DE%20PRODUCTOS%20E%20INNOVACI%C3%93N%20EN%20TI%20%28ISIS-2007%29/Proyectos/Quack-MVP/docs/ENTREGA_SEMANA_12_LANDING_Y_TRACCION.md): Nota ejecutiva para la entrega en Bloque Neón (Propuesta de valor, CTA, métricas GA4, hipótesis A/B y próximos 3 pasos).
- [`docs/BRAND_GUIDELINES.md`](file:///c:/Users/dinoc/OneDrive/Escritorio\Uniandes/7%20-%20Septimo%20Semestre/DISE%C3%91O%20DE%20PRODUCTOS%20E%20INNOVACI%C3%93N%20EN%20TI%20%28ISIS-2007%29/Proyectos/Quack-MVP/docs/BRAND_GUIDELINES.md): Manual de identidad visual.
- [`docs/ARCHITECTURE.md`](file:///c:/Users/dinoc/OneDrive/Escritorio/Uniandes/7%20-%20Septimo%20Semestre/DISE%C3%91O%20DE%20PRODUCTOS%20E%20INNOVACI%C3%93N%20EN%20TI%20%28ISIS-2007%29/Proyectos/Quack-MVP/docs/ARCHITECTURE.md): Arquitectura técnica y flujo de servicios.
- [`docs/PROMPT_ENGINEERING.md`](file:///c:/Users/dinoc/OneDrive/Escritorio/Uniandes/7%20-%20Septimo%20Semestre/DISE%C3%91O%20DE%20PRODUCTOS%20E%20INNOVACI%C3%93N%20EN%20TI%20%28ISIS-2007%29/Proyectos/Quack-MVP/docs/PROMPT_ENGINEERING.md): Prompts de sistema para Quack y visión OCR.
