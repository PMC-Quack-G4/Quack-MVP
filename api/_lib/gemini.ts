import { GoogleGenAI } from "@google/genai";

export const DEFAULT_GEMINI_MODEL = "gemini-flash-latest";
export const DEFAULT_GEMINI_LIVE_MODEL = "gemini-2.5-flash-native-audio-preview-12-2025";

export function getGeminiApiKey(): string {
  return process.env.GEMINI_API_KEY?.trim() || "";
}

export function getGeminiModel(): string {
  return process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;
}

export function getGeminiLiveModel(): string {
  return process.env.GEMINI_LIVE_MODEL?.trim() || DEFAULT_GEMINI_LIVE_MODEL;
}

export function getGaMeasurementId(): string {
  return process.env.GA_MEASUREMENT_ID?.trim() || "";
}

export function getLeadEndpoint(): string {
  return process.env.LEAD_ENDPOINT?.trim() || "";
}

export function createGeminiClient(apiVersion?: string): GoogleGenAI | null {
  const apiKey = getGeminiApiKey();
  if (!apiKey) return null;

  return new GoogleGenAI({
    apiKey,
    ...(apiVersion ? { httpOptions: { apiVersion } } : {}),
  });
}

/**
 * Reintenta llamadas a la API de Gemini ante errores transitorios (503 / 429) con backoff.
 */
export async function callWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelayMs = 1000,
  label = "Gemini API"
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
          `[${label}] Error transitorio (${apiErr.status || 503}). Reintento ${attempt}/${maxRetries} en ${delay}ms...`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}
