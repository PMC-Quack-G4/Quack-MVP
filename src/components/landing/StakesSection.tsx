import * as React from "react";
import { Check, ChevronRight, Sparkles, X } from "lucide-react";
import { Reveal } from "./Reveal";
import { transformations } from "@/mocks/landingContent";
import { useInView } from "@/hooks/useInView";
import { useCountUp } from "@/hooks/useCountUp";
import { cn } from "@/lib/utils";

interface AnimatedStatProps {
  end: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  title: string;
  description: string;
  inView: boolean;
}

const AnimatedStatCard: React.FC<AnimatedStatProps> = ({
  end,
  decimals = 0,
  prefix = "",
  suffix = "",
  title,
  description,
  inView,
}) => {
  const current = useCountUp(end, inView, 1300);

  return (
    <article className="card-3d-dark relative flex h-full flex-col justify-between rounded-3xl border-2 border-white/15 bg-[#1B202C]/90 p-5 backdrop-blur-md sm:p-7">
      <div>
        <p className="text-3d-amber font-brand text-3xl font-bold tracking-tight text-quack-amber tabular-nums sm:text-5xl">
          {prefix}
          {current.toFixed(decimals)}
          {suffix}
        </p>
        <h3 className="mt-3 font-brand text-lg font-bold text-white sm:mt-4">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-white/75">{description}</p>
      </div>
      <div className="mt-5 h-1 w-12 rounded-full bg-gradient-to-r from-quack-amber to-quack-caramel" />
    </article>
  );
};

/**
 * SECCIÓN 2: EL PROBLEMA Y LA TRANSFORMACIÓN (Escenario Oscuro 3D con contadores animados).
 * - Desktop (`md:`+): 3 cifras en grilla y comparativa lado a lado.
 * - Móvil (`< md`): Carrusel deslizable con snap para las 3 cifras y selector Con/Sin Quack sin scroll vertical largo.
 */
