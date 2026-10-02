import { GoogleGenAI } from "@google/genai";
import { FeynmanTopic, ChatMessage, SubtopicScoreData } from "@/types/feynman";
import { IFeynmanService, FeynmanEvaluationResult } from "./types";
import { getActiveModel } from "./serviceFactory";

/**
 * Función auxiliar para reintentar llamadas ante errores transitorios (503 / 429) con backoff exponencial.
 */
async function callWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelayMs = 1200
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      lastError = err;
      const apiErr = err as { status?: number; message?: string };
      const isRetryable =
        apiErr?.status === 503 ||
        apiErr?.status === 429 ||
        apiErr?.message?.includes("503") ||
        apiErr?.message?.includes("429") ||
        apiErr?.message?.includes("high demand") ||
        apiErr?.message?.includes("RESOURCE_EXHAUSTED") ||
        apiErr?.message?.includes("UNAVAILABLE");

      if (isRetryable && attempt < maxRetries) {
        const delay = baseDelayMs * attempt;
        console.warn(`[Gemini API] Error transitorio (${apiErr.status || 503}). Reintento ${attempt}/${maxRetries} en ${delay}ms...`);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

/**
 * Servicio Feynman conectado a Google Gemini API mediante el SDK oficial @google/genai.
 * Implementa límite de 3 intentos por subtema con transición automática para no estancarse,
 * soporte para dominio multi-ítem en un solo turno y puntuación graduada (100%, 50%, 0%).
 */
export class GeminiFeynmanService implements IFeynmanService {
  private getClient(): GoogleGenAI | null {
    const key = (import.meta.env.VITE_GEMINI_API_KEY as string)?.trim();
    if (!key) return null;
    try {
      return new GoogleGenAI({ apiKey: key });
    } catch (err) {
      console.warn("Error al inicializar GoogleGenAI SDK:", err);
      return null;
    }
  }

  async sendMessage(
    topic: FeynmanTopic,
    history: ChatMessage[],
    studentInput: string,
    currentCoveredIds: string[],
    subtopicScores?: Record<string, SubtopicScoreData>,
    activeSubtopicId?: string
  ): Promise<FeynmanEvaluationResult> {
    const client = this.getClient();
    if (!client) {
      throw new Error("No hay API Key de Gemini configurada en VITE_GEMINI_API_KEY.");
    }

    // Determinar el subconcepto en evaluación activa y el número de intentos que lleva
    const currentActive =
      activeSubtopicId ||
      topic.subtopics.find((s) => !currentCoveredIds.includes(s.id) && subtopicScores?.[s.id]?.status !== "failed" && subtopicScores?.[s.id]?.status !== "partial")?.id ||
      topic.subtopics[0].id;

    const attemptsSoFar = (subtopicScores?.[currentActive]?.attempts || 0) + 1;

    const subtopicsList = topic.subtopics
      .map((s) => {
        const score = subtopicScores?.[s.id];
        const statusText = score
          ? `${score.status.toUpperCase()} (${score.score}%)`
          : currentCoveredIds.includes(s.id)
          ? "MASTERED (100%)"
          : "PENDING";
        const isCurrent = s.id === currentActive;
        return `- ID: "${s.id}" | Nombre: "${s.name}" | Descripción: "${s.description || ""}" | Estado actual: ${statusText} ${
          isCurrent ? `[SUBCONCEPTO EN EVALUACIÓN ACTIVA - INTENTO ${attemptsSoFar} DE 3]` : ""
        }`;
      })
      .join("\n");

    const systemInstruction = `
Eres Quack, una estudiante de ingeniería curiosa y un poco despistada ("alumna curiosa").
Tu objetivo NO es evaluar como docente ni enseñar, sino aprender: el usuario es tu profesor y debe explicarte el concepto con sus propias palabras.

Tema de la sesión: "${topic.title}" (${topic.category}).
Contexto pedagógico del tema: ${topic.promptContext}

Subconceptos del temario oficial:
${subtopicsList}

REGLAS DE ORO OBLIGATORIAS:
1. ROL Y TONO: Eres una alumna simpática, informal y curiosa en español latinoamericano. NUNCA des la respuesta correcta ni expliques el tema por tu cuenta.
2. DETECCIÓN RIGUROSA DE ERRORES Y FALACIAS:
   - Si el estudiante dice cosas erróneas, absurdas, contradictorias o inventadas (por ejemplo: que las cosas se mueven solas sin fuerzas, que la masa de un cohete no cambia, que Newton formuló algo por moda, que el momentum solo se conserva al frenar, etc.), NUNCA lo felicites ni aceptes su error.
   - Reacciona con perplejidad e incredulidad socrática como alumna confundida.
3. DOMINIO MULTI-ÍTEM EN UNA SOLA RESPUESTA (IMPORTANTE):
   - Si el estudiante en su explicación verbaliza con claridad y rigor conceptual más de un subconcepto del temario oficial a la vez, incluye TODOS los IDs dominados en "unlockedSubtopicIds" (100%). No lo obligues a responder preguntas redundantes para subconceptos que ya demostró dominar con claridad.
4. REGLA ESTRICTA DE MÁXIMO 3 INTENTOS Y TRANSICIÓN (EVITAR ESTANCAMIENTO):
   - El subconcepto en evaluación activa es "${currentActive}". Este es su intento ${attemptsSoFar} de 3.
   - Si en este intento el estudiante domina el concepto con éxito: agrégalo a "unlockedSubtopicIds".
   - Si el estudiante NO logró explicarlo bien y este es su intento 3 (o insiste en el error tras 3 preguntas):
     * NO continúes preguntando sobre este mismo subconcepto para evitar conversaciones infinitas.
     * Si demostró cierta intuición o entendimiento medio (50%): agrégalo a "partialSubtopicIds".
     * Si no demostró nada válido, fue erróneo o disparatado (0%): agrégalo a "failedSubtopicIds".
     * En "quackReply", concluye con amabilidad tu duda y HAZ UNA TRANSICIÓN DIRECTA hacia el siguiente subtema pendiente (ej: "Mmm profe, veo que en este punto no nos pusimos de acuerdo, pero para no quedarnos atascados, pasemos al siguiente tema: [nombre nuevo tema]. ¿Cómo me explicarías [pregunta del nuevo tema]?").
     * Asigna a "nextActiveSubtopicId" el ID del siguiente subtema pendiente.
5. FINALIZACIÓN DE SESIÓN:
   - Si todos los subtemas del temario ya quedaron evaluados (bien sea en 100%, 50% o 0%), o el estudiante dominó todos los conceptos, concluye agradeciendo a tu profe y pon "isSessionFinished": true.
6. BREVEDAD: Máximo 2 a 3 oraciones cortas (para que la síntesis de voz TTS sea ágil).

FORMATO DE SALIDA ESTRICTO (JSON):
Debes responder ÚNICAMENTE con un objeto JSON válido con esta estructura:
{
  "quackReply": "Tu reacción socrática o tu transición fluida al siguiente tema (2-3 oraciones)",
  "unlockedSubtopicIds": ["id-del-subtema-dominado-100%"],
  "partialSubtopicIds": ["id-del-subtema-con-dominio-medio-50%"],
  "failedSubtopicIds": ["id-del-subtema-no-dominado-0%"],
  "nextActiveSubtopicId": "id-del-siguiente-subtema-a-evaluar",
  "isSessionFinished": false
}
`;

    // Formatear historial multi-turno con alternancia estricta
    const formattedContents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];

    const recentHistory = history.slice(-8);
    for (const msg of recentHistory) {
      formattedContents.push({
        role: msg.sender === "student" ? "user" : "model",
        parts: [{ text: msg.text }],
      });
    }

    formattedContents.push({
      role: "user",
      parts: [
        {
          text: `El estudiante (profesor) responde:\n"${studentInput}"\n\nRecuerda: Subconcepto activo "${currentActive}" (Intento ${attemptsSoFar}/3). Si falló por 3a vez, asigna 0% o 50% y pasa al siguiente tema. Si explicó múltiples temas a la vez, desbloquéalos. Responde en JSON.`,
        },
      ],
    });

    // Cascada ordenada de modelos compatibles
    const primaryModel = getActiveModel();
    const candidateModels = Array.from(
      new Set([
        primaryModel,
        "gemini-flash-latest",
        "gemini-3.8-flash",
        "gemini-3.7-flash",
        "gemini-3.6-flash",
        "gemini-3.5-flash",
      ])
    ).filter(Boolean);

    let responseText = "";
    let lastError: unknown = null;

    for (const model of candidateModels) {
      try {
        const response = await callWithRetry(() =>
          client.models.generateContent({
            model,
            contents: formattedContents,
            config: {
              systemInstruction,
              temperature: 0.7,
            },
          })
        );
        responseText = response.text || "";
        if (responseText) {
          break;
        }
      } catch (err) {
        console.warn(`[GeminiFeynmanService] Falló modelo ${model}:`, err);
        lastError = err;
      }
    }

    if (!responseText) {
      throw lastError || new Error("No se obtuvo respuesta de ningún modelo de Gemini.");
    }

    let parsedReply = "";
    let newlyUnlocked: string[] = [];
    let newlyPartial: string[] = [];
    let newlyFailed: string[] = [];
    let nextActiveSubtopicId: string | undefined = undefined;
    let isSessionFinished = false;

    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        parsedReply = parsed.quackReply || "";
        if (Array.isArray(parsed.unlockedSubtopicIds)) {
          newlyUnlocked = parsed.unlockedSubtopicIds.filter((id: string) =>
            topic.subtopics.some((s) => s.id === id)
          );
        }
        if (Array.isArray(parsed.partialSubtopicIds)) {
          newlyPartial = parsed.partialSubtopicIds.filter((id: string) =>
            topic.subtopics.some((s) => s.id === id)
          );
        }
        if (Array.isArray(parsed.failedSubtopicIds)) {
          newlyFailed = parsed.failedSubtopicIds.filter((id: string) =>
            topic.subtopics.some((s) => s.id === id)
          );
        }
        if (typeof parsed.nextActiveSubtopicId === "string") {
          nextActiveSubtopicId = parsed.nextActiveSubtopicId;
        }
        if (typeof parsed.isSessionFinished === "boolean") {
          isSessionFinished = parsed.isSessionFinished;
        }
      } else {
        parsedReply = responseText.trim();
      }
    } catch (parseErr) {
      console.warn("Error al parsear JSON de Gemini, usando texto sin formato:", parseErr);
      parsedReply = responseText.replace(/```json|```/g, "").trim();
    }

    // Calcular progreso ponderado: 100% por mastered, 50% por partial, 0% por failed
    const totalSubtopics = topic.subtopics.length;
    let totalScoreSum = 0;
    for (const sub of topic.subtopics) {
      if (newlyUnlocked.includes(sub.id) || currentCoveredIds.includes(sub.id)) {
        totalScoreSum += 100;
      } else if (newlyPartial.includes(sub.id) || subtopicScores?.[sub.id]?.status === "partial") {
        totalScoreSum += 50;
      } else if (newlyFailed.includes(sub.id) || subtopicScores?.[sub.id]?.status === "failed") {
        totalScoreSum += 0;
      }
    }

    const progress = totalSubtopics > 0 ? Math.round(totalScoreSum / totalSubtopics) : 0;

    return {
      reply: parsedReply || topic.fallbackReply,
      unlockedSubtopicIds: newlyUnlocked,
      partialSubtopicIds: newlyPartial,
      failedSubtopicIds: newlyFailed,
      nextActiveSubtopicId,
      isSessionFinished,
      detectedGaps: topic.subtopics
        .filter((s) => !newlyUnlocked.includes(s.id) && !currentCoveredIds.includes(s.id))
        .map((s) => s.name),
      masteryProgressPercentage: progress,
      engineUsed: "gemini",
    };
  }
}

export const geminiFeynmanService = new GeminiFeynmanService();
