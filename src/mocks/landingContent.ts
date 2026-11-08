import type {
  AuditStepDemo,
  FaqItem,
  FeynmanSubjectDemo,
  HeroVariant,
  LandingMetric,
  PlanStep,
  PricingTier,
  StakeItem,
  SubjectDiscipline,
  Testimonial,
  TransformationItem,
} from "@/types/landing";

/**
 * Contenido centralizado de la Landing Page de Quack.
 * Basado en el Documento Consolidado Ejercicios #1 al #5 (Lean Canvas, YODA N=20 y Precios Bill Aulet)
 * y en la rúbrica de la Semana 12 (StoryBrand + Analítica GA4 + Prueba A/B).
 */

export const landingConfig = {
  contactEmail: "alianzas@quack.edu.co",
  leadMagnetUrl: "/recursos/checklist-ilusion-de-competencia.html",
  leadMagnetTitle: "Checklist Anti‑Ilusión de Competencia",
} as const;

/**
 * Hipótesis de A/B Testing (Semana 12):
 * - Versión A (Control): Enfoque aspiracional positivo ("Llega al parcial sabiendo que sabes").
 * - Versión B (Variación): Enfoque de aversión a la pérdida académica y económica
 *   ("Deja de estudiar con resúmenes de IA que te bloquean en el parcial").
 */
export const heroVariants: readonly HeroVariant[] = [
  {
    id: "A",
    badgeText: "Programación · Algoritmia · Química · Biología · Física · Cálculo",
    lead: "Llega al parcial",
    highlight: "sabiendo que sabes.",
    subtitle:
      "Quack es la primera IA a la que tú le enseñas. Explícale en voz alta, resuelve a ciegas con cronómetro y audita tu procedimiento paso a paso — con tus materias ya listas en tu universidad o subiendo tu propio material.",
    primaryCtaText: "Ver planes y probar gratis",
  },
  {
    id: "B",
    badgeText: "Programación · Algoritmia · Química · Biología · Física · Cálculo",
    lead: "No dejes que la IA estudie por ti y",
    highlight: "te bloquee en el parcial.",
    subtitle:
      "El 93.9% siente que entiende al leer un chatbot, pero se queda en blanco frente al examen. En Quack tú le explicas a la IA por voz y auditas tu procedimiento a ciegas — con tus materias listas en tu universidad o subiendo tus propios apuntes.",
    primaryCtaText: "Empezar prueba gratis",
  },
];

/**
 * Disciplinas amplias soportadas por Quack (más allá de matemáticas).
 */
export const subjectDisciplines: readonly SubjectDiscipline[] = [
  {
    id: "prog",
    name: "Programación y Algoritmia",
    area: "Ciencias de la Computación",
    exampleTopic: "Árboles AVL, Grafos y Complejidad",
    snippet: "T(n) = 2T(n/2) + O(n) → O(n log n)",
  },
  {
    id: "quim",
    name: "Química y Termodinámica",
    area: "Ciencias Naturales",
    exampleTopic: "Equilibrio Químico y Cinética",
    snippet: "ΔG = ΔH − TΔS < 0 (Espontáneo)",
  },
  {
    id: "bio",
    name: "Biología y Biofísica",
    area: "Ciencias de la Vida",
    exampleTopic: "Potencial de Membrana y Genética",
    snippet: "Transporte activo Na⁺/K⁺ ATPasa",
  },
  {
    id: "fis",
    name: "Física y Circuitos",
    area: "Ingeniería y Ciencias Exactas",
    exampleTopic: "Leyes de Kirchhoff y Mecánica",
    snippet: "\\sum I_{\\text{in}} = \\sum I_{\\text{out}}",
    isMath: true,
  },
  {
    id: "calc",
    name: "Cálculo y Álgebra Lineal",
    area: "Matemáticas Universitarias",
    exampleTopic: "Autovalores, Series e Integrales",
    snippet: "\\det(A - \\lambda I) = 0",
    isMath: true,
  },
];

