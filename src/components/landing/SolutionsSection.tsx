import * as React from "react";
import { Check, Circle, Mic, PenTool, Sparkles } from "lucide-react";
import { Reveal } from "./Reveal";
import { CtaButton } from "./CtaButton";
import { MathRenderer } from "@/components/common/MathRenderer";
import { statusMeta } from "./auditStatus";
import { auditDemo, feynmanDemosBySubject, planSteps } from "@/mocks/landingContent";
import { usePointerTilt } from "@/hooks/usePointerTilt";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

/**
 * SECCIÓN 3: EL PLAN EN 3 PASOS + CONSOLA INTERACTIVA 3D.
 * - Tarjetas 3D para los 3 pasos.
 * - Consola oscura en 3D con inclinación suave que contrasta sobre el papel cálido.
 */
export const SolutionsSection: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<"feynman" | "exam">("feynman");
  const [selectedSubjectId, setSelectedSubjectId] = React.useState<string>(
    feynmanDemosBySubject[0]?.id ?? "algoritmos"
  );
  const [activeAuditIdx, setActiveAuditIdx] = React.useState(2);
  const consoleRef = usePointerTilt<HTMLDivElement>(6);

  const activeFeynman =
    feynmanDemosBySubject.find((d) => d.id === selectedSubjectId) ?? feynmanDemosBySubject[0];
  const selectedAuditStep = auditDemo.steps[activeAuditIdx] ?? auditDemo.steps[0];
  const selectedAuditMeta = statusMeta[selectedAuditStep.status];

  return (
    <section
      id="como-funciona"
      aria-labelledby="solutions-title"
      className="lp-paper relative isolate scroll-mt-16 overflow-hidden pt-16 pb-24 sm:scroll-mt-20 sm:pt-24 sm:pb-36"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-8">
        {/* Encabezado */}
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border-2 border-quack-gunmetal bg-quack-dandelion px-3.5 py-1 font-brand text-[11px] font-bold uppercase tracking-[0.16em] text-quack-gunmetal shadow-[3px_3px_0_0_#3B4151] sm:text-xs sm:tracking-[0.2em]">
            El plan en 3 pasos
          </span>
          <h2
            id="solutions-title"
            className="mt-4 font-brand text-[1.75rem] font-bold leading-tight text-quack-gunmetal text-balance sm:text-5xl"
          >
            Cómo pasas de la duda al <span className="marker-highlight">dominio real</span>
          </h2>
          <p className="mt-4 text-sm text-quack-gunmetal/80 sm:text-lg">
            Diseñado para <strong>Programación, Algoritmia, Química, Biología, Física y Matemáticas</strong>.
          </p>
        </Reveal>

        {/* 3 Pasos: línea temporal vertical conectada en móvil (`< md`), 3 columnas 3D en desktop (`md:`+) */}
        <ol className="scene-3d relative mt-10 flex flex-col gap-4 pl-6 before:absolute before:bottom-8 before:left-2.5 before:top-8 before:w-0.5 before:rounded-full before:bg-quack-gunmetal/20 md:mt-12 md:grid md:grid-cols-3 md:gap-6 md:pl-0 md:before:hidden">
          {planSteps.map((step, i) => (
            <Reveal as="li" key={step.id} delay={i * 110} className="relative">
              <span
                aria-hidden="true"
                className="absolute -left-5 top-7 z-10 h-3.5 w-3.5 rounded-full border-2 border-quack-gunmetal bg-quack-amber md:hidden"
              />
              <div className="card-3d-light relative flex h-full flex-col justify-between rounded-3xl border-2 border-quack-gunmetal bg-white p-5 sm:p-7">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span
                      style={{ transform: "translateZ(20px)" }}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border-2 border-quack-gunmetal bg-quack-amber font-brand text-lg font-bold text-quack-gunmetal shadow-[3px_3px_0_0_#3B4151] sm:h-12 sm:w-12 sm:rounded-2xl sm:text-xl sm:shadow-[4px_4px_0_0_#3B4151]"
                    >
                      0{i + 1}
                    </span>
                    <span className="rounded-full bg-quack-dandelion/60 px-3 py-1 font-brand text-[11px] font-bold text-quack-gunmetal">
                      {step.badge}
                    </span>
                  </div>
                  <h3 className="mt-4 font-brand text-lg font-bold text-quack-gunmetal sm:mt-5 sm:text-xl">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-quack-gunmetal/75 sm:mt-2.5">
                    {step.description}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </ol>

        {/* Consola 3D Oscura Interactiva (un solo módulo visible a la vez) */}
        <Reveal delay={160} className="mx-auto mt-12 max-w-4xl sm:mt-16">
          <div ref={consoleRef} className="scene-3d">
            <div className="tilt-stage relative rounded-3xl border-2 border-quack-gunmetal bg-[#151922] p-4 text-white shadow-[6px_8px_0_0_#FFC800,0_20px_42px_-12px_rgba(21,25,34,0.6)] sm:rounded-[2rem] sm:p-8 sm:shadow-[12px_14px_0_0_#FFC800,0_32px_64px_-16px_rgba(21,25,34,0.65)]">
              {/* Barra superior de la consola 3D */}
              <div className="flex flex-col items-stretch justify-between gap-3 border-b border-white/10 pb-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4 sm:pb-5">
                <div
                  role="tablist"
                  aria-label="Módulos de práctica de Quack"
                  className="grid w-full grid-cols-2 gap-1 rounded-2xl border border-white/15 bg-[#0E1118] p-1.5 sm:inline-flex sm:w-auto sm:gap-0"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === "feynman"}
                    onClick={() => setActiveTab("feynman")}
                    className={cn(
                      "inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-2.5 py-2 font-brand text-[11px] font-bold transition-all sm:gap-2 sm:px-4 sm:text-sm",
                      activeTab === "feynman"
                        ? "bg-quack-amber text-quack-gunmetal shadow-[0_4px_14px_rgba(255,200,0,0.4)]"
                        : "text-white/70 hover:text-white"
                    )}
                  >
                    <Mic className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" aria-hidden="true" />
                    <span>1. Feynman Oral</span>
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === "exam"}
                    onClick={() => setActiveTab("exam")}
                    className={cn(
                      "inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-2.5 py-2 font-brand text-[11px] font-bold transition-all sm:gap-2 sm:px-4 sm:text-sm",
                      activeTab === "exam"
                        ? "bg-quack-amber text-quack-gunmetal shadow-[0_4px_14px_rgba(255,200,0,0.4)]"
                        : "text-white/70 hover:text-white"
                    )}
                  >
                    <PenTool className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" aria-hidden="true" />
                    <span>
                      2. Parcial <span className="hidden sm:inline">a Ciegas </span>OCR
                    </span>
                  </button>
                </div>

                <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-quack-amber/35 bg-quack-amber/10 px-3 py-1 font-brand text-[11px] font-bold text-quack-amber sm:text-xs">
                  <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  Próximamente: Fase 0 · Repetición Espaciada
                </span>
              </div>

              {activeTab === "feynman" ? (
                <div key="tab-feynman" className="animate-pop mt-5 sm:mt-6">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                    <p className="text-xs font-medium text-white/80 sm:text-sm">
                      Selecciona una disciplina para ver cómo Quack audita tu explicación oral:
                    </p>
                    <div className="-mx-1 flex flex-nowrap gap-2 overflow-x-auto px-1 pb-1 no-scrollbar sm:mx-0 sm:flex-wrap sm:gap-1.5 sm:overflow-visible sm:px-0 sm:pb-0">
                      {feynmanDemosBySubject.map((subject) => {
                        const active = subject.id === activeFeynman.id;
                        return (
                          <button
                            key={subject.id}
                            type="button"
                            onClick={() => {
                              setSelectedSubjectId(subject.id);
                              trackEvent("demo_interaction", {
                                module: "feynman",
                                discipline: subject.id,
                              });
                            }}
                            className={cn(
                              "shrink-0 cursor-pointer whitespace-nowrap rounded-xl border px-3 py-1.5 text-xs font-bold transition-all",
                              active
                                ? "border-quack-amber bg-quack-amber text-quack-gunmetal shadow-[0_0_16px_rgba(255,200,0,0.35)]"
                                : "border-white/15 bg-white/5 text-white/75 hover:bg-white/10"
                            )}
                          >
                            {subject.discipline}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div
                    style={{ transform: "translateZ(18px)" }}
                    className="mt-4 rounded-2xl border border-white/15 bg-[#1D2230] p-3.5 shadow-inner sm:mt-5 sm:p-5"
                  >
                    <div className="flex flex-wrap gap-1.5 pb-3.5 sm:gap-2 sm:pb-4">
                      {activeFeynman.subconcepts.map((sub) => (
                        <span
                          key={sub.id}
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold sm:px-3 sm:text-xs",
                            sub.covered
                              ? "border-emerald-400/50 bg-emerald-500/15 text-emerald-300"
                              : "border-white/15 bg-white/5 text-white/55"
                          )}
                        >
                          {sub.covered ? (
                            <Check className="h-3 w-3 shrink-0 text-emerald-400 sm:h-3.5 sm:w-3.5" strokeWidth={3} aria-hidden="true" />
                          ) : (
                            <Circle className="h-2.5 w-2.5 shrink-0" aria-hidden="true" />
                          )}
                          {sub.label}
                        </span>
                      ))}
                    </div>

                    <div className="space-y-3">
                      {activeFeynman.messages.map((msg) => {
                        const isStudent = msg.sender === "student";
                        return (
                          <div
                            key={msg.id}
                            className={cn("flex", isStudent ? "justify-end" : "justify-start")}
                          >
                            <div
                              className={cn(
                                "max-w-[90%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed sm:max-w-[85%] sm:px-4 sm:py-3 sm:text-sm",
                                isStudent
                                  ? "rounded-br-sm border border-white/15 bg-white/10 text-white"
                                  : "rounded-bl-sm border-2 border-quack-gunmetal bg-quack-amber font-semibold text-quack-gunmetal shadow-[4px_4px_0_0_#000000]"
                              )}
                            >
                              {msg.text}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-5 flex justify-end sm:mt-6">
                    <CtaButton to="/login?redirect=/feynman" location="solutions_feynman" tone="light" size="md" className="w-full sm:w-auto">
                      Probar Feynman Oral en vivo
                    </CtaButton>
                  </div>
                </div>
              ) : (
                <div key="tab-exam" className="animate-pop mt-5 sm:mt-6">
                  <p className="text-xs font-medium text-white/80 sm:text-sm">
                    Toca cualquier línea manuscrita para inspeccionar el diagnóstico paso a paso:
                  </p>

                  <div
                    style={{ transform: "translateZ(18px)" }}
                    className="mt-4 space-y-2.5 rounded-2xl border-2 border-quack-gunmetal bg-[#fffcf2] p-3 text-quack-gunmetal sm:p-4"
                  >
                    {auditDemo.steps.map((step, idx) => {
                      const meta = statusMeta[step.status];
                      const isSelected = idx === activeAuditIdx;
                      return (
                        <button
                          key={step.stepNumber}
                          type="button"
                          onClick={() => {
                            setActiveAuditIdx(idx);
                            trackEvent("demo_interaction", {
                              module: "ocr_audit",
                              step: step.stepNumber,
                            });
                          }}
                          className={cn(
                            "flex w-full cursor-pointer flex-wrap items-center justify-between gap-2 rounded-xl border-2 px-3 py-2.5 text-left transition-all sm:flex-nowrap sm:gap-3 sm:px-4",
                            isSelected
                              ? "border-quack-gunmetal bg-quack-dandelion shadow-[4px_4px_0_0_#3B4151]"
                              : "border-quack-gunmetal/15 bg-white hover:border-quack-gunmetal/40"
                          )}
                        >
                          <span className="flex min-w-0 max-w-full items-center gap-2 overflow-x-auto no-scrollbar sm:gap-2.5">
                            <span className="shrink-0 font-mono text-xs font-bold text-quack-gunmetal/50">
                              #{step.stepNumber}
                            </span>
                            <span className="ink-blue whitespace-nowrap text-xs sm:text-sm">
                              <MathRenderer math={step.expression} />
                            </span>
                          </span>
                          <span
                            className={cn(
                              "inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-bold sm:px-2.5 sm:text-xs",
                              meta.chip
                            )}
                          >
                            <meta.Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" aria-hidden="true" />
                            <span>{meta.label}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4 rounded-2xl border border-quack-amber/50 bg-quack-amber/10 p-3.5 text-xs sm:p-4 sm:text-sm">
                    <p className="font-brand font-bold text-quack-amber">
                      Diagnóstico del Paso {selectedAuditStep.stepNumber} ({selectedAuditMeta.label}):
                    </p>
                    <p className="mt-1 text-white/90">{selectedAuditStep.feedback}</p>
                  </div>

                  <div className="mt-5 flex justify-end sm:mt-6">
                    <CtaButton to="/login?redirect=/parcial-ciegas" location="solutions_exam" tone="light" size="md" className="w-full sm:w-auto">
                      Probar Parcial a Ciegas OCR
                    </CtaButton>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Reveal>
      </div>

      {/* Transición diagonal hacia la sección oscura de Universidades */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 leading-none text-[#10131a]"
      >
        <svg
          viewBox="0 0 1440 72"
          preserveAspectRatio="none"
          className="block h-10 w-full sm:h-16"
        >
          <path d="M0,64 L1440,8 L1440,72 L0,72 Z" fill="currentColor" />
        </svg>
      </div>
    </section>
  );
};
