import * as React from "react";
import { trackEvent } from "@/lib/analytics";

const AB_EVENT_NAME = "quack:ab-variant-change";

/**
 * Permite cambiar manualmente la variante A/B en vivo (para demostración en clase,
 * capturas de pantalla A vs B o pruebas de usabilidad) y notifica a todos los componentes.
 */
export function setABVariant<T extends string>(experiment: string, variant: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(`quack_ab_${experiment}`, variant);
    window.dispatchEvent(new CustomEvent(AB_EVENT_NAME, { detail: { experiment, variant } }));
    trackEvent("ab_variant_switch", { experiment, variant });
  } catch {
    // Ignorar errores de almacenamiento.
  }
}

/**
 * Asigna de forma persistente (localStorage) una variante A/B al visitante,
 * soporta `?variant=A` o `?variant=B` en la URL, y escucha cambios en vivo.
 */
export function useABVariant<T extends string>(experiment: string, variants: readonly T[]): T {
  const key = `quack_ab_${experiment}`;
  const [variant, setVariantState] = React.useState<T>(() => {
    // Por defecto dejamos activa la Versión B (según preferencia de diseño y conversión),
    // manteniendo soporte por URL (?variant=A o ?variant=B) para pruebas A/B.
    const defaultVariant = (variants.find((v) => v === "B") ?? variants[0]);
    if (typeof window === "undefined") return defaultVariant;

    const forced = new URLSearchParams(window.location.search).get("variant");
    const forcedMatch = variants.find((v) => v === forced);
    if (forcedMatch) {
      try {
        window.localStorage.setItem(key, forcedMatch);
      } catch {
        // Ignorar
      }
      return forcedMatch;
    }

    return defaultVariant;
  });

  React.useEffect(() => {
    trackEvent("ab_exposure", { experiment, variant });
  }, [experiment, variant]);

  React.useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent<{ experiment: string; variant: T }>;
      if (custom.detail?.experiment === experiment && variants.includes(custom.detail.variant)) {
        setVariantState(custom.detail.variant);
      }
    };
    window.addEventListener(AB_EVENT_NAME, handler);
    return () => window.removeEventListener(AB_EVENT_NAME, handler);
  }, [experiment, variants]);

  return variant;
}
