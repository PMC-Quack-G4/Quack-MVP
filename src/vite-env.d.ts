/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY?: string;
  readonly VITE_GEMINI_MODEL?: string;
  /** Endpoint opcional (Formspree, Google Apps Script, etc.) para registrar prospectos de la landing. */
  readonly VITE_LEAD_ENDPOINT?: string;
  /** ID de medición de Google Analytics 4 (ej. G-XXXXXXX). */
  readonly VITE_GA_MEASUREMENT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
