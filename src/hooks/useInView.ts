import * as React from "react";

interface UseInViewOptions {
  /** Porcentaje visible necesario para considerar el elemento en pantalla. */
  threshold?: number;
  rootMargin?: string;
  /** Si es true, deja de observar tras la primera aparición. */
  once?: boolean;
}

/**
 * Observa si un elemento está en el viewport mediante IntersectionObserver.
 */
export function useInView<T extends Element>({
  threshold = 0.2,
  rootMargin = "0px",
  once = true,
}: UseInViewOptions = {}): [React.RefObject<T>, boolean] {
  const ref = React.useRef<T>(null);
  const [inView, setInView] = React.useState(false);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return [ref, inView];
}
