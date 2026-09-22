# AGENTS.md — Directrices Maestras para Agentes de Codificación IA

> Este documento es la guía de referencia obligatoria para cualquier agente de codificación por IA (**Antigravity**, **OpenCode**, **Codex**, **Cursor**, etc.) que trabaje en este repositorio.

---

## 1. Visión y Tesis de Producto (Quack MVP)

**Quack** es una plataforma EdTech orientada a estudiantes de carreras STEM (Ingeniería de Sistemas, Electrónica, etc.) diseñada para erradicar la **"ilusión de competencia"** (falso aprendizaje producto del uso pasivo de LLMs genéricos).

### Principios Fundamentales
1. **IA Invertida (Método Feynman Oral)**: La IA no le explica al estudiante; el estudiante le explica al agente ("Quack"). Quack asume el rol de una compañera curiosa pero despistada ("alumna despistada") que hace preguntas socráticas, detecta saltos lógicos y **JAMÁS da la respuesta correcta directamente**.
2. **Validación Autónoma a Papel y Lápiz (Parcial a Ciegas OCR)**: El estudiante resuelve a mano en papel bajo un cronómetro estricto a libro cerrado (simulacro de examen), toma una foto y el sistema audita su procedimiento **paso a paso**, otorgando crédito parcial y detectando con precisión dónde se rompe el razonamiento algebraico o conceptual.
3. **ALCANCE DELIMITADO (IMPORTANTE)**:
   - La funcionalidad de **Radar Docente / Panel del Profesor ha sido DESCARTADA** del alcance del MVP.
   - Todo el desarrollo debe enfocarse exclusivamente en la experiencia del estudiante en sus dos flujos: `/feynman` y `/parcial-ciegas`.

---

## 2. Convenciones Técnicas y Stack Tecnológico

Cualquier cambio de código debe respetar de manera estricta el siguiente stack:

- **Framework**: React `18.3.x` con Vite.
- **Lenguaje**: TypeScript en **modo estricto** (`"strict": true`, sin `any` implícitos ni variables no utilizadas).
- **Estilos**: Tailwind CSS + utilidades `clsx` y `tailwind-merge` (`cn(...)`).
- **Componentes UI**: Componentes de `shadcn/ui` basados en primitivas de Radix UI en `@/components/ui`.
- **Enrutamiento**: `react-router-dom` v6+ utilizando `createBrowserRouter`.
- **Renderizado Matemático**: `KaTeX` a través del componente reutilizable `@/components/common/MathRenderer`. **Toda fórmula matemática DEBE renderizarse con KaTeX, nunca en texto plano**.
- **Iconografía**: `lucide-react`.
- **Gestores de Paquetes**: Compatibilidad dual completa con `npm` (prioridad en documentación y scripts de equipo) y `pnpm`.

---

## 3. Uso de Skills de Agentes (`.agents/skills/`)

Este repositorio cuenta con un directorio `.agents/skills/` con directivas especializadas. Los agentes deben consultar y aplicar activamente estas skills según la tarea:

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

### A. Estrategia de Costo Cero y Adaptador Dual
- **Audio (STT y TTS)**: 100% nativo mediante la Web Speech API del navegador (`window.SpeechRecognition` / `window.speechSynthesis`). Si el navegador no lo soporta, se debe renderizar de forma fluida el fallback en texto (`<SpeechFallbackInput />`), sin lanzar excepciones.
- **LLM / Visión**:
  - Se utiliza el SDK oficial `@google/genai` (Google Gen AI SDK v2) en su capa gratuita (Free Tier) a través de `VITE_GEMINI_API_KEY`.
  - **Fallback Obligatorio a Mocks Locales**: Si la clave no está configurada, o la API retorna error (ej. `429 Too Many Requests`), el servicio debe cambiar de inmediato y transparentemente a los datos simulados en `@/mocks`. **La aplicación nunca debe quedar bloqueada o rota para el usuario**.
  - Seguir el patrón de diseño:
    ```
    Service Interface (e.g. IFeynmanService)
       ├── GeminiFeynmanService (si VITE_GEMINI_API_KEY existe)
       └── MockFeynmanService   (modo fallback o mock local)
    ```

### B. Notación Matemática
- Toda expresión algebraica, diferencial, integral o física debe procesarse mediante LaTeX estándar y renderizarse con `@/components/common/MathRenderer`.
- Manejo defensivo: Usar `throwOnError: false` para evitar que un error de sintaxis en LaTeX rompa la interfaz de usuario.

### C. Estructura de Carpetas
```text
src/
├── components/
│   ├── common/       # Componentes reutilizables transversales (MathRenderer, etc.)
│   ├── exam/         # Componentes específicos del Parcial a Ciegas
│   ├── feynman/      # Componentes específicos del Feynman Oral
│   └── ui/           # Primitivas de shadcn/ui (Button, Card, Badge, Input, etc.)
├── hooks/            # Custom hooks (useSpeechRecognition, useSpeechSynthesis, useTimer)
├── layouts/          # Layout principal (RootLayout) con Navbar y Footer
├── mocks/            # Datos simulados fuertemente tipados
├── pages/            # Vistas principales (HomePage, FeynmanPage, ExamPage)
├── routes/           # Configuración de react-router-dom v6
├── services/         # Adaptadores (GeminiService, MockService, ServiceFactory)
└── types/            # Interfaces de TypeScript organizadas por dominio
```

---

## 5. Documentación Complementaria

Para detalles funcionales, de diseño y de prompts, consulta los archivos en `docs/`:
- [`docs/ARCHITECTURE.md`](file:///c:/Users/dinoc/OneDrive/Escritorio/Uniandes/7%20-%20Septimo%20Semestre/DISE%C3%91O%20DE%20PRODUCTOS%20E%20INNOVACI%C3%93N%20EN%20TI%20%28ISIS-2007%29/Proyectos/Quack-MVP/docs/ARCHITECTURE.md): Arquitectura detallada, flujo de datos y máquinas de estados.
- [`docs/PRODUCT_SPEC.md`](file:///c:/Users/dinoc/OneDrive/Escritorio/Uniandes/7%20-%20Septimo%20Semestre/DISE%C3%91O%20DE%20PRODUCTOS%20E%20INNOVACI%C3%93N%20EN%20TI%20%28ISIS-2007%29/Proyectos/Quack-MVP/docs/PRODUCT_SPEC.md): Especificación funcional, historias de usuario HU-01 y HU-02 con criterios de aceptación.
- [`docs/PROMPT_ENGINEERING.md`](file:///c:/Users/dinoc/OneDrive/Escritorio/Uniandes/7%20-%20Septimo%20Semestre/DISE%C3%91O%20DE%20PRODUCTOS%20E%20INNOVACI%C3%93N%20EN%20TI%20%28ISIS-2007%29/Proyectos/Quack-MVP/docs/PROMPT_ENGINEERING.md): Prompts de sistema para Quack ("alumna despistada") y visión OCR.
- [`docs/MVP_BACKLOG.md`](file:///c:/Users/dinoc/OneDrive/Escritorio/Uniandes/7%20-%20Septimo%20Semestre/DISE%C3%91O%20DE%20PRODUCTOS%20E%20INNOVACI%C3%93N%20EN%20TI%20%28ISIS-2007%29/Proyectos/Quack-MVP/docs/MVP_BACKLOG.md): Hoja de ruta modular para implementación incremental del MVP.
