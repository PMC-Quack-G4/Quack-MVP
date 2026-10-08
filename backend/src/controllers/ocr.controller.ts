import { Router, Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';

const router = Router();

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

// Funciones para limpiar expresiones LaTeX
function sanitizeLatexExpression(latex?: string): string {
  if (!latex) return "";
  let clean = latex.trim();
  clean = clean.replace(/^\$+/, "").replace(/\$+$/, "");
  if (clean.startsWith("\\[") && clean.endsWith("\\]")) {
    clean = clean.slice(2, -2).trim();
  }
  return clean;
}

function normalizeStepStatus(rawStatus?: string): "CORRECT" | "ALGEBRAIC_ERROR" | "CONCEPTUAL_ERROR" | "PROPAGATED_ERROR" {
  const upper = (rawStatus || "").toUpperCase();
  if (["CORRECT", "ALGEBRAIC_ERROR", "CONCEPTUAL_ERROR", "PROPAGATED_ERROR"].includes(upper)) {
    return upper as any;
  }
  return "CONCEPTUAL_ERROR";
}

router.post('/', async (req: Request, res: Response): Promise<any> => {
  try {
    const { problem, imageBase64OrUrl, rotation } = req.body;

    const apiKey = process.env.GCP_GEMINI_API_KEY || process.env.VITE_GCP_GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "No hay clave VITE_GCP_GEMINI_API_KEY configurada." });
    }

    const client = new GoogleGenAI({ apiKey });

    // La imagen viene en Base64 desde el frontend
    const match = imageBase64OrUrl.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!match) {
        return res.status(400).json({ error: "Formato de imagen inválido." });
    }
    const mimeType = match[1];
    const base64Data = match[2];

    const canonicalReference = problem.mockAudit.steps
      .map((s: any) => `Paso ${s.stepNumber}: ${s.latexExpression}`)
      .join("\n");

    const systemInstruction = `
Tu tarea es auditar la fotografía o escaneo entregado por un estudiante para el siguiente problema oficial:

- Título del problema: "${problem.title}"
- Materia: "${problem.subject}" (Dificultad: ${problem.difficulty})
- Enunciado oficial (LaTeX): "${problem.statementLatex}"

Referencia de solución canónica orientativa:
${canonicalReference}

REGLAS DE AUDITORÍA Y CALIFICACIÓN ESTRICTA (0.0 a 5.0):
1. EXTRACCIÓN FIEL PASO A PASO en LaTeX limpio.
2. FLEXIBILIDAD DE MÉTODO PERO RIGOR MATEMÁTICO ABSOLUTO.
3. CLASIFICACIÓN ESTRICTA ("status"): "CORRECT", "ALGEBRAIC_ERROR", "CONCEPTUAL_ERROR", "PROPAGATED_ERROR".
4. CRITERIO DE NOTA FINAL ("finalScore" sobre 5.0) Y AVANCE ("completionPercentage" de 0 a 100).
5. CORRECCIÓN SUGERIDA ("suggestedFixLatex") para pasos incorrectos.

FORMATO ESTRICTO (JSON):
{
  "isValidSubmission": true,
  "finalScore": 1.0,
  "maxScore": 5.0,
  "completionPercentage": 20,
  "diagnosisTitle": "Título diagnóstico",
  "summary": "Resumen",
  "pedagogicalRecommendation": "Consejo",
  "steps": [
    {
      "stepNumber": 1,
      "latexExpression": "expresión escrita por el estudiante",
      "status": "CONCEPTUAL_ERROR",
      "feedback": "explicación",
      "suggestedFixLatex": "expresión corregida"
    }
  ]
}
`;

    const contents = [
      {
        role: "user" as const,
        parts: [
          {
            inlineData: {
              mimeType,
              data: base64Data,
            },
          },
          {
            text: `Audita con total rigor cada renglón de esta imagen para el problema "${problem.title}". Si el procedimiento escrito por el estudiante tiene errores algebraicos o conceptuales, clasifícalos como ALGEBRAIC_ERROR o CONCEPTUAL_ERROR y califica acordemente de 0.0 a 5.0. Responde en JSON.`,
          },
        ],
      },
    ];

    const candidateModels = ["gemini-flash-latest", "gemini-3.8-flash", "gemini-3.7-flash", "gemini-3.5-flash"];
    let responseText = "";
    let lastError: any = null;

    for (const model of candidateModels) {
      try {
        const response = await callWithRetry(() =>
          client.models.generateContent({
            model,
            contents,
            config: {
              systemInstruction,
              temperature: 0.2,
            },
          })
        );
        responseText = response.text || "";
        if (responseText) break;
      } catch (errModel) {
        lastError = errModel;
      }
    }

    if (!responseText) {
      throw lastError || new Error("Ningún modelo de Gemini Vision pudo completar la auditoría OCR.");
    }

    let parsed: any = {};
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.warn("Fallo al parsear JSON OCR", e);
    }

    const rawScore = typeof parsed.finalScore === "number" ? parsed.finalScore : 0.0;
    const clampedScore = Math.round(Math.min(5.0, Math.max(0.0, rawScore)) * 10) / 10;
    const rawSteps = Array.isArray(parsed.steps) ? parsed.steps : [];

    const normalizedSteps = rawSteps.length > 0 ? rawSteps.map((step: any, index: number) => {
      const status = normalizeStepStatus(step.status);
      const cleanedFix = sanitizeLatexExpression(step.suggestedFixLatex);
      return {
        stepNumber: typeof step.stepNumber === "number" ? step.stepNumber : index + 1,
        latexExpression: sanitizeLatexExpression(step.latexExpression) || "\\text{Expresión manuscrita}",
        status,
        feedback: step.feedback?.trim() || "Analizado por IA.",
        ...(status !== "CORRECT" && cleanedFix ? { suggestedFixLatex: cleanedFix } : {}),
      };
    }) : [
      {
        stepNumber: 1,
        latexExpression: "\\text{No se detectaron renglones matemáticos válidos en la imagen}",
        status: "CONCEPTUAL_ERROR",
        feedback: "La imagen no contiene pasos legibles correspondientes al ejercicio.",
        suggestedFixLatex: sanitizeLatexExpression(problem.mockAudit?.steps?.[0]?.latexExpression),
      }
    ];

    const isValidSubmission = typeof parsed.isValidSubmission === "boolean" ? parsed.isValidSubmission : clampedScore > 0;
    const completionPercentage = typeof parsed.completionPercentage === "number"
      ? Math.min(100, Math.max(0, Math.round(parsed.completionPercentage)))
      : Math.round((clampedScore / 5.0) * 100);

    return res.json({
      finalScore: clampedScore,
      maxScore: 5.0,
      summary: parsed.summary?.trim() || "Auditoría completada.",
      diagnosisTitle: parsed.diagnosisTitle?.trim() || "Evaluación Completa",
      steps: normalizedSteps,
      engineUsed: "gemini",
      isValidSubmission,
      completionPercentage,
      pedagogicalRecommendation: parsed.pedagogicalRecommendation?.trim(),
    });

  } catch (error: any) {
    console.error("Error en OCR Controller:", error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
