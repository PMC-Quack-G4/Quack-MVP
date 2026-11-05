import type { AuditStep } from "@/types/exam";
import type {
  ComparisonRow,
  FaqItem,
  HeroVariant,
  LandingMetric,
  Milestone,
  PlanStep,
  StakeItem,
  Testimonial,
  TransformationItem,
} from "@/types/landing";

/**
 * Contenido centralizado de la landing page.
 * Todo el copy vive aquí para facilitar pruebas A/B y ajustes del equipo
 * sin tocar los componentes.
 */

export const landingConfig = {
  /** ⚠️ Reemplazar por el correo real del equipo. */
  contactEmail: "hola@quack-mvp.app",
  leadMagnetUrl: "/recursos/checklist-ilusion-de-competencia.html",
  leadMagnetTitle: "Checklist anti‑ilusión de competencia",
} as const;

/** Variantes del titular para experimentación A/B (se asignan 50/50). */
export const heroVariants: readonly HeroVariant[] = [
  { id: "A", lead: "Llega al parcial", highlight: "sabiendo que sabes." },
  { id: "B", lead: "Deja de creer que entiendes.", highlight: "Demuéstralo", tail: "antes del parcial." },
];

export const stakeItems: readonly StakeItem[] = [
  {
    id: "notas",
    title: "Notas que no reflejan tus horas de estudio",
    description: "Estudiaste toda la semana, pero en el parcial no pudiste pasar del primer paso.",
  },
  {
    id: "semestre",
    title: "Materias repetidas, tiempo y dinero perdidos",
    description: "Perder una materia cuesta un semestre más de matrícula y te atrasa frente a tu cohorte.",
  },
  {
    id: "ansiedad",
    title: "Ansiedad cada vez que se acerca un parcial",
    description: "Nunca sabes si de verdad estás listo hasta que ya es demasiado tarde.",
  },
];

/**
 * Datos de validación del equipo (ver docs/PRODUCT_SPEC.md).
 * ⚠️ Confirmar redacción y tamaño de muestra de la encuesta antes de publicar.
 */
export const problemMetrics: readonly LandingMetric[] = [
  {
    id: "ilusion",
    value: 93.9,
    decimals: 1,
    suffix: "%",
    label: "de los estudiantes STEM encuestados ha sentido que entendía un tema y luego se bloqueó en el examen.",
    source: "Encuesta de validación Quack, 2026",
  },
  {
    id: "pasivo",
    value: 75.8,
    decimals: 1,
    suffix: "%",
    label: "estudia leyendo o releyendo resúmenes, sin practicar a recordar ni a resolver sin ayuda.",
    source: "Encuesta de validación Quack, 2026",
  },
];

export const transformations: readonly TransformationItem[] = [
  {
    id: "dominio",
    before: "Crees que entiendes porque el resumen “tenía sentido”.",
    after: "Sabes exactamente qué temas dominas y cuáles no.",
  },
  {
    id: "practica",
    before: "Nunca resolviste un ejercicio sin apuntes ni ayuda.",
    after: "Ya resolviste a mano, con cronómetro y a libro cerrado.",
  },
  {
    id: "errores",
    before: "Descubres tus errores cuando ya te calificaron.",
    after: "Corriges tus errores típicos antes de que te cuesten puntos.",
  },
  {
    id: "confianza",
    before: "Entras con nervios, esperando que salga lo que repasaste.",
    after: "Entras tranquilo: no dependes de la suerte, sabes que sabes.",
  },
];

/** Hechos verificables del producto (autoridad del guía). */
export const productMetrics: readonly LandingMetric[] = [
  { id: "modos", value: 2, label: "formas de practicar: explicar en voz alta y resolver a mano" },
  { id: "materias", value: 4, label: "materias STEM listas: Física, Cálculo, Álgebra lineal y Ecuaciones" },
  { id: "respuestas", value: 0, label: "respuestas regaladas: Quack pregunta, tú demuestras" },
  { id: "pasos", value: 100, suffix: "%", label: "de tu procedimiento revisado paso a paso, con crédito parcial" },
];

/**
 * ⚠️ IMPORTANTE: citas de ejemplo. Reemplazar por frases textuales de las
 * entrevistas de validación (con permiso del estudiante) y cambiar
 * `isPlaceholder` a false.
 */
