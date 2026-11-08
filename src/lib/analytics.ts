/**
 * Sistema de Medición y Analítica Digital (GA4 + UTM + Eventos de Conversión — Semana 12 ISIS-2007).
 *
 * Métrica Principal de Conversión (KPI primario):
 *   - `click_cta` / `begin_checkout` (Clic en acción principal de suscripción o prueba)
 *
 * Métricas Secundarias (Interpretación de comportamiento):
 *   1. `scroll_depth` (Porcentaje de scroll: 25%, 50%, 75%, 90%)
 *   2. `engagement_time` (Duración o tiempo de interacción activa en la página)
 *   3. `form_start` y `generate_lead` / `purchase` (Inicio y finalización de formularios)
 *   4. `demo_interaction` / `testimonial_view` (Interacción con vistas previas y evidencia)
 */

type GtagArgs = [string, ...unknown[]];

export interface AnalyticsEventRecord {
  id: string;
  name: string;
  params: Record<string, string | number | boolean>;
  timestamp: string;
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: GtagArgs) => void;
  }
}

const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim();
const UTM_STORAGE_KEY = "quack_utm_params";
let initialized = false;
const eventHistory: AnalyticsEventRecord[] = [];
const listeners = new Set<() => void>();

/** Extrae y persiste parámetros UTM de la URL actual para atribución de tráfico y campañas. */
export function getUtmParams(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const search = new URLSearchParams(window.location.search);
    const utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;
    const found: Record<string, string> = {};
    for (const key of utmKeys) {
      const val = search.get(key);
      if (val) found[key] = val;
    }
    if (Object.keys(found).length > 0) {
      window.sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(found));
      return found;
    }
    const stored = window.sessionStorage.getItem(UTM_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as Record<string, string>) : { utm_source: "direct", utm_medium: "organic" };
  } catch {
    return { utm_source: "direct", utm_medium: "organic" };
  }
}

/** Obtiene la variante A/B activa para adjuntarla a todos los eventos de conversión. */
export function getActiveVariant(): "A" | "B" {
  if (typeof window === "undefined") return "A";
  try {
    const v = window.localStorage.getItem("quack_ab_hero_headline");
    return v === "B" ? "B" : "A";
  } catch {
    return "A";
  }
}

export function initAnalytics(): () => void {
  if (typeof window === "undefined") return () => {};

  const utms = getUtmParams();

  if (!initialized) {
    initialized = true;

    if (measurementId) {
      window.dataLayer = window.dataLayer ?? [];
      window.gtag = (...args: GtagArgs) => {
        window.dataLayer?.push(args);
      };
      window.gtag("js", new Date());
      window.gtag("config", measurementId, {
        anonymize_ip: true,
        ...utms,
      });

      const loadScript = () => {
        const script = document.createElement("script");
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
        document.head.appendChild(script);
      };

      if ("requestIdleCallback" in window) {
        window.requestIdleCallback(loadScript, { timeout: 3000 });
      } else {
        setTimeout(loadScript, 1500);
      }
    }

    trackEvent("page_view", {
      page_path: window.location.pathname,
      variant: getActiveVariant(),
      ...utms,
    });
  }

  // Seguimiento automático de profundidad de scroll (25%, 50%, 75%, 90%)
  const reachedMilestones = new Set<number>();
  const onScroll = () => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;
    const pct = Math.round((window.scrollY / docHeight) * 100);
    for (const milestone of [25, 50, 75, 90]) {
      if (pct >= milestone && !reachedMilestones.has(milestone)) {
        reachedMilestones.add(milestone);
        trackEvent("scroll_depth", { percent_scrolled: milestone });
      }
    }
  };

  // Seguimiento de duración de interacción activa (15s, 30s, 60s)
  const startTime = Date.now();
  const timer15 = window.setTimeout(() => {
    trackEvent("engagement_time", { seconds: 15 });
  }, 15000);
  const timer45 = window.setTimeout(() => {
    trackEvent("engagement_time", { seconds: 45 });
  }, 45000);

  window.addEventListener("scroll", onScroll, { passive: true });

  return () => {
    window.removeEventListener("scroll", onScroll);
    window.clearTimeout(timer15);
    window.clearTimeout(timer45);
    const totalSec = Math.round((Date.now() - startTime) / 1000);
    if (totalSec >= 5) {
      trackEvent("session_duration", { duration_seconds: totalSec });
    }
  };
}

export function trackEvent(
  name: string,
  params: Record<string, string | number | boolean> = {}
): void {
  try {
    const enrichedParams: Record<string, string | number | boolean> = {
      variant: getActiveVariant(),
      ...getUtmParams(),
      ...params,
    };

    const record: AnalyticsEventRecord = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name,
      params: enrichedParams,
      timestamp: new Date().toLocaleTimeString("es-CO", { hour12: false }),
    };
    eventHistory.unshift(record);
    if (eventHistory.length > 25) eventHistory.pop();
    listeners.forEach((fn) => fn());

    if (window.gtag && measurementId) {
      window.gtag("event", name, enrichedParams);
    } else if (import.meta.env.DEV) {
      console.info(`[GA4/Analytics] ${name}`, enrichedParams);
    }
  } catch {
    // La analítica jamás debe interrumpir la experiencia del usuario.
  }
}

export function getAnalyticsHistory(): readonly AnalyticsEventRecord[] {
  return eventHistory;
}

export function subscribeAnalytics(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}
