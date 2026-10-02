import { FeynmanTopic, ChatMessage, SubtopicScoreData } from "@/types/feynman";
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
  requiredConcepts: string[][]; // Cada grupo debe tener al menos una coincidencia para maestría (100%)
  partialConcepts?: string[];   // Conceptos que evidencian intuición parcial (50%)
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
        "fuerza de voluntad",
      ],
      reply:
        "¡Espera profe, me explotó la cabeza! Si los objetos se mueven solos sin fuerzas, ¿por qué tengo que empujar un auto cuando se queda sin batería? ¿No decía Newton que la fuerza neta es lo que causa aceleración?",
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
        "no sabia multiplicar",
      ],
      reply:
        "¡Pero profe, cómo va a decir que Newton no sabía multiplicar si inventó el cálculo! Y si un cohete quema toneladas de combustible, ¿cómo no va a perder masa y volverse más liviano mientras sube?",
    },
    {
      patterns: [
        "solo cuando se detienen",
        "se conserva solo al frenar",
        "se conservan solo al frenar",
        "al detenerse de repente",
        "cuando las cosas se detienen",
        "se transforma en calor",
        "momentum es lo mismo que la energia",
      ],
      reply:
        "¡Ay profe! ¿No está confundiendo el momentum con la energía al decir que se transforma en calor? Si algo frena hasta detenerse, ¿su velocidad y su momentum no se hacen cero en lugar de conservarse?",
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
        "¡Espera profe! Pero si el límite superior es x y esa frontera se va moviendo, ¿el área bajo la curva no va creciendo en función de x? ¿Por qué sería un número fijo?",
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
        "¡Espera profe! Si un vector se puede armar sumando los múltiplos de los otros dos, ¿no significa que es redundante y por lo tanto dependiente?",
    },
  ],
  "edo-separables": [
    {
      patterns: ["sumar en vez de multiplicar", "fraccion comun", "da igual separar"],
      reply:
        "¡Espera profe! Si en dy/dx las variables x e y están sumadas como x + y en vez de multiplicadas, ¿cómo las pasas dividiendo sin mezclar diferenciales? ¿No deben ser factorizables como producto g(x)*h(y)?",
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
      partialConcepts: ["masa", "inercia", "fuerza", "kilogramos", "peso"],
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
      partialConcepts: ["derivada", "cambio", "dp", "dt", "cohete", "tiempo"],
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
      partialConcepts: ["impulso", "fuerza", "tiempo", "integral", "choque"],
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
      partialConcepts: ["sistema", "aislado", "conserva", "choque", "externa"],
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
      partialConcepts: ["area", "acumulada", "limite", "x"],
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
      partialConcepts: ["inversa", "anulan", "derivada", "rectangulo"],
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
      partialConcepts: ["antiderivada", "barrow", "extremos"],
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
      partialConcepts: ["continua", "asintota", "salto"],
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
      partialConcepts: ["escalar", "sumar", "vector"],
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
      partialConcepts: ["independiente", "redundante", "cero"],
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
      partialConcepts: ["span", "generador", "espacio"],
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
      partialConcepts: ["base", "dimension", "coordenadas"],
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
      partialConcepts: ["factorizar", "producto", "g(x)"],
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
      partialConcepts: ["diferencial", "dx", "dy"],
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
      partialConcepts: ["constante", "c", "ambos lados"],
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
      partialConcepts: ["inicial", "particular", "c"],
    },
  ],
};

/**
 * Servicio Mock Inteligente con control de 3 intentos y avance automático.
 */