export const stakeItems: readonly StakeItem[] = [
  {
    id: "bloqueo",
    title: "Bloqueo frente a la hoja en blanco",
    description:
      "Con el chat abierto todo parecía claro; al cerrar la pantalla en el examen presencial no sabes cómo arrancar.",
  },
  {
    id: "costo",
    title: "$4.5M a $6.0M COP por materia perdida",
    description:
      "Reprobar materias filtro (Algoritmos, Cálculo, Química o Física) cuesta millones en matrícula y atrasa tu grado.",
  },
  {
    id: "ceguera",
    title: "Ceguera pedagógica hasta el día del corte",
    description:
      "Ni el estudiante ni la facultad detectan a tiempo en qué concepto exacto se rompe el razonamiento de la cohorte.",
  },
];

export const problemMetrics: readonly LandingMetric[] = [
  {
    id: "ilusion",
    value: 93.9,
    decimals: 1,
    suffix: "%",
    label: "de los estudiantes sufre la ilusión de competencia tras estudiar pasivamente con IA.",
    source: "Estudio de campo Quack en UniAndes (N = 33)",
  },
  {
    id: "yoda_motivacion",
    value: 90.0,
    decimals: 0,
    suffix: "%",
    label: "calificó con 4 o 5 sobre 5 la exigencia socrática de Quack para detectar vacíos reales.",
    source: "Validación experimental YODA con prototipo (N = 20)",
  },
  {
    id: "yoda_pago",
    value: 85.0,
    decimals: 0,
    suffix: "%",
    label: "confirmó disposición de pago en Quack Pro o adopción institucional en su facultad.",
    source: "Validación experimental YODA en campus (N = 20)",
  },
];

export const transformations: readonly TransformationItem[] = [
  {
    id: "rol",
    before: "Pides resúmenes y código hecho a ChatGPT creyendo que ya entendiste.",
    after: "Tú le explicas a Quack en voz alta y descubres tus huecos antes del examen.",
  },
  {
    id: "alcance",
    before: "Pierdes tiempo configurando prompts o subiendo archivos cada vez.",
    after: "En tu universidad tus materias ya están listas (Ready-to-Go), o subes tus apuntes en 1 clic.",
  },
  {
    id: "evaluacion",
    before: "Te enteras de tus errores cuando ya perdiste el parcial.",
    after: "Practicas a ciegas con cronómetro y recibes auditoría paso a paso con crédito parcial.",
  },
];

/**
 * El Plan en 3 Pasos ("Piedras en el arroyo" de StoryBrand) + guiño a Repetición Espaciada.
 */
export const planSteps: readonly PlanStep[] = [
  {
    id: "p1",
    badge: "Paso 1 · Cero fricción",
    title: "Entra a tu materia lista o sube tu material",
    description:
      "Si tu universidad tiene Quack Campus, tus cursos (Programación, Química, Biología, Cálculo…) ya están montados. Si eres estudiante individual, sube tus PDFs, diapositivas o código y Quack se adapta al instante.",
  },
  {
    id: "p2",
    badge: "Paso 2 · Práctica activa",
    title: "Explícale a Quack y resuelve a ciegas",
    description:
      "Enséñale el concepto por voz a nuestra IA socrática (que jamás regala respuestas) y realiza un simulacro cronometrado a mano para auditar cada línea de tu procedimiento.",
  },
  {
    id: "p3",
    badge: "Paso 3 · Dominio e impacto",
    title: "Aprueba tu parcial y mide tu progreso",
    description:
      "Corrige el paso exacto donde fallas antes del examen. Los estudiantes aseguran su nota y las instituciones obtienen estadísticas en tiempo real del éxito de sus cohortes.",
  },
];

/**
 * Demostraciones multidisciplinarias del modo Feynman Oral (Algoritmos, Biología/Química y Física).
 */
