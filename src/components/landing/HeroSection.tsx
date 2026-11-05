import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { CtaButton } from "./CtaButton";
import { Hero3DScene } from "./Hero3DScene";
import { MathRenderer } from "@/components/common/MathRenderer";
import { heroVariants, studyTopics } from "@/mocks/landingContent";
import { useABVariant } from "@/hooks/useABVariant";
import type { HeroVariantId } from "@/types/landing";

const variantIds: readonly HeroVariantId[] = heroVariants.map((v) => v.id);

const marqueeItems: readonly { label: string; math: string }[] = [
  { label: studyTopics[0] ?? "Física", math: "\\vec{F} = \\frac{d\\vec{p}}{dt}" },
  { label: studyTopics[1] ?? "Cálculo", math: "\\int_a^b f(x)\\,dx = F(b) - F(a)" },
  { label: studyTopics[2] ?? "Álgebra lineal", math: "\\det(A - \\lambda I) = 0" },
  { label: studyTopics[3] ?? "Ecuaciones", math: "\\frac{dy}{dx} = g(x)\\,h(y)" },
];

/**
 * HERO — Prueba del cavernícola (Grunt Test) en < 5 s:
 *  1. ¿Qué ofreces?     → App de estudio con IA para parciales STEM (eyebrow + subtítulo).
 *  2. ¿Cómo mejora mi vida? → Llegar al parcial con seguridad (titular aspiracional).
 *  3. ¿Qué hago?        → Botón dominante "Practicar gratis ahora".
 */
export const HeroSection: React.FC = () => {
  const variantId = useABVariant("hero_headline", variantIds);
  const variant = heroVariants.find((v) => v.id === variantId) ?? heroVariants[0];

  return (
    <section
      aria-labelledby="hero-title"
      className="lp-paper lp-grain relative isolate overflow-hidden pt-[72px]"
      data-variant={variant.id}
    >
      {/* Atmósfera cálida */}
      <div aria-hidden="true" className="pointer-events-none absolute -right-40 -top-40 -z-10 h-[620px] w-[620px] rounded-full bg-quack-amber/30 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 -left-32 -z-10 h-[460px] w-[460px] rounded-full bg-quack-dandelion/50 blur-3xl" />

      <div className="mx-auto grid max-w-7xl items-center gap-4 px-5 pb-10 pt-10 sm:px-8 lg:min-h-[calc(100svh-120px)] lg:grid-cols-[1.02fr_1fr] lg:gap-8 lg:pt-6">
        <div className="relative z-10 max-w-2xl">
          <p className="animate-fadeIn inline-flex items-center gap-2 rounded-full border-2 border-quack-gunmetal/15 bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-quack-gunmetal shadow-sm backdrop-blur sm:text-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-quack-sandy opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-quack-caramel" />
            </span>
            App de estudio con IA para parciales de ingeniería y ciencias
          </p>

          <h1
            id="hero-title"
            className="mt-6 font-brand text-[2.6rem] font-bold leading-[1.05] tracking-tight text-quack-gunmetal text-balance sm:text-6xl lg:text-[4.4rem]"
          >
            {variant.lead}{" "}
            <span className="relative inline-block">
              <span className="relative z-10">{variant.highlight}</span>
              <svg
                aria-hidden="true"
                viewBox="0 0 400 30"
                preserveAspectRatio="none"
                className="absolute -bottom-2 left-0 z-0 h-4 w-full sm:h-5"
              >
                <path
                  className="scribble-path"
                  d="M4 20 C 80 6, 180 4, 260 12 S 370 22, 396 10"
                  fill="none"
                  stroke="#FFC800"
                  strokeWidth="9"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            {variant.tail && <> {variant.tail}</>}
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-quack-gunmetal/85 text-pretty sm:text-xl">
            Quack es la IA a la que <strong className="font-semibold text-quack-gunmetal">tú le explicas</strong>.
            Enséñale el tema en voz alta, resuelve a mano como en el examen y descubre el{" "}
            <span className="marker-highlight font-semibold text-quack-gunmetal">paso exacto donde te equivocas</span>.
          </p>

          <div className="mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <CtaButton to="/feynman" location="hero" size="xl" className="w-full sm:w-auto">
              Practicar gratis ahora
            </CtaButton>
            <a
              href="#como-funciona"
              className="group inline-flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-semibold text-quack-gunmetal/80 underline-offset-4 hover:text-quack-gunmetal hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-quack-gunmetal/40"
            >
              Ver cómo funciona en 3 pasos
              <ChevronDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" aria-hidden="true" />
            </a>
          </div>

          <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-quack-gunmetal/75">
            {["Gratis", "Sin crear cuenta", "Funciona en tu navegador y celular"].map((item) => (
              <li key={item} className="flex items-center gap-1.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-quack-amber text-quack-gunmetal">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <Hero3DScene />
      </div>

      {/* Cinta de materias: deja claro el "género" del producto */}
      <div className="relative border-y-2 border-quack-gunmetal bg-quack-gunmetal py-3.5 text-quack-dandelion">
        <div className="flex w-max animate-marquee items-center gap-10 whitespace-nowrap pr-10" aria-hidden="true">
          {[...marqueeItems, ...marqueeItems, ...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={`${item.label}-${i}`} className="flex items-center gap-3 text-sm">
              <span className="font-brand font-bold uppercase tracking-wider">{item.label}</span>
              <span className="text-white/80">
                <MathRenderer math={item.math} />
              </span>
              <span className="text-quack-amber">✦</span>
            </span>
          ))}
        </div>
        <p className="sr-only">Materias disponibles: {studyTopics.join(", ")}.</p>
      </div>
    </section>
  );
};
