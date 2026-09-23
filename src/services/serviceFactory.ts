import { IFeynmanService, IOcrAuditService } from "./types";
import { geminiFeynmanService } from "./geminiFeynmanService";
import { mockFeynmanService } from "./mockFeynmanService";
import { geminiOcrAuditService } from "./geminiOcrAuditService";
import { mockOcrAuditService } from "./mockOcrAuditService";

const hasApiKey = Boolean(import.meta.env.VITE_GEMINI_API_KEY);

/**
 * Instancia del servicio de Feynman Oral.
 * Utiliza Gemini si la clave está disponible (con degradación a Mock) o Mock directo.
 */
export const feynmanService: IFeynmanService = hasApiKey
  ? geminiFeynmanService
  : mockFeynmanService;

/**
 * Instancia del servicio de Auditoría OCR.
 * Utiliza Gemini Vision si la clave está disponible o Mock directo con KaTeX.
 */
export const ocrAuditService: IOcrAuditService = hasApiKey
  ? geminiOcrAuditService
  : mockOcrAuditService;

export const isGeminiActive = (): boolean => hasApiKey;
