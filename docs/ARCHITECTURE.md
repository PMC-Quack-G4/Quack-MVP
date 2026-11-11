# Arquitectura Técnica — Quack MVP

Este documento define la arquitectura técnica, los flujos autenticados por rol, el patrón de adaptador dual y el diseño modular de **Quack MVP**.

---

## 1. Diagrama de Capas y Flujo de Datos

```
┌────────────────────────────────────────────────────────────────────────┐
│                      Capa de Presentación (UI)                         │
│  - Landing Pública (/)                                                 │
│  - Acceso Simulado por Roles (/login)                                  │
│  - Workspace Protegido (RequireAuth):                                  │
│      • /materias & /materias/:courseId (Campus, Individual, Dictados)  │
│      • /feynman (Feynman Oral filtrado por curso)                      │
│      • /parcial-ciegas (Parcial OCR filtrado por curso)                │
│      • /estadisticas (StudentStats / DocenteStats / DirectivoStats)    │
│  - Componentes UI (shadcn/ui + Radix + Charts SVG + MathRenderer)      │
└───────────────────────────────┬────────────────────────────────────────┘
                                │
┌───────────────────────────────▼────────────────────────────────────────┐
│               Estado Global de Sesión y Progreso (Context)             │
│  - AuthContext (src/context/AuthContext.tsx)                           │
│  - Persistencia en localStorage (`quack_mvp_auth_session_v1`)          │
│  - Registro vivo de intentos (`recordPracticeAttempt`)                 │
│  - Generación de cursos personales B2C (`addMaterialToWorkspace`)      │
└───────────────────────────────┬────────────────────────────────────────┘
                                │
┌───────────────────────────────▼────────────────────────────────────────┐
│                    Capa de Hooks y Configuración                       │
│  - useSpeechRecognition / useSpeechSynthesis (Web Speech API)          │
│  - useTimer (cronómetro de enfoque y duración de diálogo)              │
│  - useABVariant / analytics (GA4 + experimentos en Landing)            │
│  - lib/aiConfig (detección liviana sin acoplar SDK al bundle inicial)  │
└───────────────────────────────┬────────────────────────────────────────┘
                                │
┌───────────────────────────────▼────────────────────────────────────────┐
│               Capa de Servicios (Adaptador Dual)                       │
│  - IFeynmanService (GeminiFeynmanService ↔ MockFeynmanService)         │
│  - IOcrAuditService (GeminiOcrAuditService ↔ MockOcrAuditService)      │
│  - materialGeneratorService (extracción de temas desde archivos B2C)   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Enrutamiento, Protección y Code-Splitting

Definido en [`src/routes/index.tsx`](../src/routes/index.tsx):

- **Rutas públicas**:
  - `/`: Landing Page StoryBrand (`HomePage`) optimizada para carga inicial rápida.
  - `/login`: Inicio de sesión y registro simulado (`LoginPage`), permitiendo ingresar **nombre personalizado**, elegir entre los 3 perfiles (`student_campus`, `student_individual`, `institution`) y preseleccionar la vista inicial (`docente` o `directivo`).
- **Rutas protegidas por [`RequireAuth`](../src/components/auth/RequireAuth.tsx)** (redirigen a `/login?redirect=...` si no existe sesión):
  - `/materias` (`CoursesPage`): Hub de asignaturas adaptado al rol.
  - `/materias/:courseId` (`CourseDetailPage`): Detalle de la materia con aislamiento estricto de sus propios temas, materiales cargados (B2C) y lanzadores directos de Feynman y Parcial OCR.
  - `/feynman` (`FeynmanDemoPage`): Módulo 1 filtrado al catálogo de materias del usuario (soporta `?course=` y `?topic=`).
  - `/parcial-ciegas` (`ExamPage`): Módulo 2 filtrado al catálogo de materias del usuario (soporta `?course=` y `?problem=`).
  - `/estadisticas` (`StatisticsPage`): Panel de analítica adaptativo según el rol (especificado en [`docs/ESTADISTICAS_POR_ROL.md`](./ESTADISTICAS_POR_ROL.md)).
  - `/dashboard`: Redirección permanente hacia `/estadisticas`.
- **Aislamiento de Bundle**: Las rutas de aplicación y el SDK `@google/genai` (cargado bajo demanda en servicios e importación dinámica en `materialGeneratorService`) se dividen por *code-splitting* (`React.lazy` + `src/lib/aiConfig.ts`) para que `/` cargue sin descargar mocks ni librerías pesadas de IA.

---

## 3. Flujo Realista por Rol y Telemetría Viva

1. **Estudiante Quack Campus (`student_campus`)**:
   - Recibe las materias oficiales precargadas vía LTI (`CAMPUS_COURSES` en `src/mocks/appData.ts`).
   - En `/feynman` y `/parcial-ciegas`, el selector de materia filtra los temas disponibles exclusivamente a sus cursos matriculados.
   - Al finalizar una sesión Feynman o una auditoría OCR, la página invoca `recordPracticeAttempt()`, actualizando inmediatamente el `%` de dominio del tema en `/materias`, las gráficas semanales y la taxonomía de errores en `/estadisticas`.
2. **Estudiante Individual (`student_individual`)**:
   - Solo visualiza las materias creadas desde sus propios materiales (`INDIVIDUAL_STARTER_COURSES` + cursos agregados).
   - Mediante [`MaterialUploadModal`](../src/components/courses/MaterialUploadModal.tsx) y [`generateStudyBundleFromMaterial`](../src/services/materialGeneratorService.ts), lee archivos reales del navegador (`FileReader`) o plantillas demo y genera simultáneamente un `CourseTopicItem`, un `FeynmanTopic` con subconceptos evaluables y un `ExamProblem` listo para practicar.
3. **Profesor / Institución (`institution`)**:
   - Ve las materias que dicta (`TAUGHT_COURSES`) en `/materias` y puede previsualizar los simuladores Feynman/OCR de cada tema.
   - En `/estadisticas`, alterna mediante selector explícito entre **Vista Docente** (analítica por sección, cuellos de botella, tabla e inspección individual de alumnos) y **Vista Directivo** (impacto institucional Con Quack vs. Sin Quack, retención y alertas 48h).
   - Desde la barra superior (`RootLayout`), también es posible cambiar rápidamente de rol demo conservando el nombre del presentador.

---

## 4. Máquinas de Estados por Módulo de Práctica

### 4.1. Módulo 1: Feynman Oral (`/feynman`)

```
 [FILTRO_MATERIA / TEMA]
         │ (Selecciona tema del curso activo)
         ▼
    [LISTO_VOZ] ◄────────────────────────────────────────┐
         │ (Push-to-Talk o SpeechFallbackInput)          │
         ▼                                               │
    [ESCUCHANDO]                                         │
         │                                               │
         ▼                                               │
   [PROCESANDO_QUACK] (Gemini / Mock + Eval. 3 intentos) │
         │                                               │
         ▼                                               │
  [QUACK_RESPONDIENDO] (Audio TTS + texto) ──────────────┘
         │ (Todos los subconceptos evaluados o cierre manual)
         ▼
  [RESUMEN + REGISTRO EN ESTADÍSTICAS (`recordPracticeAttempt`)]