export const StakesSection: React.FC = () => {
  const [statsRef, statsInView] = useInView<HTMLDivElement>({ threshold: 0.1 });
  const [mobileCompare, setMobileCompare] = React.useState<"after" | "before">("after");

  return (
    <section
      id="problema"
      aria-labelledby="stakes-title"
      className="lp-paper-dark relative isolate scroll-mt-16 overflow-hidden pt-16 pb-24 text-white sm:scroll-mt-20 sm:pt-28 sm:pb-36"
    >
      {/* Piso en perspectiva 3D al fondo de la sección */}
      <div
        aria-hidden="true"
        className="perspective-grid-floor pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-72 opacity-50"
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-quack-amber/40 bg-quack-amber/10 px-3.5 py-1 font-brand text-[11px] font-bold uppercase tracking-[0.16em] text-quack-amber sm:text-xs sm:tracking-[0.2em]">
            El costo de la ilusión de competencia
          </span>
          <h2
            id="stakes-title"
            className="mt-4 font-brand text-[1.75rem] font-bold leading-tight text-balance sm:text-5xl"
          >
            Leer respuestas de IA se siente como aprender.{" "}
            <span className="text-quack-amber">Hasta que te entregan el parcial.</span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/75 sm:text-lg">
            Entender la solución que escribió otro no equivale a saber resolverla por tu cuenta frente a una hoja en
            blanco.
          </p>
        </Reveal>

        {/* Guía visual móvil para el carrusel de cifras */}
        <div className="mt-8 flex items-center justify-between text-[11px] font-semibold text-white/60 md:hidden">
          <span>3 indicadores clave</span>
          <span className="inline-flex items-center gap-1 text-quack-amber">
            Desliza las 3 cifras
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        </div>

        {/* 3 Cifras Clave: snap horizontal en móvil, grilla 3 columnas en desktop */}
        <div
          ref={statsRef}
          className="-mx-4 mt-3 flex snap-x snap-mandatory gap-3.5 overflow-x-auto px-4 pb-3 no-scrollbar md:mx-0 md:mt-12 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0 md:pb-0"
        >
          <Reveal
            delay={0}
            className="w-[82vw] max-w-[310px] shrink-0 snap-center md:w-auto md:max-w-none md:shrink max-md:opacity-100 max-md:transform-none"
          >
            <AnimatedStatCard
              end={93.9}
              decimals={1}
              suffix="%"
              title="Ilusión de competencia"
              description="Siente que domina el tema al leer la explicación de un chatbot, pero se bloquea frente al examen sin ayuda."
              inView={statsInView}
            />
          </Reveal>
          <Reveal
            delay={110}
            className="w-[82vw] max-w-[310px] shrink-0 snap-center md:w-auto md:max-w-none md:shrink max-md:opacity-100 max-md:transform-none"
          >
            <AnimatedStatCard
              end={75.8}
              decimals={1}
              suffix="%"
              title="Estudio pasivo sin práctica"
              description="Usa la IA para pedir código o soluciones terminadas, anulando el esfuerzo mental que exige el parcial real."
              inView={statsInView}
            />
          </Reveal>
          <Reveal
            delay={220}
            className="w-[82vw] max-w-[310px] shrink-0 snap-center md:w-auto md:max-w-none md:shrink max-md:opacity-100 max-md:transform-none"
          >
            <AnimatedStatCard
              end={1200}
              decimals={0}
              prefix="$"
              suffix="+ USD"
              title="Costo por materia reprobada"
              description="Perder una asignatura filtro en la universidad cuesta más de $1,200 USD en créditos de matrícula y atrasa el grado."
              inView={statsInView}
            />
          </Reveal>
        </div>

        {/* Contraste 3D: Sin Quack vs. Con Quack */}
        <Reveal delay={180} className="mt-10 sm:mt-14">
          {/* Selector segmentado solo en móvil para comparar sin apilar tarjetas largas */}
          <div
            role="tablist"
            aria-label="Comparativa Con Quack vs Sin Quack"
            className="mb-4 grid grid-cols-2 gap-1.5 rounded-2xl border border-white/15 bg-[#0E1118] p-1.5 md:hidden"
          >
            <button
              type="button"
              role="tab"
              aria-selected={mobileCompare === "after"}
              onClick={() => setMobileCompare("after")}
              className={cn(
                "cursor-pointer rounded-xl px-3 py-2 font-brand text-xs font-bold transition-all",
                mobileCompare === "after"
                  ? "bg-quack-amber text-quack-gunmetal shadow-[0_4px_14px_rgba(255,200,0,0.35)]"
                  : "text-white/70 hover:text-white"
              )}
            >
              Con Quack · +25%
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mobileCompare === "before"}
              onClick={() => setMobileCompare("before")}
              className={cn(
                "cursor-pointer rounded-xl px-3 py-2 font-brand text-xs font-bold transition-all",
                mobileCompare === "before"
                  ? "bg-red-500/25 text-red-200 border border-red-400/40"
                  : "text-white/70 hover:text-white"
              )}
            >
              Sin Quack · Pasivo
            </button>
          </div>

          <div className="scene-3d grid grid-cols-1 items-stretch gap-6 md:grid-cols-2">
            {/* Tarjeta Izquierda: Sin Quack */}
            <div
              className={cn(
                "card-3d-dark rounded-3xl border-2 border-white/15 bg-[#1B202C] p-5 sm:p-8",
                mobileCompare === "before" ? "block" : "hidden md:block"
              )}
            >
              <span className="inline-block rounded-full border border-red-400/30 bg-red-500/15 px-3 py-1 font-brand text-xs font-bold uppercase tracking-wider text-red-300">
                Sin Quack · Estudio pasivo
              </span>
              <ul className="mt-5 space-y-3.5 text-sm text-white/80 sm:text-base">
                {transformations.map((t) => (
                  <li key={t.id} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-red-300">
                      <X className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden="true" />
                    </span>
                    <span>{t.before}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tarjeta Derecha: Con Quack (Elevada en 3D con brillo Amber) */}
            <div
              className={cn(
                "card-3d-amber relative rounded-3xl border-2 border-quack-amber bg-gradient-to-br from-[#232938] to-[#171B26] p-5 sm:p-8",
                mobileCompare === "after" ? "block" : "hidden md:block"
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-quack-amber px-3 py-1 font-brand text-xs font-bold uppercase tracking-wider text-quack-gunmetal">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  Con Quack · Dominio activo
                </span>
                <span className="rounded-full border border-quack-amber/50 bg-quack-amber/15 px-2.5 py-0.5 font-mono text-xs font-bold text-quack-amber">
                  +25% aprobación
                </span>
              </div>

              <ul className="mt-5 space-y-3.5 text-sm font-medium text-white sm:text-base">
                {transformations.map((t) => (
                  <li key={t.id} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-quack-amber text-quack-gunmetal shadow-[0_0_12px_rgba(255,200,0,0.5)]">
                      <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
                    </span>
                    <span>{t.after}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Transición curva en capas hacia la sección clara */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 leading-none text-[#fffcf2]"
      >
        <svg
          viewBox="0 0 1440 72"
          preserveAspectRatio="none"
          className="block h-10 w-full sm:h-14"
        >
          <path
            d="M0,24 C360,72 1080,0 1440,48 L1440,72 L0,72 Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </section>
  );
};