export const feynmanDemosBySubject: readonly FeynmanSubjectDemo[] = [
  {
    id: "algoritmos",
    discipline: "Algoritmos y Programación",
    topic: "Complejidad en Árboles AVL y Búsqueda",
    modeTag: "Ing. de Sistemas · Estructuras de Datos",
    subconcepts: [
      { id: "balance", label: "Factor de balanceo {-1, 0, 1}", covered: true },
      { id: "rotacion", label: "Rotaciones simples y dobles O(1)", covered: true },
      { id: "cota", label: "Altura garantizada O(log n)", covered: false },
    ],
    messages: [
      {
        id: "a1",
        sender: "student",
        text: "Un árbol AVL mantiene la búsqueda en O(log n) porque en cada nodo la altura de sus subárboles difiere máximo en 1.",
      },
      {
        id: "a2",
        sender: "quack",
        text: "¡Quack! 🦆 Espera… si inserto números ordenados 1, 2, 3, 4, ¿no se vuelve una lista enlazada lenta? ¿Cómo lo evita el AVL sin recorrer todo el árbol?",
      },
      {
        id: "a3",
        sender: "student",
        text: "Detecta el desbalance de altura 2 y aplica una rotación simple o doble en tiempo constante O(1).",
      },
    ],
  },
  {
    id: "bioquimica",
    discipline: "Química y Biología",
    topic: "Termodinámica Celular y Transporte Activo",
    modeTag: "Biología · Química · Ing. Biomédica",
    subconcepts: [
      { id: "gradiente", label: "Gradiente electroquímico", covered: true },
      { id: "atp", label: "Acoplamiento con hidrólisis de ATP", covered: true },
      { id: "gibbs", label: "Energía libre ΔG positiva vs acoplada", covered: false },
    ],
    messages: [
      {
        id: "b1",
        sender: "student",
        text: "La bomba sodio-potasio mueve 3 iones Na+ hacia afuera y 2 K+ hacia adentro en contra de su gradiente de concentración.",
      },
      {
        id: "b2",
        sender: "quack",
        text: "Mmm… pero mover algo en contra de su gradiente tiene ΔG positivo, ¡no ocurre solo! 🤔 ¿De dónde sale la energía química para forzar ese paso?",
      },
      {
        id: "b3",
        sender: "student",
        text: "Se acopla a la hidrólisis exergónica del ATP, que fosforila la proteína transportadora y cambia su conformación.",
      },
    ],
  },
  {
    id: "fisica_calculo",
    discipline: "Física y Cálculo",
    topic: "Conservación del Momentum y Choque Inelástico",
    modeTag: "Física Mecánica · Cálculo",
    subconcepts: [
      { id: "impulso", label: "Fuerzas externas nulas (dp/dt = 0)", covered: true },
      { id: "energia", label: "Pérdida de energía cinética ΔK", covered: true },
      { id: "masavar", label: "Sistemas de masa variable", covered: false },
    ],
    messages: [
      {
        id: "f1",
        sender: "student",
        text: "En un choque inelástico el momentum lineal total se conserva porque no hay fuerzas externas netas.",
      },
      {
        id: "f2",
        sender: "quack",
        text: "¡Ajá! ¿Y por qué no puedo igualar también la energía cinética inicial con la final para despejar la velocidad? 🤔",
      },
      {
        id: "f3",
        sender: "student",
        text: "Porque al quedar unidos los cuerpos parte de la energía cinética se disipa en deformación y calor.",
      },
    ],
  },
];

export const auditDemo: {
  title: string;
  subject: string;
  score: number;
  maxScore: number;
  steps: readonly AuditStepDemo[];
} = {
  title: "Auditoría de Procedimiento Manuscrito",
  subject: "Física / Cálculo / Algoritmia",
  score: 3.8,
  maxScore: 5.0,
  steps: [
    {
      stepNumber: 1,
      expression: "p_i = m_1 v_1 + m_2 v_2 = (2)(6) + 0 = 12",
      isLatex: true,
      status: "CORRECT",
      feedback: "Planteamiento inicial e invariante del sistema correctos.",
    },
    {
      stepNumber: 2,
      expression: "12 = (2 + 4)\\,v_f \\Rightarrow v_f = 2\\,\\text{m/s}",
      isLatex: true,
      status: "CORRECT",
      feedback: "Despeje consistente de la velocidad final tras la colisión.",
    },
    {
      stepNumber: 3,
      expression: "K_f = \\tfrac{1}{2}(6)(2) = 6\\,\\text{J}",
      isLatex: true,
      status: "ALGEBRAIC_ERROR",
      feedback: "Omitiste elevar la velocidad al cuadrado (v_f^2 = 4). Debía dar 12 J.",
    },
    {
      stepNumber: 4,
      expression: "\\Delta K = K_f - K_i = 6 - 36 = -30\\,\\text{J}",
      isLatex: true,
      status: "PROPAGATED_ERROR",
      feedback: "Procedimiento válido que arrastra el valor del paso 3 (se otorga crédito parcial).",
    },
  ],
};

