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
 * HERO — Versión B activa por defecto + Escena 3D multicapa y transición diagonal hacia sección oscura.
 */
export const HeroSection: React.FC = () => {
  const variantId = useABVariant("hero_headline", variantIds);
  const variant = heroVariants.find((v) => v.id === variantId) ?? heroVariants[1];

  return (
    <section
      aria-labelledby="hero-title"
      className="lp-paper relative isolate flex min-h-[calc(100svh-4rem)] flex-col justify-between overflow-hidden pt-16 sm:pt-20"
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

      <div className="mx-auto my-auto grid w-full max-w-6xl items-center gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[1.06fr_0.94fr] lg:gap-12">
        <div className="max-w-xl">
          <p className="inline-flex items-center gap-2 rounded-full border-2 border-quack-gunmetal bg-white px-3.5 py-1 text-xs font-bold text-quack-gunmetal shadow-[3px_3px_0_0_#FFC800]">
            <span className="h-2 w-2 rounded-full bg-quack-amber" aria-hidden="true" />
            <span>{variant.badgeText}</span>
          </p>

          <h1
            id="hero-title"
            className="mt-5 font-brand text-4xl font-bold leading-[1.07] tracking-tight text-quack-gunmetal text-balance sm:text-5xl lg:text-[3.35rem]"
          >
            {variant.lead}{" "}
            <span className="relative inline-block">
              <span className="relative z-10">{variant.highlight}</span>
              <svg
                aria-hidden="true"
                viewBox="0 0 400 30"
                preserveAspectRatio="none"
                className="absolute -bottom-1.5 left-0 z-0 h-3.5 w-full sm:h-4"
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

          <p className="mt-5 text-base leading-relaxed text-quack-gunmetal/80 text-pretty sm:text-lg">
            {variant.subtitle}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <CtaButton to="/feynman" location="hero_primary" size="xl">
              Empezar prueba gratis
            </CtaButton>
            <a
              href="#precios"
              className="rounded-xl px-3 py-2.5 font-brand text-sm font-bold text-quack-gunmetal underline decoration-quack-amber decoration-2 underline-offset-4 transition-colors hover:text-quack-caramel"
            >
              Ver planes desde $4.99 USD/mes
            </a>
          </div>
        </div>

        <Hero3DScene />
      </div>

      {/* Transición 3D hacia la sección oscura: cinta diagonal STEM + corte en perspectiva */}
      <div className="relative mt-6 w-full">
        <div
          aria-hidden="true"
          className="relative z-10 border-y-2 border-quack-gunmetal bg-quack-amber py-2.5 text-quack-gunmetal shadow-[0_10px_28px_rgba(21,25,34,0.3)]"
        >
          <div className="flex overflow-hidden whitespace-nowrap">
            <div className="animate-marquee flex items-center gap-8 pr-8 font-brand text-xs font-bold uppercase tracking-wider">
              {[...stemTicker, ...stemTicker].map((item, idx) => (
                <span key={`${item}-${idx}`} className="inline-flex items-center gap-3">
                  <span className="h-2 w-2 rotate-45 bg-quack-gunmetal" />
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
