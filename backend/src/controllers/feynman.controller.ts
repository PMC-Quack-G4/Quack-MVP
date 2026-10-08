import { Router, Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';

const router = Router();

// Extraemos la función de retry genérica
const callWithRetry = async <T>(fn: () => Promise<T>, retries = 2, baseDelay = 1000): Promise<T> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      if (attempt === retries) throw error;
      const status = error?.status || 500;
      if (status === 429 || status >= 500) {
        const delay = baseDelay * attempt;
        console.warn(`[API] Error transitorio (${status}). Reintento ${attempt}/${retries} en ${delay}ms...`);
        await new Promise((res) => setTimeout(res, delay));
      } else {
        throw error;
      }
    }
  }
  throw new Error("Unreachable");
};

router.post('/', async (req: Request, res: Response): Promise<any> => {
  try {
    const { topic, history, studentInput, currentCoveredIds, subtopicScores, activeSubtopicId } = req.body;

    // Inicializar el cliente (soporta Vertex AI o API Key)
    let client;
    const isVertex = process.env.USE_VERTEX_AI === 'true';

    if (isVertex) {
      client = new GoogleGenAI({
        vertexai: {
          project: process.env.GCP_PROJECT_ID || 'carloscafe-511015',
          location: process.env.GCP_LOCATION || 'us-central1'
        }
      });
    } else {
      const apiKey = process.env.GCP_GEMINI_API_KEY || process.env.VITE_GCP_GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "No hay API Key ni configuración de Vertex AI en el servidor." });
      }
      client = new GoogleGenAI({ apiKey });
    }

    // Determinar el subconcepto en evaluación activa
    let currentActive = activeSubtopicId;
    if (!currentActive) {
      const remainingIds = topic.subtopics
        .filter((sub: any) => !currentCoveredIds.includes(sub.id))
        .map((sub: any) => sub.id);
      currentActive = remainingIds.length > 0 ? remainingIds[0] : null;
    }

    let attemptsSoFar = 1;
    if (currentActive && subtopicScores?.[currentActive]?.attempts) {
      attemptsSoFar = subtopicScores[currentActive].attempts + 1;
    }

    const subtopicsList = topic.subtopics.map((s: any) => `- ID: ${s.id} | Nombre: ${s.name}`).join("\n");

    const systemInstruction = `
Tu objetivo NO es evaluar como docente ni enseñar, sino aprender: el usuario es tu profesor y debe explicarte el concepto con sus propias palabras.

Tema de la sesión: "${topic.title}" (${topic.category}).
Contexto pedagógico del tema: ${topic.promptContext}

Subconceptos del temario oficial:
${subtopicsList}

REGLAS DE ORO OBLIGATORIAS:
1. ROL Y TONO: Eres una alumna simpática, informal y curiosa en español latinoamericano. NUNCA des la respuesta correcta ni expliques el tema por tu cuenta.
2. DETECCIÓN RIGUROSA DE ERRORES Y FALACIAS:
   - Si el estudiante dice cosas erróneas, absurdas o contradictorias, NUNCA lo felicites. Reacciona con perplejidad.
3. DOMINIO MULTI-ÍTEM: Si explica bien varios temas, agrégalos a "unlockedSubtopicIds".
4. MÁXIMO 3 INTENTOS:
   - Subconcepto activo: "${currentActive}". Intento ${attemptsSoFar} de 3.
   - Si acierta -> "unlockedSubtopicIds".
   - Si falla en el intento 3 -> pon 0% ("failedSubtopicIds") o 50% ("partialSubtopicIds") y CAMBIA DE TEMA. Usa "nextActiveSubtopicId".
5. FINALIZACIÓN: Si ya se evaluó todo, pon "isSessionFinished": true.
6. BREVEDAD: 2 a 3 oraciones cortas.

FORMATO ESTRICTO (JSON):
{
  "quackReply": "Tu reacción (2-3 oraciones)",
  "unlockedSubtopicIds": ["id1"],
  "partialSubtopicIds": ["id2"],
  "failedSubtopicIds": [],
  "nextActiveSubtopicId": "id-siguiente",
  "isSessionFinished": false
}
`;

    const formattedContents: Array<any> = [];
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
          text: `El estudiante responde:\n"${studentInput}"\n\nRecuerda: Activo "${currentActive}" (Intento ${attemptsSoFar}/3). Responde en JSON.`,
        },
      ],
    });

    const candidateModels = ["gemini-flash-latest", "gemini-3.8-flash", "gemini-3.7-flash", "gemini-3.5-flash"];
    let responseText = "";
    let lastError: any = null;

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
        if (responseText) break;
      } catch (err) {
        lastError = err;
      }
    }

    if (!responseText) {
      throw lastError || new Error("No se obtuvo respuesta de Gemini.");
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
        newlyUnlocked = Array.isArray(parsed.unlockedSubtopicIds) ? parsed.unlockedSubtopicIds : [];
        newlyPartial = Array.isArray(parsed.partialSubtopicIds) ? parsed.partialSubtopicIds : [];
        newlyFailed = Array.isArray(parsed.failedSubtopicIds) ? parsed.failedSubtopicIds : [];
        if (typeof parsed.nextActiveSubtopicId === "string") nextActiveSubtopicId = parsed.nextActiveSubtopicId;
        if (typeof parsed.isSessionFinished === "boolean") isSessionFinished = parsed.isSessionFinished;
      } else {
        parsedReply = responseText.trim();
      }
    } catch (e) {
      parsedReply = responseText.replace(/```json|```/g, "").trim();
    }

    const totalSubtopics = topic.subtopics.length;
    let totalScoreSum = 0;
    for (const sub of topic.subtopics) {
      if (newlyUnlocked.includes(sub.id) || currentCoveredIds.includes(sub.id)) totalScoreSum += 100;
      else if (newlyPartial.includes(sub.id) || subtopicScores?.[sub.id]?.status === "partial") totalScoreSum += 50;
    }
    const progress = totalSubtopics > 0 ? Math.round(totalScoreSum / totalSubtopics) : 0;

    return res.json({
      reply: parsedReply || topic.fallbackReply,
      unlockedSubtopicIds: newlyUnlocked,
      partialSubtopicIds: newlyPartial,
      failedSubtopicIds: newlyFailed,
      nextActiveSubtopicId,
      isSessionFinished,
      detectedGaps: topic.subtopics
        .filter((s: any) => !newlyUnlocked.includes(s.id) && !currentCoveredIds.includes(s.id))
        .map((s: any) => s.name),
      masteryProgressPercentage: progress,
      engineUsed: "gemini",
    });

  } catch (error: any) {
    console.error("Error en Feynman Controller:", error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