export class MockFeynmanService implements IFeynmanService {
  async sendMessage(
    topic: FeynmanTopic,
    history: ChatMessage[],
    studentInput: string,
    currentCoveredIds: string[],
    subtopicScores?: Record<string, SubtopicScoreData>,
    activeSubtopicId?: string
  ): Promise<FeynmanEvaluationResult> {
    await new Promise((res) => setTimeout(res, 500));

    const normalizedInput = studentInput
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    const validations = TOPIC_VALIDATIONS[topic.id] || [];

    // Determinar subconcepto activo
    const currentActive =
      activeSubtopicId ||
      topic.subtopics.find(
        (s) =>
          !currentCoveredIds.includes(s.id) &&
          subtopicScores?.[s.id]?.status !== "failed" &&
          subtopicScores?.[s.id]?.status !== "partial"
      )?.id ||
      topic.subtopics[0].id;

    const attemptsSoFar = (subtopicScores?.[currentActive]?.attempts || 0) + 1;

    // 1. EVALUAR DOMINIO MULTI-ÍTEM SIMULTÁNEO
    // Comprobar si el estudiante explicó con éxito uno o más subtemas en esta misma respuesta
    const newlyUnlockedIds: string[] = [];
    let multiItemAcknowledgment = "";

    for (const val of validations) {
      if (!currentCoveredIds.includes(val.subtopicId) && !newlyUnlockedIds.includes(val.subtopicId)) {
        const isMastered = val.requiredConcepts.every((group) =>
          group.some((term) => normalizedInput.includes(term))
        );
        if (isMastered) {
          newlyUnlockedIds.push(val.subtopicId);
          multiItemAcknowledgment += (multiItemAcknowledgment ? " Además, " : "") + val.acknowledgment;
        }
      }
    }

    // 2. DETECCIÓN DE FALACIAS EN EL TEMA ACTIVO
    const topicMisconceptions = TOPIC_MISCONCEPTIONS[topic.id] || [];
    let detectedMisconception: MisconceptionRule | undefined;

    for (const rule of topicMisconceptions) {
      const matches = rule.patterns.some((pattern) => {
        const norm = pattern.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return normalizedInput.includes(norm);
      });
      if (matches) {
        detectedMisconception = rule;
        break;
      }
    }

    // Buscar siguientes subtemas pendientes
    const alreadyEvaluated = (id: string) =>
      currentCoveredIds.includes(id) ||
      newlyUnlockedIds.includes(id) ||
      subtopicScores?.[id]?.status === "failed" ||
      subtopicScores?.[id]?.status === "partial";

    const nextPendingSubtopic = topic.subtopics.find((s) => s.id !== currentActive && !alreadyEvaluated(s.id));
    const nextValidation = validations.find((v) => v.subtopicId === nextPendingSubtopic?.id);

    const newlyPartialIds: string[] = [];
    const newlyFailedIds: string[] = [];
    let reply = "";
    let isSessionFinished = false;

    // CASO A: Hubo dominio de al menos un subtema
    if (newlyUnlockedIds.length > 0) {
      if (nextPendingSubtopic && nextValidation) {
        reply = `${multiItemAcknowledgment} Ahora cuéntame: ${nextValidation.question}`;
      } else {
        reply = `${multiItemAcknowledgment} ¡Guao, profe! Me quedó clarísimo todo el concepto de ${topic.title}. Conectaste cada definición matemática y física sin dejar vacíos lógicos. ¡Muchas gracias por enseñarme!`;
        isSessionFinished = true;
      }
    }
    // CASO B: Se alcanzó el límite de 3 intentos en el subtema activo sin lograr dominio completo
    else if (attemptsSoFar >= 3) {
      const activeVal = validations.find((v) => v.subtopicId === currentActive);
      const hasPartialKnowledge =
        !detectedMisconception &&
        activeVal?.partialConcepts?.some((c) => normalizedInput.includes(c));

      if (hasPartialKnowledge) {
        newlyPartialIds.push(currentActive);
      } else {
        newlyFailedIds.push(currentActive);
      }

      if (nextPendingSubtopic && nextValidation) {
        reply = `Mmm profe, veo que en este punto todavía nos quedamos un poco enredados, pero para no quedarnos atascados aquí, avancemos al siguiente tema: ${nextPendingSubtopic.name}. ${nextValidation.question}`;
      } else {
        reply =
          "Mmm profe, veo que en esta parte nos costó un poco aterrizar la teoría, pero hemos cubierto todo el temario. ¡Revisemos juntos nuestro balance pedagógico final!";
        isSessionFinished = true;
      }
    }
    // CASO C: Menos de 3 intentos y se detectó una falacia
    else if (detectedMisconception) {
      reply = detectedMisconception.reply;
    }
    // CASO D: Menos de 3 intentos, respuesta insuficiente pero no falaz
    else {
      const activeVal = validations.find((v) => v.subtopicId === currentActive);
      reply = `Mmm, entiendo en parte lo que dices, pero todavía no me queda del todo claro el fundamento físico. ${
        activeVal ? activeVal.question : "¿Podrías darme un ejemplo concreto?"
      }`;
    }

    // Cálculo ponderado del progreso
    const allMastered = Array.from(new Set([...currentCoveredIds, ...newlyUnlockedIds]));
    let scoreSum = 0;
    for (const s of topic.subtopics) {
      if (allMastered.includes(s.id)) {
        scoreSum += 100;
      } else if (newlyPartialIds.includes(s.id) || subtopicScores?.[s.id]?.status === "partial") {
        scoreSum += 50;
      }
    }
    const progress = topic.subtopics.length > 0 ? Math.round(scoreSum / topic.subtopics.length) : 0;

    return {
      reply,
      unlockedSubtopicIds: newlyUnlockedIds,
      partialSubtopicIds: newlyPartialIds,
      failedSubtopicIds: newlyFailedIds,
      nextActiveSubtopicId: nextPendingSubtopic?.id,
      isSessionFinished,
      detectedGaps: topic.subtopics.filter((s) => !allMastered.includes(s.id)).map((s) => s.name),
      masteryProgressPercentage: progress,
      engineUsed: "mock",
    };
  }
}

export const mockFeynmanService = new MockFeynmanService();
