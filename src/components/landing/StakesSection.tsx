import * as React from "react";
import { BookOpenCheck, Clock3, GraduationCap, HeartCrack, Sparkles, type LucideIcon } from "lucide-react";
import { Reveal } from "./Reveal";
import { MathRenderer } from "@/components/common/MathRenderer";
import { problemMetrics, stakeItems } from "@/mocks/landingContent";
import { useInView } from "@/hooks/useInView";
import { useCountUp } from "@/hooks/useCountUp";
import type { LandingMetric } from "@/types/landing";
import { cn } from "@/lib/utils";

const stakeIcons: Record<string, LucideIcon> = {
  notas: GraduationCap,
  semestre: Clock3,
  ansiedad: HeartCrack,
};

const illusionSteps: readonly string[] = [
  "Le pides a una IA que te explique el tema.",
  "Lees el resumen. Todo tiene sentido.",
  "Sientes que ya lo entendiste.",
];

/**
 * COSTO DE LA INACCIÓN (Stakes / Failure): el "imán" StoryBrand.
 * Contraste deliberado con el hero: fondo oscuro, hoja en blanco y cronómetro corriendo.
 */
export const StakesSection: React.FC = () => (
  <section aria-labelledby="stakes-title" className="lp-paper-dark relative overflow-hidden py-24 text-white sm:py-32">
    <div className="mx-auto max-w-7xl px-5 sm:px-8">
      <Reveal className="max-w-3xl">
        <p className="font-brand text-sm font-bold uppercase tracking-[0.25em] text-quack-sandy">El problema</p>
        <h2 id="stakes-title" className="mt-4 font-brand text-4xl font-bold leading-tight text-balance sm:text-6xl">
          Pero hoy estudias así, <span className="text-quack-amber">¿verdad?</span>
        </h2>
      </Reveal>

      <div className="mt-14 grid items-center gap-14 lg:grid-cols-2">
        {/* Relato de la ilusión */}
        <div>
          <ol className="space-y-4">
            {illusionSteps.map((step, i) => (
              <Reveal as="li" key={step} delay={i * 140}>
                <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 font-brand text-lg font-bold text-quack-dandelion">
                    {i + 1}
                  </span>
                  <span className="text-lg text-white/90">{step}</span>
                  {i === 2 && <Sparkles className="ml-auto h-5 w-5 text-quack-amber" aria-hidden="true" />}
                </div>
              </Reveal>
            ))}
          </ol>

          <Reveal delay={480} className="mt-8">
            <p className="text-2xl font-semibold leading-snug text-white sm:text-3xl">
              Luego llega el parcial, te entregan una hoja en blanco…{" "}
              <span className="text-quack-sandy">y la mente también se queda en blanco.</span>
            </p>
            <p className="mt-5 max-w-xl text-lg text-white/70">
              Eso tiene nombre: <strong className="text-white">ilusión de competencia</strong>. Leer una explicación
              no es lo mismo que poder explicarla ni resolver sin ayuda.
            </p>
          </Reveal>

          <IllusionGap />
        </div>

        <BlankExamSheet />
      </div>

      {/* Lo que está en juego */}
      <div className="mt-24">
        <Reveal>
          <h3 className="font-brand text-2xl font-bold sm:text-3xl">Lo que te cuesta seguir estudiando así</h3>
        </Reveal>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {stakeItems.map((item, i) => {
            const Icon = stakeIcons[item.id] ?? BookOpenCheck;
            return (
              <Reveal key={item.id} delay={i * 120}>
                <article className="group h-full rounded-3xl border-2 border-white/10 bg-gradient-to-b from-white/[0.07] to-transparent p-7 transition-colors duration-300 hover:border-quack-sandy/60">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-quack-caramel/20 text-quack-sandy transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <h4 className="mt-5 font-brand text-xl font-bold leading-snug">{item.title}</h4>
                  <p className="mt-3 text-white/70">{item.description}</p>
                </article>
              </Reveal>
            );
          })}
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {problemMetrics.map((metric, i) => (
            <MetricStat key={metric.id} metric={metric} delay={i * 150} />
          ))}
        </div>
      </div>
    </div>
  </section>
);