export const testimonials: readonly Testimonial[] = [
  {
    id: "t1",
    quote: "Le expliqué la regla de la cadena a Quack y me hizo una pregunta que no supe responder. Ahí entendí que solo me sabía el procedimiento de memoria.",
    author: "Estudiante de Ingeniería de Sistemas",
    role: "3.er semestre · Prueba del prototipo",
    isPlaceholder: true,
  },
  {
    id: "t2",
    quote: "Lo mejor es que me dice en qué renglón me equivoqué. Siempre perdía puntos por errores de signo y no me daba cuenta.",
    author: "Estudiante de Ingeniería Electrónica",
    role: "2.º semestre · Prueba del prototipo",
    isPlaceholder: true,
  },
  {
    id: "t3",
    quote: "Con ChatGPT sentía que entendía todo. Con Quack me tocó demostrarlo, y eso es justo lo que pasa en el parcial.",
    author: "Estudiante de Ingeniería Mecánica",
    role: "4.º semestre · Entrevista de validación",
    isPlaceholder: true,
  },
];

export const milestones: readonly Milestone[] = [
  {
    id: "m1",
    period: "Fase 1",
    title: "Escuchamos a los estudiantes",
    description: "Entrevistas y encuesta con estudiantes STEM para validar la ilusión de competencia.",
    status: "done",
  },
  {
    id: "m2",
    period: "Fase 2",
    title: "Prototipo con dos modos",
    description: "Explicar a Quack en voz alta y Parcial a ciegas con revisión paso a paso.",
    status: "done",
  },
  {
    id: "m3",
    period: "Fase 3",
    title: "IA real con respaldo",
    description: "Integración con Gemini y modo de respaldo para que la práctica nunca se detenga.",
    status: "current",
  },
  {
    id: "m4",
    period: "Próximo",
    title: "Piloto con una materia",
    description: "Curso preparado con temas y ejercicios listos para practicar desde el primer día.",
    status: "next",
  },
];

export const comparisonRows: readonly ComparisonRow[] = [
  { id: "quien", criterion: "¿Quién explica?", genericAi: "La IA", tutor: "El tutor", quack: "Tú" },
  { id: "respuesta", criterion: "¿Te da la respuesta?", genericAi: "Siempre", tutor: "A menudo", quack: "Nunca" },
  { id: "papel", criterion: "¿Practicas a mano y con tiempo?", genericAi: "No", tutor: "A veces", quack: "Sí" },
  { id: "pasos", criterion: "¿Revisa tu procedimiento paso a paso?", genericAi: "No", tutor: "Sí", quack: "Sí" },
  { id: "disponible", criterion: "¿Disponible a las 2 a. m.?", genericAi: "Sí", tutor: "No", quack: "Sí" },
  { id: "costo", criterion: "Costo", genericAi: "Gratis o suscripción", tutor: "Pago por hora", quack: "Gratis en el piloto" },
];

export const planSteps: readonly PlanStep[] = [
  {
    id: "p1",
    title: "Elige tu tema",
    description: "Física, Cálculo integral, Álgebra lineal o Ecuaciones diferenciales. Sin crear cuenta.",
  },
  {
    id: "p2",
    title: "Explícalo y resuélvelo",
    description: "Enséñale el tema a Quack en voz alta y resuelve un ejercicio a mano con cronómetro.",
  },
  {
    id: "p3",
    title: "Llega seguro al parcial",
    description: "Corrige a tiempo el paso exacto donde fallas y entra sabiendo que sabes.",
  },
];

