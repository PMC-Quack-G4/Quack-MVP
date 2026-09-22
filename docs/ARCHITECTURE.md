# Arquitectura Técnica — Quack MVP

Este documento define la arquitectura técnica, patrones de diseño y flujo de datos de **Quack MVP**.

---

## 1. Diagrama de Capas y Flujo de Servicios

```
┌────────────────────────────────────────────────────────┐
│               Capa de Presentación (UI)                │
│  - Páginas (/feynman, /parcial-ciegas, /)              │
│  - Componentes shadcn/ui + Radix UI                    │
│  - MathRenderer (KaTeX display/inline)                 │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│                    Capa de Hooks                       │
│  - useSpeechRecognition (Web Speech API)               │
│  - useSpeechSynthesis (Web Speech API)                 │
│  - useExamTimer (cronómetro y bloqueo)                 │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│               Capa de Servicios (Interfaces)           │
│  - IFeynmanService                                     │
│  - IOcrAuditService                                    │
└───────────────────────────┬────────────────────────────┘
                            │
              ┌─────────────┴─────────────┐
              ▼                           ▼
┌───────────────────────────┐ ┌───────────────────────────┐
│       GeminiService       │ │        MockService        │
│  (@google/genai SDK)      │ │  (Datos locales tipados)  │
│  - Activo con             │ │  - Activo por defecto     │
│    VITE_GEMINI_API_KEY    │ │  - Fallback en 429/error  │
└───────────────────────────┘ └───────────────────────────┘
```

---

## 2. Máquinas de Estados por Módulo

### 2.1. Módulo 1: Feynman Oral (`/feynman`)

```
 [SELECCIÓN_TEMA] 
        │ (Selecciona tema del syllabus)
        ▼
   [LISTO_VOZ] ◄────────────────────────────────────────┐
        │                                               │
        │ (Push-to-Talk: botón presionado)              │
        ▼                                               │
   [ESCUCHANDO]                                         │
        │ (Suelta botón: fin de transcripción)          │
        ▼                                               │
   [PROCESANDO_QUACK]                                   │
        │ (Agente formula repregunta socrática)         │
        ▼                                               │
  [QUACK_RESPONDIENDO] (Audio TTS + texto) ─────────────┘
        │
        │ (Se cubren todos los subtemas críticos)
        ▼
   [DOMINIO_ALCANZADO]
```

### 2.2. Módulo 2: Parcial a Ciegas OCR (`/parcial-ciegas`)

```
   ┌─────────┐
   │  SETUP  │ : Selección del problema matemático del catálogo.
   └────┬────┘
        │ (Click en "Comenzar Parcial")
        ▼
  ┌───────────┐
  │  SOLVING  │ : Cronómetro activo, pantalla sin ayudas ("modo examen").
  └─────┬─────┘
        │ (Click en "He terminado en papel")
        ▼
   ┌────────┐
   │ UPLOAD │ : Zona Drag & Drop para subir imagen o seleccionar muestra demo.
   └────┬───┘
        │ (Click en "Evaluar con OCR")
        ▼
   ┌────────┐
   │ AUDIT  │ : Vista en dos columnas (Imagen vs Desglose en KaTeX con badges de error).
   └────────┘
```

---

## 3. Patrón de Adaptador Dual (Resiliencia Offline y Costo Cero)

Para garantizar costo cero y máxima fiabilidad:
1. El archivo `src/services/serviceFactory.ts` inspecciona si existe `import.meta.env.VITE_GEMINI_API_KEY`.
2. Si la clave existe, intenta instanciar `GeminiFeynmanService` y `GeminiOcrAuditService` usando `@google/genai`.
3. Si la clave **no** existe, o si cualquier llamada al modelo retorna error (ej. `429 Rate Limit`, falta de cuota, error de red), el servicio conmuta de forma transparente al `MockFeynmanService` y `MockOcrAuditService`.
4. El layout superior (`RootLayout`) refleja este estado mediante un `Badge` visual:
   - `Modo: Gemini API (Free)` (Verde).
   - `Modo: Datos Simulados (Mock)` (Azul / Neutro).

---

## 4. Estrategia de Web Speech API (STT y TTS)

- **Speech-to-Text (STT)**:
  - Detección en tiempo de ejecución: `const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;`
  - Si el navegador no lo soporta (ej. ciertos entornos Firefox o iOS), se activa automáticamente `<SpeechFallbackInput />`, que permite ingresar la explicación por texto sin degradar la experiencia.
- **Text-to-Speech (TTS)**:
  - Utiliza `window.speechSynthesis`.
  - Voz en español (`es-ES`, `es-419` o voz nativa disponible).
  - Controles de usuario: botón para repetir la locución o pausarla.

---

## 5. Renderizado Matemático (KaTeX)

- Componente: `@/components/common/MathRenderer`.
- Configuración:
  - `output: "htmlAndMathml"` para accesibilidad de lectores de pantalla.
  - `throwOnError: false` con color de error `#ef4444`.
  - Soporte de modo bloque (`block={true}`) para ecuaciones destacadas y modo en línea (`block={false}`) dentro de texto explicativo.
