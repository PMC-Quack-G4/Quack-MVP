import * as React from "react";
import { Brain, CheckCircle2, CircleDot, Mic, PenLine, Quote, Target } from "lucide-react";
import { Reveal } from "./Reveal";
import { DuckModel } from "./DuckModel";
import { comparisonRows, milestones, productMetrics, testimonials } from "@/mocks/landingContent";
import { useInView } from "@/hooks/useInView";
import { useCountUp } from "@/hooks/useCountUp";
import { usePointerTilt } from "@/hooks/usePointerTilt";
import type { LandingMetric, MilestoneStatus, Testimonial } from "@/types/landing";
import { cn } from "@/lib/utils";

const principles = [
  {
    Icon: Mic,
    title: "Técnica Feynman",
    text: "Si puedes explicarlo con palabras simples, lo entiendes. Si no, Quack encuentra el hueco.",
  },
  {
    Icon: Brain,
    title: "Práctica de recuperación",
    text: "Recordar sin mirar apuntes fija el conocimiento mucho mejor que releer resúmenes.",
  },
  {
    Icon: Target,
    title: "Retroalimentación por pasos",
    text: "Saber en qué renglón fallaste vale más que una nota final sin explicación.",
  },
] as const;

/**
 * EL GUÍA: la marca entra en escena después del problema.
 * Empatía ("te entendemos") + Autoridad (métricas, método, prueba social, hitos).
 */
export const GuideSection: React.FC = () => (
  <section id="guia" aria-labelledby="guide-title" className="lp-paper relative overflow-hidden py-24 sm:py-32">
    <div className="mx-auto max-w-7xl px-5 sm:px-8">
      {/* Empatía */}
      <div className="grid items-center gap-12 lg:grid-cols-[auto_1fr]">
        <Reveal className="mx-auto">
          <div className="relative">
            <div aria-hidden="true" className="absolute inset-0 -z-10 scale-125 rounded-full bg-quack-amber/30 blur-2xl" />
            <DuckModel size={200} />
          </div>
        </Reveal>
        <Reveal delay={120} className="max-w-3xl">
          <p className="font-brand text-sm font-bold uppercase tracking-[0.25em] text-quack-caramel">Te entendemos</p>
          <h2 id="guide-title" className="mt-4 font-brand text-4xl font-bold leading-tight text-quack-gunmetal text-balance sm:text-5xl">
            Sabemos lo que se siente quedarse en blanco.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-quack-gunmetal/80 sm:text-xl">
            Somos estudiantes de ingeniería. También estudiamos con resúmenes de IA, también sentimos que entendíamos y
            también nos bloqueamos frente a la hoja del parcial. Por eso creamos a Quack: una compañera que{" "}
            <strong className="text-quack-gunmetal">no te da las respuestas</strong>, sino que te ayuda a demostrar que
            las sabes.
          </p>
        </Reveal>
      </div>

      {/* Autoridad: métricas del producto */}
      <div className="mt-20 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {productMetrics.map((metric, i) => (
          <ProductMetric key={metric.id} metric={metric} delay={i * 100} />
        ))}
      </div>

      {/* Ciencia del aprendizaje */}
      <div className="mt-20">
        <Reveal>
          <h3 className="font-brand text-2xl font-bold text-quack-gunmetal sm:text-3xl">Construido sobre cómo aprende tu cerebro</h3>
        </Reveal>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {principles.map(({ Icon, title, text }, i) => (
            <Reveal key={title} delay={i * 120}>
              <article className="h-full rounded-3xl border-2 border-quack-gunmetal/10 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-quack-amber hover:shadow-[0_20px_40px_-20px_rgba(59,65,81,0.35)]">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-quack-dandelion text-quack-gunmetal">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h4 className="mt-5 font-brand text-xl font-bold text-quack-gunmetal">{title}</h4>
                <p className="mt-2 text-quack-gunmetal/75">{text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Diferenciación */}
      <ComparisonTable />

      {/* Prueba social */}
      <div className="mt-24">
        <Reveal className="max-w-2xl">
          <h3 className="font-brand text-2xl font-bold text-quack-gunmetal sm:text-3xl">Lo que dicen quienes ya lo probaron</h3>
        </Reveal>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={t.id} delay={i * 120}>
              <TestimonialCard testimonial={t} />
            </Reveal>
          ))}
        </div>
      </div>

      {/* Hitos del producto */}
      <Milestones />
    </div>
  </section>
);

const ProductMetric: React.FC<{ metric: LandingMetric; delay: number }> = ({ metric, delay }) => {
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.5 });
  const value = useCountUp(metric.value, inView, 1200);
  return (
    <Reveal delay={delay}>
      <div ref={ref} className="h-full rounded-3xl border-2 border-quack-gunmetal bg-white p-6 shadow-[5px_5px_0_0_#3B4151]">
        <p className="font-brand text-5xl font-bold tabular-nums text-quack-gunmetal">
          {Math.round(value)}
          {metric.suffix}
        </p>
        <p className="mt-3 text-sm font-medium leading-snug text-quack-gunmetal/75">{metric.label}</p>
      </div>
    </Reveal>
  );
};

