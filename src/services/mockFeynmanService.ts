import { FeynmanTopic, ChatMessage } from "@/types/feynman";
import { IFeynmanService, FeynmanEvaluationResult } from "./types";

interface SocraticStage {
  subtopicId: string;
  question: string;
  acknowledgment: string;
  keywords: string[];
}

// Mapeo detallado de etapas socráticas por tema para el simulador local inteligente
const TOPIC_STAGES: Record<string, SocraticStage[]> = {
  "newton-momentum": [
    {
      subtopicId: "def-masa",
      question:
        "Espera un segundo... ¿la masa inercial y el peso son lo mismo? Si viajo a la Luna, ¿mi inercia cambia o solo mi peso?",
      acknowledgment:
        "¡Ah, perfecto! Ahora entiendo: la masa inercial mide la resistencia del cuerpo al cambio de movimiento y no depende del planeta, mientras que el peso es la fuerza gravitacional.",
      keywords: ["masa", "peso", "inercia", "gravedad", "luna", "fuerza", "resistencia", "cantidad", "materia"],
    },
    {
      subtopicId: "diferencial",
      question:
        "¡Ya veo! Pero entonces, ¿por qué Newton formuló la ley como el cambio de momentum dp/dt en lugar de simplemente F = m*a? ¿Qué pasa si la masa varía como en un cohete?",
      acknowledgment:
        "¡Guao, claro! Al derivar el producto p = m(t)*v(t) mediante la regla del producto, aparece la variación de masa dm/dt, por lo que F = m*a es solo un caso particular.",
      keywords: ["derivada", "diferencial", "cohete", "tiempo", "cambio", "producto", "constante", "variable", "dp/dt", "aceleracion"],
    },
    {
      subtopicId: "impulso",
      question:
        "¿Y qué relación tiene esa fuerza aplicada durante un instante breve de tiempo con el cambio de velocidad? ¿Cómo se conecta con la integral del impulso?",
      acknowledgment:
        "¡Entendido! El impulso J es la integral de la fuerza en el tiempo (el área bajo la curva F(t)), y equivale exactamente a la variación total de momentum Δp.",
      keywords: ["impulso", "integral", "tiempo", "area", "delta", "choque", "golpe", "instante", "fuerza", "acumula"],
    },
    {
      subtopicId: "conservacion",
      question:
        "¡Excelente! Y si dos patitos chocan en un estanque sin fricción, ¿por qué se dice que el momentum se conserva? ¿Qué condición de fuerzas externas debe cumplirse?",
      acknowledgment:
        "¡Impecable! Al no haber fuerzas externas netas en el sistema aislado, la derivada dp_total/dt es cero, lo que garantiza que el momentum se conserva.",
      keywords: ["conserva", "aislado", "externa", "cero", "friccion", "sistema", "neta", "constante", "choque", "colision"],
    },
  ],
  "calculo-ftc": [
    {
      subtopicId: "area-acumulada",
      question:
        "Espera, ¿la integral es un número fijo de área o es una función que cambia? ¿Por qué tiene una variable x en el límite superior?",
      acknowledgment:
        "¡Ah, ya capté! La función de acumulación F(x) = ∫_a^x f(t)dt mide el área acumulada desde a hasta una frontera móvil x.",
      keywords: ["area", "acumulada", "limite", "x", "funcion", "curva", "frontera", "movil", "riemann"],
    },
    {
      subtopicId: "relacion-inversa",
      question:
        "¿Y por qué la derivada del área acumulada F'(x) da exactamente la altura de la curva original f(x)? ¿Por qué derivar e integrar se anulan?",
      acknowledgment:
        "¡Guao, qué revelación! Al agrandar el intervalo en un ancho diminuto Δx, el área aumenta en un rectángulo de altura f(x)*Δx, y al dividir por Δx la derivada es justo f(x).",
      keywords: ["inversa", "pendiente", "anulan", "altura", "rectangulo", "tasa", "cambio", "operacion", "derivar"],
    },
    {
      subtopicId: "regla-barrow",
      question:
        "¿Y entonces para calcular un área de verdad no necesito hacer infinitos rectángulos de Riemann, sino solo buscar la antiderivada F(b) - F(a)?",
      acknowledgment:
        "¡Exacto! La Regla de Barrow (segunda parte del teorema) permite evaluar la integral definida con solo calcular los valores extremos de la antiderivada.",
      keywords: ["barrow", "antiderivada", "evaluar", "resta", "extremos", "limites", "primitiva", "riemann"],
    },
    {
      subtopicId: "continuidad",
      question:
        "¿Y qué pasaría si la función tuviera una asíntota vertical o un salto brusco en medio del intervalo? ¿Aún puedo aplicar el teorema?",
      acknowledgment:
        "¡Gran precisión! La función debe ser estrictamente continua en el intervalo cerrado [a, b]; si hay discontinuidades o asíntotas el teorema no aplica directamente.",
      keywords: ["continua", "asintota", "salto", "hueco", "cerrado", "intervalo", "discontinuidad", "condicion"],
    },
  ],
  "algebra-espacios": [
    {
      subtopicId: "comb-lineal",
      question:
        "¿Una combinación lineal es simplemente multiplicar vectores por números y sumarlos? ¿Para qué sirve eso?",
      acknowledgment:
        "¡Buen punto! Permite generar cualquier vector del espacio sumando múltiplos escalares de un conjunto inicial.",
      keywords: ["combinacion", "escalar", "multiplicar", "sumar", "ponderar", "vector", "espacio"],
    },
    {
      subtopicId: "independencia",
      question:
        "¿Y cómo sé si un vector es redundante o 'independiente'? ¿Qué significa que la única combinación que da el vector cero sea con coeficientes cero?",
      acknowledgment:
        "¡Entendido! Si son linealmente independientes, ningún vector se puede escribir a partir de los demás; no hay vectores redundantes en el conjunto.",
      keywords: ["independiente", "dependiente", "cero", "redundante", "trivial", "coeficiente", "sobra"],
    },
    {
      subtopicId: "generador",
      question:
        "¿Y qué diferencia hay entre el conjunto 'generador' (Span) y que los vectores sean independientes?",
      acknowledgment:
        "¡Claro! El generador abarca todo el espacio que se puede alcanzar, mientras que la independencia garantiza que lo hacemos sin desperdiciar vectores.",
      keywords: ["span", "generador", "alcanzar", "cubrir", "espacio", "diferencia", "conjunto"],
    },
    {
      subtopicId: "base-dimension",
      question:
        "¡Ah! ¿Y una base es el punto perfecto entre generar todo el espacio y ser independiente? ¿Por eso la dimensión de R^3 es 3?",
      acknowledgment:
        "¡Exacto! Una base es un conjunto generador mínimo y la dimensión es la cantidad de vectores indispensables que la componen.",
      keywords: ["base", "dimension", "minimo", "coordenadas", "r3", "r2", "ejes"],
    },
  ],
  "edo-separables": [
    {
      subtopicId: "factorizacion-edo",
      question:
        "¿Cómo sé si una ecuación diferencial dy/dx es separable? ¿Qué forma debe tener la función f(x, y)?",
      acknowledgment:
        "¡Bien definido! Debe ser factorizable como el producto de una función que solo depende de x por otra que solo depende de y: g(x)*h(y).",
      keywords: ["factorizar", "producto", "multiplicar", "forma", "separar", "g(x)", "h(y)"],
    },
    {
      subtopicId: "separacion-algebraica",
      question:
        "¿Y es matemáticamente válido 'pasar el dx multiplicando' al otro lado como si fuera una fracción común?",
      acknowledgment:
        "¡Gran aclaración! Rigurosamente se trata de una integración por sustitución implícita con diferenciales, aunque algebraicamente coincida con agrupar dy y dx en lados opuestos.",
      keywords: ["diferencial", "dx", "dy", "fraccion", "lados", "despejar", "pasar", "multiplicar"],
    },
    {
      subtopicId: "integracion-ambos",
      question:
        "¿Y al integrar ambos miembros, por qué no pongo una constante a la izquierda y otra a la derecha?",
      acknowledgment:
        "¡Totalmente claro! Ambas constantes arbitrarias se pueden restar y agrupar en una única constante general C.",
      keywords: ["integrar", "constante", "ambos", "lados", "agrupar", "c", "miembros"],
    },
    {
      subtopicId: "constante-solucion",
      question:
        "¿Y si me dan un valor inicial como y(0) = 5, qué le pasa a esa constante C?",
      acknowledgment:
        "¡Excelente! Ese dato inicial fija el valor numérico exacto de C, transformando la solución general en una solución particular única.",
      keywords: ["inicial", "particular", "general", "condicion", "despejar", "fijar", "valor"],
    },
  ],
};

