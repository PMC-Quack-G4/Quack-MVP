import * as React from "react";
import { Link } from "react-router-dom";
import { CtaButton } from "./CtaButton";
import { playQuackSound } from "@/lib/quackSound";
import { cn } from "@/lib/utils";

/**
 * Encabezado minimalista StoryBrand:
 * - Izquierda: Logo del pato limpio + texto "quack" al lado (sin cajas ni avisos).
 *   Al tocar el logo suena el Easter Egg oculto.
 * - Derecha: Enlace limpio a Precios + Botón CTA principal en la esquina superior derecha.
 */
export const LandingHeader: React.FC = () => {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-quack-gunmetal/10 bg-[#fffcf2]/90 backdrop-blur-md"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link
          to="/"
          onClick={() => playQuackSound("header_logo_easter_egg")}
          aria-label="Quack, ir al inicio"
          className="flex items-center gap-2.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-quack-amber"
        >
          <img
            src="/brand/quack-logo.png"
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 object-contain"
          />
          <span className="font-brand text-2xl font-bold tracking-tight text-quack-gunmetal">
            quack
          </span>
        </Link>

        <div className="flex items-center gap-5 sm:gap-7">
          <a
            href="#como-funciona"
            className="hidden text-sm font-semibold text-quack-gunmetal/75 transition-colors hover:text-quack-gunmetal sm:inline"
          >
            Cómo funciona
          </a>
          <a
            href="#precios"
            className="text-sm font-semibold text-quack-gunmetal/80 transition-colors hover:text-quack-gunmetal"
          >
            Precios
          </a>
          <CtaButton to="/feynman" location="header" size="md">
            Empezar ahora
          </CtaButton>
        </div>
      </div>
    </header>
  );
};