```

### 4.2. Módulo 2: Parcial a Ciegas OCR (`/parcial-ciegas`)

```
   ┌─────────┐
   │  SETUP  │ : Problema filtrado por curso activo.
   └────┬────┘
        │
        ▼
  ┌───────────┐
  │  SOLVING  │ : Cronómetro a libro cerrado sin ayudas digitales.
  └─────┬─────┘
        │
        ▼
   ┌────────┐
   │ UPLOAD │ : Cámara nativa, Drag & Drop o muestras coherentes del curso.
   └────┬───┘
        │
        ▼
   ┌────────┐
   │ AUDIT  │ : Split-View KaTeX + registro automático en Estadísticas.
   └────────┘
```

---

## 5. Patrón de Adaptador Dual, Web Speech y KaTeX

- **Detección de IA (`src/lib/aiConfig.ts`)**: Inspecciona `VITE_GEMINI_API_KEY` sin acoplar el cliente de `@google/genai` en la carga inicial.
- **Resiliencia Total (Gemini ↔ Mock)**: Tanto `FeynmanServiceAdapter`, `OcrAuditServiceAdapter` como `generateStudyBundleFromMaterial` conmutan transparentemente a mocks inteligentes locales ante ausencia de clave o errores de red/`429`. Además, `MockFeynmanService` soporta generación dinámica de validaciones (`buildDynamicValidations`) para cualquier tema generado por el estudiante B2C.
- **Audio 100% Nativo**: `useSpeechRecognition` (`SpeechRecognition` / `webkitSpeechRecognition`) con degradación transparente a `<SpeechFallbackInput />`, `useSpeechSynthesis` (`es-ES` / `es-419`) y efecto sonoro sintetizado `"¡Quack!"` (`src/lib/quackSound.ts`).
- **Renderizado Matemático**: `@/components/common/MathRenderer` con `KaTeX` (`output: "htmlAndMathml"`).
