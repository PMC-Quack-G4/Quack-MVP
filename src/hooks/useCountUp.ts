import * as React from "react";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

/**
 * Anima un número desde 0 hasta `target` cuando `start` es true.
 */
export function useCountUp(target: number, start: boolean, durationMs = 1600): number {
  const reduced = usePrefersReducedMotion();
  const [value, setValue] = React.useState(0);

  React.useEffect(() => {
    if (!start) return;
    if (reduced || target === 0) {
      setValue(target);
      return;
    }

    let frame = 0;
    const startTime = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, start, durationMs, reduced]);

  return value;
}
