# Backlog de Implementación del MVP — Quack

Este documento define la hoja de ruta de tareas atómicas para que los agentes de codificación por IA construyan el MVP de forma incremental y ordenada.

---

## Épica 1: Infraestructura Compartida y Servicios Híbridos

- [x] **TASK-1.1**: Inicialización de Vite + React 18 + TS estricto + Tailwind + shadcn/ui.
- [x] **TASK-1.2**: Configuración de `MathRenderer` con KaTeX para renderizado en bloque y en línea.
- [x] **TASK-1.3**: Definición de contratos de tipos TypeScript en `src/types/` (`feynman.ts`, `exam.ts`).
- [ ] **TASK-1.4**: Implementación de `useSpeechRecognition` y `useSpeechSynthesis` con verificación de soporte nativo.
- [ ] **TASK-1.5**: Implementación del patrón de adaptadores (`IFeynmanService`, `IOcrAuditService`) con `GeminiService` (`@google/genai`) y `MockService` conmutables automáticamente por `VITE_GEMINI_API_KEY`.
- [ ] **TASK-1.6**: Componente de estado de API en el Navbar de `RootLayout` (`Gemini Free` vs `Mock Local`).

---

## Épica 2: Módulo 1 — Feynman Oral (`/feynman`)

- [ ] **TASK-2.1**: Componente `<ConceptSelector />` para elegir el tema del temario oficial (Cálculo, Mecánica, Álgebra).
- [ ] **TASK-2.2**: Componente `<PushToTalkButton />` con estados visuales (Idle, Grabando con animación `pulse`, Procesando con spinner).
- [ ] **TASK-2.3**: Componente `<TranscriptFeed />` con historial de conversación (burbujas estudiante vs Quack) y botón de audio (`Volume2`) para reproducir TTS.
- [ ] **TASK-2.4**: Componente `<ConceptChecklistCard />` para visualizar en tiempo real los subconceptos desbloqueados.
- [ ] **TASK-2.5**: Componente `<SpeechFallbackInput />` que se muestra automáticamente en navegadores sin soporte de `SpeechRecognition`.

---

## Épica 3: Módulo 2 — Parcial a Ciegas OCR (`/parcial-ciegas`)

- [ ] **TASK-3.1**: Máquina de estados principal (`SETUP` -> `SOLVING` -> `UPLOAD` -> `AUDIT`).
- [ ] **TASK-3.2**: Fase `SETUP` y `SOLVING`: Presentación del problema en KaTeX y `<ExamTimer />` con cuenta regresiva.
- [ ] **TASK-3.3**: Fase `UPLOAD`: `<DropzoneUpload />` con arrastre de fotos, previsualización, rotación y **botones de muestras manuscritas predefinidas** (`public/samples/`).
- [ ] **TASK-3.4**: Fase `AUDIT`: `<AuditSplitView />` con la imagen del examen a la izquierda y el desglose de pasos en KaTeX a la derecha.
- [ ] **TASK-3.5**: Componente `<StepItem />` con clasificación de error (`CORRECT`, `ALGEBRAIC_ERROR`, `CONCEPTUAL_ERROR`, `PROPAGATED_ERROR`), badges de colores y explicación pedagógica.
- [ ] **TASK-3.6**: Tarjeta de rúbrica global final con puntaje sobre 5.0 y resumen de desempeño.

---

## Épica 4: Pulido, Accesibilidad y Verificación

- [ ] **TASK-4.1**: Verificación de contraste y etiquetas ARIA en MathRenderer y botones de voz.
- [ ] **TASK-4.2**: Chequeo estricto de tipos (`npm run typecheck`) y build de producción (`npm run build`).
- [ ] **TASK-4.3**: Pruebas de navegación fluida entre rutas sin recarga.
