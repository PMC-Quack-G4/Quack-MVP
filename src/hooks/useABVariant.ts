import * as React from "react";
import { trackEvent } from "@/lib/analytics";

/**
 * Asigna de forma persistente (localStorage) una variante A/B al visitante
 * y registra la exposición en analítica una sola vez por sesión.
 *
 * Se puede forzar una variante con `?variant=B` en la URL (útil para demos).
 */
export function useABVariant<T extends string>(experiment: string, variants: readonly T[]): T {
  const [variant] = React.useState<T>(() => {
    const fallback = variants[0];
    if (typeof window === "undefined") return fallback;

    const forced = new URLSearchParams(window.location.search).get("variant");
    const forcedMatch = variants.find((v) => v === forced);
    if (forcedMatch) return forcedMatch;

    const key = `quack_ab_${experiment}`;
    try {
      const stored = window.localStorage.getItem(key);
      const storedMatch = variants.find((v) => v === stored);
      if (storedMatch) return storedMatch;

      const assigned = variants[Math.floor(Math.random() * variants.length)] ?? fallback;
      window.localStorage.setItem(key, assigned);
      return assigned;
    } catch {
      return fallback;
    }
  });

  React.useEffect(() => {
    trackEvent("ab_exposure", { experiment, variant });
  }, [experiment, variant]);

  return variant;
}
