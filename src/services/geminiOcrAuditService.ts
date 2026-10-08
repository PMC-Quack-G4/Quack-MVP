import { IOcrAuditService } from "./types";
import { ExamProblem, MockAuditResult } from "@/types/exam";

/**
 * Función para leer y rotar la imagen usando un canvas HTML oculto, retornando Base64
 */
async function prepareImageForOcr(
  imageBase64OrUrl: string,
  rotation = 0
): Promise<{ mimeType: string; base64Data: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      try {
        if (rotation === 0 && imageBase64OrUrl.startsWith("data:")) {
          const match = imageBase64OrUrl.match(/^data:(image\/\w+);base64,(.+)$/);
          if (match) {
            resolve({ mimeType: match[1], base64Data: match[2] });
            return;
          }
        }

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("No se pudo obtener el contexto del canvas.");

        let width = img.width;
        let height = img.height;

        if (rotation === 90 || rotation === 270) {
          canvas.width = height;
          canvas.height = width;
        } else {
          canvas.width = width;
          canvas.height = height;
        }

        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.drawImage(img, -width / 2, -height / 2, width, height);

        const rotatedDataUrl = canvas.toDataURL("image/jpeg", 0.9);
        const match = rotatedDataUrl.match(/^data:(image\/\w+);base64,(.+)$/);
        if (match) {
          resolve({ mimeType: match[1], base64Data: match[2] });
        } else {
          throw new Error("Fallo al generar data URL del canvas rotado.");
        }
      } catch (canvasErr) {
        console.warn("[GeminiOcrAuditService] No se pudo rasterizar en canvas, intentando extracción directa:", canvasErr);
        const fbMatch = imageBase64OrUrl.match(/^data:(image\/\w+);base64,(.+)$/);
        if (fbMatch) {
          resolve({ mimeType: fbMatch[1], base64Data: fbMatch[2] });
        } else {
          reject(new Error("Formato de imagen inválido o sin soporte de CORS."));
        }
      }
    };
    img.onerror = () => reject(new Error("Error al cargar la imagen para pre-procesamiento."));
    img.src = imageBase64OrUrl;
  });
}

/**
 * Servicio OCR que ahora se conecta al backend local/Dockerizado.
 */
export class GeminiOcrAuditService implements IOcrAuditService {
  async auditSolution(
    problem: ExamProblem,
    imageBase64OrUrl: string,
    rotation = 0
  ): Promise<MockAuditResult> {
    
    // Primero procesamos la imagen en el frontend (rotación)
    const { mimeType, base64Data } = await prepareImageForOcr(imageBase64OrUrl, rotation);
    const finalBase64 = `data:${mimeType};base64,${base64Data}`;

    const response = await fetch('/api/ocr-audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        problem,
        imageBase64OrUrl: finalBase64,
        rotation: 0 // Ya fue rotada
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP error ${response.status}`);
    }

    return await response.json();
  }
}

export const geminiOcrAuditService = new GeminiOcrAuditService();
