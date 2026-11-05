import * as React from "react";
import { Link } from "react-router-dom";
import { CtaButton } from "./CtaButton";
import { cn } from "@/lib/utils";

/**
 * Encabezado minimalista StoryBrand: logotipo a la izquierda y CTA dominante
 * en la esquina superior derecha (zona de mayor impacto del patrón en "Z").
 * Sin menú: los enlaces secundarios viven en el footer ("cajón de los deshechos").
 */
export const LandingHeader: React.FC = () => {
  const [scrolled, setScrolled] = React.useState(false);
  const progressRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled(y > 12);
        const max = document.documentElement.scrollHeight - window.innerHeight;
        if (progressRef.current) {
          progressRef.current.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
        }
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled ? "bg-[#fffcf2]/85 shadow-[0_8px_30px_-12px_rgba(59,65,81,0.25)] backdrop-blur-xl" : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link to="/" className="group flex items-center gap-2.5 rounded-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-quack-amber/60" aria-label="Quack, ir al inicio">
          <img
            src="/brand/quack-logo.png"
            alt=""
            width={44}
            height={44}
            className="h-11 w-11 transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110"
          />
          <span className="font-brand text-2xl font-bold tracking-tight text-quack-gunmetal">quack</span>
        </Link>

        <CtaButton to="/feynman" location="header" size="md" className="sm:h-12 sm:px-6 sm:text-base">
          Practicar gratis
        </CtaButton>
      </div>
      <div
        ref={progressRef}
        className="h-[3px] origin-left bg-gradient-to-r from-quack-amber via-quack-sandy to-quack-caramel"
        style={{ transform: "scaleX(0)" }}
        aria-hidden="true"
      />
    </header>
  );
};
