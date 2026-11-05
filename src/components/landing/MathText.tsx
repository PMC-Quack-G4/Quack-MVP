import * as React from "react";
import { MathRenderer } from "@/components/common/MathRenderer";

/**
 * Renderiza texto con fórmulas delimitadas por `$...$` usando KaTeX.
 */
export const MathText: React.FC<{ text: string; className?: string }> = ({ text, className }) => {
  const parts = text.split(/(\$[^$]+\$)/g).filter(Boolean);
  return (
    <span className={className}>
      {parts.map((part, i) =>
        part.startsWith("$") && part.endsWith("$") ? (
          <MathRenderer key={i} math={part.slice(1, -1)} />
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        )
      )}
    </span>
  );
};
