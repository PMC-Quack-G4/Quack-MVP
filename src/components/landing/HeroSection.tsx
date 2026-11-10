import * as React from "react";
import { CtaButton } from "./CtaButton";
import { Hero3DScene } from "./Hero3DScene";
import { heroVariants } from "@/mocks/landingContent";
import { useABVariant } from "@/hooks/useABVariant";
import type { HeroVariantId } from "@/types/landing";

const variantIds: readonly HeroVariantId[] = heroVariants.map((v) => v.id);

const stemTicker = [
  "Programación y Algoritmia",
  "Estructuras de Datos",
  "Química y Termodinámica",
  "Biología Celular",
  "Física y Circuitos",
  "Cálculo y Álgebra Lineal",
  "Cursos Ready‑to‑Go vía LTI",
  "Estadísticas de Éxito Estudiantil",
] as const;

/**
 * HERO — Versión B activa por defecto + Escena 3D multicapa y cinta STEM.
 * En móvil deja margen superior suficiente para no cortarse bajo el header fijo.
 */
export const HeroSection: React.FC = () => {
  const variantId = useABVariant("hero_headline", variantIds);
  const variant = heroVariants.find((v) => v.id === variantId) ?? heroVariants[1];

  return (
    <section
      aria-labelledby="hero-title"
      className="lp-paper relative isolate flex flex-col justify-between overflow-hidden pt-20 sm:min-h-[calc(100svh-4rem)] sm:pt-20"
      data-variant={variant.id}
    >
      {/* Luces ambientales cálidas de fondo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/4 -z-10 h-96 w-96 rounded-full bg-quack-amber/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-10 top-1/3 -z-10 h-80 w-80 rounded-full bg-quack-sandy/20 blur-3xl"
      />

      <div className="mx-auto my-auto grid w-full max-w-6xl grid-cols-1 items-center gap-6 px-4 py-5 sm:gap-10 sm:px-8 sm:py-10 lg:grid-cols-[1.06fr_0.94fr] lg:gap-12">
        <div className="min-w-0 w-full max-w-xl">
          <p className="inline-flex max-w-full items-start gap-2 rounded-2xl border-2 border-quack-gunmetal bg-white px-3 py-1.5 text-[11px] font-bold leading-snug text-quack-gunmetal shadow-[3px_3px_0_0_#FFC800] sm:items-center sm:rounded-full sm:px-3.5 sm:py-1 sm:text-xs">
            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-quack-amber sm:mt-0" aria-hidden="true" />
            <span className="min-w-0">{variant.badgeText}</span>
          </p>

          <h1
            id="hero-title"
            className="mt-4 font-brand text-[1.65rem] font-bold leading-[1.16] tracking-tight text-quack-gunmetal text-balance sm:mt-5 sm:text-5xl lg:text-[3.35rem] lg:leading-[1.07]"
          >
            {variant.lead}{" "}
            <span className="relative inline max-sm:box-decoration-clone max-sm:bg-[linear-gradient(transparent_64%,rgba(255,200,0,0.85)_64%,rgba(255,200,0,0.85)_92%,transparent_92%)] sm:inline-block">
              <span className="relative z-10">{variant.highlight}</span>
              <svg
                aria-hidden="true"
                viewBox="0 0 400 30"
                preserveAspectRatio="none"
                className="hidden sm:absolute sm:-bottom-1.5 sm:left-0 sm:z-0 sm:block sm:h-4 sm:w-full"
              >
                <path
                  className="scribble-path"
                  d="M4 20 C 80 6, 180 4, 260 12 S 370 22, 396 10"
                  fill="none"
                  stroke="#FFC800"
                  strokeWidth="10"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          <p className="mt-3.5 text-[15px] leading-relaxed text-quack-gunmetal/80 text-pretty sm:mt-5 sm:text-lg">
            {variant.subtitle}
          </p>

          <div className="mt-5 flex w-full flex-col items-stretch gap-3 sm:mt-8 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
            <CtaButton
              to="/feynman"
              location="hero_primary"
              size="xl"
              className="h-12 w-full px-5 text-sm sm:h-14 sm:w-auto sm:px-8 sm:text-lg"
            >
              Empezar prueba gratis
            </CtaButton>
            <a
              href="#precios"
              className="rounded-xl px-3 py-2 text-center font-brand text-sm font-bold text-quack-gunmetal underline decoration-quack-amber decoration-2 underline-offset-4 transition-colors hover:text-quack-caramel sm:py-2.5 sm:text-left"
            >
              Ver planes desde $4.99 USD/mes
            </a>
          </div>
        </div>

        <Hero3DScene />
      </div>

      {/* Transición 3D hacia la sección oscura: cinta diagonal STEM */}
      <div className="relative mt-4 w-full sm:mt-6">
        <div
          aria-hidden="true"
          className="relative z-10 border-y-2 border-quack-gunmetal bg-quack-amber py-2 text-quack-gunmetal shadow-[0_10px_28px_rgba(21,25,34,0.3)] sm:py-2.5"
        >
          <div className="flex overflow-hidden whitespace-nowrap">
            <div className="animate-marquee flex items-center gap-6 pr-6 font-brand text-[11px] font-bold uppercase tracking-wider sm:gap-8 sm:pr-8 sm:text-xs">
              {[...stemTicker, ...stemTicker].map((item, idx) => (
                <span key={`${item}-${idx}`} className="inline-flex items-center gap-2.5 sm:gap-3">
                  <span className="h-1.5 w-1.5 rotate-45 bg-quack-gunmetal sm:h-2 sm:w-2" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
