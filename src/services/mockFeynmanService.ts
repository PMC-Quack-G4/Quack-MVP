import { FeynmanTopic, ChatMessage } from "@/types/feynman";
import { IFeynmanService, FeynmanEvaluationResult } from "./types";

interface MisconceptionRule {
  patterns: string[];
  reply: string;
}

interface SocraticSubtopicValidation {
  subtopicId: string;
  name: string;
  question: string;
  acknowledgment: string;
  requiredConcepts: string[][]; // Cada grupo debe tener al menos una coincidencia
}

// Reglas pedagógicas de detección de errores comunes por tema
const TOPIC_MISCONCEPTIONS: Record<string, MisconceptionRule[]> = {
  "newton-momentum": [
    {
      patterns: [
        "se mueven solos",
        "sin fuerza",
        "sin fuerzas",
        "no necesitan fuerza",
        "no necesita fuerza",
        "sin necesidad de fuerza",
        "sin necesidad de fuerzas",
      ],
      reply:
        "¡Espera profe, me dejaste súper confundida! Si los objetos se movieran solos sin fuerzas, ¿por qué tengo que empujar un mueble pesado para moverlo? ¿No decía Newton que la fuerza neta es justamente lo que cambia el movimiento?",
    },
    {
      patterns: [
        "por moda",
        "moda historica",
        "la masa no cambia",
        "masa de un cohete no cambia",
        "combustible sigue pesando",
        "combustible no cambia",
        "pesando lo mismo",
      ],
      reply:
        "¡Espera un momento profe! ¿Cómo que la masa de un cohete no cambia mientras vuela? ¡Pero si va expulsando y quemando toneladas de combustible cada segundo! Si la masa varía con el tiempo, ¿de verdad da lo mismo usar F = m·a que dp/dt?",
    },
    {
      patterns: [
        "solo cuando se detienen",
        "se conserva solo al frenar",
        "se conservan solo al frenar",
        "al detenerse de repente",
        "cuando las cosas se detienen",
      ],
      reply:
        "¡Ay profe! Pero si algo se frena de golpe, ¿su velocidad y su momentum no se van a cero? ¿Cómo se va a conservar el momentum solo al detenerse? ¿No dependía más bien de que no hubiera fuerzas externas netas sobre el sistema?",
    },
    {
      patterns: [
        "masa y peso son lo mismo",
        "es lo mismo masa y peso",
        "inercia cambia en la luna",
        "masa cambia en la luna",
      ],
      reply:
        "¡Mmm, espera profe! ¿Seguro que la masa y el peso son lo mismo? Si viajo a la Luna, ¿mi masa inercial también cambia o solo cambia la atracción gravitacional de la balanza?",
    },
  ],
  "calculo-ftc": [
    {
      patterns: ["numero fijo", "no es una funcion", "no cambia", "solo un numero"],
      reply:
        "¡Espera profe! Pero si el límite superior es x y esa frontera se va moviendo hacia la derecha, ¿el área bajo la curva no va creciendo o cambiando en función de x? ¿Por qué sería un número fijo?",
    },
    {
      patterns: [
        "no importa la continuidad",
        "da igual si hay saltos",
        "asintota da igual",
        "aunque se rompa",
      ],
      reply:
        "¡Cuidado profe! ¿Y qué pasa si la función se dispara al infinito o tiene un salto brusco en medio del intervalo? ¿El Teorema Fundamental sigue siendo válido si la curva no es continua?",
    },
  ],
  "algebra-espacios": [
    {
      patterns: [
        "sobra y es independiente",
        "da igual si sobra",
        "redundantes son independientes",
        "sumando los otros da independiente",
      ],
      reply:
        "¡Espera profe! Si un vector se puede armar sumando los múltiplos de los otros dos, ¿no significa que es redundante y por lo tanto dependiente? ¿Cómo va a ser independiente si no aporta una dirección nueva?",
    },
  ],
  "edo-separables": [
    {
      patterns: ["sumar en vez de multiplicar", "fraccion comun", "da igual separar"],
      reply:
        "¡Espera profe! Si en dy/dx las variables x e y están sumadas como x + y en vez de multiplicadas, ¿cómo las pasas dividiendo a lados contrarios sin mezclar diferenciales? ¿No deben ser factorizables como producto g(x)*h(y)?",
    },
  ],
};