/**
 * Testimonios reales tomados de la hoja de seguimiento YODA (Ejercicio #4, N = 20 en UniAndes).
 */
export const testimonials: readonly Testimonial[] = [
  {
    id: "e04",
    code: "Entrevista YODA #E04",
    quote:
      "La auditoría paso a paso me marcó de inmediato un error que venía arrastrando desde el inicio. En un taller normal no me habría dado cuenta hasta perder el parcial.",
    author: "Estudiante de 4.° semestre",
    subject: "Ingeniería de Sistemas · Algoritmos",
    score: "5.0 / 5",
  },
  {
    id: "e17",
    code: "Entrevista YODA #E17",
    quote:
      "Explicándole por voz a Quack identifiqué una brecha conceptual crítica en la complejidad asintótica de árboles AVL que creía dominar por haber leído mis apuntes.",
    author: "Estudiante de 4.° semestre",
    subject: "Ingeniería de Sistemas · Estructuras de Datos",
    score: "5.0 / 5",
  },
  {
    id: "e10",
    code: "Entrevista YODA #E10",
    quote:
      "El rol de alumna curiosa quita la pena de equivocarse y obliga a hacer active recall verdadero la noche antes del examen. Si está en Bloque Neón, lo uso en todas mis materias.",
    author: "Estudiante de 4.° semestre",
    subject: "Ingeniería Química · Termodinámica",
    score: "4.5 / 5",
  },
];

/**
 * Tabla Oficial de Planes y Precios (Ejercicio #5 — Paso 16 Bill Aulet).
 */
export const pricingTiers: readonly PricingTier[] = [
  {
    id: "free",
    name: "Quack Free",
    audience: "Para probar el método cada semana",
    priceCopMonthly: "$0",
    priceCopAnnual: "$0",
    priceUsdMonthly: "$0",
    priceUsdAnnual: "$0",
    billingNote: "Gratis siempre · Sin tarjeta de crédito",
    valueAnchor: "Ideal para conocer a Quack antes de tu próximo quiz",
    description:
      "Empieza hoy mismo probando nuestras materias de demostración o subiendo tu primer apunte.",
    features: [
      "3 sesiones orales Feynman por semana",
      "1 simulacro de Parcial a Ciegas OCR por semana",
      "Sube hasta 2 documentos propios / semana (PDF o apuntes)",
      "Acceso a materias demo (Algoritmos, Química, Física, Cálculo)",
    ],
    ctaLabel: "Probar gratis ahora",
    ctaAction: "try_free",
  },
  {
    id: "pro",
    name: "Quack Pro",
    audience: "Estudiantes individuales · Todas tus materias",
    badge: "Más elegido · Ahorra 37% anual",
    popular: true,
    priceCopMonthly: "$19.900",
    priceCopAnnual: "$149.000",
    priceUsdMonthly: "$4.99",
    priceUsdAnnual: "$37.50",
    billingNote: "COP / mes (o $149.000 COP / año · equivale a $12.400/mes)",
    valueAnchor: "Menos que 25 min de tutor particular · Protege matrículas de $4.5M–$6M COP",
    description:
      "Sube todo tu material de estudio (código, diapositivas, guías) y Quack se adapta a lo que evalúan tus profesores.",
    features: [
      "Carga ilimitada de tu propio material (Programación, Biología, Química, Ingeniería)",
      "Sesiones orales Feynman ilimitadas con voz e IA socrática",
      "Parciales a Ciegas OCR ilimitados con crédito parcial paso a paso",
      "Reporte semanal de Brechas Erradicadas y alertas pre-parcial",
      "Acceso prioritario al nuevo módulo de Repetición Espaciada (Próximamente)",
    ],
    ctaLabel: "Activar Quack Pro",
    ctaAction: "checkout_pro",
  },
  {
    id: "campus",
    name: "Quack Campus",
    audience: "Universidades, Facultades y Colegios (B2B)",
    badge: "Piloto Early Adopter -20%",
    priceCopMonthly: "$48.000",
    priceCopAnnual: "$48.000",
    priceUsdMonthly: "$12.00",
    priceUsdAnnual: "$12.00",
    billingNote: "COP por estudiante / año en Piloto ($60.000 COP / $15 USD tarifa estándar)",
    valueAnchor: "ROI institucional > 50x al prevenir deserción (+$30M COP retenidos por alumno)",
    description:
      "Experiencia 100% Ready-to-Go para tus estudiantes + analítica estratégica de éxito estudiantil para la institución.",
    features: [
      "Cursos Ready-to-Go vía LTI (Bloque Neón, Canvas, Brightspace): el alumno entra y ya ve sus materias y temas montados",
      "Panel de Estadísticas de Éxito Estudiantil: evolución de aprobación, dominio por cohorte y cuellos de botella por materia",
      "Abarca todo el currículo: Programación, Algoritmia, Química, Biología, Física y Matemáticas",
      "Parametrización oficial con sílabos, rúbricas y parciales históricos de la facultad",
      "Soporte dedicado y co-desarrollo pedagógico",
    ],
    ctaLabel: "Solicitar Piloto Institucional",
    ctaAction: "contact_campus",
  },
];

