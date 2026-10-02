import { GoogleGenAI } from "@google/genai";
import { FeynmanTopic, ChatMessage } from "@/types/feynman";
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
 * Implementa cascada de modelos modernos y reintentos ante picos de demanda.
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
    currentCoveredIds: string[]
  ): Promise<FeynmanEvaluationResult> {
    const client = this.getClient();
    if (!client) {
      throw new Error("No hay API Key de Gemini configurada en VITE_GEMINI_API_KEY.");
    }

    const subtopicsList = topic.subtopics
      .map(
        (s) =>
          `- ID: "${s.id}" | Nombre: "${s.name}" | Descripción: "${s.description || ""}" (Ya cubierto: ${
            currentCoveredIds.includes(s.id) ? "SÍ" : "NO"
          })`
      )
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
2. DETECCIÓN RIGUROSA DE ERRORES Y FALACIAS (CRUCIAL):
   - Si el estudiante dice cosas erróneas, absurdas, contradictorias o inventadas (por ejemplo: que las cosas se mueven solas sin fuerzas, que la masa de un cohete nunca cambia, que Newton formuló algo por moda, que el momentum solo se conserva al frenar, etc.), NUNCA lo felicites ni aceptes su error.
   - Reacciona con perplejidad e incredulidad socrática como alumna confundida (ej: "Espera profe, ¡me confundí! Si se mueven solas sin fuerzas, ¿entonces por qué tengo que empujar algo pesado para moverlo? ¿No decía la ley que una fuerza neta causa aceleración?").
   - Bajo NINGUNA circunstancia agregues un ID a "unlockedSubtopicIds" si la explicación del estudiante fue incorrecta, falaz o incompleta. Solo déjalo vacío: [].
3. VALIDACIÓN DE MAESTRÍA: Solo agrega un ID a "unlockedSubtopicIds" si el estudiante explicó ese subconcepto con razonamiento físico/matemático genuino, coherente y correcto.
4. REPREGUNTA SOCRÁTICA: Si el estudiante explicó bien un punto previo, valida brevemente su intuición y haz una pregunta socrática sobre el SIGUIENTE subconcepto que aún esté marcado como NO cubierto.
5. MEMORIA CONVERSACIONAL: Revisa todo el historial previo. No repitas dudas que ya te aclaró satisfactoriamente.
6. BREVEDAD ESTRICTA: Máximo 2 a 3 oraciones cortas (para que la síntesis de voz TTS sea ágil y natural).

FORMATO DE SALIDA ESTRICTO (JSON):
Debes responder ÚNICAMENTE con un objeto JSON válido con esta estructura:
{
  "quackReply": "Tu reacción socrática en tono de alumna (2-3 oraciones breves)",
  "unlockedSubtopicIds": ["id-del-subtema-si-y-solo-si-lo-explico-correctamente"]
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
          text: `El estudiante (profesor) responde:\n"${studentInput}"\n\nRecuerda: Si dijo algo erróneo o disparatado, muestra perplejidad y NO desbloquees ningún subtema. Si explicó bien, haz la siguiente duda socrática. Responde en JSON.`,
        },
      ],
    });

    // Cascada de modelos compatibles: predeterminado latest y alternativas en orden descendente (3.8, 3.7, 3.6, 3.5)
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
    let modelUsed = primaryModel;
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
        modelUsed = model;
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

    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        parsedReply = parsed.quackReply || "";
        if (Array.isArray(parsed.unlockedSubtopicIds)) {
          newlyUnlocked = parsed.unlockedSubtopicIds.filter(
            (id: string) => topic.subtopics.some((s) => s.id === id) && !currentCoveredIds.includes(id)
          );
        }
      } else {
        parsedReply = responseText.trim();
      }
    } catch (parseErr) {
      console.warn("Error al parsear JSON de Gemini, usando texto sin formato:", parseErr);
      parsedReply = responseText.replace(/```json|```/g, "").trim();
    }

    const allCovered = Array.from(new Set([...currentCoveredIds, ...newlyUnlocked]));
    const progress = Math.round((allCovered.length / topic.subtopics.length) * 100);

    return {
      reply: parsedReply || topic.fallbackReply,
      unlockedSubtopicIds: newlyUnlocked,
      detectedGaps: topic.subtopics.filter((s) => !allCovered.includes(s.id)).map((s) => s.name),
      masteryProgressPercentage: progress,
      engineUsed: "gemini",
    };
  }
}

export const geminiFeynmanService = new GeminiFeynmanService();
