import * as React from "react";

/**
 * Configuración pública en tiempo de ejecución obtenida desde `/api/config`.
 * Ninguna llave sensible (como `GEMINI_API_KEY`) se incluye en el bundle del navegador.
 */

export interface RuntimePublicConfig {
  geminiActive: boolean;
  model: string;
  liveModel: string;
  gaMeasurementId: string;
  loaded: boolean;
}

const DEFAULT_CONFIG: RuntimePublicConfig = {
  geminiActive: false,
  model: "gemini-flash-latest",
  liveModel: "gemini-2.5-flash-native-audio-preview-12-2025",
  gaMeasurementId: "",
  loaded: false,
};

let currentConfig: RuntimePublicConfig = DEFAULT_CONFIG;
let inflightPromise: Promise<RuntimePublicConfig> | null = null;
const listeners = new Set<() => void>();

function notify(): void {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): RuntimePublicConfig {
  return currentConfig;
}

export function ensureRuntimeConfig(): Promise<RuntimePublicConfig> {
  if (currentConfig.loaded) {
    return Promise.resolve(currentConfig);
  }
  if (inflightPromise) {
    return inflightPromise;
  }
  if (typeof window === "undefined" || typeof fetch === "undefined") {
    return Promise.resolve(currentConfig);
  }

  inflightPromise = fetch("/api/config", {
    method: "GET",
    headers: { Accept: "application/json" },
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = (await response.json()) as Partial<RuntimePublicConfig>;
      currentConfig = {
        geminiActive: Boolean(data.geminiActive),
        model:
          typeof data.model === "string" && data.model.trim()
            ? data.model.trim()
            : DEFAULT_CONFIG.model,
        liveModel:
          typeof data.liveModel === "string" && data.liveModel.trim()
            ? data.liveModel.trim()
            : DEFAULT_CONFIG.liveModel,
        gaMeasurementId:
          typeof data.gaMeasurementId === "string" ? data.gaMeasurementId.trim() : "",
        loaded: true,
      };
      notify();
      return currentConfig;
    })
    .catch(() => {
      currentConfig = { ...currentConfig, loaded: true };
      notify();
      return currentConfig;
    })
    .finally(() => {
      inflightPromise = null;
    });

  return inflightPromise;
}

// Dispara la lectura inicial de configuración pública apenas carga la aplicación en el navegador.
if (typeof window !== "undefined") {
  void ensureRuntimeConfig();
}

export function useAiConfig(): RuntimePublicConfig {
  React.useEffect(() => {
    void ensureRuntimeConfig();
  }, []);

  return React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function isGeminiActive(): boolean {
  return currentConfig.geminiActive;
}

export function getActiveModel(): string {
  return currentConfig.model;
}

export function getActiveLiveModel(): string {
  return currentConfig.liveModel;
}

export function getGaMeasurementId(): string {
  return currentConfig.gaMeasurementId;
}
