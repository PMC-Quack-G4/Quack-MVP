import { IFeynmanService, IOcrAuditService, FeynmanEvaluationResult } from "./types";
import { geminiFeynmanService } from "./geminiFeynmanService";
import { mockFeynmanService } from "./mockFeynmanService";
import { geminiOcrAuditService } from "./geminiOcrAuditService";
import { mockOcrAuditService } from "./mockOcrAuditService";
import { FeynmanTopic, ChatMessage } from "@/types/feynman";
import { ExamProblem, MockAuditResult } from "@/types/exam";

const STORAGE_KEY = "quack_gemini_api_key";
type KeyChangeCallback = (newKey: string) => void;
const listeners: Set<KeyChangeCallback> = new Set();

/**
 * Obtiene la API Key activa: primero busca en localStorage y luego en variables de entorno VITE.
 */
export function getActiveApiKey(): string {
  if (typeof window !== "undefined") {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && stored.trim()) {
      return stored.trim();
    }
  }
  return (import.meta.env.VITE_GEMINI_API_KEY as string)?.trim() || "";
}

/**
 * Guarda una API Key personalizada en localStorage y notifica a los suscriptores.
 */
export function setActiveApiKey(key: string): void {
  if (typeof window !== "undefined") {
    if (key && key.trim()) {
      window.localStorage.setItem(STORAGE_KEY, key.trim());
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    listeners.forEach((fn) => fn(key.trim()));
  }
}

/**
 * Elimina la API Key personalizada de localStorage y revierte a la configuración por defecto.
 */
export function clearActiveApiKey(): void {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(STORAGE_KEY);
    listeners.forEach((fn) => fn(""));
  }
}

/**
 * Permite a componentes suscribirse a cambios de la API Key.
 */
export function subscribeToApiKeyChange(callback: KeyChangeCallback): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

/**
 * Verifica de forma reactiva si Gemini está activo (clave presente).
 */
export function isGeminiActive(): boolean {
  return Boolean(getActiveApiKey());
}

/**
 * Adaptador dinámico para Feynman Oral:
 * Despacha dinámicamente a Gemini si hay clave activa, con degradación automática al mock.
 */
class DynamicFeynmanService implements IFeynmanService {
  async sendMessage(
    topic: FeynmanTopic,
    history: ChatMessage[],
    studentInput: string,
    currentCoveredIds: string[]
  ): Promise<FeynmanEvaluationResult> {
    const key = getActiveApiKey();
    if (key) {
      try {
        return await geminiFeynmanService.sendMessage(topic, history, studentInput, currentCoveredIds);
      } catch (err) {
        console.warn("Fallo en GeminiFeynmanService. Activando fallback a MockFeynmanService:", err);
        return await mockFeynmanService.sendMessage(topic, history, studentInput, currentCoveredIds);
      }
    }
    return await mockFeynmanService.sendMessage(topic, history, studentInput, currentCoveredIds);
  }
}

/**
 * Adaptador dinámico para Auditoría OCR:
 * Despacha a Gemini Vision si hay clave activa, con fallback automático al mock.
 */
class DynamicOcrAuditService implements IOcrAuditService {
  async auditSolution(
    problem: ExamProblem,
    imageBase64OrUrl: string
  ): Promise<MockAuditResult> {
    const key = getActiveApiKey();
    if (key) {
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

export const feynmanService: IFeynmanService = new DynamicFeynmanService();
export const ocrAuditService: IOcrAuditService = new DynamicOcrAuditService();