// Criterios pedagógicos rigurosos para validar cada subconcepto
const TOPIC_VALIDATIONS: Record<string, SocraticSubtopicValidation[]> = {
  "newton-momentum": [
    {
      subtopicId: "def-masa",
      name: "Definición de masa inercial y momentum",
      question:
        "Espera un segundo... ¿la masa inercial y el peso son lo mismo? Si viajo a la Luna, ¿mi inercia cambia o solo mi peso? ¿Cómo definirías la inercia con tus palabras?",
      acknowledgment:
        "¡Ah, perfecto! Ahora entiendo: la masa inercial mide la resistencia del cuerpo al cambio de movimiento y no depende del planeta, mientras que el peso es la fuerza gravitacional.",
      requiredConcepts: [
        ["resistencia", "inercia", "oponerse", "cuesta mover"],
        ["peso", "gravedad", "fuerza gravitacional", "planeta", "luna", "atraccion"],
      ],
    },
    {
      subtopicId: "diferencial",
      name: "Formulación diferencial dp/dt vs F = m*a",
      question:
        "¡Ya veo! Pero entonces, ¿por qué Newton formuló la ley como el cambio de momentum dp/dt en lugar de simplemente F = m*a? ¿Qué pasa si la masa varía en el tiempo como en un cohete?",
      acknowledgment:
        "¡Guao, claro! Al derivar el producto p = m(t)*v(t) aparece la variación de masa dm/dt, por lo que F = m*a es solo el caso particular donde la masa es constante.",
      requiredConcepts: [
        ["dp/dt", "derivada", "cambio de momentum", "producto", "regla del producto"],
        ["varia", "variable", "cambia con el tiempo", "dm/dt", "cohete", "combustible", "constante"],
      ],
    },
    {
      subtopicId: "impulso",
      name: "Teorema del Impulso Integral",
      question:
        "¿Y qué relación tiene esa fuerza aplicada durante un lapso de tiempo con el cambio de velocidad? ¿Cómo se conecta con la integral del impulso?",
      acknowledgment:
        "¡Entendido! El impulso J es la integral de la fuerza en el tiempo (el área bajo la curva F(t)), y equivale exactamente a la variación total de momentum Δp.",
      requiredConcepts: [
        ["impulso", "j", "area"],
        ["integral", "tiempo", "delta p", "variacion de momentum", "cambio de velocidad"],
      ],
    },
    {
      subtopicId: "conservacion",
      name: "Conservación en sistemas aislados",
      question:
        "¡Excelente! Y si dos patitos chocan en un estanque sin fricción, ¿por qué se dice que el momentum se conserva? ¿Qué condición de fuerzas externas debe cumplirse?",
      acknowledgment:
        "¡Impecable! Al no haber fuerzas externas netas en el sistema aislado, la derivada del momentum total respecto al tiempo es cero, por lo que se conserva constante.",
      requiredConcepts: [
        ["aislado", "externas", "fuerza externa", "neta cero", "sin friccion"],
        ["conserva", "constante", "igual", "mismo momentum", "cero"],
      ],
    },
  ],
  "calculo-ftc": [
    {
      subtopicId: "area-acumulada",
      name: "Función de Acumulación",
      question:
        "Espera, ¿la integral es un número fijo de área o es una función que cambia? ¿Por qué tiene una variable x en el límite superior?",
      acknowledgment:
        "¡Ah, ya capté! La función de acumulación F(x) = ∫_a^x f(t)dt mide el área acumulada desde a hasta una frontera móvil x.",
      requiredConcepts: [
        ["acumula", "acumulada", "movil", "cambia", "frontera"],
        ["funcion", "limite", "x", "limite superior"],
      ],
    },
    {
      subtopicId: "relacion-inversa",
      name: "Derivada del Área Acumulada",
      question:
        "¿Y por qué la derivada del área acumulada F'(x) da exactamente la altura de la curva original f(x)? ¿Por qué derivar e integrar se anulan?",
      acknowledgment:
        "¡Guao, qué revelación! Al agrandar el intervalo en un ancho diminuto Δx, el área aumenta en un rectángulo de altura f(x)*Δx, y al dividir por Δx la derivada es justo f(x).",
      requiredConcepts: [
        ["inversa", "anulan", "operacion inversa", "rectangulo", "altura"],
        ["f(x)", "derivada", "tasa de cambio"],
      ],
    },
    {
      subtopicId: "regla-barrow",
      name: "Evaluación por Primitiva (Barrow)",
      question:
        "¿Y entonces para calcular un área de verdad no necesito hacer infinitos rectángulos de Riemann, sino solo buscar la antiderivada F(b) - F(a)?",
      acknowledgment:
        "¡Exacto! La Regla de Barrow permite evaluar la integral definida con solo calcular los valores extremos de la antiderivada.",
      requiredConcepts: [
        ["barrow", "antiderivada", "primitiva"],
        ["f(b) - f(a)", "extremos", "limites", "resta"],
      ],
    },
    {
      subtopicId: "continuidad",
      name: "Hipótesis de Continuidad",
      question:
        "¿Y qué pasaría si la función tuviera una asíntota vertical o un salto brusco en medio del intervalo? ¿Aún puedo aplicar el teorema?",
      acknowledgment:
        "¡Gran precisión! La función debe ser estrictamente continua en el intervalo cerrado [a, b]; si hay discontinuidades el teorema no aplica directamente.",
      requiredConcepts: [
        ["continua", "continuidad"],
        ["intervalo", "cerrado", "asintota", "salto", "discontinuidad"],
      ],
    },
  ],
  "algebra-espacios": [
    {
      subtopicId: "comb-lineal",
      name: "Combinaciones Lineales",
      question:
        "¿Una combinación lineal es simplemente multiplicar vectores por números y sumarlos? ¿Para qué sirve eso?",
      acknowledgment:
        "¡Buen punto! Permite generar cualquier vector del espacio sumando múltiplos escalares de un conjunto inicial.",
      requiredConcepts: [
        ["escalar", "multiplicar", "ponderar"],
        ["sumar", "vectores", "espacio"],
      ],
    },
    {
      subtopicId: "independencia",
      name: "Independencia Lineal",
      question:
        "¿Y cómo sé si un vector es redundante o 'independiente'? ¿Qué significa que la única combinación que da el vector cero sea con coeficientes cero?",
      acknowledgment:
        "¡Entendido! Si son linealmente independientes, ningún vector se puede escribir como combinación de los demás; no hay vectores redundantes.",
      requiredConcepts: [
        ["independiente", "redundante", "sobra", "combinacion"],
        ["cero", "trivial", "coeficiente"],
      ],
    },
    {
      subtopicId: "generador",
      name: "Conjuntos Generadores (Span)",
      question:
        "¿Y qué diferencia hay entre el conjunto 'generador' (Span) y que los vectores sean independientes?",
      acknowledgment:
        "¡Claro! El generador abarca todo el espacio que se puede alcanzar, mientras que la independencia garantiza que lo hacemos sin desperdiciar vectores.",
      requiredConcepts: [
        ["span", "generador", "alcanzar", "cubrir"],
        ["espacio", "diferencia"],
      ],
    },
    {
      subtopicId: "base-dimension",
      name: "Bases y Dimensión",
      question:
        "¡Ah! ¿Y una base es el punto perfecto entre generar todo el espacio y ser independiente? ¿Por eso la dimensión de R^3 es 3?",
      acknowledgment:
        "¡Exacto! Una base es un conjunto generador linealmente independiente y la dimensión es la cantidad de vectores indispensables que la componen.",
      requiredConcepts: [
        ["base", "dimension"],
        ["minimo", "coordenadas", "r3", "independiente"],
      ],
    },
  ],
  "edo-separables": [
    {
      subtopicId: "factorizacion-edo",
      name: "Identificación de la Estructura Separable",
      question:
        "¿Cómo sé si una ecuación diferencial dy/dx es separable? ¿Qué forma debe tener la función f(x, y)?",
      acknowledgment:
        "¡Bien definido! Debe ser factorizable como el producto de una función que solo depende de x por otra que solo depende de y: g(x)*h(y).",
      requiredConcepts: [
        ["factorizar", "producto", "multiplicar"],
        ["x", "y", "g(x)", "h(y)"],
      ],
    },
    {
      subtopicId: "separacion-algebraica",
      name: "Separación Algebraica de Diferenciales",
      question:
        "¿Y es matemáticamente válido 'pasar el dx multiplicando' al otro lado como si fuera una fracción común?",
      acknowledgment:
        "¡Gran aclaración! Rigurosamente se trata de una integración por sustitución implícita con diferenciales, aunque algebraicamente coincida con agrupar dy y dx en lados opuestos.",
      requiredConcepts: [
        ["diferencial", "dx", "dy"],
        ["sustitucion", "lados", "fraccion", "separar"],
      ],
    },
    {
      subtopicId: "integracion-ambos",
      name: "Integración de Ambos Miembros y Constante C",
      question:
        "¿Y al integrar ambos miembros, por qué no pongo una constante a la izquierda y otra a la derecha?",
      acknowledgment:
        "¡Totalmente claro! Ambas constantes arbitrarias se pueden restar y agrupar en una única constante general C.",
      requiredConcepts: [
        ["constante", "c", "arbitraria"],
        ["agrupar", "ambos lados", "restar", "una sola"],
      ],
    },
    {
      subtopicId: "constante-solucion",
      name: "Valor Inicial y Solución Particular",
      question:
        "¿Y si me dan un valor inicial como y(0) = 5, qué le pasa a esa constante C?",
      acknowledgment:
        "¡Excelente! Ese dato inicial fija el valor numérico exacto de C, transformando la solución general en una solución particular única.",
      requiredConcepts: [
        ["inicial", "particular", "general"],
        ["valor", "fijar", "despejar", "c"],
      ],
    },
  ],
};

