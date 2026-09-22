import * as React from "react";
import katex from "katex";
import { cn } from "@/lib/utils";

export interface MathRendererProps {
  /**
   * LaTeX mathematical expression or equation to render.
   * Example: "E = mc^2" or "\\int_{0}^{\\infty} e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}"
   */
  math: string;
  /**
   * Whether to render in display mode (centered block) or inline.
   * Defaults to false (inline mode).
   */
  block?: boolean;
  /**
   * Custom CSS classes for the container.
   */
  className?: string;
  /**
   * Optional custom error fallback renderer if syntax is invalid.
   */
  renderError?: (error: Error) => React.ReactNode;
}

/**
 * MathRenderer component powered by KaTeX.
 * Safely renders LaTeX algebraic notation and mathematical formulas.
 */
export const MathRenderer: React.FC<MathRendererProps> = ({
  math,
  block = false,
  className,
  renderError,
}) => {
  const containerRef = React.useRef<HTMLSpanElement | HTMLDivElement>(null);
  const [renderErrorState, setRenderErrorState] = React.useState<Error | null>(null);

  const html = React.useMemo(() => {
    try {
      setRenderErrorState(null);
      return katex.renderToString(math, {
        displayMode: block,
        throwOnError: false,
        errorColor: "#ef4444",
        output: "htmlAndMathml",
      });
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setRenderErrorState(errorObj);
      return "";
    }
  }, [math, block]);

  if (renderErrorState && renderError) {
    return <>{renderError(renderErrorState)}</>;
  }

  if (block) {
    return (
      <div
        ref={containerRef as React.RefObject<HTMLDivElement>}
        className={cn(
          "my-2 overflow-x-auto py-2 text-center transition-all",
          className
        )}
        dangerouslySetInnerHTML={{ __html: html }}
        role="region"
        aria-label={`Fórmula matemática: ${math}`}
      />
    );
  }

  return (
    <span
      ref={containerRef as React.RefObject<HTMLSpanElement>}
      className={cn("inline-block align-middle transition-all", className)}
      dangerouslySetInnerHTML={{ __html: html }}
      role="math"
      aria-label={`Expresión matemática: ${math}`}
    />
  );
};

export default MathRenderer;
