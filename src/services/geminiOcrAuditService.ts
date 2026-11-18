import { ExamProblem, MockAuditResult } from "@/types/exam";
import { IOcrAuditService } from "./types";

/**
 * Limpia delimitadores innecesarios ($$, $, bloques markdown) y restaura secuencias de escape
 * de una expresión LaTeX para asegurar que KaTeX la renderice sin errores visuales.
 */
export function sanitizeLatexExpression(raw: string | undefined): string {
  if (!raw) return "";
  return raw
    .replace(/\x08/g, "\\b")
    .replace(/\x0c/g, "\\f")
    .replace(/\x09/g, "\\t")
    .replace(/\x0d/g, "\\r")
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
      console.warn(
        "[GeminiOcrAuditService] No se pudo rasterizar en canvas, intentando extracción directa:",
        canvasErr
      );
    }
  }

  const directMatch = imageBase64OrUrl.match(
    /^data:(image\/(?:png|jpeg|jpg|webp|heic|heif));base64,(.+)$/i
  );
  if (directMatch) {
    return {
      mimeType:
        directMatch[1].toLowerCase() === "image/jpg"
          ? "image/jpeg"
          : directMatch[1].toLowerCase(),
      base64Data: directMatch[2],
    };
  }

  throw new Error("No fue posible procesar el formato de la imagen para el análisis OCR.");
}

/**
 * Servicio de Auditoría OCR conectado al endpoint seguro `/api/ai/ocr`.
 * Mantiene `GEMINI_API_KEY` exclusivamente en el servidor.
 */
export class GeminiOcrAuditService implements IOcrAuditService {
  async auditSolution(
    problem: ExamProblem,
    imageBase64OrUrl: string,
    rotation = 0
  ): Promise<MockAuditResult> {
    const { mimeType, base64Data } = await prepareImageForOcr(imageBase64OrUrl, rotation);

    const response = await fetch("/api/ai/ocr", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        problem: {
          title: problem.title,
          subject: problem.subject,
          difficulty: problem.difficulty,
          statementLatex: problem.statementLatex,
          mockAudit: {
            steps: problem.mockAudit.steps.map((s) => ({
              stepNumber: s.stepNumber,
              latexExpression: s.latexExpression,
              status: s.status,
              feedback: s.feedback,
            })),
          },
        },
        mimeType,
        base64Data,
      }),
    });

    if (!response.ok) {
      let message = `HTTP ${response.status}`;
      try {
        const errPayload = (await response.json()) as { error?: string };
        if (errPayload.error) message = errPayload.error;
      } catch {
        // Ignore non-JSON error body
      }
      throw new Error(message);
    }

    return (await response.json()) as MockAuditResult;
  }
}

export const geminiOcrAuditService = new GeminiOcrAuditService();
