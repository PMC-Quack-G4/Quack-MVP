import * as React from "react";
import { Link } from "react-router-dom";
import { Cpu, Database, Mail, Plus } from "lucide-react";
import { Reveal } from "./Reveal";
import { CtaButton } from "./CtaButton";
import { DuckModel } from "./DuckModel";
import { faqItems, landingConfig } from "@/mocks/landingContent";
import { isGeminiActive, getActiveModel } from "@/services/serviceFactory";

/**
 * CIERRE + EL "CAJÓN DE LOS DESHECHOS" (Junk Drawer / Footer — StoryBrand):
 * Agrupa preguntas frecuentes, enlaces secundarios, estado técnico de la API
 * y contacto al fondo de la página para mantener limpio el encabezado.
 */
export const LandingFooter: React.FC = () => {
  const isOnline = isGeminiActive();
  const activeModel = getActiveModel();

  return (
    <>
      {/* FAQ + CTA final */}
      <section id="preguntas" aria-labelledby="faq-title" className="lp-paper py-24 sm:py-32">
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <Reveal className="text-center">
            <p className="font-brand text-sm font-bold uppercase tracking-[0.25em] text-quack-caramel">
              Preguntas frecuentes
            </p>
            <h2
              id="faq-title"
              className="mt-3 font-brand text-3xl font-bold text-quack-gunmetal sm:text-5xl"
            >
              Respuestas claras antes de empezar
            </h2>
          </Reveal>

          <div className="mt-12 space-y-3.5">
            {faqItems.map((item, i) => (
              <Reveal key={item.id} delay={i * 70}>
                <details className="faq-item group rounded-2xl border-2 border-quack-gunmetal/20 bg-white px-6 py-4 transition-colors open:border-quack-gunmetal open:shadow-[5px_5px_0_0_#3B4151]">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-brand text-base font-bold text-quack-gunmetal sm:text-lg">
                    <span>{item.question}</span>
                    <span className="faq-icon flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-quack-dandelion text-quack-gunmetal transition-transform duration-200">
                      <Plus className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </summary>
                  <p className="mt-3 border-t border-quack-gunmetal/10 pt-3 text-sm leading-relaxed text-quack-gunmetal/80 sm:text-base">
                    {item.answer}
                  </p>
                </details>
              </Reveal>
            ))}
          </div>

          {/* Banner final de conversión */}
          <Reveal delay={200} className="mt-20">
            <div className="relative overflow-hidden rounded-[32px] border-2 border-quack-gunmetal bg-quack-amber p-8 text-quack-gunmetal shadow-[10px_10px_0_0_#3B4151] sm:p-12">
              <div className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
                <div>
                  <h3 className="font-brand text-3xl font-bold leading-tight sm:text-4xl">
                    No esperes al día del parcial para descubrir qué no sabías.
                  </h3>
                  <p className="mt-3 text-base font-medium text-quack-gunmetal/85 sm:text-lg">
                    Elige un tema ahora, explícaselo a Quack y llega al examen sabiendo que sabes.
                  </p>
                  <div className="mt-7 flex flex-wrap items-center gap-4">
                    <CtaButton to="/feynman" location="final" tone="dark" size="xl">
                      Practicar gratis ahora
                    </CtaButton>
                    <Link
                      to="/parcial-ciegas"
                      className="rounded-xl px-4 py-2.5 font-brand text-sm font-bold text-quack-gunmetal underline decoration-2 underline-offset-4 hover:bg-white/40"
                    >
                      O ir directo al Parcial a ciegas →
                    </Link>
                  </div>
                </div>
                <div className="mx-auto hidden md:block">
                  <DuckModel size={148} layers={7} />
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Junk Drawer (Pie de página completo) */}
      <footer className="border-t-2 border-quack-gunmetal bg-white text-quack-gunmetal">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {/* Marca */}
            <div className="space-y-3">
              <Link to="/" className="inline-flex items-center gap-2.5">
                <img src="/brand/quack-logo.png" alt="Quack Logo" className="h-10 w-10 object-contain" />
                <span className="font-brand text-2xl font-bold">quack</span>
              </Link>
              <p className="text-sm text-quack-gunmetal/75">
                La primera IA a la que tú le enseñas. Aprendizaje activo para estudiantes de ingeniería y ciencias.
              </p>
              <div className="pt-1">
                {isOnline ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                    <Cpu className="h-3.5 w-3.5" aria-hidden="true" /> IA en línea ({activeModel})
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    <Database className="h-3.5 w-3.5" aria-hidden="true" /> Modo demostrativo local activo
                  </span>
                )}
              </div>
            </div>

            {/* Práctica directa */}
            <div>
              <h4 className="font-brand text-sm font-bold uppercase tracking-wider text-quack-gunmetal">
                Modos de práctica
              </h4>
              <ul className="mt-4 space-y-2.5 text-sm text-quack-gunmetal/80">
                <li>
                  <Link to="/feynman" className="hover:text-quack-caramel hover:underline">
                    Explicar un tema a Quack (Feynman Oral)
                  </Link>
                </li>
                <li>
                  <Link to="/parcial-ciegas" className="hover:text-quack-caramel hover:underline">
                    Simulacro de Parcial a Ciegas (OCR)
                  </Link>
                </li>
                <li>
                  <a
                    href={landingConfig.leadMagnetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-quack-caramel hover:underline"
                  >
                    Descargar Checklist anti‑ilusión
                  </a>
                </li>
              </ul>
            </div>

            {/* Navegación interna */}
            <div>
              <h4 className="font-brand text-sm font-bold uppercase tracking-wider text-quack-gunmetal">
                En esta página
              </h4>
              <ul className="mt-4 space-y-2.5 text-sm text-quack-gunmetal/80">
                <li>
                  <a href="#guia" className="hover:text-quack-caramel hover:underline">
                    Por qué funciona Quack
                  </a>
                </li>
                <li>
                  <a href="#soluciones" className="hover:text-quack-caramel hover:underline">
                    Demostración de los 2 modos
                  </a>
                </li>
                <li>
                  <a href="#como-funciona" className="hover:text-quack-caramel hover:underline">
                    El plan en 3 pasos
                  </a>
                </li>
                <li>
                  <a href="#preguntas" className="hover:text-quack-caramel hover:underline">
                    Preguntas frecuentes
                  </a>
                </li>
              </ul>
            </div>

            {/* Contacto, privacidad y proyecto */}
            <div>
              <h4 className="font-brand text-sm font-bold uppercase tracking-wider text-quack-gunmetal">
                Contacto y transparencia
              </h4>
              <ul className="mt-4 space-y-2.5 text-sm text-quack-gunmetal/80">
                <li>
                  <a
                    href={`mailto:${landingConfig.contactEmail}`}
                    className="inline-flex items-center gap-1.5 hover:text-quack-caramel hover:underline"
                  >
                    <Mail className="h-4 w-4" aria-hidden="true" />
                    {landingConfig.contactEmail}
                  </a>
                </li>
                <li className="text-xs leading-relaxed text-quack-gunmetal/65">
                  Privacidad: tu voz se procesa en tu navegador y las calificaciones del Parcial a ciegas son
                  orientativas para estudio autónomo.
                </li>
                <li className="text-xs text-quack-gunmetal/60">
                  Proyecto académico ISIS‑2007 · Diseño de Productos e Innovación en TI · Universidad de los Andes.
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-quack-gunmetal/10 pt-6 text-xs text-quack-gunmetal/60 sm:flex-row">
            <p>© {new Date().getFullYear()} Quack MVP. Hecho por y para estudiantes STEM.</p>
            <p>Arquitectura StoryBrand · React 18 · TypeScript · Tailwind CSS · KaTeX</p>
          </div>
        </div>
      </footer>
    </>
  );
};
