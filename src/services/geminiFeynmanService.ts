import { GoogleGenAI } from "@google/genai";
import { FeynmanTopic, ChatMessage } from "@/types/feynman";
import { IFeynmanService, FeynmanEvaluationResult } from "./types";
import { mockFeynmanService } from "./mockFeynmanService";

/**
 * Servicio Feynman conectado a Google Gemini API mediante el SDK oficial @google/genai.
 * Implementa el rol de 'alumna curiosa y despistada' siguiendo las directrices de docs/PROMPT_ENGINEERING.md.
 * Si la API Key no existe o la llamada falla (ej. 429), conmuta de inmediato y de forma transparente al MockFeynmanService.
 */
export class GeminiFeynmanService implements IFeynmanService {
  private client: GoogleGenAI | null = null;
  private apiKey: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
    if (this.apiKey) {
      try {
        this.client = new GoogleGenAI({ apiKey: this.apiKey });
      } catch (err) {
        console.warn("Fallo al inicializar GoogleGenAI SDK:", err);
      }
    }
  }

  async sendMessage(
    topic: FeynmanTopic,
    history: ChatMessage[],
    studentInput: string,
    currentCoveredIds: string[]
  ): Promise<FeynmanEvaluationResult> {
    if (!this.client || !this.apiKey) {
      return mockFeynmanService.sendMessage(topic, history, studentInput, currentCoveredIds);
    }

    try {
      const subtopicsList = topic.subtopics
        .map((s) => `- ID: "${s.id}", Nombre: "${s.name}" (Actualmente cubierto: ${currentCoveredIds.includes(s.id)})`)
        .join("\n");

      const systemInstruction = `
Eres Quack, una estudiante de ingeniería curiosa y un poco despistada ("alumna curiosa").
Tu objetivo NO es enseñar, sino aprender: el usuario es quien debe explicarte el concepto matemático o físico.
Tema actual: "${topic.title}" (${topic.category}).
Contexto: ${topic.promptContext}

Subconceptos del tema a auditar:
${subtopicsList}

REGLAS DE ORO:
1. NUNCA des la respuesta correcta ni expliques el tema por tu cuenta.
2. Si el usuario explica bien, haz una pregunta de profundización o caso límite.
3. Si el usuario comete un error conceptual o falta un aspecto, muestra perplejidad socrática ("Espera, si eso fuera así, ¿no significaría que...?").
4. Mantén tus respuestas breves (máximo 2 a 3 oraciones cortas) para que puedan escucharse por síntesis de voz (TTS) con total fluidez.
5. Habla en español latinoamericano amigable, informal y curioso.

FORMATO DE SALIDA OBLIGATORIO:
Responde ÚNICAMENTE en JSON válido con este formato:
{
  "quackReply": "Texto de tu respuesta socrática breve (2-3 oraciones)",
  "unlockedSubtopicIds": ["id-del-subtema-que-el-usuario-acaba-de-explicar-bien"]
}
`;

      const prompt = `Historial reciente:\n${history
        .slice(-4)
        .map((m) => `${m.sender === "student" ? "Estudiante" : "Quack"}: ${m.text}`)
        .join("\n")}\n\nNueva intervención del estudiante: "${studentInput}"`;

      const response = await this.client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.6,
        },
      });

      const responseText = response.text || "";
      const parsed = JSON.parse(responseText);

      const newlyUnlocked: string[] = Array.isArray(parsed.unlockedSubtopicIds)
        ? parsed.unlockedSubtopicIds.filter(
            (id: string) => topic.subtopics.some((s) => s.id === id) && !currentCoveredIds.includes(id)
          )
        : [];

      const allCovered = Array.from(new Set([...currentCoveredIds, ...newlyUnlocked]));
      const progress = Math.round((allCovered.length / topic.subtopics.length) * 100);

      return {
        reply: parsed.quackReply || topic.fallbackReply,
        unlockedSubtopicIds: newlyUnlocked,
        detectedGaps: topic.subtopics.filter((s) => !allCovered.includes(s.id)).map((s) => s.name),
        masteryProgressPercentage: progress,
      };
    } catch (error) {
      console.warn("Fallo en llamada Gemini API. Activando fallback automático a MockFeynmanService:", error);
      return mockFeynmanService.sendMessage(topic, history, studentInput, currentCoveredIds);
    }
  }
}

export const geminiFeynmanService = new GeminiFeynmanService();
