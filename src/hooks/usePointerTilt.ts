import * as React from "react";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

/**
 * Inclinación 3D según la posición del puntero.
 * Escribe las variables CSS `--rx` y `--ry` (grados) en el elemento,
 * sin re-renderizar React (rendimiento).
 */
export function usePointerTilt<T extends HTMLElement>(maxDeg = 10): React.RefObject<T> {
  const ref = React.useRef<T>(null);
  const reduced = usePrefersReducedMotion();

  React.useEffect(() => {
    const node = ref.current;
    if (!node || reduced) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let frame = 0;
    const onMove = (event: PointerEvent) => {
      const rect = node.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        node.style.setProperty("--ry", `${(x * maxDeg).toFixed(2)}deg`);
        node.style.setProperty("--rx", `${(-y * maxDeg).toFixed(2)}deg`);
      });
    };
    const onLeave = () => {
      cancelAnimationFrame(frame);
      node.style.setProperty("--ry", "0deg");
      node.style.setProperty("--rx", "0deg");
    };

    node.addEventListener("pointermove", onMove);
    node.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      node.removeEventListener("pointermove", onMove);
      node.removeEventListener("pointerleave", onLeave);
    };
  }, [maxDeg, reduced]);

  return ref;
}
