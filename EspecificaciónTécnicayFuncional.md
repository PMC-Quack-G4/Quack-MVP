# ESPECIFICACIÓN TÉCNICA Y FUNCIONAL: QUACK MVP (PROTOTIPO FRONTEND)

## 1. Visión y Alcance
Quack es una plataforma EdTech orientada a carreras STEM para combatir la ilusión de competencia. Este prototipo inicial implementa dos flujos de trabajo autónomos:
1. **Feynman Oral**: Práctica activa donde el estudiante enseña y explica conceptos a un agente mediante voz (Push-to-Talk), recibiendo preguntas y dudas socráticas inmediatas en texto y audio.
2. **Parcial a Ciegas OCR**: Simulación de examen en papel a libro cerrado con temporizador, subida de foto del procedimiento manuscrito y auditoría matemática paso a paso.

---

## 2. Stack Tecnológico
- **Framework**: React 18+ con Vite.
- **Lenguaje**: TypeScript (modo estricto).
- **Estilos y Componentes**: Tailwind CSS + `shadcn/ui` (Radix UI primitives).
- **Enrutamiento**: `react-router-dom` v6+.
- **Renderizado Matemático**: `KaTeX` / `react-katex` para notación algebraica.
- **Iconografía**: `lucide-react`.

---

## 3. Estrategia de Costos y Servicios (Free Tier + Mocks)

El prototipo debe funcionar **sin generar costos económicos**, priorizando servicios gratuitos y APIs con capas sin costo:

1. **Audio (STT y TTS) - 100% Nativo en Navegador**:
   - Reconocimiento de voz (STT): Web Speech API (`SpeechRecognition` o `webkitSpeechRecognition`).
   - Síntesis de voz (TTS): Web Speech API (`window.speechSynthesis`).
   - Evita contratar servicios de audio externos (como Whisper o Deepgram).

2. **Capa LLM / Visión - Gemini API (Free Tier) & Fallback**:
   - Integración opcional mediante variable de entorno `VITE_GEMINI_API_KEY` consumiendo el SDK oficial (`@google/genai` o `@google/generative-ai`).
   - **Modo Híbrido Obligatorio**: Si `VITE_GEMINI_API_KEY` no está configurada, falla por límite de peticiones (429 Rate Limit) o se activa la bandera de desarrollo, la app debe conmutar automáticamente a los **datos mockeados locales** (`src/mocks/`).

---

## 4. Arquitectura de Rutas y Layout

```
/ (Dashboard / Home)
├── /feynman           (Módulo 1: Feynman Oral)
└── /parcial-ciegas    (Módulo 2: Parcial a Ciegas OCR)
```

### Layout Base (`RootLayout`)
- **Navbar superior**:
  - Logo y nombre: "Quack".
  - Enlaces de navegación: Inicio, Feynman Oral, Parcial a Ciegas.
  - Indicador de estado de API: Badge visual que indique si la app está en `Modo: Gemini API (Free)` o `Modo: Datos Simulados (Mock)`.
- **Contenedor**: Centrado (`max-w-5xl mx-auto px-4 py-6`).

---

## 5. Módulo 1: Feynman Oral (`/feynman`)

### 5.1. Flujo de Usuario
1. El estudiante selecciona un tema del temario predefinido (ej. *Segunda Ley de Newton*, *Regla de la Cadena*, *Leyes de Kirchhoff*).
2. Presiona y mantiene presionado el botón de micrófono (**Push-to-Talk**) para explicar el concepto con sus propias palabras.
3. Al soltar el botón, el texto reconocido se añade al historial.
4. El agente ("Quack") procesa la explicación y formula una repregunta socrática breve, orientada a detectar vacíos conceptuales o uso indebido de jerga sin definir.
5. La respuesta de Quack se muestra en texto y se reproduce automáticamente por audio mediante la Web Speech API (con botón para pausar o repetir).
6. Una lista lateral de subconceptos clave se va actualizando conforme el estudiante los explica correctamente.

### 5.2. Componentes de UI
- `<ConceptSelector />`: Selector o menú de tarjetas para elegir el concepto a explicar.
- `<PushToTalkButton />`:
  - *Estado Idle*: Ícono de micrófono listo.
  - *Estado Grabando*: Anillo animado (`animate-pulse`) mientras el usuario mantiene pulsado.
  - *Estado Procesando*: Spinner con texto "Quack está reflexionando...".
- `<TranscriptFeed />`: Lista de mensajes tipo chat.
  - Burbujas del estudiante alineadas a la derecha.
  - Burbujas de Quack alineadas a la izquierda con botón de audio (`Volume2`) para reproducir el texto con `speechSynthesis`.
- `<ConceptChecklistCard />`: Panel lateral con lista de subtemas esperados y checks de completitud.
- `<SpeechFallbackInput />`: Campo de texto alternativo que se despliega si el navegador no tiene soporte para `SpeechRecognition`.

---

## 6. Módulo 2: Parcial a Ciegas OCR (`/parcial-ciegas`)

### 6.1. Flujo Operativo en 3 Fases
El módulo se gestiona a través de una máquina de estados en el componente principal (`SETUP` -> `SOLVING` -> `UPLOAD` -> `AUDIT`).