export const faqItems: readonly FaqItem[] = [
  {
    id: "f1",
    question: "¿Cuánto cuesta Quack?",
    answer: "Nada. Quack es gratis durante el piloto y funciona directamente en tu navegador, sin instalar nada ni crear cuenta.",
  },
  {
    id: "f2",
    question: "¿Quack me da las respuestas?",
    answer: "No, y es a propósito. Quack actúa como una compañera curiosa: te hace preguntas hasta que tu explicación no tenga huecos. En el Parcial a ciegas te señala el paso donde se rompe tu razonamiento para que lo corrijas tú.",
  },
  {
    id: "f3",
    question: "¿Necesito micrófono?",
    answer: "Es lo ideal, porque explicar en voz alta fija mejor lo aprendido. Si no tienes micrófono o tu navegador no lo soporta, puedes escribir tu explicación.",
  },
  {
    id: "f4",
    question: "¿La nota del Parcial a ciegas es oficial?",
    answer: "No. Es una calificación orientativa para estudiar. Si tu letra es difícil de leer, la revisión puede fallar; por eso siempre te mostramos qué leyó en cada paso.",
  },
  {
    id: "f5",
    question: "¿Qué pasa con mi voz y mis fotos?",
    answer: "Tu voz se convierte a texto en tu propio navegador. Las fotos se envían al motor de IA solo para revisar tu procedimiento y no las guardamos en servidores propios.",
  },
  {
    id: "f6",
    question: "¿Funciona en el celular?",
    answer: "Sí. Puedes tomarle la foto a tu hoja directamente desde el celular y ver la revisión paso a paso ahí mismo.",
  },
];

export const studyTopics: readonly string[] = [
  "Física mecánica",
  "Cálculo integral",
  "Álgebra lineal",
  "Ecuaciones diferenciales",
];

/**
 * Demostración de auditoría (mismo caso que `fis-mec-01` en quackData):
 * choque inelástico con un error algebraico en el paso 5 que se arrastra al 6.
 * Se duplica de forma compacta para mantener ligero el bundle de la landing.
 */
export const auditDemo: {
  title: string;
  score: number;
  maxScore: number;
  steps: readonly Pick<AuditStep, "stepNumber" | "latexExpression" | "status" | "feedback">[];
} = {
  title: "Choque inelástico",
  score: 3.5,
  maxScore: 5,
  steps: [
    { stepNumber: 1, latexExpression: "p_i = (2)(6) + (4)(0) = 12", status: "CORRECT", feedback: "Momento inicial bien planteado." },
    { stepNumber: 2, latexExpression: "p_f = (2 + 4)\\,v_f = 6v_f", status: "CORRECT", feedback: "Masa combinada correcta." },
    { stepNumber: 3, latexExpression: "12 = 6v_f \\Rightarrow v_f = 2", status: "CORRECT", feedback: "Despeje correcto." },
    { stepNumber: 4, latexExpression: "K_i = \\tfrac{1}{2}(2)(6)^2 = 36", status: "CORRECT", feedback: "Energía inicial correcta." },
    { stepNumber: 5, latexExpression: "K_f = \\tfrac{1}{2}(6)(2) = 6", status: "ALGEBRAIC_ERROR", feedback: "Revisa cómo aparece la velocidad en la energía cinética." },
    { stepNumber: 6, latexExpression: "\\Delta K = 6 - 36 = -30", status: "PROPAGATED_ERROR", feedback: "Coherente, pero arrastra el error del paso 5." },
  ],
};

export interface FeynmanDemoMessage {
  id: string;
  sender: "student" | "quack";
  /** Texto con fórmulas delimitadas por $...$ (se renderizan con KaTeX). */
  text: string;
  unlocks?: string;
}

/** Diálogo de ejemplo del modo "Explícale a Quack". */
export const feynmanDemo: {
  topic: string;
  subconcepts: readonly { id: string; label: string }[];
  messages: readonly FeynmanDemoMessage[];
} = {
  topic: "Segunda ley de Newton",
  subconcepts: [
    { id: "fuerza", label: "Fuerza neta" },
    { id: "momentum", label: "Momentum" },
    { id: "masa-variable", label: "Masa variable" },
  ],
  messages: [
    { id: "m1", sender: "student", text: "La segunda ley dice que la fuerza es masa por aceleración: $F = ma$.", unlocks: "fuerza" },
    { id: "m2", sender: "quack", text: "¡Ajá! ¿Y si la masa cambia, como un cohete que va quemando combustible? 🤔" },
    { id: "m3", sender: "student", text: "Entonces se usa el cambio de momentum: $F = \\frac{dp}{dt}$.", unlocks: "momentum" },
    { id: "m4", sender: "quack", text: "Mmm… ¿y qué es el momentum? Explícamelo como si yo nunca hubiera oído esa palabra." },
  ],
};
