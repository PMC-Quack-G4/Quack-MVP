import * as React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import type { CtaLocation } from "@/types/landing";

type CtaSize = "md" | "lg" | "xl";
type CtaTone = "amber" | "dark" | "light";

interface CtaButtonProps {
  to?: string;
  href?: string;
  onClick?: () => void;
  location: CtaLocation;
  children: React.ReactNode;
  size?: CtaSize;
  tone?: CtaTone;
  showArrow?: boolean;
  className?: string;
}

const sizeClasses: Record<CtaSize, string> = {
  md: "h-11 px-5 text-sm",
  lg: "h-13 px-6 text-base py-3",
  xl: "h-14 px-8 text-base sm:text-lg",
};

const toneClasses: Record<CtaTone, string> = {
  amber: "bg-quack-amber text-quack-gunmetal hover:bg-[#ffd21f]",
  dark: "bg-quack-gunmetal text-white hover:bg-[#454c5f]",
  light: "btn-toy-light bg-white text-quack-gunmetal hover:bg-quack-dandelion",
};

/**
 * Llamado a la acción principal: botón "juguete" con contraste alto
 * que dispara el evento principal de conversión `click_cta` en GA4.
 */
export const CtaButton: React.FC<CtaButtonProps> = ({
  to,
  href,
  onClick,
  location,
  children,
  size = "lg",
  tone = "amber",
  showArrow = true,
  className,
}) => {
  const classes = cn("btn-toy group cursor-pointer", sizeClasses[size], toneClasses[tone], className);
  const destination = to ?? href ?? "modal";

  const handleClick = () => {
    trackEvent("click_cta", { location, destination });
    onClick?.();
  };

  const content = (
    <>
      {children}
      {showArrow && (
        <ArrowRight
          aria-hidden="true"
          className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1"
        />
      )}
    </>
  );

  if (href) {
    return (
      <a href={href} onClick={handleClick} className={classes}>
        {content}
      </a>
    );
  }

  if (to) {
    return (
      <Link to={to} onClick={handleClick} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={handleClick} className={classes}>
      {content}
    </button>
  );
};
