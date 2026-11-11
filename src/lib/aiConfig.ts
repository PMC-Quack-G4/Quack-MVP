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