1. **Fase 1: Preparación y Enfoque (`SETUP` / `SOLVING`)**:
   - Selección de un problema del banco de ejercicios.
   - Presentación del enunciado con soporte completo de KaTeX.
   - Temporizador de examen (cronómetro de minutos/segundos con pausa y reinicio).
   - Botón de acción: *"He terminado en papel"*, que lleva a la fase de carga.

2. **Fase 2: Carga de Evidencia (`UPLOAD`)**:
   - Área Drag & Drop para subir imagen de la hoja manuscrita (`.png`, `.jpg`, `.jpeg`).
   - Vista previa con controles para rotar 90° o sustituir la imagen.
   - Botón de acción: *"Evaluar procedimiento con OCR"*.

3. **Fase 3: Auditoría y Desglose Paso a Paso (`AUDIT`)**:
   - Loader con progreso simulado (*"Extrayendo notación matemática..."*, *"Comprobando consistencia algebraico-conceptual..."*).
   - Interfaz en dos columnas (desktop):
     - **Columna Izquierda**: Vista ampliada de la imagen manuscrita del estudiante.
     - **Columna Derecha**: Secuencia ordenada de pasos extraídos en LaTeX, acompañados de badges:
       - `CORRECTO` (Verde).
       - `ERROR_CONCEPTUAL` (Rojo).
       - `ERROR_ALGEBRAICO` (Ámbar).
       - `ARRASTRE_DE_ERROR` (Gris).
     - Explicación puntual de cada paso y rúbrica global final con puntaje (ej. `3.8 / 5.0`).

### 6.2. Componentes de UI
- `<ProblemHeader />`: Muestra título, área, nivel de dificultad y tiempo sugerido.
- `<LatexRenderer />`: Componente envoltorio de KaTeX para expresiones matemáticas tanto inline (`$..$`) como display (`$$..$$`).
- `<ExamTimer />`: Temporizador visible con control de arranque y pausa.
- `<DropzoneUpload />`: Zona de arrastre de archivos con validación de tipo y tamaño.
- `<AuditSplitView />`: Contenedor responsivo en dos paneles (foto vs. análisis).
- `<StepItem />`: Fila de auditoría con la ecuación en LaTeX, el badge de estado y el diagnóstico correctivo.

---

## 7. Modelos de Datos y Tipos TypeScript

### 7.1. Módulo Feynman (`src/types/feynman.ts`)
```typescript
export interface SubtopicKey {
  id: string;
  name: string;
  covered: boolean;
}

export interface FeynmanTopic {
  id: string;
  title: string;
  category: string;
  promptContext: string;
  subtopics: SubtopicKey[];
  mockDialogue: Array<{
    triggerWords: string[];
    quackReply: string;
    unlocksSubtopicId?: string;
  }>;
  fallbackReply: string;
}

export interface ChatMessage {
  id: string;
  sender: 'student' | 'quack';
  text: string;
  timestamp: Date;
}
```

### 7.2. Módulo Parcial a Ciegas (`src/types/exam.ts`)
```typescript
export type StepStatus = 
  | 'CORRECT' 
  | 'ALGEBRAIC_ERROR' 
  | 'CONCEPTUAL_ERROR' 
  | 'PROPAGATED_ERROR';

export interface AuditStep {
  stepNumber: number;
  latexExpression: string;
  status: StepStatus;
  feedback: string;
  suggestedFixLatex?: string;
}

export interface ExamProblem {
  id: string;
  title: string;
  subject: string;
  difficulty: 'Fácil' | 'Medio' | 'Difícil';
  statementLatex: string;
  estimatedMinutes: number;
  defaultSampleImage: string;
  mockAudit: {
    finalScore: number;
    maxScore: number;
    summary: string;
    steps: AuditStep[];
  };
}
```

---

## 8. Reglas de Implementación para el Agente de Desarrollo

1. **Aislamiento de la Capa de Servicios**:
   - Crear una interfaz de servicio clara (ej. `FeynmanService` y `OcrAuditService`).
   - Implementar dos adaptadores por servicio: uno para llamadas directas a Gemini (`GeminiService.ts`) y otro para datos locales (`MockService.ts`).
   - La selección del adaptador se resuelve automáticamente según la presencia de la variable `VITE_GEMINI_API_KEY`.

2. **Manejo Seguro de la Web Speech API**:
   - Validar compatibilidad en tiempo de ejecución:
     ```typescript
     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
     ```
   - Si no está disponible, no disparar excepciones no controladas; renderizar de forma condicional el componente `<SpeechFallbackInput />`.

3. **Renderizado de Fórmulas Matemáticas**:
   - Todas las expresiones matemáticas deben pasar por `KaTeX`.
   - No usar renderizado de texto plano para variables con subíndices, exponentes o fracciones.

4. **Estilo y Experiencia de Usuario**:
   - Utilizar componentes limpios de `shadcn/ui` (Button, Card, Badge, Dialog, Progress).
   - Paleta de colores neutra (Slate / Zinc) enfocada en la legibilidad y la concentración durante el estudio.