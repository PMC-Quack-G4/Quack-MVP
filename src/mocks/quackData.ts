import { FormulaDefinition, FeynmanTopic, ExamProblem, FeynmanSession } from "@/types";

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

export const mockFeynmanTopics: FeynmanTopic[] = [
  {
    id: "newton-momentum",
    title: "Segunda Ley de Newton y Conservación del Momentum",
    category: "Física Mecánica",
    difficulty: "Intermedio",
    formulaLatex: "\\vec{F}_{net} = \\frac{d\\vec{p}}{dt} = m\\frac{d\\vec{v}}{dt} + \\vec{v}\\frac{dm}{dt}",
    promptContext:
      "El estudiante te enseñará el significado de la Segunda Ley de Newton en forma diferencial y la conservación del momentum.",
    subtopics: [
      {
        id: "def-masa",
        name: "Definición de masa inercial y momentum",
        description: "Relación p = m·v y el significado físico de la inercia sin confundir masa y peso.",
        covered: false,
      },
      {
        id: "diferencial",
        name: "Formulación diferencial dp/dt vs F = m·a",
        description: "Por qué F = dp/dt es más general y qué ocurre cuando la masa varía en el tiempo.",
        covered: false,
      },
      {
        id: "impulso",
        name: "Teorema del Impulso Integral",
        description: "Integración en el tiempo del impulso neto: J = Δp = ∫ F dt.",
        covered: false,
      },
      {
        id: "conservacion",
        name: "Conservación en sistemas aislados",
        description: "Condición de fuerza neta externa nula para conservación en colisiones.",
        covered: false,
      },
    ],
    mockDialogue: [
      {
        triggerWords: ["masa", "inercia", "peso", "velocidad", "movimiento"],
        quackReply:
          "Espera un segundo... ¿la masa inercial y el peso son lo mismo? Si viajo a la Luna, ¿mi inercia cambia o solo mi peso?",
        unlocksSubtopicId: "def-masa",
      },
      {
        triggerWords: ["derivada", "diferencial", "tiempo", "cohete", "aceleracion", "cambio"],
        quackReply:
          "¡Ah, ya veo! Pero entonces, ¿por qué en el colegio siempre me enseñaron que F = m*a? ¿En qué casos esa fórmula se queda corta?",
        unlocksSubtopicId: "diferencial",
      },
      {
        triggerWords: ["impulso", "integral", "fuerza", "choque", "golpe", "instante", "area"],
        quackReply:
          "O sea que si le doy un raquetazo a una pelota en milisegundos, ¿esa fuerza breve acumulada en el tiempo es lo que le cambia la velocidad? ¿Cómo se llama esa integral?",
        unlocksSubtopicId: "impulso",
      },
      {
        triggerWords: ["conserva", "aislado", "externa", "cero", "colision", "sistema"],
        quackReply:
          "¡Guao! Entonces si dos patitos chocan en el agua y no hay fricción, ¿el momento total antes del choque es idéntico al de después? ¿Incluso si quedan pegados?",
        unlocksSubtopicId: "conservacion",
      },
    ],
    fallbackReply:
      "Mmm, me suena un poco técnico. ¿Podrías darme una analogía con algo de la vida cotidiana para que pueda entenderlo mejor?",
  },
  {
    id: "calculo-ftc",
    title: "Teorema Fundamental del Cálculo y Antiderivadas",
    category: "Cálculo Integral",
    difficulty: "Básico",
    formulaLatex: "\\frac{d}{dx} \\left( \\int_{a}^{x} f(t) \\, dt \\right) = f(x)",
    promptContext: "El estudiante te explicará cómo se conectan la derivada y la integral en el Teorema Fundamental del Cálculo.",
    subtopics: [
      {
        id: "area-acumulada",
        name: "Función de Área Acumulada",
        description: "Comprensión geométrica del área bajo la curva como una función dependiente del límite superior x.",
        covered: false,
      },
      {
        id: "relacion-inversa",
        name: "Operaciones Inversas (Derivar e Integrar)",
        description: "Por qué la tasa de cambio del área acumulada es exactamente la altura de la curva original.",
        covered: false,
      },
      {
        id: "regla-barrow",
        name: "Regla de Barrow (Parte 2)",
        description: "Uso de la antiderivada F(b) - F(a) para calcular integrales definidas sin sumas de Riemann.",
        covered: false,
      },
      {
        id: "continuidad",
        name: "Condición de Continuidad",
        description: "Por qué la función integrando debe ser continua en el intervalo cerrado [a, b].",
        covered: false,
      },
    ],
    mockDialogue: [
      {
        triggerWords: ["area", "curva", "acumulada", "rectangulo", "riemann"],
        quackReply:
          "Espera, ¿la integral es una función o es solo un número que representa un área? ¿Por qué tiene una x en el límite de arriba?",
        unlocksSubtopicId: "area-acumulada",
      },
      {
        triggerWords: ["inversa", "pendiente", "tasa", "cambio", "anulan", "derivar"],
        quackReply:
          "¡Qué loco! ¿Me estás diciendo que si calculo el área y luego le saco la derivada, regreso a la función del principio? ¿Por qué pasa eso?",
        unlocksSubtopicId: "relacion-inversa",
      },
      {
        triggerWords: ["barrow", "evaluar", "antiderivada", "resta", "limites"],
        quackReply:
          "¿Y entonces para qué sirven las sumas infinitas de rectángulos si basta con encontrar una función y restarle F(b) menos F(a)?",
        unlocksSubtopicId: "regla-barrow",
      },
      {
        triggerWords: ["continua", "salto", "asintota", "hueco", "cerrado", "intervalo"],
        quackReply:
          "¿Y si la gráfica tiene una asíntota o se corta en la mitad, todavía puedo aplicar el teorema como si nada?",
        unlocksSubtopicId: "continuidad",
      },
    ],
    fallbackReply:
      "Aún no lo veo del todo claro... ¿qué le responderías a alguien que piensa que derivar e integrar son dos ramas de matemáticas que no tienen nada que ver?",
  },
  {
    id: "algebra-espacios",
    title: "Independencia Lineal y Bases Vectoriales",
    category: "Álgebra Lineal",
    difficulty: "Intermedio",
    formulaLatex: "c_1 \\vec{v}_1 + c_2 \\vec{v}_2 + \\dots + c_k \\vec{v}_k = \\vec{0} \\implies c_i = 0",
    promptContext: "El estudiante te enseñará qué es la independencia lineal y cómo se construye una base de un espacio vectorial.",
    subtopics: [
      {
        id: "comb-lineal",
        name: "Combinación Lineal y Ponderación",
        description: "Escalar vectores y sumarlos para alcanzar nuevos puntos del espacio.",
        covered: false,
      },
      {
        id: "independencia",
        name: "Definición de Independencia Lineal",
        description: "Ningún vector del conjunto puede escribirse como combinación de los demás; solo coeficientes nulos dan cero.",
        covered: false,
      },
      {
        id: "generador",
        name: "Conjunto Generador (Span)",
        description: "El espacio total de vectores que se pueden construir con el conjunto dado.",
        covered: false,
      },
      {
        id: "base-dimension",
        name: "Base y Dimensión del Espacio",
        description: "Conjunto generador mínimo e independiente que define las coordenadas únicas.",
        covered: false,
      },
    ],
    mockDialogue: [
      {
        triggerWords: ["combinacion", "escalar", "suma", "ponderar", "multiplicar"],
        quackReply:
          "O sea que una combinación lineal es como una receta de cocina donde mezclo cantidades de vectores para llegar a otro lugar?",
        unlocksSubtopicId: "comb-lineal",
      },
      {
        triggerWords: ["independiente", "dependiente", "cero", "trivial", "paralelo", "plano"],
        quackReply:
          "Si tengo tres vectores en una hoja de papel, ¿pueden ser linealmente independientes o uno siempre sobra?",
        unlocksSubtopicId: "independencia",
      },
      {
        triggerWords: ["span", "generador", "espacio", "alcanzar", "cubrir"],
        quackReply:
          "¿Y qué diferencia hay entre los vectores que 'generan' un espacio y los que son 'independientes'?",
        unlocksSubtopicId: "generador",
      },
      {
        triggerWords: ["base", "dimension", "coordenadas", "minimo", "ejes"],
        quackReply:
          "¡Ah! ¿Por eso en el plano 2D necesitamos exactamente 2 vectores que no sean paralelos para formar una base?",
        unlocksSubtopicId: "base-dimension",
      },
    ],
    fallbackReply:
      "A ver si entendí... ¿puedes explicármelo visualmente como si estuviéramos moviéndonos en un mapa con flechas?",
  },
  {
    id: "edo-separables",
    title: "Ecuaciones Diferenciales de Variables Separables",
    category: "Ecuaciones Diferenciales",
    difficulty: "Avanzado",
    formulaLatex: "\\frac{dy}{dx} = g(x)h(y) \\implies \\int \\frac{1}{h(y)} \\, dy = \\int g(x) \\, dx + C",
    promptContext: "El estudiante te enseñará el método analítico de separación de variables para resolver EDOs de primer orden.",
    subtopics: [
      {
        id: "factorizacion-edo",
        name: "Factorización en Producto g(x)·h(y)",
        description: "Reconocer cuándo una derivada dy/dx se puede desglosar en factores independientes de x e y.",
        covered: false,
      },
      {
        id: "separacion-algebraica",
        name: "Separación Rigurosa de Diferenciales",
        description: "Agrupar todas las 'y' con dy a un lado y todas las 'x' con dx al otro lado.",
        covered: false,
      },
      {
        id: "integracion-ambos",
        name: "Integración Directa de Ambos Miembros",
        description: "Aplicar la integral en ambos lados de la igualdad con métodos estándar.",
        covered: false,
      },
      {
        id: "constante-solucion",
        name: "Constante de Integración y Solución Explícita",
        description: "Manejo de la constante C y despeje de y(x) o aplicación del problema de valor inicial.",
        covered: false,
      },
    ],
    mockDialogue: [
      {
        triggerWords: ["factorizar", "producto", "multiplicar", "forma", "separar"],
        quackReply:
          "¿Y si tengo algo como x + y en vez de x*y, puedo separar las variables o el método ya no sirve?",
        unlocksSubtopicId: "factorizacion-edo",
      },
      {
        triggerWords: ["diferencial", "dy", "dx", "lados", "despeje", "pasar"],
        quackReply:
          "Un profe nos dijo que dy/dx no es una fracción cualquiera. ¿Es matemáticamente legal pasar el dx multiplicando al otro lado?",
        unlocksSubtopicId: "separacion-algebraica",
      },
      {
        triggerWords: ["integrar", "ambos", "integral", "lado", "metodo"],
        quackReply:
          "¿Y por qué no pongo una constante C a la izquierda con la 'y' y otra constante D a la derecha con la 'x'?",
        unlocksSubtopicId: "integracion-ambos",
      },
      {
        triggerWords: ["constante", "inicial", "despejar", "condicion", "particular", "general"],
        quackReply:
          "¡Guao! Y si me dan una condición como y(0) = 5, ¿eso fija el valor de esa constante misteriosa C?",
        unlocksSubtopicId: "constante-solucion",
      },
    ],
    fallbackReply:
      "Mmm, me suena un poco abstracto. ¿Por qué no resolvemos un ejemplo paso a paso juntos para que vea cómo se hace?",
  },
];

