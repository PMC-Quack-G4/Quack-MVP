import { IFeynmanService, IOcrAuditService, FeynmanEvaluationResult } from "./types";
import { geminiFeynmanService } from "./geminiFeynmanService";
import { mockFeynmanService } from "./mockFeynmanService";
import { geminiOcrAuditService } from "./geminiOcrAuditService";
import { mockOcrAuditService } from "./mockOcrAuditService";
import { FeynmanTopic, ChatMessage } from "@/types/feynman";
import { ExamProblem, MockAuditResult } from "@/types/exam";

const hasApiKey = Boolean(import.meta.env.VITE_GEMINI_API_KEY);

/**
 * Indica si el servicio de Gemini está configurado vía variables de entorno (.env).
 */
export function isGeminiActive(): boolean {
  return hasApiKey;
}

/**
 * Obtiene el modelo configurado por el desarrollador en variables de entorno o usa gemini-2.0-flash por defecto.
 */
export function getActiveModel(): string {
  return (import.meta.env.VITE_GEMINI_MODEL as string)?.trim() || "gemini-2.0-flash";
}

/**
 * Adaptador para Feynman Oral:
 * Utiliza Gemini si VITE_GEMINI_API_KEY está configurada en .env, con fallback automático a Mock en caso de error.
 */
class FeynmanServiceAdapter implements IFeynmanService {
  async sendMessage(
    topic: FeynmanTopic,
    history: ChatMessage[],
    studentInput: string,
    currentCoveredIds: string[]
  ): Promise<FeynmanEvaluationResult> {
    if (hasApiKey) {
      try {
        return await geminiFeynmanService.sendMessage(topic, history, studentInput, currentCoveredIds);
      } catch (err) {
        console.warn("Fallo en GeminiFeynmanService. Conmutando a MockFeynmanService:", err);
        return await mockFeynmanService.sendMessage(topic, history, studentInput, currentCoveredIds);
      }
    }
    return await mockFeynmanService.sendMessage(topic, history, studentInput, currentCoveredIds);
  }
}

/**
 * Adaptador para Parcial a Ciegas OCR:
 * Utiliza Gemini Vision si VITE_GEMINI_API_KEY está configurada en .env, con fallback automático a Mock.
 */
class OcrAuditServiceAdapter implements IOcrAuditService {
  async auditSolution(
    problem: ExamProblem,
    imageBase64OrUrl: string
  ): Promise<MockAuditResult> {
    if (hasApiKey) {
      try {
        return await geminiOcrAuditService.auditSolution(problem, imageBase64OrUrl);
      } catch (err) {
        console.warn("Fallo en GeminiOcrAuditService. Conmutando a MockOcrAuditService:", err);
        return await mockOcrAuditService.auditSolution(problem, imageBase64OrUrl);
      }
    }
    return await mockOcrAuditService.auditSolution(problem, imageBase64OrUrl);
  }
}

export const feynmanService: IFeynmanService = new FeynmanServiceAdapter();
export const ocrAuditService: IOcrAuditService = new OcrAuditServiceAdapter();
