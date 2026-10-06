import { GoogleGenAI } from "@google/genai";
import { AuditStep, ExamProblem, MockAuditResult, StepStatus } from "@/types/exam";
import { IOcrAuditService } from "./types";
import { getActiveModel } from "./serviceFactory";

/**
 * Reintenta llamadas a la API de Gemini ante errores transitorios (503 / 429) con backoff.
 */
async function callWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 2,
  baseDelayMs = 900
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
        apiErr?.message?.includes("UNAVAILABLE") ||
        apiErr?.message?.includes("overloaded");

      if (isRetryable && attempt < maxRetries) {
        const delay = baseDelayMs * attempt;
        console.warn(
          `[Gemini Vision OCR] Error transitorio (${apiErr.status || 503}). Reintento ${attempt}/${maxRetries} en ${delay}ms...`
        );
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

/**
 * Limpia delimitadores innecesarios ($$, $, bloques markdown) y restaura secuencias de escape
 * de una expresión LaTeX para asegurar que KaTeX la renderice sin errores visuales.
 */
export function sanitizeLatexExpression(raw: string | undefined): string {
  if (!raw) return "";
  return raw
    .replace(/\x08/g, "\\b") // Restaura \begin, \beta, \binom si fueron interpretados como backspace
    .replace(/\x0c/g, "\\f") // Restaura \frac, \forall si fueron interpretados como form-feed
    .replace(/\x09/g, "\\t") // Restaura \text, \times, \theta, \tan si fueron interpretados como tab
    .replace(/\x0d/g, "\\r") // Restaura \right, \rho si fueron interpretados como carriage-return
    .trim()
    .replace(/^```(?:latex|tex)?\s*/i, "")
    .replace(/```$/i, "")
    .replace(/^\$\$\s*/, "")
    .replace(/\s*\$\$$/, "")
    .replace(/^\$\s*/, "")
    .replace(/\s*\$$/, "")
    .replace(/^\\\[\s*/, "")
    .replace(/\s*\\\]$/, "")
    .replace(/^\\\(\s*/, "")
    .replace(/\s*\\\)$/, "")
    .trim();
}

/**
 * Parsea de forma segura un JSON devuelto por el LLM que contiene expresiones LaTeX,
 * escapando barras invertidas simples (\ln, \frac, \cdot, \text, \right, etc.) que de otro modo
 * lanzarían SyntaxError en JSON.parse().
 */
export function parseGeminiAuditJson(responseText: string): Partial<MockAuditResult> {
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  const rawJson = (
    jsonMatch
      ? jsonMatch[0]
      : responseText
          .replace(/```json\s*/gi, "")
          .replace(/```\s*/g, "")
  ).trim();

  // Escapar cualquier barra invertida de LaTeX no escapada (\frac, \ln, \cdot, \text, \, etc.)
  // preservando secuencias JSON válidas (\\, \", \/, \uXXXX y \n cuando no precede letras de comando como \neq)
  const latexSafeJson = rawJson.replace(
    /\\(\\|"|\/|u[0-9a-fA-F]{4}|n(?![a-zA-Z]))|\\(.)/g,
    (match, validEscape, latexChar) => {
      if (validEscape) {
        return match;
      }
      return "\\\\" + latexChar;
    }
  );

  try {
    return JSON.parse(latexSafeJson) as Partial<MockAuditResult>;
  } catch {
    // Último intento directo con el JSON original
    return JSON.parse(rawJson) as Partial<MockAuditResult>;
  }
}

/**
 * Normaliza cualquier fuente de imagen (DataURL subida/cámara o ruta local de muestra SVG/PNG),
 * aplica la rotación indicada por el estudiante y la rasteriza a JPEG optimizado para Gemini Vision.
 */
export async function prepareImageForOcr(
  imageBase64OrUrl: string,
  rotationDegrees = 0
): Promise<{ mimeType: string; base64Data: string }> {
  if (typeof window !== "undefined" && typeof document !== "undefined") {
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const element = new Image();
        element.crossOrigin = "anonymous";
        element.onload = () => resolve(element);
        element.onerror = (err) => reject(err);
        element.src = imageBase64OrUrl;
      });

      const normalizedRotation = ((rotationDegrees % 360) + 360) % 360;
      const isSideways = normalizedRotation === 90 || normalizedRotation === 270;

      const naturalWidth = img.naturalWidth || img.width || 800;
      const naturalHeight = img.naturalHeight || img.height || 1000;

      // Escalar manteniendo alta nitidez para trazos matemáticos (máx 1500px en el lado mayor)
      const maxDimension = 1500;
      const scale = Math.min(1, maxDimension / Math.max(naturalWidth, naturalHeight));
      const drawWidth = Math.max(1, Math.round(naturalWidth * scale));
      const drawHeight = Math.max(1, Math.round(naturalHeight * scale));

      const canvas = document.createElement("canvas");
      canvas.width = isSideways ? drawHeight : drawWidth;
      canvas.height = isSideways ? drawWidth : drawHeight;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Fondo blanco limpio para garantizar alto contraste en imágenes transparentes o SVGs
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((normalizedRotation * Math.PI) / 180);
        ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
        const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
        if (match) {
          return {
            mimeType: match[1],
            base64Data: match[2],
          };
        }
      }
    } catch (canvasErr) {
      console.warn("[GeminiOcrAuditService] No se pudo rasterizar en canvas, intentando extracción directa:", canvasErr);
    }
  }

  // Fallback directo si ya es un data:image base64 estándar compatible
  const directMatch = imageBase64OrUrl.match(/^data:(image\/(?:png|jpeg|jpg|webp|heic|heif));base64,(.+)$/i);
  if (directMatch) {
    return {
      mimeType: directMatch[1].toLowerCase() === "image/jpg" ? "image/jpeg" : directMatch[1].toLowerCase(),
      base64Data: directMatch[2],
    };
  }

  throw new Error("No fue posible procesar el formato de la imagen para el análisis OCR.");
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

