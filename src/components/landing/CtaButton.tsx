import * as React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import type { CtaLocation } from "@/types/landing";

type CtaSize = "md" | "lg" | "xl";
type CtaTone = "amber" | "dark" | "light";

interface CtaButtonProps {
  to: string;
  location: CtaLocation;
  children: React.ReactNode;
  size?: CtaSize;
  tone?: CtaTone;
  showArrow?: boolean;
  className?: string;
}

const sizeClasses: Record<CtaSize, string> = {
  md: "h-11 px-5 text-sm",
  lg: "h-14 px-7 text-base",
  xl: "h-16 px-9 text-lg",
};

const toneClasses: Record<CtaTone, string> = {
  amber: "bg-quack-amber text-quack-gunmetal hover:bg-[#ffd21f]",
  dark: "bg-quack-gunmetal text-white hover:bg-[#454c5f]",
  light: "btn-toy-light bg-white text-quack-gunmetal hover:bg-quack-dandelion",
};

/**
 * Llamado a la acción principal: botón "juguete" con contraste alto,
 * que registra el clic en analítica según su ubicación.
 */
export const CtaButton: React.FC<CtaButtonProps> = ({
  to,
  location,
  children,
  size = "lg",
  tone = "amber",
  showArrow = true,
  className,
}) => (
  <Link
    to={to}
    onClick={() => trackEvent("cta_click", { location, destination: to })}
    className={cn("btn-toy group", sizeClasses[size], toneClasses[tone], className)}
  >
    {children}
    {showArrow && (
      <ArrowRight
        aria-hidden="true"
        className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1"
      />
    )}
  </Link>
);
