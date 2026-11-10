import * as React from "react";
import { MathRenderer } from "@/components/common/MathRenderer";
import { DuckModel } from "./DuckModel";
import { statusMeta } from "./auditStatus";
import { auditDemo } from "@/mocks/landingContent";
import { usePointerTilt } from "@/hooks/usePointerTilt";
import { cn } from "@/lib/utils";

/**
 * Escena 3D interactiva multicapa para el Hero:
 * - En desktop usa perspectiva 3D con inclinación al puntero y capas en eje Z.
 * - En móvil mantiene sus tarjetas y etiquetas flotantes contenidas dentro del ancho
 *   de pantalla para evitar recortes laterales.
 */
export const Hero3DScene: React.FC = () => {
  const stageRef = usePointerTilt<HTMLDivElement>(11);
  const stepsPreview = auditDemo.steps.slice(0, 3);

  return (
    <div
      ref={stageRef}
      className="scene-3d relative mx-auto w-full min-w-0 max-w-lg py-3 sm:py-4"
      role="img"
      aria-label="Escena 3D interactiva de Quack: la mascota interroga un paso del procedimiento y audita con crédito parcial."
    >
      {/* Halo de luz cálida en el plano posterior */}
      <div
        aria-hidden="true"
        className="animate-pulse-glow pointer-events-none absolute -inset-2 -z-10 rounded-[2.2rem] bg-gradient-to-tr from-quack-amber/35 via-quack-sandy/20 to-transparent blur-2xl sm:-inset-4"
      />

      <div className="tilt-stage relative rounded-3xl border-2 border-quack-gunmetal bg-[#151922] p-4 text-white shadow-[6px_8px_0_0_#FFC800,0_20px_42px_-12px_rgba(21,25,34,0.6)] sm:rounded-[2rem] sm:p-6 sm:shadow-[12px_14px_0_0_#FFC800,0_28px_60px_-15px_rgba(21,25,34,0.65)]">
        {/* Piso de cuadrícula en perspectiva dentro del escenario oscuro */}
        <div
          aria-hidden="true"
          className="perspective-grid-floor pointer-events-none absolute inset-x-0 bottom-0 h-32 rounded-b-3xl opacity-55 sm:h-36 sm:rounded-b-[1.9rem]"
        />

        {/* Píldoras 3D flotantes de disciplinas — contenidas dentro del card en móvil */}
        <div
          aria-hidden="true"
          style={{ transform: "translateZ(52px)" }}
          className="animate-float pointer-events-none absolute left-3 -top-3 z-20 rounded-lg border-2 border-quack-gunmetal bg-quack-amber px-2.5 py-0.5 font-mono text-[10px] font-bold text-quack-gunmetal shadow-[3px_3px_0_0_#3B4151] sm:left-6 sm:-top-3.5 sm:rounded-xl sm:px-3 sm:py-1 sm:text-[11px] sm:shadow-[4px_4px_0_0_#3B4151]"
        >
          {"<AVL O(log n) />"}
        </div>
        <div
          aria-hidden="true"
          style={{ transform: "translateZ(46px)" }}
          className="animate-float delay-2 pointer-events-none absolute right-3 -top-3 z-20 rounded-lg border-2 border-quack-amber bg-[#1E2433] px-2.5 py-0.5 font-mono text-[10px] font-bold text-quack-dandelion shadow-[3px_3px_0_0_#FFC800] sm:-right-2 sm:-top-3 sm:rounded-xl sm:px-3 sm:py-1 sm:text-[11px] sm:shadow-[4px_4px_0_0_#FFC800]"
        >
          ΔG = ΔH − TΔS
        </div>

        {/* Nivel Superior: Pato 3D extruido + Burbuja Socrática */}
        <div
          style={{ transform: "translateZ(36px)" }}
          className="relative z-10 mt-1 flex items-center gap-3 rounded-2xl border border-white/15 bg-white/[0.06] p-3 backdrop-blur-md sm:mt-0 sm:gap-4 sm:p-3.5"
        >
          <div className="relative flex h-[70px] w-[70px] shrink-0 items-center justify-center sm:h-[92px] sm:w-[92px]">
            <span
              aria-hidden="true"
              className="animate-ripple pointer-events-none absolute h-16 w-16 rounded-full border border-quack-amber/50 sm:h-20 sm:w-20"
            />
            <div className="origin-center scale-[0.76] sm:scale-100">
              <DuckModel size={92} layers={8} />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-quack-amber px-2 py-0.5 font-brand text-[9px] font-bold uppercase tracking-wider text-quack-gunmetal sm:px-2.5 sm:text-[10px]">
              <span className="h-1.5 w-1.5 rounded-full bg-quack-gunmetal animate-ping" />
              Feynman Oral Activo
            </span>
            <p className="mt-1.5 text-xs font-semibold leading-snug text-white sm:mt-2 sm:text-sm">
              “Oye… en el paso 3, ¿no faltó elevar la velocidad al cuadrado antes de multiplicar?”
            </p>
          </div>
        </div>

        {/* Nivel Medio: Hoja manuscrita con escáner láser 3D */}
        <div
          style={{ transform: "translateZ(22px)" }}
          className="relative z-10 mt-3.5 overflow-hidden rounded-2xl border-2 border-quack-gunmetal bg-[#fffcf2] p-3 text-quack-gunmetal shadow-[0_14px_30px_-10px_rgba(0,0,0,0.65)] sm:mt-4 sm:p-4"
        >
          {/* Línea láser de escaneo OCR */}
          <div
            aria-hidden="true"
            className="animate-scan pointer-events-none absolute inset-x-0 z-20 h-[2px] bg-gradient-to-r from-transparent via-quack-amber to-transparent shadow-[0_0_12px_2px_rgba(255,200,0,0.85)]"
          />

          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-quack-gunmetal/10 pb-2 text-[11px] sm:pb-2.5 sm:text-xs">
            <span className="font-brand font-bold text-quack-gunmetal">
              Parcial a Ciegas · OCR
            </span>
            <span className="rounded-full border border-quack-gunmetal bg-quack-amber px-2 py-0.5 font-mono text-[10px] font-bold text-quack-gunmetal shadow-[2px_2px_0_0_#3B4151] sm:px-2.5 sm:text-[11px]">
              Nota: {auditDemo.score.toFixed(1)} / {auditDemo.maxScore.toFixed(1)}
            </span>
          </div>

          <ol className="mt-2.5 space-y-2 sm:mt-3">
            {stepsPreview.map((step) => {
              const meta = statusMeta[step.status];
              return (
                <li
                  key={step.stepNumber}
                  className="flex items-center justify-between gap-2 rounded-xl border border-quack-gunmetal/15 bg-white px-2.5 py-2 shadow-2xs transition-transform duration-200 hover:translate-x-1 sm:px-3"
                >
                  <span className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2">
                    <span className="shrink-0 font-mono text-[11px] font-bold text-quack-gunmetal/45 sm:text-xs">
                      {step.stepNumber}.
                    </span>
                    <span className="ink-blue min-w-0 max-w-full overflow-x-auto no-scrollbar text-[11px] sm:truncate sm:text-sm">
                      <MathRenderer math={step.expression} />
                    </span>
                  </span>
                  <span
                    className={cn(
                      "inline-flex shrink-0 items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-bold sm:px-2 sm:text-[11px]",
                      meta.chip
                    )}
                  >
                    <meta.Icon className="h-2.5 w-2.5 sm:h-3 sm:w-3" aria-hidden="true" />
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