export const certificationAddon = {
  name: "Certificación de Dominio Autónomo (Pay‑per‑Use)",
  priceCop: "$100.000 COP",
  priceUsd: "$25 USD",
  unit: "por examen oficial auditado",
  description:
    "Rinde un examen supervisado a libro cerrado y obtén una credencial verificable de dominio técnico para postular a monitorías académicas, semilleros y prácticas profesionales.",
} as const;

export const faqItems: readonly FaqItem[] = [
  {
    id: "f1",
    question: "¿Quack sirve solo para matemáticas o también para otras materias?",
    answer:
      "Quack funciona en un rango amplio de disciplinas: Programación, Algoritmia y Estructuras de Datos, Química, Biología, Biofísica, Física, Circuitos, Cálculo y Álgebra. Si el tema requiere razonamiento lógico, explicación de conceptos o resolución de problemas, puedes entrenarlo con Quack.",
  },
  {
    id: "f2",
    question: "¿Cuál es la diferencia entre el plan para Universidades (Quack Campus) y la suscripción individual (Quack Pro)?",
    answer:
      "En Quack Campus (B2B), la universidad integra Quack con su LMS (como Bloque Neón o Canvas): cuando el estudiante entra, ya encuentra todas sus materias, unidades y temas listos para practicar (Ready-to-Go), y la institución recibe estadísticas estratégicas del éxito y brechas de sus estudiantes. En Quack Pro (B2C), el estudiante individual sube sus propios apuntes, diapositivas o código y Quack se adapta a ese material.",
  },
  {
    id: "f3",
    question: "¿Qué estadísticas de éxito estudiantil entrega Quack a las instituciones educativas?",
    answer:
      "Las decanaturas y coordinaciones académicas acceden a métricas agregadas de impacto: porcentaje de incremento en la aprobación de parciales, tasa de dominio por tema antes de cada corte, identificación de los conceptos donde más se bloquean los estudiantes y alertas tempranas para reducir la repitencia y deserción.",
  },
  {
    id: "f4",
    question: "¿Cómo funcionan los precios para estudiantes (B2C) y universidades (B2B)?",
    answer:
      "Los estudiantes individuales pueden empezar gratis con Quack Free ($0 USD) o activar Quack Pro por $4.99 USD/mes ($37.50 USD/año, ahorrando 37%). Para universidades y facultades (B2B), manejamos planes por volumen desde $12,000 USD/año por cada 1,000 estudiantes en Piloto Early Adopter (con descuentos progresivos hasta $9,000 USD por cada 1k estudiantes en campus completos).",
  },
  {
    id: "f5",
    question: "¿Habrá una etapa previa de memorización antes de evaluar con Feynman y OCR?",
    answer:
      "Sí. Tenemos en hoja de ruta el módulo de Memorización por Repetición Espaciada: primero entrenas conceptos clave con tarjetas adaptativas según qué tan difícil te resultó cada una, y luego pasas a demostrar el dominio profundo explicándole a Quack por voz y resolviendo el Parcial a Ciegas.",
  },
];
