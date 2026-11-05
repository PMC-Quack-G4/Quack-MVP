import * as React from "react";
import { Check, Circle, Mic, PenTool, RotateCcw, Volume2 } from "lucide-react";
import { Reveal } from "./Reveal";
import { CtaButton } from "./CtaButton";
import { MathRenderer } from "@/components/common/MathRenderer";
import { MathText } from "./MathText";
import { statusMeta } from "./auditStatus";
import { auditDemo, feynmanDemo } from "@/mocks/landingContent";
import { usePointerTilt } from "@/hooks/usePointerTilt";
import { useInView } from "@/hooks/useInView";
import { cn } from "@/lib/utils";

/**
 * CATÁLOGO DE SOLUCIONES (StoryBrand):
 * Segmentación clara de los dos modos de Quack con demostraciones en vivo
 * e inclinación 3D interactiva.
 */
export const SolutionsSection: React.FC = () => (
  <section id="soluciones" aria-labelledby="solutions-title" className="relative overflow-hidden bg-white py-24 sm:py-32">
    <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[680px] w-[680px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-quack-dandelion/40 blur-3xl" />

    <div className="mx-auto max-w-7xl px-5 sm:px-8">
      <Reveal className="max-w-3xl">
        <p className="font-brand text-sm font-bold uppercase tracking-[0.25em] text-quack-caramel">
          Catálogo de soluciones
        </p>
        <h2
          id="solutions-title"
          className="mt-4 font-brand text-4xl font-bold leading-tight text-quack-gunmetal text-balance sm:text-5xl"
        >
          Dos modos conectados para <span className="marker-highlight">dominar tu materia</span>
        </h2>
        <p className="mt-5 text-lg text-quack-gunmetal/80">
          No más leer resúmenes pasivamente. Elige cómo quieres poner a prueba lo que sabes hoy mismo.
        </p>
      </Reveal>

      <div className="mt-14 grid gap-10 lg:grid-cols-2">
        <Reveal delay={100}>
          <FeynmanShowcaseCard />
        </Reveal>
        <Reveal delay={220}>
          <ExamShowcaseCard />
        </Reveal>
      </div>
    </div>
  </section>
);

const FeynmanShowcaseCard: React.FC = () => {
  const tiltRef = usePointerTilt<HTMLDivElement>(6);
  const [viewRef, inView] = useInView<HTMLDivElement>({ threshold: 0.25 });
  const [step, setStep] = React.useState(1);

  React.useEffect(() => {
    if (!inView) return;
    const total = feynmanDemo.messages.length;
    if (step >= total) return;
    const timer = window.setTimeout(() => setStep((s) => Math.min(s + 1, total)), 1400);
    return () => window.clearTimeout(timer);
  }, [inView, step]);

  const visibleMessages = feynmanDemo.messages.slice(0, step);
  const unlockedIds = new Set(visibleMessages.map((m) => m.unlocks).filter(Boolean));

  return (
    <div ref={tiltRef} className="scene-3d h-full">
      <article
        ref={viewRef}
        className="tilt-stage flex h-full flex-col justify-between rounded-[32px] border-2 border-quack-gunmetal bg-[#fffcf2] p-7 shadow-[10px_10px_0_0_#3B4151] sm:p-9"
      >
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border-2 border-quack-gunmetal bg-quack-amber px-3.5 py-1 font-brand text-xs font-bold uppercase tracking-wider text-quack-gunmetal">
              <Mic className="h-3.5 w-3.5" aria-hidden="true" /> Modo 1 · Voz e IA invertida
            </span>
            <span className="text-xs font-semibold text-quack-gunmetal/60">Para entender conceptos</span>
          </div>

          <h3 className="mt-5 font-brand text-2xl font-bold text-quack-gunmetal sm:text-3xl">
            Explícale el tema a Quack
          </h3>
          <p className="mt-2.5 text-base text-quack-gunmetal/80">
            Habla como si le enseñaras a una compañera curiosa. Quack jamás te regala la respuesta: te hace preguntas
            cortas hasta que descubras tus vacíos por ti mismo.
          </p>

          {/* Simulador en vivo del diálogo Feynman */}
          <div className="mt-6 rounded-2xl border-2 border-quack-gunmetal/15 bg-white p-4 shadow-inner">
            <div className="flex items-center justify-between border-b border-quack-gunmetal/10 pb-3">
              <div className="flex items-center gap-2">
                <img src="/brand/quack-logo.png" alt="" className="h-7 w-7 object-contain" />
                <div>
                  <p className="font-brand text-xs font-bold text-quack-gunmetal">{feynmanDemo.topic}</p>
                  <p className="text-[11px] text-quack-gunmetal/60">Subconceptos desbloqueados al explicar</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-quack-gunmetal/70 hover:bg-quack-dandelion/40 hover:text-quack-gunmetal"
                aria-label="Reiniciar demostración de diálogo"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Repetir
              </button>
            </div>

            {/* Píldoras de subconceptos */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {feynmanDemo.subconcepts.map((sub) => {
                const covered = unlockedIds.has(sub.id);
                return (
                  <span
                    key={sub.id}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-300",
                      covered
                        ? "border-emerald-400 bg-emerald-50 text-emerald-800"
                        : "border-quack-gunmetal/15 bg-slate-50 text-quack-gunmetal/55"
                    )}
                  >
                    {covered ? (
                      <Check className="h-3 w-3 text-emerald-600" strokeWidth={3} aria-hidden="true" />
                    ) : (
                      <Circle className="h-2.5 w-2.5" aria-hidden="true" />
                    )}
                    {sub.label}
                  </span>
                );
              })}
            </div>

            {/* Mensajes */}
            <div className="mt-4 space-y-2.5 min-h-[210px]">
              {visibleMessages.map((msg) => {
                const isStudent = msg.sender === "student";
                return (
                  <div
                    key={msg.id}
                    className={cn("flex animate-fadeIn", isStudent ? "justify-end" : "justify-start")}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-snug",
                        isStudent
                          ? "rounded-br-sm bg-quack-gunmetal text-white"
                          : "rounded-bl-sm border border-quack-amber/60 bg-quack-dandelion/50 text-quack-gunmetal font-medium"
                      )}
                    >
                      <MathText text={msg.text} />
                      {!isStudent && (
                        <span className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-quack-caramel">
                          <Volume2 className="h-3 w-3" aria-hidden="true" /> Voz socrática activa
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-between gap-4 pt-2">
          <CtaButton to="/feynman" location="solutions_feynman" size="lg" className="w-full sm:w-auto">
            Explicarle un tema a Quack
          </CtaButton>
          <span className="text-xs font-semibold text-quack-gunmetal/65">
            Con micrófono o teclado · Gratis
          </span>
        </div>
      </article>
    </div>
  );
};

const ExamShowcaseCard: React.FC = () => {
  const tiltRef = usePointerTilt<HTMLDivElement>(6);
  const [activeStepIndex, setActiveStepIndex] = React.useState(4); // Paso 5 con error algebraico por defecto
  const selectedStep = auditDemo.steps[activeStepIndex] ?? auditDemo.steps[0];
  const selectedMeta = statusMeta[selectedStep.status];

  return (
    <div ref={tiltRef} className="scene-3d h-full">
      <article className="tilt-stage flex h-full flex-col justify-between rounded-[32px] border-2 border-quack-gunmetal bg-[#fffcf2] p-7 shadow-[10px_10px_0_0_#3B4151] sm:p-9">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border-2 border-quack-gunmetal bg-quack-sandy px-3.5 py-1 font-brand text-xs font-bold uppercase tracking-wider text-quack-gunmetal">
              <PenTool className="h-3.5 w-3.5" aria-hidden="true" /> Modo 2 · Papel, lápiz y cámara
            </span>
            <span className="text-xs font-semibold text-quack-gunmetal/60">Para entrenar el examen</span>
          </div>

          <h3 className="mt-5 font-brand text-2xl font-bold text-quack-gunmetal sm:text-3xl">
            Parcial a ciegas paso a paso
          </h3>
          <p className="mt-2.5 text-base text-quack-gunmetal/80">
            Resuelve en papel con cronómetro y sin apuntes. Toma una foto y recibe crédito parcial sabiendo si tu fallo
            fue conceptual, algebraico o arrastrado.
          </p>

          {/* Inspector interactivo de pasos */}
          <div className="mt-6 rounded-2xl border-2 border-quack-gunmetal/15 bg-white p-4 shadow-inner">
            <div className="flex items-center justify-between border-b border-quack-gunmetal/10 pb-3">
              <div>
                <p className="font-brand text-xs font-bold text-quack-gunmetal">
                  Haz clic en cada renglón para inspeccionar
                </p>
                <p className="text-[11px] text-quack-gunmetal/60">
                  Calificación orientativa: {auditDemo.score.toFixed(1)} / {auditDemo.maxScore.toFixed(1)}
                </p>
              </div>
              <span className="rounded-full bg-quack-dandelion px-2.5 py-0.5 font-brand text-xs font-bold text-quack-gunmetal">
                Crédito parcial
              </span>
            </div>

            <div className="mt-3 space-y-1.5">
              {auditDemo.steps.map((step, idx) => {
                const meta = statusMeta[step.status];
                const isSelected = idx === activeStepIndex;
                return (
                  <button
                    key={step.stepNumber}
                    type="button"
                    onClick={() => setActiveStepIndex(idx)}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-1.5 text-left transition-all",
                      isSelected
                        ? "border-quack-gunmetal bg-quack-dandelion/40 shadow-sm"
                        : "border-transparent bg-slate-50/70 hover:bg-slate-100/80"
                    )}
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <span className="font-mono text-xs font-bold text-quack-gunmetal/50">
                        #{step.stepNumber}
                      </span>
                      <span className="ink-blue truncate text-xs sm:text-sm">
                        <MathRenderer math={step.latexExpression} />
                      </span>
                    </span>
                    <span
                      className={cn(
                        "inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-bold",
                        meta.chip
                      )}
                    >
                      <meta.Icon className="h-3 w-3" aria-hidden="true" />
                      <span className="hidden sm:inline">{meta.label}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Detalle del paso seleccionado */}
            <div className="mt-3 rounded-xl border border-quack-gunmetal/15 bg-[#fffcf2] p-3 text-xs sm:text-sm">
              <div className="flex items-center gap-1.5 font-brand font-bold text-quack-gunmetal">
                <selectedMeta.Icon className={cn("h-4 w-4", selectedMeta.ink)} aria-hidden="true" />
                <span>
                  Paso {selectedStep.stepNumber}: {selectedMeta.label}
                </span>
              </div>
              <p className="mt-1 text-quack-gunmetal/80">{selectedStep.feedback}</p>
            </div>
          </div>
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-between gap-4 pt-2">
          <CtaButton to="/parcial-ciegas" location="solutions_exam" tone="dark" size="lg" className="w-full sm:w-auto">
            Resolver un parcial a ciegas
          </CtaButton>
          <span className="text-xs font-semibold text-quack-gunmetal/65">
            Incluye ejemplos listos para probar
          </span>
        </div>
      </article>
    </div>
  );
};
