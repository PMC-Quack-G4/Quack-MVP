import { GoogleGenAI } from "@google/genai";
import { FeynmanTopic, ChatMessage } from "@/types/feynman";
import { IFeynmanService, FeynmanEvaluationResult } from "./types";
import { getActiveModel } from "./serviceFactory";

/**
 * Servicio Feynman conectado a Google Gemini API mediante el SDK oficial @google/genai.
 * El modelo y la API Key son configurados por el desarrollador en variables de entorno (.env).
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
Tu objetivo NO es evaluar con frialdad ni enseñar, sino aprender: el usuario es tu profesor y debe explicarte el concepto con sus propias palabras.

Tema de la sesión: "${topic.title}" (${topic.category}).
Contexto pedagógico: ${topic.promptContext}

Subconceptos del temario oficial que debes auditar:
${subtopicsList}

REGLAS DE ORO OBLIGATORIAS:
1. NUNCA des la respuesta correcta ni expliques el tema por tu cuenta. Eres una alumna, no la profesora.
2. MEMORIA DE CONVERSACIÓN: Revisa TODO el historial previo. NUNCA repitas una pregunta o duda que ya le hiciste al estudiante.
3. REACCIÓN INMEDIATA: Reacciona brevemente a lo que el estudiante te acaba de decir en su última respuesta (ej. "Ah, entiendo que la masa no cambia de planeta...", "¡Guao, qué buena analogía!", "Espera, eso me confunde un poco porque...").
4. REPREGUNTA SOCRÁTICA: Si el estudiante explicó bien el punto anterior, pasa a preguntarle por el SIGUIENTE subconcepto que aún NO esté cubierto.
5. Si el estudiante dice cosas ambiguas, comete un error o deja cabos sueltos, muestra perplejidad socrática ("Espera, si eso fuera así, ¿no significaría que...?").
6. BREVEDAD ESTRICTA: Máximo 2 a 3 oraciones cortas para que la síntesis de voz (TTS) sea fluida y natural.
7. Tono: Amigable, informal, curioso y en español latinoamericano estándar.

FORMATO DE SALIDA ESTRICTO (JSON):
Debes responder exclusivamente en JSON válido:
{
  "quackReply": "Tu reacción amistosa y tu nueva repregunta socrática (2-3 oraciones breves)",
  "unlockedSubtopicIds": ["id-del-subtema-que-el-estudiante-acaba-de-explicar-con-claridad"]
}
`;

    // Formatear historial multi-turno con alternancia estricta de roles 'user' y 'model'
    const formattedContents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];

    // Incluir hasta los últimos 10 mensajes previos para memoria conversacional
    const recentHistory = history.slice(-10);
    for (const msg of recentHistory) {
      formattedContents.push({
        role: msg.sender === "student" ? "user" : "model",
        parts: [{ text: msg.text }],
      });
    }

    // Agregar la intervención actual del estudiante
    formattedContents.push({
      role: "user",
      parts: [
        {
          text: `El estudiante responde:\n"${studentInput}"\n\nRecuerda: Reacciona a lo que dijo, evalúa si cubrió algún subtema pendiente y haz una nueva pregunta socrática sin repetir preguntas previas.`,
        },
      ],
    });

    const activeModel = getActiveModel();
    let responseText = "";

    try {
      const response = await client.models.generateContent({
        model: activeModel,
        contents: formattedContents,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      });
      responseText = response.text || "";
    } catch (primaryErr) {
      console.warn(`Fallo con el modelo ${activeModel}. Intentando con fallback:`, primaryErr);
      const fallback = activeModel === "gemini-2.0-flash" ? "gemini-1.5-flash" : "gemini-2.0-flash";
      const fallbackResponse = await client.models.generateContent({
        model: fallback,
        contents: formattedContents,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      });
      responseText = fallbackResponse.text || "";
    }

    // Limpieza de formato markdown de bloques JSON (```json ... ```)
    const cleanedJson = responseText
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/g, "")
      .trim();

    let parsedReply = "";
    let newlyUnlocked: string[] = [];

    try {
      const parsed = JSON.parse(cleanedJson);
      parsedReply = parsed.quackReply || "";
      if (Array.isArray(parsed.unlockedSubtopicIds)) {
        newlyUnlocked = parsed.unlockedSubtopicIds.filter(
          (id: string) => topic.subtopics.some((s) => s.id === id) && !currentCoveredIds.includes(id)
        );
      }
    } catch (parseErr) {
      console.warn("No fue posible parsear JSON directo de Gemini, usando respuesta limpia:", parseErr);
      parsedReply = cleanedJson;
    }

    const allCovered = Array.from(new Set([...currentCoveredIds, ...newlyUnlocked]));
    const progress = Math.round((allCovered.length / topic.subtopics.length) * 100);

    return {
      reply: parsedReply || topic.fallbackReply,
      unlockedSubtopicIds: newlyUnlocked,
      detectedGaps: topic.subtopics.filter((s) => !allCovered.includes(s.id)).map((s) => s.name),
      masteryProgressPercentage: progress,
    };
  }
}

export const geminiFeynmanService = new GeminiFeynmanService();
