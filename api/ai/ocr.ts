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
import { parseGeminiJsonWithLatex, sanitizeLatexExpression } from "../_lib/latex.js";

type StepStatus = "CORRECT" | "ALGEBRAIC_ERROR" | "CONCEPTUAL_ERROR" | "PROPAGATED_ERROR";

interface AuditStep {
  stepNumber: number;
  latexExpression: string;
  status: StepStatus;
  feedback: string;
  suggestedFixLatex?: string;
}

interface ExamProblemInput {
  title: string;
  subject: string;
  difficulty: string;
  statementLatex: string;
  mockAudit: {
    steps: Array<{
      stepNumber: number;
      latexExpression: string;
      status: string;
      feedback: string;
    }>;
  };
}

interface OcrRequestBody {
  problem?: ExamProblemInput;
  mimeType?: string;
  base64Data?: string;
}

interface ParsedAuditPayload {
  finalScore?: number;
  summary?: string;
  diagnosisTitle?: string;
  steps?: Array<{
    stepNumber?: number;
    latexExpression?: string;
    status?: unknown;
    feedback?: string;
    suggestedFixLatex?: string;
  }>;
  isValidSubmission?: boolean;
  completionPercentage?: number;
  pedagogicalRecommendation?: string;
}

const VALID_STATUSES: StepStatus[] = [
  "CORRECT",
  "ALGEBRAIC_ERROR",
  "CONCEPTUAL_ERROR",
  "PROPAGATED_ERROR",
];

function normalizeStepStatus(status: unknown): StepStatus {
  if (typeof status === "string" && VALID_STATUSES.includes(status as StepStatus)) {
    return status as StepStatus;
  }
  return "ALGEBRAIC_ERROR";
}

