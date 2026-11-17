/**
 * Utilidades livianas de configuración del motor IA para evitar acoplar
 * el SDK de `@google/genai` al bundle inicial de la Landing Page.
 */

export function isGeminiActive(): boolean {
  return Boolean(import.meta.env.VITE_GEMINI_API_KEY);
}

export function getActiveModel(): string {
  return (import.meta.env.VITE_GEMINI_MODEL as string)?.trim() || "gemini-flash-latest";
}

export function getActiveLiveModel(): string {
  return (
    (import.meta.env.VITE_GEMINI_LIVE_MODEL as string)?.trim() ||
    "gemini-2.5-flash-native-audio-preview-12-2025"
  );
}
