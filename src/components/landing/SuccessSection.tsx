import * as React from "react";
import { Check, X } from "lucide-react";
import { Reveal } from "./Reveal";
import { DuckModel } from "./DuckModel";
import { transformations } from "@/mocks/landingContent";
import { useInView } from "@/hooks/useInView";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

type Mode = "sin" | "con";

/**
 * ESCENARIO DE ÉXITO (Show Potential Success): tarjetas que giran en 3D
 * del "antes" al "después". Se activan solas al entrar en pantalla y el usuario
 * puede alternarlas.
 */
export const SuccessSection: React.FC = () => {
  const [mode, setMode] = React.useState<Mode>("sin");
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.35 });
  const touched = React.useRef(false);

  React.useEffect(() => {
    if (!inView || touched.current) return;
    const id = window.setTimeout(() => setMode("con"), 900);
    return () => window.clearTimeout(id);
  }, [inView]);

  const choose = (next: Mode) => {
    touched.current = true;
    setMode(next);
    trackEvent("success_toggle", { mode: next });
  };

  return (
    <section aria-labelledby="success-title" className="relative overflow-hidden bg-quack-dandelion py-24 sm:py-32">
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-10 h-96 w-96 rounded-full bg-quack-amber/60 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <Reveal className="max-w-2xl">
            <p className="font-brand text-sm font-bold uppercase tracking-[0.25em] text-quack-caramel">El resultado</p>
            <h2 id="success-title" className="mt-4 font-brand text-4xl font-bold leading-tight text-quack-gunmetal text-balance sm:text-6xl">
              Ahora imagina llegar al parcial así.
            </h2>
            <p className="mt-5 text-lg text-quack-gunmetal/80">
              Sin depender de la suerte ni de lo que alcanzaste a releer. Con la tranquilidad de haberlo demostrado antes.
            </p>
          </Reveal>

          <Reveal delay={150}>
            <div role="group" aria-label="Comparar tu estudio sin Quack y con Quack" className="inline-flex rounded-2xl border-2 border-quack-gunmetal bg-white p-1.5 shadow-[4px_4px_0_0_#3B4151]">
              {(["sin", "con"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  aria-pressed={mode === m}
                  onClick={() => choose(m)}
                  className={cn(
                    "rounded-xl px-5 py-2.5 font-brand text-sm font-bold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-quack-gunmetal sm:px-7 sm:text-base",
                    mode === m
                      ? m === "con"
                        ? "bg-quack-amber text-quack-gunmetal shadow-inner"
                        : "bg-quack-gunmetal text-white"
                      : "text-quack-gunmetal/60 hover:text-quack-gunmetal"
                  )}
                >
                  {m === "sin" ? "Sin Quack" : "Con Quack"}
                </button>
              ))}
            </div>
          </Reveal>
        </div>

        <div ref={ref} className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {transformations.map((item, i) => (
            <div key={item.id} className="scene-3d">
              <div
                className="preserve-3d grid transition-transform duration-700"
                style={{
                  transform: mode === "con" ? "rotateY(180deg)" : "rotateY(0deg)",
                  transitionTimingFunction: "cubic-bezier(0.34, 1.4, 0.64, 1)",
                  transitionDelay: `${i * 110}ms`,
                }}
              >
                {/* Antes */}
                <article
                  className="flex min-h-[210px] flex-col rounded-3xl border-2 border-quack-gunmetal/20 bg-white/70 p-6 [grid-area:1/1]"
                  style={{ backfaceVisibility: "hidden" }}
                  aria-hidden={mode === "con"}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-quack-gunmetal/10 text-quack-gunmetal/70">
                    <X className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <p className="mt-auto pt-6 text-lg font-medium leading-snug text-quack-gunmetal/70">{item.before}</p>
                </article>
                {/* Después */}
                <article
                  className="flex min-h-[210px] flex-col rounded-3xl border-2 border-quack-gunmetal bg-white p-6 shadow-[6px_6px_0_0_#3B4151] [grid-area:1/1]"
                  style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                  aria-hidden={mode === "sin"}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-quack-amber text-quack-gunmetal">
                    <Check className="h-5 w-5" strokeWidth={3} aria-hidden="true" />
                  </span>
                  <p className="mt-auto pt-6 font-brand text-lg font-bold leading-snug text-quack-gunmetal">{item.after}</p>
                </article>
              </div>
            </div>
          ))}
        </div>

        <Reveal className="mt-16 flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-center sm:gap-6 sm:text-left">
          <DuckModel size={128} layers={7} />
          <p className="max-w-xl font-brand text-2xl font-bold leading-snug text-quack-gunmetal sm:text-3xl">
            Más horas de estudio que sí se convierten en nota.
          </p>
        </Reveal>
      </div>
    </section>
  );
};