export const mockExamProblems: ExamProblem[] = [
  {
    id: "calc-diff-01",
    title: "Derivación con Regla de la Cadena y Logaritmos",
    subject: "Cálculo Diferencial",
    difficulty: "Medio",
    statementLatex: "f(x) = \\ln\\left((x^2 + 3x + 1)^5\\right). \\quad \\text{Calcular } f'(x) \\text{ simplificando la expresión al máximo.}",
    estimatedMinutes: 15,
    defaultSampleImage: "/samples/sample_exam_derivatives.svg",
    mockAudit: {
      finalScore: 4.8,
      maxScore: 5.0,
      diagnosisTitle: "Dominio Sobresaliente",
      summary: "Excelente aplicación de las propiedades de logaritmos antes de derivar. El desarrollo algebraico es riguroso y el resultado es completamente canónico.",
      completionPercentage: 100,
      isValidSubmission: true,
      pedagogicalRecommendation: "Dominas con solidez la simplificación logarítmica previa a la regla de la cadena. Para el 5.0 absoluto, recuerda indicar explícitamente el dominio de validez del argumento del logaritmo (x² + 3x + 1 > 0).",
      steps: [
        {
          stepNumber: 1,
          latexExpression: "f(x) = \\ln\\left((x^2 + 3x + 1)^5\\right)",
          status: "CORRECT",
          feedback: "Expresión inicial del enunciado planteada de forma fidedigna.",
        },
        {
          stepNumber: 2,
          latexExpression: "f(x) = 5 \\cdot \\ln(x^2 + 3x + 1)",
          status: "CORRECT",
          feedback: "Uso óptimo de la propiedad \\ln(u^k) = k \\ln(u) para simplificar la función antes de derivar, reduciendo la complejidad.",
        },
        {
          stepNumber: 3,
          latexExpression: "f'(x) = 5 \\cdot \\frac{d}{dx}\\left[\\ln(x^2 + 3x + 1)\\right]",
          status: "CORRECT",
          feedback: "Aplicación de la linealidad de la derivada extrayendo el escalar constante.",
        },
        {
          stepNumber: 4,
          latexExpression: "f'(x) = 5 \\cdot \\left(\\frac{2x + 3}{x^2 + 3x + 1}\\right)",
          status: "CORRECT",
          feedback: "Regla de la cadena aplicada con exactitud: derivada interna (2x + 3) dividida por el argumento (x^2 + 3x + 1).",
        },
        {
          stepNumber: 5,
          latexExpression: "f'(x) = \\frac{10x + 15}{x^2 + 3x + 1}",
          status: "CORRECT",
          feedback: "Distribución del factor escalar 5 en el numerador sin errores aritméticos.",
        },
      ],
    },
  },
  {
    id: "fis-mec-01",
    title: "Conservación del Momento y Choque Inelástico",
    subject: "Física Mecánica",
    difficulty: "Difícil",
    statementLatex: "\\text{Un cuerpo } m_1 = 2\\,\\text{kg} \\text{ con } v_1 = 6\\,\\text{m/s} \\text{ colisiona inelásticamente con } m_2 = 4\\,\\text{kg} \\text{ en reposo. Hallar } v_f \\text{ y la energía cinética disipada } \\Delta K.",
    estimatedMinutes: 20,
    defaultSampleImage: "/samples/sample_exam_physics.svg",
    mockAudit: {
      finalScore: 3.5,
      maxScore: 5.0,
      diagnosisTitle: "Error Algebraico con Arrastre",
      summary: "Excelente planteamiento del principio de conservación del momento lineal. Sin embargo, hubo un olvido del exponente al calcular la energía cinética final en el paso 5, lo cual provocó un arrastre de error al calcular la disipación.",
      completionPercentage: 85,
      isValidSubmission: true,
      pedagogicalRecommendation: "Tu intuición física sobre colisiones inelásticas es correcta y obtuviste crédito parcial en el paso 6 por consistencia con tu dato previo. Revisa siempre la homogeneidad dimensional de la energía cinética (J = kg·m²/s²) para no omitir el cuadrado de la velocidad.",
      steps: [
        {
          stepNumber: 1,
          latexExpression: "p_i = m_1 v_1 + m_2 v_2 = (2)(6) + (4)(0) = 12\\,\\text{kg}\\cdot\\text{m/s}",
          status: "CORRECT",
          feedback: "Cálculo preciso del momento lineal inicial del sistema antes del choque.",
        },
        {
          stepNumber: 2,
          latexExpression: "p_f = (m_1 + m_2)v_f = (2 + 4)v_f = 6v_f",
          status: "CORRECT",
          feedback: "Identificación correcta de que al ser un choque inelástico las masas se mueven como un solo cuerpo.",
        },
        {
          stepNumber: 3,
          latexExpression: "12 = 6v_f \\implies v_f = 2\\,\\text{m/s}",
          status: "CORRECT",
          feedback: "Despeje correcto de la velocidad final común de los cuerpos.",
        },
        {
          stepNumber: 4,
          latexExpression: "K_i = \\frac{1}{2}m_1 v_1^2 = \\frac{1}{2}(2)(6)^2 = 36\\,\\text{J}",
          status: "CORRECT",
          feedback: "Cálculo impecable de la energía cinética inicial.",
        },
        {
          stepNumber: 5,
          latexExpression: "K_f = \\frac{1}{2}(m_1 + m_2)v_f = \\frac{1}{2}(6)(2) = 6\\,\\text{J}",
          status: "ALGEBRAIC_ERROR",
          feedback: "Error algebraico por omisión de exponente: la fórmula de energía cinética requiere v_f^2 = 2^2 = 4.",
          suggestedFixLatex: "K_f = \\frac{1}{2}(6)(2)^2 = \\frac{1}{2}(6)(4) = 12\\,\\text{J}",
        },
        {
          stepNumber: 6,
          latexExpression: "\\Delta K = K_f - K_i = 6 - 36 = -30\\,\\text{J}",
          status: "PROPAGATED_ERROR",
          feedback: "Arrastre de error previo: la resta es matemáticamente consistente con el valor 6 J del paso 5, pero errónea respecto a la física real.",
          suggestedFixLatex: "\\Delta K = 12 - 36 = -24\\,\\text{J}",
        },
      ],
    },
  },
  {
    id: "calc-int-02",
    title: "Integración por Fracciones Parciales",
    subject: "Cálculo Integral",
    difficulty: "Medio",
    statementLatex: "\\int \\frac{3x + 5}{x^2 + 3x + 2} \\, dx. \\quad \\text{Resolver la integral indefinida expresando el resultado con logaritmos.}",
    estimatedMinutes: 18,
    defaultSampleImage: "/samples/sample_exam_integrals.svg",
    mockAudit: {
      finalScore: 4.9,
      maxScore: 5.0,
      diagnosisTitle: "Dominio Sólido en Integración",
      summary: "Factorización y descomposición en fracciones simples perfectamente ejecutadas. Buena integración de términos logarítmicos con constante de integración.",
      completionPercentage: 100,
      isValidSubmission: true,
      pedagogicalRecommendation: "Procedimiento algebraico y cálculo de primitivas impecables. También puedes expresar la respuesta final compactada como ln|(x+1)²(x+2)| + C usando propiedades de logaritmos.",
      steps: [
        {
          stepNumber: 1,
          latexExpression: "x^2 + 3x + 2 = (x + 1)(x + 2)",
          status: "CORRECT",
          feedback: "Factorización cuadrática correcta en el denominador.",
        },
        {
          stepNumber: 2,
          latexExpression: "\\frac{3x + 5}{(x + 1)(x + 2)} = \\frac{A}{x + 1} + \\frac{B}{x + 2}",
          status: "CORRECT",
          feedback: "Planteamiento formal de la descomposición en fracciones parciales simples.",
        },
        {
          stepNumber: 3,
          latexExpression: "3x + 5 = A(x + 2) + B(x + 1)",
          status: "CORRECT",
          feedback: "Eliminación correcta del denominador común para encontrar coeficientes.",
        },
        {
          stepNumber: 4,
          latexExpression: "x = -1 \\implies 2 = A(1) \\implies A = 2; \\quad x = -2 \\implies -1 = B(-1) \\implies B = 1",
          status: "CORRECT",
          feedback: "Cálculo exacto de las constantes A = 2 y B = 1 mediante evaluación de raíces.",
        },
        {
          stepNumber: 5,
          latexExpression: "\\int \\left( \\frac{2}{x + 1} + \\frac{1}{x + 2} \\right) dx = 2\\ln|x + 1| + \\ln|x + 2| + C",
          status: "CORRECT",
          feedback: "Integración término a término impecable con valor absoluto y constante de integración.",
        },
      ],
    },
  },
  {
    id: "alg-lin-01",
    title: "Cálculo de Autovalores y Polinomio Característico",
    subject: "Álgebra Lineal",
    difficulty: "Fácil",
    statementLatex: "A = \\begin{pmatrix} 4 & 1 \\\\ 2 & 3 \\end{pmatrix}. \\quad \\text{Determinar los autovalores } \\lambda \\text{ resolviendo } \\det(A - \\lambda I) = 0.",
    estimatedMinutes: 12,
    defaultSampleImage: "/samples/sample_exam_algebra.svg",
    mockAudit: {
      finalScore: 5.0,
      maxScore: 5.0,
      diagnosisTitle: "Procedimiento Perfecto",
      summary: "Deducción matricial ejemplar. Planteamiento riguroso del determinante y factorización cuadrática sin errores.",
      completionPercentage: 100,
      isValidSubmission: true,
      pedagogicalRecommendation: "¡Dominio total! Puedes verificar rápidamente tus autovalores comprobando que su suma (5 + 2 = 7) coincide con la traza de A (4 + 3 = 7) y su producto (5 · 2 = 10) coincide con det(A) (12 - 2 = 10).",
      steps: [
        {
          stepNumber: 1,
          latexExpression: "\\det\\begin{pmatrix} 4 - \\lambda & 1 \\\\ 2 & 3 - \\lambda \\end{pmatrix} = 0",
          status: "CORRECT",
          feedback: "Planteamiento correcto de la ecuación característica det(A - λI) = 0.",
        },
        {
          stepNumber: 2,
          latexExpression: "(4 - \\lambda)(3 - \\lambda) - (1)(2) = 0",
          status: "CORRECT",
          feedback: "Desarrollo del determinante 2x2: producto de la diagonal principal menos la secundaria.",
        },
        {
          stepNumber: 3,
          latexExpression: "\\lambda^2 - 7\\lambda + 12 - 2 = 0 \\implies \\lambda^2 - 7\\lambda + 10 = 0",
          status: "CORRECT",
          feedback: "Polinomio característico simplificado correctamente.",
        },
        {
          stepNumber: 4,
          latexExpression: "(\\lambda - 5)(\\lambda - 2) = 0 \\implies \\lambda_1 = 5, \\quad \\lambda_2 = 2",
          status: "CORRECT",
          feedback: "Factorización cuadrática exacta: autovalores λ₁ = 5 y λ₂ = 2.",
        },
      ],
    },
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
