/**
 * Analítica ligera para la landing (KPIs: conversión, rebote, duración de sesión).
 *
 * - Si `VITE_GA_MEASUREMENT_ID` existe, se carga Google Analytics 4 de forma diferida.
 * - Si no existe, los eventos se registran en consola (solo en desarrollo) y nunca
 *   bloquean la experiencia del usuario.
 */

type GtagArgs = [string, ...unknown[]];

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: GtagArgs) => void;
  }
}

const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim();
let initialized = false;

export function initAnalytics(): void {
  if (initialized || !measurementId || typeof window === "undefined") return;
  initialized = true;

  window.dataLayer = window.dataLayer ?? [];
  window.gtag = (...args: GtagArgs) => {
    window.dataLayer?.push(args);
  };
  window.gtag("js", new Date());
  window.gtag("config", measurementId, { anonymize_ip: true });

  const loadScript = () => {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);
  };

  // Carga diferida para no penalizar el tiempo de carga inicial (< 2 s).
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(loadScript, { timeout: 3000 });
  } else {
    setTimeout(loadScript, 1500);
  }
}

export function trackEvent(name: string, params: Record<string, string | number | boolean> = {}): void {
  try {
    if (window.gtag && measurementId) {
      window.gtag("event", name, params);
    } else if (import.meta.env.DEV) {
      console.info(`[analytics] ${name}`, params);
    }
  } catch {
    // La analítica nunca debe romper la interfaz.
  }
}
