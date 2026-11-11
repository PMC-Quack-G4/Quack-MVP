import * as React from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { CtaButton } from "./CtaButton";
import { playQuackSound } from "@/lib/quackSound";
import { cn } from "@/lib/utils";

const mobileNavLinks = [
  { href: "#problema", step: "01", label: "El problema" },
  { href: "#como-funciona", step: "02", label: "Cómo funciona en 3 pasos" },
  { href: "#instituciones", step: "03", label: "Estudiantes vs. Universidades" },
  { href: "#precios", step: "04", label: "Planes y Precios (USD)" },
  { href: "#preguntas", step: "05", label: "Preguntas frecuentes" },
] as const;

/**
 * Encabezado minimalista StoryBrand:
 * - Desktop (`sm:`+): Logo limpio + `Cómo funciona` + `Precios` + CTA `Empezar ahora`.
 * - Móvil (`< sm`): Logo compacto sin cortes + CTA compacto `Probar` + menú desplegable guiado por secciones.
 */
export const LandingHeader: React.FC = () => {
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileMenuOpen]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled || mobileMenuOpen
          ? "border-b border-quack-gunmetal/15 bg-[#fffcf2]/95 backdrop-blur-md"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4 sm:h-[68px] sm:px-8">
        <Link
          to="/"
          onClick={() => {
            playQuackSound("header_logo_easter_egg");
            setMobileMenuOpen(false);
          }}
          aria-label="Quack, ir al inicio"
          className="flex shrink-0 items-center gap-2 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-quack-amber sm:gap-2.5"
        >
          <img
            src="/brand/quack-logo.png"
            alt=""
            width={40}
            height={40}
            className="h-8 w-8 object-contain sm:h-10 sm:w-10"
          />
          <span className="font-brand text-xl font-bold tracking-tight text-quack-gunmetal sm:text-2xl">
            quack
          </span>
        </Link>

        {/* Navegación Desktop (`sm:`+) — se conserva intacta */}
        <div className="hidden items-center gap-5 sm:flex sm:gap-7">
          <a
            href="#como-funciona"
            className="text-sm font-semibold text-quack-gunmetal/75 transition-colors hover:text-quack-gunmetal"
          >
            Cómo funciona
          </a>
          <a
            href="#precios"
            className="text-sm font-semibold text-quack-gunmetal/80 transition-colors hover:text-quack-gunmetal"
          >
            Precios
          </a>
          <CtaButton to="/login" location="header" size="md">
            Empezar ahora
          </CtaButton>
        </div>

        {/* Acciones Móvil (`< sm`) — sin colisión ni recorte en pantallas pequeñas */}
        <div className="flex shrink-0 items-center gap-2 sm:hidden">
          <CtaButton
            to="/login"
            location="header"
            size="md"
            showArrow={false}
            className="h-9 rounded-xl px-3 text-xs"
          >
            Probar
          </CtaButton>
          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-expanded={mobileMenuOpen}
            aria-controls="landing-mobile-menu"
            aria-label={mobileMenuOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación"}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border-2 border-quack-gunmetal bg-white text-quack-gunmetal shadow-[2px_2px_0_0_#3B4151] active:translate-y-0.5"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Panel Desplegable Móvil con flujo numerado */}
      {mobileMenuOpen && (
        <nav
          id="landing-mobile-menu"
          aria-label="Navegación móvil"
          className="max-h-[calc(100svh-4rem)] overflow-y-auto border-t border-quack-gunmetal/15 bg-[#fffcf2] px-4 py-4 shadow-xl sm:hidden"
        >
          <ul className="space-y-1.5">
            {mobileNavLinks.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-quack-gunmetal transition-colors hover:bg-quack-dandelion/60"
                >
                  <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-quack-amber font-mono text-[11px] font-bold text-quack-gunmetal">
                    {item.step}
                  </span>
                  <span>{item.label}</span>
                </a>
              </li>
            ))}
          </ul>

          <div className="mt-3 grid grid-cols-2 gap-2 border-t border-quack-gunmetal/10 pt-3">
            <Link
              to="/login?redirect=/feynman"
              onClick={() => setMobileMenuOpen(false)}
              className="flex h-10 items-center justify-center rounded-xl border-2 border-quack-gunmetal bg-quack-amber font-brand text-xs font-bold text-quack-gunmetal"
            >
              Feynman Oral
            </Link>
            <Link
              to="/login?redirect=/parcial-ciegas"
              onClick={() => setMobileMenuOpen(false)}
              className="flex h-10 items-center justify-center rounded-xl border-2 border-quack-gunmetal bg-[#151922] font-brand text-xs font-bold text-white"
            >
              Parcial OCR
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
};
