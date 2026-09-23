# Quack-MVP 🦆

**Quack** es una plataforma EdTech de aprendizaje activo para estudiantes de carreras **STEM** (Ingeniería de Sistemas, Electrónica, Física, etc.) diseñada para erradicar la **"ilusión de competencia"** (la falsa sensación de dominio producto del consumo pasivo de resúmenes de LLMs genéricos).

El producto se estructura en torno a dos pilares complementarios:
1. **Método Feynman Oral (IA Invertida)**: El estudiante asume el rol de docente para explicarle a Quack ("alumna curiosa y despistada"). La IA no da respuestas ni cátedras, sino que formula preguntas socráticas, detecta vacíos conceptuales y sintetiza voz automáticamente.
2. **Parcial a Ciegas OCR (Simulacro a Papel y Lápiz)**: El estudiante resuelve a mano en papel a libro cerrado bajo un cronómetro estricto. Al subir la fotografía de su desarrollo, el sistema audita paso a paso el procedimiento mediante OCR, otorgando crédito parcial y clasificando rigurosamente los fallos algebraicos vs conceptuales.

---

## 🚀 Stack Tecnológico

| Tecnología | Versión | Rol en el Proyecto |
| :--- | :--- | :--- |
| **React** | `18.3.x` | Framework de UI reactiva con modo estricto (`StrictMode`). |
| **Vite** | `6.x` | Bundler y servidor de desarrollo ultrarrápido con HMR. |
| **TypeScript** | `5.6.x` | Tipado estricto (`strict: true`, sin `any` implícitos). |
| **Tailwind CSS** | `3.4.x` | Estilos utilitarios con soporte de variables de diseño y BrandBook. |
| **shadcn/ui + Radix**| Radix UI | Primitivas de interfaz accesibles y modulares (`Button`, `Card`, `Badge`, `Input`). |
| **react-router-dom** | `6.28.x` | Enrutamiento SPA basado en `createBrowserRouter`. |
| **KaTeX** | `0.16.x` | Motor de renderizado matemático KaTeX (`throwOnError: false`). |
| **Web Speech API** | Nativa | Speech-to-Text (`SpeechRecognition`) y Text-to-Speech (`speechSynthesis`). |
| **@google/genai** | `2.24.x` | SDK oficial de Google Gen AI v2 para Gemini Flash Vision y razonamiento. |
| **Lucide React** | `0.468.x` | Iconografía accesible y optimizada. |

---

## 🎨 Identidad de Marca Quack (BrandBook Oficial)

- **Mascota**: Patito de goma amarillo (*Yellow Rubber Duck*) inspirado en la técnica de *Rubber Duck Debugging*.
- **Tipografías**:
  - `Comfortaa` (`font-brand`): Logotipo, encabezados principales (`h1`, `h2`, `h3`) y llamadas a la acción.
  - `Inter` (`font-sans`): Cuerpos de texto técnico, enunciados y fórmulas matemáticas.
- **Paleta de Colores**:
  - **Amber Yellow** (`#FFC800`): Primario de marca, botones principales y estados de escucha activa.
  - **Dandelion Yellow** (`#FFE978`): Secundario, fondos suaves de tarjetas y highlights.
  - **Caramel Brown** (`#D96B43`): Acento de atención, pico del pato y avisos socráticos.
  - **Sandy Orange** (`#F89D4F`): Acento de ala, interacción hover y transiciones cálidas.
  - **Gunmetal Gray** (`#3B4151`): Tipografía neutra principal y bordes de contraste.

---

## 🧩 Arquitectura de Servicios: Adaptador Dual y Costo Cero

Para garantizar **costo cero** y **resiliencia total offline**:
- **Capa de Voz (STT y TTS)**: 100% nativa en el navegador del usuario a través de la Web Speech API. Si el navegador no cuenta con micrófono o soporte nativo, se despliega automáticamente `<SpeechFallbackInput />` en texto sin lanzar errores.
- **Capa de IA (LLM y Visión)**:
  - Si `VITE_GEMINI_API_KEY` está configurada, utiliza `GeminiFeynmanService` y `GeminiOcrAuditService` mediante `@google/genai`.
  - Si la clave **no** está presente, o si la API devuelve error (ej. límite de cuota `429 Too Many Requests`), la aplicación conmuta de forma **automática y transparente** a los servicios `MockFeynmanService` y `MockOcrAuditService` en `src/services/`.
  - La aplicación **nunca se bloquea ni se rompe para el usuario**.

---

## 📂 Estructura del Proyecto

