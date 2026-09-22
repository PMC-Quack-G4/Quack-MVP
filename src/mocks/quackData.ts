import { FeynmanSession, FormulaDefinition } from "@/types";

export const mockFormulas: FormulaDefinition[] = [
  {
    id: "formula-newton-2",
    name: "Segunda Ley de Newton (Forma Diferencial)",
    latex: "\\vec{F}_{net} = \\frac{d\\vec{p}}{dt} = m \\frac{d^2\\vec{r}}{dt^2} = m \\vec{a}",
    subject: "fisica-mecanica",
    description:
      "La tasa de cambio del momento lineal de un cuerpo es directamente proporcional a la fuerza neta aplicada.",
    variables: [
      {
        symbol: "\\vec{F}_{net}",
        name: "Fuerza Neta",
        unit: "N (Newtons)",
        description: "Suma vectorial de todas las fuerzas que actúan sobre el sistema.",
      },
      {
        symbol: "\\vec{p}",
        name: "Momento Lineal",
        unit: "kg \\cdot m/s",
        description: "Producto de la masa y la velocidad del cuerpo.",
      },
      {
        symbol: "m",
        name: "Masa inercial",
        unit: "kg",
        description: "Medida de la resistencia del cuerpo a cambiar su estado de movimiento.",
      },
      {
        symbol: "\\vec{a}",
        name: "Aceleración",
        unit: "m/s^2",
        description: "Segunda derivada de la posición respecto al tiempo.",
      },
    ],
  },
  {
    id: "formula-calc-integral",
    name: "Teorema Fundamental del Cálculo",
    latex: "\\frac{d}{dx} \\left( \\int_{a}^{x} f(t) \\, dt \\right) = f(x)",
    subject: "calculo-integral",
    description:
      "Establece la conexión íntima entre la derivación y la integración como operaciones inversas.",
    variables: [
      {
        symbol: "f(t)",
        name: "Función integrable",
        unit: "adimensional",
        description: "Función continua en el intervalo cerrado [a, b].",
      },
      {
        symbol: "x",
        name: "Límite superior variable",
        unit: "u",
        description: "Variable independiente del resultado de la derivada.",
      },
    ],
  },
  {
    id: "formula-schrodinger",
    name: "Ecuación de Onda Unidimensional",
    latex: "\\frac{\\partial^2 u}{\\partial t^2} = v^2 \\frac{\\partial^2 u}{\\partial x^2}",
    subject: "ecuaciones-diferenciales",
    description:
      "Ecuación diferencial parcial hiperbólica que describe la propagación de oscilaciones y perturbaciones.",
    variables: [
      {
        symbol: "u(x, t)",
        name: "Desplazamiento de onda",
        unit: "m",
        description: "Amplitud en la posición x y tiempo t.",
      },
      {
        symbol: "v",
        name: "Velocidad de propagación",
        unit: "m/s",
        description: "Velocidad de fase de la onda en el medio.",
      },
    ],
  },
];

export const mockActiveSession: FeynmanSession = {
  id: "session-feynman-001",
  topic: "Dinámica de Partículas y Conservación del Momentum",
  subject: "fisica-mecanica",
  formula: mockFormulas[0],
  phase: "evaluacion_ocr",
  studentExplanationTranscript:
    "La fuerza no es simplemente masa por aceleración constante, sino cómo cambia el momentum en el tiempo. Si la masa varía como en un cohete, debemos derivar el producto masa por velocidad.",
  aiReflectionFeedback:
    "¡Excelente intuición física! Has captado con precisión la formulación diferencial de Newton d(p)/dt. Ahora valida este concepto resolviendo a mano el desglose del impulso.",
  ocrSteps: [
    {
      stepNumber: 1,
      stepTitle: "Planteamiento del diferencial de momento",
      detectedLatex: "d\\vec{p} = \\vec{F} \\cdot dt",
      expectedLatex: "d\\vec{p} = \\vec{F}_{net} \\, dt",
      isCorrect: true,
      confidenceScore: 0.98,
      feedback: "Correcto: El diferencial de momento lineal coincide con el impulso diferencial aplicado.",
    },
    {
      stepNumber: 2,
      stepTitle: "Integración definida del impulso",
      detectedLatex: "\\Delta \\vec{p} = \\int_{t_1}^{t_2} \\vec{F}_{net}(t) \\, dt",
      expectedLatex: "\\Delta \\vec{p} = \\int_{t_1}^{t_2} \\vec{F}_{net}(t) \\, dt = \\vec{J}",
      isCorrect: true,
      confidenceScore: 0.95,
      feedback: "Muy bien deducido: Relacionaste el teorema del impulso con la integral en el tiempo.",
    },
    {
      stepNumber: 3,
      stepTitle: "Caso de masa variable (Ecuación del Cohete)",
      detectedLatex: "m(t) \\frac{dv}{dt} = -v_{rel} \\frac{dm}{dt}",
      expectedLatex: "m(t) \\frac{dv}{dt} = -v_{rel} \\frac{dm}{dt} - mg",
      isCorrect: false,
      confidenceScore: 0.88,
      feedback: "Cuidado: En un campo gravitatorio externo no debes olvidar el término de peso gravitacional -mg.",
    },
  ],
  masteryScore: 88,
  createdAt: "2026-09-22T15:00:00Z",
};