export default async function handler(req: ApiRequest, res: ApiResponse): Promise<void> {
  if (!enforceMethod(req, res, "POST")) return;

  const client = createGeminiClient();
  if (!client) {
    sendJson(res, 503, { error: "GEMINI_API_KEY no configurada en el servidor." });
    return;
  }

  try {
    const body = await readJsonBody<OcrRequestBody>(req);
    const problem = body.problem;
    const mimeType = typeof body.mimeType === "string" ? body.mimeType : "";
    const base64Data = typeof body.base64Data === "string" ? body.base64Data : "";

    if (!problem || !mimeType || !base64Data) {
      sendJson(res, 400, { error: "Solicitud incompleta para auditoría OCR." });
      return;
    }

    const canonicalReference = (problem.mockAudit?.steps ?? [])
      .map(
        (s) =>
          `  Paso ${s.stepNumber}: ${s.latexExpression} (${s.status}) -> ${s.feedback}`
      )
      .join("\n");

    const systemInstruction = `
Eres un profesor universitario de ingeniería y auditor riguroso pero pedagógico de exámenes STEM manuscritos a libro cerrado.
Tu tarea es auditar la fotografía o escaneo entregado por un estudiante para el siguiente problema oficial:

- Título del problema: "${problem.title}"
- Materia: "${problem.subject}" (Dificultad: ${problem.difficulty})
- Enunciado oficial (LaTeX): "${problem.statementLatex}"

Referencia de solución canónica orientativa:
${canonicalReference}

REGLAS DE AUDITORÍA Y CALIFICACIÓN ESTRICTA (0.0 a 5.0):
1. EXTRACCIÓN FIEL PASO A PASO:
   - Lee la imagen renglón por renglón y transcribe a LaTeX limpio EXACTAMENTE lo que el estudiante escribió en su hoja en el campo "latexExpression" (incluso si está equivocado, transcribe lo que escribió el estudiante para poder señalar su error).
   - NO inventes pasos que no estén en la imagen ni reemplaces el texto del estudiante por la solución canónica.
   - NO envuelvas las fórmulas en signos "$" ni "$$". Escribe LaTeX puro compatible con KaTeX.

2. FLEXIBILIDAD DE MÉTODO PERO RIGOR MATEMÁTICO ABSOLUTO:
   - Si el estudiante utilizó un método alternativo matemáticamente válido, márcalo como "CORRECT".
   - Si el procedimiento del estudiante es ERRÓNEO, absurdo o inventa pasos sin sentido matemático, JAMÁS marques los pasos como "CORRECT". Márcalos como "ALGEBRAIC_ERROR" o "CONCEPTUAL_ERROR" y penaliza severamente la calificación ("finalScore" entre 0.0 y 1.5 según corresponda).

3. CLASIFICACIÓN ESTRICTA DE CADA PASO ("status"):
   - "CORRECT": El paso es matemáticamente y conceptualmente válido.
   - "ALGEBRAIC_ERROR": La idea base era aplicable, pero hubo un error operativo (signo equivocado, exponente olvidado, despeje erróneo, derivada/integral mal calculada o error aritmético).
   - "CONCEPTUAL_ERROR": Error grave de teoría (regla matemática inexistente, propiedad falsa, fórmula física equivocada).
   - "PROPAGATED_ERROR": Arrastre de error previo. El paso actual ejecuta operaciones algebraicas coherentes usando el resultado erróneo de un paso anterior.

4. CRITERIO DE NOTA FINAL ("finalScore" sobre 5.0) Y AVANCE ("completionPercentage" de 0 a 100):
   - Si todos los pasos están equivocados o el procedimiento es completamente erróneo: "finalScore" entre 0.0 y 0.8, "completionPercentage" entre 0 y 15.
   - Si la imagen está en blanco, es ilegible o pertenece a otro tema distinto a "${problem.title}": "isValidSubmission": false, "finalScore": 0.0, "completionPercentage": 0.
   - Si el procedimiento quedó incompleto o tiene errores intermedios con arrastre coherente: asigna nota proporcional justa (crédito parcial).
   - Si todo el desarrollo es correcto: "finalScore" entre 4.8 y 5.0.

5. CORRECCIÓN SUGERIDA ("suggestedFixLatex"):
   - Para cualquier paso cuyo estado NO sea "CORRECT", incluye obligatoriamente en "suggestedFixLatex" la expresión LaTeX corregida de cómo debía resolverse ese paso.

FORMATO DE SALIDA ESTRICTO (JSON):
Debes responder ÚNICAMENTE con un objeto JSON válido con esta estructura:
{
  "isValidSubmission": true,
  "finalScore": 1.0,
  "maxScore": 5.0,
  "completionPercentage": 20,
  "diagnosisTitle": "Título diagnóstico corto",
  "summary": "Resumen analítico claro del desempeño",
  "pedagogicalRecommendation": "Consejo puntual para corregir el fallo",
  "steps": [
    {
      "stepNumber": 1,
      "latexExpression": "expresión escrita por el estudiante en LaTeX",
      "status": "CONCEPTUAL_ERROR",
      "feedback": "explicación puntual del paso",
      "suggestedFixLatex": "expresión corregida en LaTeX"
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

    const primaryModel = getGeminiModel();
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
        const response = await callWithRetry(
          () =>
            client.models.generateContent({
              model,
              contents,
              config: {
                systemInstruction,
                temperature: 0.2,
              },
            }),
          2,
          900,
          "api/ai/ocr"
        );
        responseText = response.text || "";
        if (responseText) break;
      } catch (errModel) {
        console.warn(`[api/ai/ocr] Falló modelo ${model}:`, errModel);
        lastError = errModel;
      }
    }

    if (!responseText) {
      throw lastError || new Error("Ningún modelo de Gemini Vision pudo completar la auditoría OCR.");
    }

    const parsed = parseGeminiJsonWithLatex<ParsedAuditPayload>(responseText);

    const rawScore =
      typeof parsed.finalScore === "number" && !Number.isNaN(parsed.finalScore)
        ? parsed.finalScore
        : 0.0;
    const clampedScore = Math.round(Math.min(5.0, Math.max(0.0, rawScore)) * 10) / 10;

    const rawSteps = Array.isArray(parsed.steps) ? parsed.steps : [];
    const normalizedSteps: AuditStep[] =
      rawSteps.length > 0
        ? rawSteps.map((step, index) => {
            const status = normalizeStepStatus(step.status);
            const cleanedFix = sanitizeLatexExpression(step.suggestedFixLatex);
            return {
              stepNumber: typeof step.stepNumber === "number" ? step.stepNumber : index + 1,
              latexExpression:
                sanitizeLatexExpression(step.latexExpression) ||
                "\\text{Expresión manuscrita}",
              status,
              feedback:
                step.feedback?.trim() ||
                "Paso analizado por el motor de visión matemática.",
              ...(status !== "CORRECT" && cleanedFix ? { suggestedFixLatex: cleanedFix } : {}),
            };
          })
        : [
            {
              stepNumber: 1,
              latexExpression: "\\text{No se detectaron renglones matemáticos válidos en la imagen}",
              status: "CONCEPTUAL_ERROR",
              feedback:
                "La imagen proporcionada no contiene pasos legibles correspondientes al ejercicio.",
              suggestedFixLatex: sanitizeLatexExpression(problem.mockAudit?.steps?.[0]?.latexExpression),
            },
          ];

    const isValidSubmission =
      typeof parsed.isValidSubmission === "boolean"
        ? parsed.isValidSubmission
        : clampedScore > 0;

    const completionPercentage =
      typeof parsed.completionPercentage === "number"
        ? Math.min(100, Math.max(0, Math.round(parsed.completionPercentage)))
        : Math.round((clampedScore / 5.0) * 100);

    sendJson(res, 200, {
      finalScore: clampedScore,
      maxScore: 5.0,
      summary:
        parsed.summary?.trim() ||
        "Auditoría completada mediante visión artificial y verificación simbólica paso a paso.",
      diagnosisTitle:
        parsed.diagnosisTitle?.trim() ||
        (clampedScore >= 4.0
          ? "Dominio Sólido"
          : clampedScore >= 3.0
          ? "Crédito Parcial con Observaciones"
          : isValidSubmission
          ? "Procedimiento con Errores Críticos"
          : "Evidencia No Correspondiente"),
      steps: normalizedSteps,
      engineUsed: "gemini",
      isValidSubmission,
      completionPercentage,
      pedagogicalRecommendation: parsed.pedagogicalRecommendation?.trim(),
    });
  } catch (err) {
    console.error("[api/ai/ocr] Error:", err);
    sendJson(res, 502, {
      error: err instanceof Error ? err.message : "Error al auditar la solución manuscrita.",
    });
  }
}