const ComparisonTable: React.FC = () => (
  <div className="mt-24">
    <Reveal className="max-w-3xl">
      <h3 className="font-brand text-2xl font-bold text-quack-gunmetal text-balance sm:text-4xl">
        La IA genérica responde por ti. <span className="marker-highlight">Quack te hace demostrar lo que sabes.</span>
      </h3>
    </Reveal>
    <Reveal delay={120} className="mt-8 overflow-x-auto rounded-3xl border-2 border-quack-gunmetal bg-white shadow-[6px_6px_0_0_#3B4151]">
      <table className="w-full min-w-[640px] border-collapse text-left">
        <caption className="sr-only">Comparación entre IA genérica, tutor particular y Quack</caption>
        <thead>
          <tr className="border-b-2 border-quack-gunmetal/10 text-sm">
            <th scope="col" className="p-4 font-semibold text-quack-gunmetal/60 sm:p-5">
              <span className="sr-only">Criterio</span>
            </th>
            <th scope="col" className="p-4 font-brand font-bold text-quack-gunmetal/70 sm:p-5">IA genérica</th>
            <th scope="col" className="p-4 font-brand font-bold text-quack-gunmetal/70 sm:p-5">Tutor particular</th>
            <th scope="col" className="bg-quack-amber p-4 font-brand font-bold text-quack-gunmetal sm:p-5">
              <span className="flex items-center gap-2">
                <img src="/brand/quack-logo.png" alt="" className="h-6 w-6" /> Quack
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {comparisonRows.map((row) => (
            <tr key={row.id} className="border-b border-quack-gunmetal/10 last:border-0">
              <th scope="row" className="p-4 text-sm font-semibold text-quack-gunmetal sm:p-5">{row.criterion}</th>
              <td className="p-4 text-quack-gunmetal/65 sm:p-5">{row.genericAi}</td>
              <td className="p-4 text-quack-gunmetal/65 sm:p-5">{row.tutor}</td>
              <td className="bg-quack-dandelion/60 p-4 font-bold text-quack-gunmetal sm:p-5">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
                  {row.quack}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Reveal>
  </div>
);

const TestimonialCard: React.FC<{ testimonial: Testimonial }> = ({ testimonial }) => {
  const ref = usePointerTilt<HTMLDivElement>(8);
  return (
    <div ref={ref} className="scene-3d h-full">
      <figure className="tilt-stage relative flex h-full flex-col rounded-3xl bg-quack-gunmetal p-7 text-white shadow-[0_30px_60px_-30px_rgba(59,65,81,0.8)]">
        <Quote className="h-8 w-8 text-quack-amber" style={{ transform: "translateZ(30px)" }} aria-hidden="true" />
        <blockquote className="mt-4 flex-1 text-lg leading-relaxed text-white/90" style={{ transform: "translateZ(20px)" }}>
          “{testimonial.quote}”
        </blockquote>
        <figcaption className="mt-6 border-t border-white/10 pt-4" style={{ transform: "translateZ(14px)" }}>
          <p className="font-brand font-bold text-quack-dandelion">{testimonial.author}</p>
          <p className="text-sm text-white/60">{testimonial.role}</p>
        </figcaption>
      </figure>
    </div>
  );
};

const milestoneStyles: Record<MilestoneStatus, { dot: string; label: string; Icon: typeof CheckCircle2 }> = {
  done: { dot: "bg-emerald-600 text-white", label: "Logrado", Icon: CheckCircle2 },
  current: { dot: "bg-quack-amber text-quack-gunmetal", label: "En curso", Icon: PenLine },
  next: { dot: "bg-white text-quack-gunmetal border-2 border-dashed border-quack-gunmetal/40", label: "Próximo", Icon: CircleDot },
};

const Milestones: React.FC = () => {
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.3 });
  return (
    <div className="mt-24">
      <Reveal>
        <h3 className="font-brand text-2xl font-bold text-quack-gunmetal sm:text-3xl">Cómo ha evolucionado Quack</h3>
      </Reveal>
      <div ref={ref} className="relative mt-10">
        <div aria-hidden="true" className="absolute left-5 top-0 h-full w-1 rounded-full bg-quack-gunmetal/10 md:left-0 md:top-5 md:h-1 md:w-full">
          <div
            className={cn(
              "h-full w-full origin-top rounded-full bg-gradient-to-b from-quack-amber to-quack-caramel transition-transform ease-out md:origin-left md:bg-gradient-to-r",
              inView ? "scale-100" : "scale-0"
            )}
            style={{ transform: inView ? "scale(0.68)" : "scale(0)", transitionDuration: "1600ms" }}
          />
        </div>
        <ol className="relative grid gap-8 md:grid-cols-4">
          {milestones.map((m, i) => {
            const s = milestoneStyles[m.status];
            return (
              <Reveal as="li" key={m.id} delay={i * 150} className="relative pl-16 md:pl-0 md:pt-16">
                <span className={cn("absolute left-0 top-0 flex h-11 w-11 items-center justify-center rounded-full shadow-md", s.dot)}>
                  <s.Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-quack-caramel">
                  {m.period} · {s.label}
                </p>
                <h4 className="mt-1 font-brand text-lg font-bold text-quack-gunmetal">{m.title}</h4>
                <p className="mt-1.5 text-sm text-quack-gunmetal/75">{m.description}</p>
              </Reveal>
            );
          })}
        </ol>
      </div>
    </div>
  );
};
