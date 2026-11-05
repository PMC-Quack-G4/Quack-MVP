import * as React from "react";
import { MathRenderer } from "@/components/common/MathRenderer";
import { DuckModel } from "./DuckModel";
import { statusMeta } from "./auditStatus";
import { auditDemo } from "@/mocks/landingContent";
import { usePointerTilt } from "@/hooks/usePointerTilt";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/utils";

/**
 * Escena 3D del hero (CSS puro): hoja de parcial manuscrita que Quack revisa
 * paso a paso, con capas a distintas profundidades que reaccionan al puntero.
 * Muestra en 5 segundos el producto real: resolver a mano → revisión por pasos.
 */
export const Hero3DScene: React.FC = () => {
  const stageRef = usePointerTilt<HTMLDivElement>(12);
  const reduced = usePrefersReducedMotion();
  const total = auditDemo.steps.length;
  const [revealed, setRevealed] = React.useState(0);

  React.useEffect(() => {
    if (reduced) {
      setRevealed(total);
      return;
    }
    let count = 0;
    let timer = window.setTimeout(function step() {
      count += 1;
      setRevealed(count);
      if (count < total) timer = window.setTimeout(step, 520);
    }, 900);
    return () => window.clearTimeout(timer);
  }, [reduced, total]);

  const done = revealed >= total;

  return (
    <div
      className="relative mx-auto h-[380px] w-full sm:h-[500px] lg:h-[580px]"
      role="img"
      aria-label="Ilustración: hoja de parcial resuelta a mano. Quack revisa cada paso: cuatro correctos, un error algebraico en el paso 5 y un error arrastrado en el paso 6. Calificación 3.5 de 5."
    >
      <div className="absolute left-1/2 top-0 h-[580px] w-[580px] origin-top -translate-x-1/2 scale-[0.64] sm:scale-[0.86] lg:scale-100">
        <div ref={stageRef} className="scene-3d h-full w-full">
          <div className="tilt-stage relative h-full w-full">
            {/* Fórmulas fantasma de fondo (profundidad) */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 preserve-3d text-quack-gunmetal/15">
              <span className="absolute left-2 top-6 text-4xl animate-float-slow" style={{ ["--z" as string]: "-160px" }}>
                <MathRenderer math="\oint \vec{E}\cdot d\vec{A}" />
              </span>
              <span className="absolute bottom-10 right-4 text-5xl animate-float-slow delay-2" style={{ ["--z" as string]: "-200px" }}>
                <MathRenderer math="\nabla \times \vec{B}" />
              </span>
              <span className="absolute bottom-24 left-0 text-3xl animate-float delay-3" style={{ ["--z" as string]: "-120px" }}>
                <MathRenderer math="\int_0^\infty e^{-x}\,dx" />
              </span>
            </div>

            {/* Hoja de parcial */}
            <div
              className="absolute left-6 top-16 w-[390px] preserve-3d"
              style={{ transform: "rotateY(-14deg) rotateX(10deg) rotateZ(-3deg)" }}
            >
              <div className="relative overflow-hidden rounded-[22px] border-2 border-quack-gunmetal/80 bg-white shadow-[18px_28px_0_-6px_rgba(59,65,81,0.18),0_40px_80px_-30px_rgba(59,65,81,0.55)]">
                <div className="lp-paper absolute inset-0 opacity-70" aria-hidden="true" />
                <div className="absolute bottom-0 left-12 top-0 w-px bg-red-300/70" aria-hidden="true" />
                <div className="relative px-5 pb-6 pl-16 pt-5">
                  <div className="mb-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.18em] text-quack-gunmetal/60">
                    <span>Parcial a ciegas · Física</span>
                    <span className="rounded-full bg-quack-gunmetal px-2 py-0.5 font-mono text-[10px] tracking-normal text-quack-amber">
                      ⏱ 18:42
                    </span>
                  </div>
                  <p className="font-hand text-2xl leading-tight text-blue-900">{auditDemo.title}</p>

                  <ol className="mt-2 space-y-1.5">
                    {auditDemo.steps.map((step, index) => {
                      const meta = statusMeta[step.status];
                      const visible = index < revealed;
                      const isError = step.status === "ALGEBRAIC_ERROR";
                      return (
                        <li key={step.stepNumber} className="relative flex items-center gap-2">
                          <span className="absolute -left-10 w-6 text-right font-hand text-lg text-quack-gunmetal/40">
                            {step.stepNumber}.
                          </span>
                          <span className="ink-blue min-w-0 flex-1 text-[15px]">
                            <MathRenderer math={step.latexExpression} />
                          </span>
                          <span className={cn("shrink-0", meta.ink, visible ? "animate-pop" : "opacity-0")}>
                            <meta.Icon className="h-5 w-5" aria-hidden="true" />
                          </span>
                          {isError && visible && (
                            <svg
                              aria-hidden="true"
                              viewBox="0 0 300 60"
                              className="pointer-events-none absolute -inset-x-3 -inset-y-2 h-[calc(100%+16px)] w-[calc(100%+24px)]"
                              preserveAspectRatio="none"
                            >
                              <path
                                className="scribble-path"
                                style={{ animationDelay: "0.1s" }}
                                d="M12 34 C 20 6, 270 2, 290 26 C 300 50, 60 62, 14 44 C 4 38, 18 20, 40 16"
                                fill="none"
                                stroke="#F89D4F"
                                strokeWidth="3.5"
                                strokeLinecap="round"
                              />
                            </svg>
                          )}
                        </li>
                      );
                    })}
                  </ol>
                </div>
              </div>

              {/* Anotación manuscrita */}
              <div
                className={cn(
                  "absolute -right-16 top-[208px] flex items-center gap-1 font-hand text-2xl text-quack-caramel transition-opacity duration-500",
                  revealed >= 5 ? "opacity-100" : "opacity-0"
                )}
                style={{ transform: "translateZ(40px) rotate(-6deg)" }}
                aria-hidden="true"
              >
                <svg viewBox="0 0 50 30" className="h-6 w-10">
                  <path d="M48 6 C 30 4, 14 10, 4 24 M4 24 L 6 12 M4 24 L 15 21" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
                ¡revisa aquí!
              </div>
            </div>

            {/* Sello de calificación con crédito parcial */}
            <div
              className="absolute bottom-[54px] left-[300px] preserve-3d"
              style={{ transform: "translateZ(90px)" }}
              aria-hidden="true"
            >
              {done && (
                <div className="animate-stamp flex h-[124px] w-[124px] flex-col items-center justify-center rounded-full border-[5px] border-double border-quack-caramel bg-[#fff6ec]/95 text-quack-caramel shadow-[0_18px_40px_-14px_rgba(217,107,67,0.6)]">
                  <span className="font-brand text-4xl font-bold leading-none">
                    {auditDemo.score.toFixed(1)}
                  </span>
                  <span className="text-xs font-bold">/ {auditDemo.maxScore.toFixed(1)}</span>
                  <span className="mt-1 text-[9px] font-bold uppercase tracking-[0.2em]">Crédito parcial</span>
                </div>
              )}
            </div>

            {/* Quack con globo de diálogo socrático */}
            <div className="absolute right-0 top-0 preserve-3d" style={{ transform: "translateZ(140px)" }} aria-hidden="true">
              <div className="relative">
                <div
                  className={cn(
                    "absolute -left-[214px] top-4 w-[220px] rounded-3xl rounded-tr-md border-2 border-quack-gunmetal bg-white p-3.5 text-[13px] font-medium leading-snug text-quack-gunmetal shadow-[6px_6px_0_0_#3B4151] transition-all duration-500",
                    revealed >= 5 ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
                  )}
                >
                  Oye… en el paso 5, ¿cómo era la fórmula de la energía cinética? 🤔
                </div>
                <DuckModel size={168} />
              </div>
            </div>

            {/* Chips flotantes de diagnóstico */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 preserve-3d">
              <Chip className="right-6 top-[230px] animate-float" z={110} status="CORRECT" text="4 pasos correctos" show={revealed >= 4} />
              <Chip className="right-0 top-[300px] animate-float delay-2" z={70} status="ALGEBRAIC_ERROR" text="Paso 5 · error algebraico" show={revealed >= 5} />
              <Chip className="right-10 top-[370px] animate-float delay-3" z={40} status="PROPAGATED_ERROR" text="Paso 6 · error arrastrado" show={done} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ChipProps {
  className?: string;
  z: number;
  status: keyof typeof statusMeta;
  text: string;
  show: boolean;
}

const Chip: React.FC<ChipProps> = ({ className, z, status, text, show }) => {
  const meta = statusMeta[status];
  return (
    <div className={cn("absolute", className)} style={{ ["--z" as string]: `${z}px` }}>
      <div
        className={cn(
          "flex items-center gap-1.5 rounded-full border-2 px-3 py-1.5 text-xs font-bold shadow-lg transition-all duration-500",
          meta.chip,
          show ? "scale-100 opacity-100" : "scale-75 opacity-0"
        )}
      >
        <meta.Icon className="h-4 w-4" />
        {text}
      </div>
    </div>
  );
};