const MetricStat: React.FC<{ metric: LandingMetric; delay: number }> = ({ metric, delay }) => {
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.4 });
  const value = useCountUp(metric.value, inView);
  return (
    <Reveal delay={delay}>
      <div ref={ref} className="flex h-full flex-col gap-3 rounded-3xl bg-quack-amber p-7 text-quack-gunmetal sm:flex-row sm:items-center sm:gap-6">
        <p className="font-brand text-6xl font-bold leading-none tabular-nums sm:text-7xl" aria-label={`${metric.value}${metric.suffix ?? ""}`}>
          {value.toFixed(metric.decimals ?? 0)}
          {metric.suffix}
        </p>
        <div>
          <p className="text-base font-semibold leading-snug">{metric.label}</p>
          {metric.source && <p className="mt-1.5 text-xs font-medium text-quack-gunmetal/70">Fuente: {metric.source}</p>}
        </div>
      </div>
    </Reveal>
  );
};

/** Barras que muestran la brecha entre "lo que creo saber" y "lo que demuestro". Ilustrativo. */
const IllusionGap: React.FC = () => {
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.5 });
  const bars = [
    { label: "Lo que crees que sabes después de leer", width: "92%", color: "bg-quack-amber" },
    { label: "Lo que logras demostrar en el parcial", width: "34%", color: "bg-quack-caramel" },
  ];
  return (
    <div ref={ref} className="mt-10 space-y-4 rounded-3xl border border-white/10 bg-black/20 p-6">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">La brecha de la ilusión (ilustrativo)</p>
      {bars.map((bar, i) => (
        <div key={bar.label}>
          <p className="mb-1.5 text-sm font-medium text-white/85">{bar.label}</p>
          <div className="h-4 overflow-hidden rounded-full bg-white/10">
            <div
              className={cn("h-full rounded-full transition-[width] ease-out", bar.color)}
              style={{ width: inView ? bar.width : "0%", transitionDuration: "1400ms", transitionDelay: `${i * 300}ms` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

/** Hoja de parcial vacía con cronómetro real corriendo: la ansiedad del papel en blanco. */
const BlankExamSheet: React.FC = () => {
  const [seconds, setSeconds] = React.useState(89 * 60 + 59);
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.3, once: false });

  React.useEffect(() => {
    if (!inView) return;
    const id = window.setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => window.clearInterval(id);
  }, [inView]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <Reveal className="scene-3d">
      <div
        ref={ref}
        className="relative mx-auto max-w-md rounded-[26px] border-2 border-white/20 bg-[#fdfcf7] p-7 text-quack-gunmetal shadow-[0_50px_100px_-30px_rgba(0,0,0,0.8)] transition-transform duration-700 hover:[transform:rotateY(0deg)_rotateX(0deg)]"
        style={{ transform: "rotateY(10deg) rotateX(6deg) rotateZ(1.5deg)" }}
      >
        <div className="flex items-center justify-between border-b-2 border-dashed border-quack-gunmetal/20 pb-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-quack-gunmetal/50">Parcial 2 · Cálculo integral</p>
            <p className="mt-1 font-brand text-lg font-bold">Problema 1 (2.5 pts)</p>
          </div>
          <div className="rounded-xl bg-red-600 px-3 py-1.5 font-mono text-lg font-bold tabular-nums text-white shadow-md" aria-label={`Tiempo restante ${mm} minutos ${ss} segundos`}>
            {mm}:{ss}
          </div>
        </div>
        <div className="py-4 text-center text-lg">
          <MathRenderer math="\int \frac{3x + 5}{x^2 + 3x + 2}\,dx" block />
        </div>
        <div className="space-y-5 pt-2" aria-hidden="true">
          <div className="flex items-end gap-1 border-b border-quack-gunmetal/15 pb-1">
            <span className="h-6 w-0.5 bg-quack-gunmetal animate-blink" />
          </div>
          {[0, 1, 2, 3, 4].map((line) => (
            <div key={line} className="border-b border-quack-gunmetal/15 pb-5" />
          ))}
        </div>
        <p className="absolute -bottom-6 right-6 rotate-[-4deg] rounded-xl bg-quack-caramel px-4 py-2 font-hand text-2xl text-white shadow-lg">
          …¿y ahora por dónde empiezo?
        </p>
      </div>
    </Reveal>
  );
};
