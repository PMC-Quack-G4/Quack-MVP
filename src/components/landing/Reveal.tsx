import * as React from "react";
import { useInView } from "@/hooks/useInView";
import { cn } from "@/lib/utils";

interface RevealProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Retraso en ms para escalonar apariciones. */
  delay?: number;
  as?: "div" | "li" | "article";
}

/**
 * Envuelve contenido para que aparezca suavemente al entrar en pantalla.
 * Respeta `prefers-reduced-motion` vía CSS.
 */
export const Reveal: React.FC<RevealProps> = ({ delay = 0, as = "div", className, style, children, ...rest }) => {
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.15 });
  const Comp = as as "div";

  return (
    <Comp
      ref={ref}
      data-visible={inView}
      className={cn("reveal", className)}
      style={{ ...style, ["--reveal-delay" as string]: `${delay}ms` }}
      {...rest}
    >
      {children}
    </Comp>
  );
};
