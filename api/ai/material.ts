import {
  callWithRetry,
  createGeminiClient,
  getGeminiModel,
} from "../_lib/gemini.js";
import {
  enforceMethod,
  readJsonBody,
  sendJson,
  type ApiRequest,
  type ApiResponse,
} from "../_lib/http.js";

interface MaterialRequestBody {
  courseTitle?: string;
  discipline?: string;
  fileName?: string;
  rawTextContent?: string;
}

export default async function handler(req: ApiRequest, res: ApiResponse): Promise<void> {
  if (!enforceMethod(req, res, "POST")) return;

  const client = createGeminiClient();
  if (!client) {
    sendJson(res, 503, { error: "GEMINI_API_KEY no configurada en el servidor." });
    return;
  }

  try {
    const body = await readJsonBody<MaterialRequestBody>(req);
    const courseTitle = typeof body.courseTitle === "string" ? body.courseTitle.trim() : "";
    const discipline = typeof body.discipline === "string" ? body.discipline.trim() : "";
    const fileName = typeof body.fileName === "string" ? body.fileName.trim() : "";
    const rawTextContent = typeof body.rawTextContent === "string" ? body.rawTextContent.trim() : "";

    if (rawTextContent.length < 20) {
      sendJson(res, 400, { error: "El material cargado es demasiado corto para extracción IA." });
      return;
    }

    const prompt = `Eres un diseñador pedagógico STEM para Quack.
El estudiante subió este material para la materia "${courseTitle}" (${discipline}), archivo "${fileName}":
---
${rawTextContent.slice(0, 3500)}
---
Devuelve EXCLUSIVAMENTE un JSON válido sin markdown con esta estructura:
{
  "topicTitle": "Título conciso del tema principal",
  "summary": "Resumen en 1 frase",
  "subtopics": [
    { "name": "Subconcepto 1", "description": "Qué debe demostrar el estudiante" },
    { "name": "Subconcepto 2", "description": "Qué debe demostrar el estudiante" },
    { "name": "Subconcepto 3", "description": "Qué debe demostrar el estudiante" }
  ],
  "examTitle": "Título de un ejercicio tipo parcial sobre este material",
  "statementLatex": "Enunciado corto en LaTeX válido (ej. \\\\text{...})"
}`;

    const response = await callWithRetry(
      () =>
        client.models.generateContent({
          model: getGeminiModel(),
          contents: prompt,
          config: { responseMimeType: "application/json", temperature: 0.4 },
        }),
      2,
      1000,
      "api/ai/material"
    );

    const text = response.text?.trim() ?? "";
    const parsed = JSON.parse(text) as {
      topicTitle?: string;
      summary?: string;
      subtopics?: Array<{ name: string; description?: string }>;
      examTitle?: string;
      statementLatex?: string;
    };

    sendJson(res, 200, parsed);
  } catch (err) {
    console.error("[api/ai/material] Error:", err);
    sendJson(res, 502, {
      error: err instanceof Error ? err.message : "Error generando material de estudio con Gemini.",
    });
  }
}
