import * as React from "react";
import { BookOpen, Mic, ShieldCheck } from "lucide-react";
import { Reveal } from "./Reveal";
import { CtaButton } from "./CtaButton";
import { DuckModel } from "./DuckModel";
import { planSteps } from "@/mocks/landingContent";

const stepIcons = [BookOpen, Mic, ShieldCheck] as const;

/**
 * EL PLAN EN 3 PASOS ("Piedras en el arroyo" de StoryBrand):
 * Disuelve el temor y la fricción operativa mostrando exactamente cómo empezar
 * en 3 pasos simples.
 */
export const PlanSection: React.FC = () => (
  <section
    id="como-funciona"
    aria-labelledby="plan-title"
    className="lp-paper relative overflow-hidden border-y-2 border-quack-gunmetal py-24 sm:py-32"
  >
    {/* Arroyo ilustrado en el fondo */}
    <svg
      aria-hidden="true"
      viewBox="0 0 1200 260"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 hidden h-56 w-full -translate-y-1/2 opacity-45 lg:block"
    >
      <path
        d="M -40 160 C 260 20, 480 260, 760 110 C 980 10, 1100 200, 1260 120"
        fill="none"
        stroke="#FFE978"
        strokeWidth="70"
        strokeLinecap="round"
      />
      <path
        d="M -40 160 C 260 20, 480 260, 760 110 C 980 10, 1100 200, 1260 120"
        fill="none"
        stroke="#3B4151"
        strokeWidth="3"
        strokeDasharray="10 12"
        strokeLinecap="round"
      />
    </svg>

    <div className="mx-auto max-w-7xl px-5 sm:px-8">
      <Reveal className="mx-auto max-w-3xl text-center">
        <p className="font-brand text-sm font-bold uppercase tracking-[0.25em] text-quack-caramel">
          El plan en 3 pasos
        </p>
        <h2
          id="plan-title"
          className="mt-4 font-brand text-4xl font-bold leading-tight text-quack-gunmetal text-balance sm:text-5xl"
        >
          Cruza del “creo que entiendo” al <span className="marker-highlight">“sé que sé”</span>
        </h2>
        <p className="mt-4 text-lg text-quack-gunmetal/80">
          Sin registros eternos ni configuraciones complicadas. Tres piedras firmes para llegar tranquilo al examen.
        </p>
      </Reveal>

      <ol className="mt-16 grid gap-8 lg:grid-cols-3">
        {planSteps.map((step, i) => {
          const Icon = stepIcons[i] ?? BookOpen;
          return (
            <Reveal as="li" key={step.id} delay={i * 150} className="relative">
              <div className="group relative flex h-full flex-col rounded-[30px] border-2 border-quack-gunmetal bg-white p-8 shadow-[8px_8px_0_0_#3B4151] transition-transform duration-300 hover:-translate-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-quack-gunmetal bg-quack-amber font-brand text-2xl font-bold text-quack-gunmetal shadow-[3px_3px_0_0_#3B4151]">
                    {i + 1}
                  </span>
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-quack-dandelion/60 text-quack-gunmetal">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                </div>

                <h3 className="mt-6 font-brand text-2xl font-bold text-quack-gunmetal">{step.title}</h3>
                <p className="mt-3 flex-1 text-base leading-relaxed text-quack-gunmetal/80">{step.description}</p>

                <div className="mt-6 flex items-center gap-2 border-t border-dashed border-quack-gunmetal/15 pt-4 text-xs font-bold uppercase tracking-wider text-quack-caramel">
                  <span>Paso {i + 1} de 3</span>
                  <span>·</span>
                  <span>{i === 0 ? "30 segundos" : i === 1 ? "10–20 minutos" : "Día del parcial"}</span>
                </div>
              </div>
            </Reveal>
          );
        })}
      </ol>

      <Reveal delay={350} className="mt-16 flex flex-col items-center justify-center gap-5 text-center">
        <div className="flex items-center gap-4">
          <div className="hidden sm:block">
            <DuckModel size={96} layers={6} />
          </div>
          <CtaButton to="/feynman" location="plan" size="xl">
            Dar el paso 1 gratis ahora
          </CtaButton>
        </div>
        <p className="text-sm font-medium text-quack-gunmetal/75">
          Toma menos de un minuto empezar tu primera práctica.
        </p>
      </Reveal>
    </div>
  </section>
);
