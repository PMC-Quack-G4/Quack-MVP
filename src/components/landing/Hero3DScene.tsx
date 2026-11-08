import * as React from "react";
import { MathRenderer } from "@/components/common/MathRenderer";
import { DuckModel } from "./DuckModel";
import { statusMeta } from "./auditStatus";
import { auditDemo } from "@/mocks/landingContent";
import { usePointerTilt } from "@/hooks/usePointerTilt";
import { cn } from "@/lib/utils";

/**
 * Escena 3D interactiva multicapa para el Hero:
 * - Usa perspectiva 3D real (`preserve-3d`) con inclinación al cursor (`usePointerTilt`)
 *   y planos a distintas profundidades (`translateZ`) sin salirse del viewport.
 * - Combina el contraste oscuro (#151922) con acentos Amber (#FFC800) y el pato extruido en 3D.
 */
export const Hero3DScene: React.FC = () => {
  const stageRef = usePointerTilt<HTMLDivElement>(11);
  const stepsPreview = auditDemo.steps.slice(0, 3);

  return (
    <div
      ref={stageRef}
      className="scene-3d relative mx-auto w-full max-w-lg py-4"
      role="img"
      aria-label="Escena 3D interactiva de Quack: la mascota interroga un paso del procedimiento y audita con crédito parcial."
    >
      {/* Halo de luz cálida en el plano posterior */}
      <div
        aria-hidden="true"
        className="animate-pulse-glow pointer-events-none absolute -inset-4 -z-10 rounded-[2.5rem] bg-gradient-to-tr from-quack-amber/35 via-quack-sandy/20 to-transparent blur-2xl"
      />

      <div className="tilt-stage relative rounded-[2rem] border-2 border-quack-gunmetal bg-[#151922] p-5 text-white shadow-[12px_14px_0_0_#FFC800,0_28px_60px_-15px_rgba(21,25,34,0.65)] sm:p-6">
        {/* Piso de cuadrícula en perspectiva dentro del escenario oscuro */}
        <div
          aria-hidden="true"
          className="perspective-grid-floor pointer-events-none absolute inset-x-0 bottom-0 h-36 rounded-b-[1.9rem] opacity-55"
        />

        {/* Píldoras 3D flotantes de disciplinas (plano Z +55px) */}
        <div
          aria-hidden="true"
          style={{ transform: "translateZ(52px)" }}
          className="animate-float pointer-events-none absolute -top-3.5 left-6 z-20 rounded-xl border-2 border-quack-gunmetal bg-quack-amber px-3 py-1 font-mono text-[11px] font-bold text-quack-gunmetal shadow-[4px_4px_0_0_#3B4151]"
        >
          {"<AVL O(log n) />"}
        </div>
        <div
          aria-hidden="true"
          style={{ transform: "translateZ(46px)" }}
          className="animate-float delay-2 pointer-events-none absolute -right-2 -top-3 z-20 rounded-xl border-2 border-quack-amber bg-[#1E2433] px-3 py-1 font-mono text-[11px] font-bold text-quack-dandelion shadow-[4px_4px_0_0_#FFC800]"
        >
          ΔG = ΔH − TΔS
        </div>

        {/* Nivel Superior (Z +36px): Pato 3D extruido + Burbuja Socrática */}
        <div
          style={{ transform: "translateZ(36px)" }}
          className="relative z-10 flex items-center gap-4 rounded-2xl border border-white/15 bg-white/[0.06] p-3.5 backdrop-blur-md"
        >
          <div className="relative flex shrink-0 items-center justify-center">
            <span
              aria-hidden="true"
              className="animate-ripple pointer-events-none absolute h-20 w-20 rounded-full border border-quack-amber/50"
            />
            <DuckModel size={92} layers={8} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-quack-amber px-2.5 py-0.5 font-brand text-[10px] font-bold uppercase tracking-wider text-quack-gunmetal">
                <span className="h-1.5 w-1.5 rounded-full bg-quack-gunmetal animate-ping" />
                Feynman Oral Activo
              </span>
            </div>
            <p className="mt-2 text-xs font-semibold leading-snug text-white sm:text-sm">
              “Oye… en el paso 3, ¿no faltó elevar la velocidad al cuadrado antes de multiplicar?”
            </p>
          </div>
        </div>

        {/* Nivel Medio (Z +22px): Hoja manuscrita con escáner láser 3D */}
        <div
          style={{ transform: "translateZ(22px)" }}
          className="relative z-10 mt-4 overflow-hidden rounded-2xl border-2 border-quack-gunmetal bg-[#fffcf2] p-4 text-quack-gunmetal shadow-[0_14px_30px_-10px_rgba(0,0,0,0.65)]"
        >
          {/* Línea láser de escaneo OCR */}
          <div
            aria-hidden="true"
            className="animate-scan pointer-events-none absolute inset-x-0 z-20 h-[2px] bg-gradient-to-r from-transparent via-quack-amber to-transparent shadow-[0_0_12px_2px_rgba(255,200,0,0.85)]"
          />

          <div className="flex items-center justify-between border-b border-quack-gunmetal/10 pb-2.5 text-xs">
            <span className="font-brand font-bold text-quack-gunmetal">
              Parcial a Ciegas · Auditoría OCR
            </span>
            <span className="rounded-full border border-quack-gunmetal bg-quack-amber px-2.5 py-0.5 font-mono text-[11px] font-bold text-quack-gunmetal shadow-[2px_2px_0_0_#3B4151]">
              Nota: {auditDemo.score.toFixed(1)} / {auditDemo.maxScore.toFixed(1)}
            </span>
          </div>

          <ol className="mt-3 space-y-2">
            {stepsPreview.map((step) => {
              const meta = statusMeta[step.status];
              return (
                <li
                  key={step.stepNumber}
                  className="flex items-center justify-between gap-2 rounded-xl border border-quack-gunmetal/15 bg-white px-3 py-2 shadow-2xs transition-transform duration-200 hover:translate-x-1"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="font-mono text-xs font-bold text-quack-gunmetal/45">
                      {step.stepNumber}.
                    </span>
                    <span className="ink-blue truncate text-xs sm:text-sm">
                      <MathRenderer math={step.expression} />
                    </span>
                  </span>
                  <span
                    className={cn(
                      "inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-bold",
                      meta.chip
                    )}
                  >
                    <meta.Icon className="h-3 w-3" aria-hidden="true" />
                    <span>{meta.label}</span>
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
};
