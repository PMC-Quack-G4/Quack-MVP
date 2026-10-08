import { IFeynmanService, IOcrAuditService, FeynmanEvaluationResult } from "./types";
import { geminiFeynmanService } from "./geminiFeynmanService";
import { mockFeynmanService } from "./mockFeynmanService";
import { geminiOcrAuditService } from "./geminiOcrAuditService";
import { mockOcrAuditService } from "./mockOcrAuditService";
import { FeynmanTopic, ChatMessage } from "@/types/feynman";
import { ExamProblem, MockAuditResult } from "@/types/exam";

const hasApiKey = Boolean(import.meta.env.VITE_GCP_GEMINI_API_KEY);

/**
 * Indica si el servicio de Gemini está configurado vía variables de entorno (.env).
 */
export function isGeminiActive(): boolean {
  return hasApiKey;
}

/**
 * Obtiene el modelo configurado por el desarrollador en variables de entorno o usa gemini-flash-latest por defecto.
 */
export function getActiveModel(): string {
  return (import.meta.env.VITE_GEMINI_MODEL as string)?.trim() || "gemini-flash-latest";
}

/**
 * Adaptador para Feynman Oral:
 * Utiliza Gemini si VITE_GCP_GEMINI_API_KEY está configurada en .env, con reintentos y fallback a Mock pedagógico.
 */
class FeynmanServiceAdapter implements IFeynmanService {
  async sendMessage(
    topic: FeynmanTopic,
    history: ChatMessage[],
    studentInput: string,
    currentCoveredIds: string[],
    subtopicScores?: Record<string, SubtopicScoreData>,
    activeSubtopicId?: string
  ): Promise<FeynmanEvaluationResult> {
    if (hasApiKey) {
      try {
        return await geminiFeynmanService.sendMessage(
          topic,
          history,
          studentInput,
          currentCoveredIds,
          subtopicScores,
          activeSubtopicId
        );
      } catch (err: unknown) {
        console.warn("Fallo en GeminiFeynmanService tras reintentos. Conmutando a MockFeynmanService:", err);
        const mockResult = await mockFeynmanService.sendMessage(
          topic,
          history,
          studentInput,
          currentCoveredIds,
          subtopicScores,
          activeSubtopicId
        );
        return {
          ...mockResult,
          engineUsed: "mock",
          warning: "La API de Gemini experimentó un pico de demanda temporal (503/429). Quack respondió con el evaluador pedagógico local.",
        };
      }
    }
    return await mockFeynmanService.sendMessage(
      topic,
      history,
      studentInput,
      currentCoveredIds,
      subtopicScores,
      activeSubtopicId
    );
  }
}

/**
 * Adaptador para Parcial a Ciegas OCR:
 * Utiliza Gemini Vision si VITE_GCP_GEMINI_API_KEY está configurada en .env, con fallback automático a Mock.
 */
class OcrAuditServiceAdapter implements IOcrAuditService {
  async auditSolution(
    problem: ExamProblem,
    imageBase64OrUrl: string,
    rotation = 0
  ): Promise<MockAuditResult> {
    if (hasApiKey) {
      try {
        return await geminiOcrAuditService.auditSolution(problem, imageBase64OrUrl, rotation);
      } catch (err) {
        console.warn("Fallo en GeminiOcrAuditService. Conmutando a MockOcrAuditService:", err);
        const mockResult = await mockOcrAuditService.auditSolution(
          problem,
          imageBase64OrUrl,
          rotation
        );
        return {
          ...mockResult,
          engineUsed: "mock",
          warning:
            "La API de Gemini Vision experimentó un pico de demanda temporal o límite de cuota (503/429). Se evaluó con el motor de auditoría pedagógica local.",
        };
      }
    }
    return await mockOcrAuditService.auditSolution(problem, imageBase64OrUrl, rotation);
  }
}

export const feynmanService: IFeynmanService = new FeynmanServiceAdapter();
export const ocrAuditService: IOcrAuditService = new OcrAuditServiceAdapter();