```text
src/
├── components/
│   ├── common/
│   │   └── MathRenderer.tsx          # Componente KaTeX con soporte inline y block
│   ├── feynman/                      # Módulo 1: Feynman Oral
│   │   ├── ConceptSelector.tsx       # Catálogo de temas STEM del temario
│   │   ├── PushToTalkButton.tsx      # Botón PTT con animación de ondas y reflexión
│   │   ├── TranscriptFeed.tsx        # Feed de diálogo con audio replay TTS
│   │   ├── ConceptChecklistCard.tsx  # Auditoría lateral de subconceptos en tiempo real
│   │   ├── SpeechFallbackInput.tsx   # Fallback accesible por teclado
│   │   └── SessionSummaryModal.tsx   # Balance final (tiempo, dominio y lagunas)
│   ├── exam/                         # Módulo 2: Parcial a Ciegas OCR
│   │   ├── ExamProblemSelector.tsx   # Selector de problemas nivel examen
│   │   ├── ExamFocusMode.tsx         # Modo enfoque a libro cerrado con cronómetro pausable
│   │   ├── EvidenceDropzone.tsx      # Drag & Drop de fotos, rotación 90° y muestras demo
│   │   ├── AuditProgressAnimation.tsx# Animación por fases de la lectura OCR
│   │   └── AuditSplitView.tsx        # Split View: foto original vs pasos KaTeX con 4 estados
│   └── ui/                           # Primitivas shadcn/ui (Button, Card, Badge, Input)
├── hooks/
│   ├── useSpeechRecognition.ts       # Hook nativo STT (Web Speech API en español)
│   ├── useSpeechSynthesis.ts         # Hook nativo TTS con voces en español
│   └── useTimer.ts                   # Temporizador para exámenes (pausa/reanudación)
├── layouts/
│   └── RootLayout.tsx                # Cabecera con selector de modo API/Mock y footer
├── mocks/
│   └── quackData.ts                  # Datos simulados tipados (temas y problemas)
├── pages/
│   ├── HomePage.tsx                  # Landing page interactiva con KaTeX playground
│   ├── FeynmanDemoPage.tsx           # Experiencia interactiva de Feynman Oral
│   └── ExamPage.tsx                  # Experiencia interactiva de Parcial a Ciegas
├── routes/
│   └── index.tsx                     # Enrutador react-router-dom v6
├── services/
│   ├── types.ts                      # Interfaces IFeynmanService y IOcrAuditService
│   ├── mockFeynmanService.ts         # Simulador socrático con desbloqueo de subconceptos
│   ├── mockOcrAuditService.ts        # Simulador de desglose analítico en KaTeX
│   ├── geminiFeynmanService.ts       # Adaptador Google Gen AI SDK v2 para Feynman
│   ├── geminiOcrAuditService.ts      # Adaptador Google Gen AI Vision para OCR
│   └── serviceFactory.ts             # Factoría con detección dinámica de credenciales
└── types/
    ├── feynman.ts                    # Interfaces del Método Feynman y resúmenes
    ├── exam.ts                       # Interfaces de Parcial a Ciegas y estados de error
    └── index.ts                      # Exportación centralizada del dominio STEM
```

---

## ⚙️ Instalación y Puesta en Marcha

### Prerrequisitos
- **Node.js**: v18+ (recomendado v20+ o v22).
- **Gestor de Paquetes**: `npm` o `pnpm`.

### 1. Clonar e Instalar
```bash
git clone https://github.com/usuario/Quack-MVP.git
cd Quack-MVP
npm install
```

### 2. Configurar Variables de Entorno (Opcional)
Copia `.env.example` a `.env`:
```bash
cp .env.example .env
```
Agrega tu clave gratuita de Google AI Studio en `VITE_GEMINI_API_KEY`.
> *Si no configuras ninguna clave, el sistema operará automáticamente en modo **Datos Simulados (Mock)** con funcionalidad 100% interactiva.*

### 3. Ejecutar en Modo Desarrollo
```bash
npm run dev
```
Abre tu navegador en `http://localhost:3000`.

### 4. Chequeo de Tipos y Compilación
```bash
# Validar tipos estrictos de TypeScript
npm run typecheck

# Compilar para producción
npm run build
```

---

## 🎯 Flujos Principales Implementados

### 1. Módulo Feynman Oral (`/feynman`)
- **Selección de Concepto**: Explora temas de Física Mecánica, Cálculo Integral, Álgebra Lineal y Ecuaciones Diferenciales.
- **Push-to-Talk (PTT)**: Mantén presionado el botón central de Quack para verbalizar tu explicación; al soltarlo, Quack reflexiona y emite su contrapregunta socrática.
- **Locución Automática (TTS)**: Las respuestas de Quack se leen con síntesis de voz en español y cuentan con botón para repetir cuantas veces se desee.
- **Auditoría en Tiempo Real**: Lista lateral que va marcando como cubiertos los subconceptos explicados con claridad y destaca los pendientes.
- **Entrada Accesible de Respaldo**: Si no cuentas con micrófono, el sistema habilita un campo de texto fluido para continuar.
- **Balance General de Sesión**: Al concluir, se presenta un diagnóstico con el tiempo dedicado, los conceptos dominados y las lagunas conceptuales detectadas.

### 2. Módulo Parcial a Ciegas OCR (`/parcial-ciegas`)
- **Selección del Problema**: Ejercicios de nivel examen con enunciados en KaTeX formal.
- **Modo Enfoque con Cronómetro**: Simula el examen presencial a libro cerrado con temporizador pausable y reanudable para trabajar exclusivamente con lápiz y papel.
- **Carga de Evidencia Manuscrita**: Zona `Drag & Drop` para subir fotos, rotación de 90°, o botones de muestras predefinidas para pruebas instantáneas.
- **Animación de Segmentación OCR**: Proceso visual que comunica la digitalización de caligrafía, la estructuración a KaTeX y la verificación de lógica paso a paso.
- **Split View con Crédito Parcial**: Panel comparativo donde a la izquierda se observa la foto original y a la derecha el procedimiento en KaTeX, con badges específicos para:
  - `CORRECT` (Verde): Paso matemáticamente consistente.
  - `ALGEBRAIC_ERROR` (Ámbar): Error de signo, despeje o cálculo menor.
  - `CONCEPTUAL_ERROR` (Rojo): Error de física o teorema mal aplicado.
  - `PROPAGATED_ERROR` (Gris): Consecuencia inevitable de un error previo.
- **Calificación y Diagnóstico**: Puntuación sobre 5.0 y sugerencia matemática formal para los pasos erróneos.