/**
 * Servicio de Auditoría OCR conectado a Google Gemini Flash Vision (@google/genai).
 * Audita procedimientos manuscritos reales o muestras rasterizadas, desglosa cada renglón en KaTeX,
 * clasifica errores con crédito parcial y califica de 0.0 a 5.0.
 */
export class GeminiOcrAuditService implements IOcrAuditService {
  private getClient(): GoogleGenAI | null {
    const key = (import.meta.env.VITE_GEMINI_API_KEY as string)?.trim();
    if (!key) return null;
    try {
      return new GoogleGenAI({ apiKey: key });
    } catch (err) {
      console.warn("Fallo al inicializar GoogleGenAI SDK para OCR:", err);
      return null;
    }
  }

  async auditSolution(
    problem: ExamProblem,
    imageBase64OrUrl: string,
    rotation = 0
  ): Promise<MockAuditResult> {
    const client = this.getClient();
    if (!client) {
      throw new Error("No hay clave VITE_GEMINI_API_KEY configurada.");
    }

    const { mimeType, base64Data } = await prepareImageForOcr(imageBase64OrUrl, rotation);

    const canonicalReference = problem.mockAudit.steps
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
            contents,
            config: {
              systemInstruction,
              temperature: 0.2,
            },
          })
        );
        responseText = response.text || "";
        if (responseText) {
          break;
        }
      } catch (errModel) {
        console.warn(`[GeminiOcrAuditService] Falló modelo ${model} en OCR:`, errModel);
        lastError = errModel;
      }
    }

    if (!responseText) {
      throw lastError || new Error("Ningún modelo de Gemini Vision pudo completar la auditoría OCR.");
    }

    const parsed = parseGeminiAuditJson(responseText);

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
              suggestedFixLatex: sanitizeLatexExpression(problem.mockAudit.steps[0]?.latexExpression),
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

    return {
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
    };
  }
}

export const geminiOcrAuditService = new GeminiOcrAuditService();