/**
 * Servicio Mock Inteligente y Riguroso para Feynman Oral.
 * - Detecta falacias, errores físicos y afirmaciones absurdas mostrando perplejidad socrática.
 * - NUNCA desbloquea subconceptos ante respuestas erróneas o insuficientes.
 * - Solo otorga progreso cuando el estudiante explica con conceptos físicos válidos.
 */
export class MockFeynmanService implements IFeynmanService {
  async sendMessage(
    topic: FeynmanTopic,
    history: ChatMessage[],
    studentInput: string,
    currentCoveredIds: string[]
  ): Promise<FeynmanEvaluationResult> {
    // Simular un tiempo breve de reflexión natural
    await new Promise((res) => setTimeout(res, 500));

    const normalizedInput = studentInput
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    // 1. PASO CRÍTICO: DETECTAR ERRORES O FALACIAS CONCEPTUALES
    const topicMisconceptions = TOPIC_MISCONCEPTIONS[topic.id] || [];
    for (const rule of topicMisconceptions) {
      const matchesMisconception = rule.patterns.some((pattern) => {
        const normPattern = pattern
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");
        return normalizedInput.includes(normPattern);
      });

      if (matchesMisconception) {
        // Encontró una falacia: Quack muestra confusión y NO DESBLOQUEA NADA
        const allCovered = currentCoveredIds;
        const progress = Math.round((allCovered.length / topic.subtopics.length) * 100);
        return {
          reply: rule.reply,
          unlockedSubtopicIds: [],
          detectedGaps: topic.subtopics.filter((s) => !allCovered.includes(s.id)).map((s) => s.name),
          masteryProgressPercentage: progress,
          engineUsed: "mock",
        };
      }
    }

    // 2. EVALUAR SI EL ESTUDIANTE EXPLICÓ CORRECTAMENTE ALGÚN SUBCONCEPTO PENDIENTE
    const validations = TOPIC_VALIDATIONS[topic.id] || [];
    const newUnlockedIds: string[] = [];
    let acknowledgment = "";

    // Evaluar primero el subconcepto correspondiente a la última pregunta formulada por Quack
    const lastQuackMessage = [...history].reverse().find((m) => m.sender === "quack");
    let activeValidation: SocraticSubtopicValidation | undefined;

    if (lastQuackMessage) {
      activeValidation = validations.find((v) =>
        lastQuackMessage.text.toLowerCase().includes(v.subtopicId.toLowerCase()) ||
        v.question.slice(0, 25).toLowerCase().includes(lastQuackMessage.text.slice(0, 25).toLowerCase()) ||
        lastQuackMessage.text.includes(v.question.slice(0, 30))
      );
    }

    // Si no identificamos la etapa por la última pregunta, tomar la primera no cubierta
    if (!activeValidation) {
      activeValidation = validations.find((v) => !currentCoveredIds.includes(v.subtopicId));
    }

    if (activeValidation && !currentCoveredIds.includes(activeValidation.subtopicId)) {
      // Verificar si cumple TODOS los grupos de conceptos requeridos
      const meetsAllRequirements = activeValidation.requiredConcepts.every((conceptGroup) =>
        conceptGroup.some((concept) => normalizedInput.includes(concept))
      );

      if (meetsAllRequirements) {
        newUnlockedIds.push(activeValidation.subtopicId);
        acknowledgment = activeValidation.acknowledgment;
      }
    }

    const allCovered = Array.from(new Set([...currentCoveredIds, ...newUnlockedIds]));

    // 3. BUSCAR LA SIGUIENTE PREGUNTA SOCRÁTICA PENDIENTE
    const pendingValidation = validations.find((v) => !allCovered.includes(v.subtopicId));

    let reply = "";

    if (newUnlockedIds.length === 0) {
      // El estudiante no cometió una falacia explícita, pero su respuesta fue vaga o insuficiente
      if (pendingValidation) {
        reply = `Mmm, entiendo lo que dices a grandes rasgos, pero siento que me falta ver el porqué físico. ${pendingValidation.question}`;
      } else {
        reply =
          "Entendido, pero ¿podrías darme un ejemplo concreto de cómo se aplicaría esto en la vida real para estar 100% segura?";
      }
    } else if (allCovered.length >= topic.subtopics.length) {
      // Logró explicar satisfactoriamente TODOS los subconceptos
      reply = `${acknowledgment} ¡Guao, profe! Me quedó clarísimo todo el concepto de ${topic.title}. Conectaste cada definición matemática y física sin dejar vacíos lógicos. ¡Muchas gracias por enseñarme!`;
    } else if (pendingValidation) {
      // Desbloqueó este subconcepto y Quack formula la siguiente duda socrática
      reply = `${acknowledgment} ${pendingValidation.question}`;
    } else {
      reply = `${acknowledgment} ¡Excelente! Siento que ahora tengo una intuición mucho más clara de este tema.`;
    }

    const totalSubtopics = topic.subtopics.length;
    const progress = totalSubtopics > 0 ? Math.round((allCovered.length / totalSubtopics) * 100) : 100;
    const detectedGaps = topic.subtopics.filter((s) => !allCovered.includes(s.id)).map((s) => s.name);

    return {
      reply,
      unlockedSubtopicIds: newUnlockedIds,
      detectedGaps,
      masteryProgressPercentage: progress,
      engineUsed: "mock",
    };
  }
}

export const mockFeynmanService = new MockFeynmanService();
