import * as React from "react";
import { Check, Sparkles, X } from "lucide-react";
import { Reveal } from "./Reveal";
import { transformations } from "@/mocks/landingContent";
import { useInView } from "@/hooks/useInView";
import { useCountUp } from "@/hooks/useCountUp";

interface AnimatedStatProps {
  end: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  title: string;
  description: string;
}

const AnimatedStatCard: React.FC<AnimatedStatProps> = ({
  end,
  decimals = 0,
  prefix = "",
  suffix = "",
  title,
  description,
}) => {
  const { ref, inView } = useInView<HTMLElement>({ threshold: 0.25 });
  const current = useCountUp(end, inView, 1300);

  return (
    <article
      ref={ref}
      className="card-3d-dark relative flex h-full flex-col justify-between rounded-3xl border-2 border-white/15 bg-[#1B202C]/90 p-6 backdrop-blur-md sm:p-7"
    >
      <div>
        <p className="text-3d-amber font-brand text-4xl font-bold tracking-tight text-quack-amber tabular-nums sm:text-5xl">
          {prefix}
          {current.toFixed(decimals)}
          {suffix}
        </p>
        <h3 className="mt-4 font-brand text-lg font-bold text-white">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-white/75">{description}</p>
      </div>
      <div className="mt-5 h-1 w-12 rounded-full bg-gradient-to-r from-quack-amber to-quack-caramel" />
    </article>
  );
};

/**
 * SECCIÓN 2: EL PROBLEMA Y LA TRANSFORMACIÓN (Escenario Oscuro 3D con contadores animados).
 */
export const StakesSection: React.FC = () => (
  <section
    aria-labelledby="stakes-title"
    className="lp-paper-dark relative isolate overflow-hidden pt-20 pb-28 text-white sm:pt-28 sm:pb-36"
  >
    {/* Piso en perspectiva 3D al fondo de la sección */}
    <div
      aria-hidden="true"
      className="perspective-grid-floor pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-72 opacity-50"
    />

    <div className="mx-auto max-w-6xl px-5 sm:px-8">
      <Reveal className="mx-auto max-w-3xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-quack-amber/40 bg-quack-amber/10 px-3.5 py-1 font-brand text-xs font-bold uppercase tracking-[0.2em] text-quack-amber">
          El costo de la ilusión de competencia
        </span>
        <h2
          id="stakes-title"
          className="mt-4 font-brand text-3xl font-bold leading-tight text-balance sm:text-5xl"
        >
          Leer respuestas de IA se siente como aprender.{" "}
          <span className="text-quack-amber">Hasta que te entregan el parcial.</span>
        </h2>
        <p className="mt-4 text-base leading-relaxed text-white/75 sm:text-lg">
          Entender la solución que escribió otro no equivale a saber resolverla por tu cuenta frente a una hoja en
          blanco.
        </p>
      </Reveal>

      {/* 3 Cifras Clave con Contadores Animados y Tarjetas 3D */}
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        <Reveal delay={0}>
          <AnimatedStatCard
            end={93.9}
            decimals={1}
            suffix="%"
            title="Ilusión de competencia"
            description="Siente que domina el tema al leer la explicación de un chatbot, pero se bloquea frente al examen sin ayuda."
          />
        </Reveal>
        <Reveal delay={110}>
          <AnimatedStatCard
            end={75.8}
            decimals={1}
            suffix="%"
            title="Estudio pasivo sin práctica"
            description="Usa la IA para pedir código o soluciones terminadas, anulando el esfuerzo mental que exige el parcial real."
          />
        </Reveal>
        <Reveal delay={220}>
          <AnimatedStatCard
            end={1200}
            decimals={0}
            prefix="$"
            suffix="+ USD"
            title="Costo por materia reprobada"
            description="Perder una asignatura filtro en la universidad cuesta más de $1,200 USD en créditos de matrícula y atrasa el grado."
          />
        </Reveal>
      </div>

      {/* Contraste 3D: Sin Quack vs. Con Quack */}
      <Reveal delay={180} className="mt-14">
        <div className="scene-3d grid items-stretch gap-6 md:grid-cols-2">
          {/* Tarjeta Izquierda: Sin Quack */}
          <div className="card-3d-dark rounded-3xl border-2 border-white/15 bg-[#1B202C] p-6 sm:p-8">
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
          <div className="card-3d-amber relative rounded-3xl border-2 border-quack-amber bg-gradient-to-br from-[#232938] to-[#171B26] p-6 sm:p-8">
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