/**
 * Servicio Mock para Feynman Oral.
 * Implementa una máquina de conversación contextual que:
 * 1. Recuerda todo el historial y NUNCA repite preguntas ya formuladas.
 * 2. Reconoce y valida las respuestas del estudiante a la pregunta anterior.
 * 3. Avanza progresivamente por los subconceptos desbloqueándolos en tiempo real.
 */
export class MockFeynmanService implements IFeynmanService {
  async sendMessage(
    topic: FeynmanTopic,
    history: ChatMessage[],
    studentInput: string,
    currentCoveredIds: string[]
  ): Promise<FeynmanEvaluationResult> {
    // Simular un retardo natural de reflexión (550ms)
    await new Promise((res) => setTimeout(res, 550));

    const normalizedInput = studentInput
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    const stages = TOPIC_STAGES[topic.id] || [];

    // 1. Obtener todas las preguntas que Quack ya ha hecho en la conversación
    const previousQuackQuestions = history
      .filter((m) => m.sender === "quack")
      .map((m) => m.text);

    // 2. Determinar cuál fue la última pregunta de Quack
    const lastQuackMessage = [...history].reverse().find((m) => m.sender === "quack");

    let acknowledgment = "";
    const newUnlockedIds: string[] = [];

    // 3. Evaluar si el estudiante respondió a la última pregunta formulada
    if (lastQuackMessage) {
      const activeStage = stages.find((st) => lastQuackMessage.text.includes(st.question.slice(0, 30)));
      if (activeStage && !currentCoveredIds.includes(activeStage.subtopicId)) {
        // El estudiante estuvo respondiendo a esta etapa
        newUnlockedIds.push(activeStage.subtopicId);
        acknowledgment = activeStage.acknowledgment;
      }
    }

    // 4. Si el estudiante mencionó palabras de otras etapas no cubiertas aún
    for (const stage of stages) {
      if (!currentCoveredIds.includes(stage.subtopicId) && !newUnlockedIds.includes(stage.subtopicId)) {
        const hasKeyword = stage.keywords.some((kw) => normalizedInput.includes(kw));
        if (hasKeyword) {
          newUnlockedIds.push(stage.subtopicId);
          if (!acknowledgment) {
            acknowledgment = stage.acknowledgment;
          }
        }
      }
    }

    const allCovered = Array.from(new Set([...currentCoveredIds, ...newUnlockedIds]));

    // 5. Buscar la siguiente etapa pendiente que NUNCA haya sido formulada
    const pendingStage = stages.find(
      (st) =>
        !allCovered.includes(st.subtopicId) &&
        !previousQuackQuestions.some((pq) => pq.includes(st.question.slice(0, 30)))
    );

    let nextQuestion = "";

    if (pendingStage) {
      nextQuestion = pendingStage.question;
    } else {
      // Si todas las etapas del temario están cubiertas
      if (allCovered.length >= topic.subtopics.length) {
        const finalReply = acknowledgment
          ? `${acknowledgment} ¡Guao, profe! Me quedó clarísimo todo el concepto de ${topic.title}. Conectaste cada definición matemática y física sin dejar vacíos lógicos. ¡Muchas gracias por enseñarme!`
          : `¡Guao, ahora sí lo entendí todo a la perfección! Has explicado cada aspecto del concepto sin dejar cabos sueltos. ¡Siento que lo dominas al 100%!`;

        return {
          reply: finalReply,
          unlockedSubtopicIds: newUnlockedIds,
          detectedGaps: [],
          masteryProgressPercentage: 100,
        };
      } else {
        // Encontrar algún subtema del topic que falte
        const missingSub = topic.subtopics.find((s) => !allCovered.includes(s.id));
        if (missingSub) {
          nextQuestion = `¿Y cómo explicarías la parte de "${missingSub.name}"? Siento que aún no me queda del todo claro ese detalle.`;
        }
      }
    }

    // Si hubo reconocimiento de la respuesta anterior, ensamblamos acknowledge + nueva pregunta
    let reply = "";
    if (acknowledgment && nextQuestion) {
      reply = `${acknowledgment} ${nextQuestion}`;
    } else if (nextQuestion) {
      reply = nextQuestion;
    } else {
      reply =
        "¡Entendido! Lo que acabas de explicar tiene mucho sentido. ¿Podrías darme un último ejemplo cotidiano para rematar la idea?";
    }

    const totalSubtopics = topic.subtopics.length;
    const progress = totalSubtopics > 0 ? Math.round((allCovered.length / totalSubtopics) * 100) : 100;
    const detectedGaps = topic.subtopics.filter((s) => !allCovered.includes(s.id)).map((s) => s.name);

    return {
      reply,
      unlockedSubtopicIds: newUnlockedIds,
      detectedGaps,
      masteryProgressPercentage: progress,
    };
  }
}

export const mockFeynmanService = new MockFeynmanService();
