import * as React from "react";
import { BarChart3, Building2, CheckCircle2, ChevronRight, FileUp, Quote } from "lucide-react";
import { Reveal } from "./Reveal";
import { testimonials } from "@/mocks/landingContent";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

/**
 * SECCIÓN 4: UNIVERSIDADES (B2B) VS. ESTUDIANTES INDIVIDUALES (B2C) + PRUEBA SOCIAL YODA.
 * - Desktop (`md:`+): dos tarjetas 3D lado a lado y 3 testimonios en grilla.
 * - Móvil (`< md`): selector segmentado B2B/B2C para evitar scroll largo + carrusel deslizable de reseñas.
 */
export const GuideSection: React.FC = () => {
  const [mobileModality, setMobileModality] = React.useState<"b2b" | "b2c">("b2b");

  return (
    <section
      id="instituciones"
      aria-labelledby="guide-title"
      className="lp-midnight relative isolate scroll-mt-16 overflow-hidden pt-16 pb-24 text-white sm:scroll-mt-20 sm:pt-28 sm:pb-36"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-quack-amber/40 bg-quack-amber/10 px-3.5 py-1 font-brand text-[11px] font-bold uppercase tracking-[0.16em] text-quack-amber sm:text-xs sm:tracking-[0.2em]">
            Dos modalidades · Un mismo objetivo
          </span>
          <h2
            id="guide-title"
            className="mt-4 font-brand text-[1.75rem] font-bold leading-tight text-balance sm:text-5xl"
          >
            Listo para usar en tu universidad o{" "}
            <span className="text-quack-amber">adaptado a tus propios apuntes</span>
          </h2>
        </Reveal>

        {/* Selector de modalidad solo en móvil para explorar una tarjeta a la vez */}
        <div
          role="tablist"
          aria-label="Modalidad Quack Campus vs Quack Pro"
          className="mt-7 grid grid-cols-2 gap-1.5 rounded-2xl border border-white/15 bg-[#0A0D13] p-1.5 md:hidden"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mobileModality === "b2b"}
            onClick={() => setMobileModality("b2b")}
            className={cn(
              "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl px-3 py-2 font-brand text-xs font-bold transition-all",
              mobileModality === "b2b"
                ? "bg-quack-amber text-quack-gunmetal shadow-[0_4px_14px_rgba(255,200,0,0.35)]"
                : "text-white/70 hover:text-white"
            )}
          >
            <Building2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>Universidades</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mobileModality === "b2c"}
            onClick={() => setMobileModality("b2c")}
            className={cn(
              "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl px-3 py-2 font-brand text-xs font-bold transition-all",
              mobileModality === "b2c"
                ? "bg-quack-amber text-quack-gunmetal shadow-[0_4px_14px_rgba(255,200,0,0.35)]"
                : "text-white/70 hover:text-white"
            )}
          >
            <FileUp className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>Estudiantes</span>
          </button>
        </div>

        {/* 2 Tarjetas 3D: Institucional (Ready-to-Go + Estadísticas) vs Individual (Upload) */}
        <div className="scene-3d mt-5 grid grid-cols-1 gap-8 md:mt-12 md:grid-cols-2">
          <Reveal
            delay={80}
            className={cn(mobileModality === "b2b" ? "block" : "hidden md:block")}
          >
            <article className="card-3d-amber flex h-full flex-col justify-between rounded-3xl border-2 border-quack-amber bg-gradient-to-b from-[#1E2433] to-[#141822] p-5 text-white sm:p-7">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-quack-amber px-3 py-1 font-brand text-[11px] font-bold text-quack-gunmetal sm:text-xs">
                  <Building2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /> Quack Campus · Para Universidades (B2B)
                </span>

                <h3 className="mt-4 font-brand text-xl font-bold text-white sm:text-2xl">
                  Materias <span className="text-quack-amber">Ready‑to‑Go</span> + Estadísticas de Éxito Estudiantil
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/80">
                  Integrado vía LTI (Canvas, Brightspace, Bloque Neón): el estudiante entra y{" "}
                  <strong>encuentra todas sus materias y temas listos para practicar</strong>, mientras la institución
                  mide el impacto real en tiempo real.
                </p>

                {/* Mini-widget 3D flotante de Estadísticas de Éxito Estudiantil */}
                <div
                  style={{ transform: "translateZ(20px)" }}
                  className="mt-5 rounded-2xl border border-quack-amber/35 bg-[#0E1118]/90 p-3.5 shadow-[0_12px_28px_rgba(0,0,0,0.5)] sm:p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-quack-amber">
                    <span className="inline-flex items-center gap-1.5">
                      <BarChart3 className="h-4 w-4 shrink-0" aria-hidden="true" />
                      Analítica Estratégica de Cohorte
                    </span>
                    <span className="font-mono text-[11px] text-emerald-400">+25% Aprobación</span>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-2">
                      <p className="font-brand text-base font-bold text-white sm:text-lg">92%</p>
                      <p className="text-[10px] text-white/65">Retención STEM</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-2">
                      <p className="font-brand text-base font-bold text-quack-amber sm:text-lg">48h</p>
                      <p className="text-[10px] text-white/65">Alerta pre‑parcial</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-2">
                      <p className="font-brand text-base font-bold text-emerald-400 sm:text-lg">&gt;50x</p>
                      <p className="text-[10px] text-white/65">ROI Institucional</p>
                    </div>
                  </div>
                </div>

                <ul className="mt-5 space-y-2.5 text-sm text-white/90">
                  {[
                    "Estadísticas de éxito estudiantil: evolución de aprobación y detección de cuellos de botella por materia.",
                    "Cursos Ready-to-Go en Programación, Algoritmia, Química, Biología, Física y Cálculo.",
                  ].map((point) => (
                    <li key={point} className="flex items-start gap-2.5">
                      <CheckCircle2
                        className="mt-0.5 h-4 w-4 shrink-0 text-quack-amber"
                        aria-hidden="true"
                      />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 border-t border-white/15 pt-4 text-xs font-semibold text-quack-dandelion">
                Paquetes institucionales desde $12,000 USD / año para 1,000 estudiantes (hasta 40% de ahorro en campus)
              </div>
            </article>
          </Reveal>

          <Reveal
            delay={160}
            className={cn(mobileModality === "b2c" ? "block" : "hidden md:block")}
          >
            <article className="card-3d-dark flex h-full flex-col justify-between rounded-3xl border-2 border-white/20 bg-[#181C26] p-5 text-white sm:p-7">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-quack-amber/50 bg-quack-amber/15 px-3 py-1 font-brand text-[11px] font-bold text-quack-amber sm:text-xs">
                  <FileUp className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /> Quack Pro · Estudiantes Individuales (B2C)
                </span>

                <h3 className="mt-4 font-brand text-xl font-bold text-white sm:text-2xl">
                  Sube tu propio material y Quack se adapta a ti
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/80">
                  Si estudias por tu cuenta, no dependes de un catálogo fijo: subes los archivos de tu clase y Quack
                  arma tu sesión de entrenamiento al instante.
                </p>

                {/* Mini-widget 3D flotante de Archivos del Estudiante */}
                <div
                  style={{ transform: "translateZ(20px)" }}
                  className="mt-5 rounded-2xl border border-white/15 bg-[#0E1118]/90 p-3.5 shadow-[0_12px_28px_rgba(0,0,0,0.5)] sm:p-4"
                >
                  <p className="text-xs font-bold text-white/80">Tu material cargado en 1 clic:</p>
                  <div className="mt-2.5 flex flex-wrap gap-2 font-mono text-[11px]">
                    <span className="rounded-lg border border-quack-amber/40 bg-quack-amber/15 px-2.5 py-1 text-quack-amber">
                      arboles_avl.py
                    </span>
                    <span className="rounded-lg border border-emerald-400/40 bg-emerald-500/15 px-2.5 py-1 text-emerald-300">
                      termodinamica_lab.pdf
                    </span>
                    <span className="rounded-lg border border-sky-400/40 bg-sky-500/15 px-2.5 py-1 text-sky-300">
                      parcial_fisica.pdf
                    </span>
                  </div>
                </div>

                <ul className="mt-5 space-y-2.5 text-sm text-white/90">
                  {[
                    "Sube diapositivas, apuntes en PDF, guías de laboratorio o código fuente.",
                    "Quack extrae los subconceptos clave para interrogarte por voz con el Método Feynman.",
                    "Simulacros de Parcial a Ciegas OCR ilimitados adaptados a tus propios talleres.",
                  ].map((point) => (
                    <li key={point} className="flex items-start gap-2.5">
                      <CheckCircle2
                        className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400"
                        aria-hidden="true"
                      />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 border-t border-white/15 pt-4 text-xs font-semibold text-quack-sandy">
                Desde $0 USD gratis o $4.99 USD / mes en Quack Pro
              </div>
            </article>
          </Reveal>
        </div>

        {/* Evidencia YODA: 3 Testimonios (carrusel deslizable en móvil, 3 columnas en desktop) */}
        <div className="mt-14 sm:mt-20">
          <Reveal className="text-center">
            <p className="font-brand text-[11px] font-bold uppercase tracking-[0.18em] text-quack-amber sm:text-xs sm:tracking-[0.22em]">
              Validación en campo (N = 20 estudiantes · 90% de aceptación)
            </p>
            <h3 className="mt-2 font-brand text-2xl font-bold text-white sm:text-3xl">
              Lo que dicen quienes ya estudiaron con Quack
            </h3>
          </Reveal>

          <div className="mt-6 flex items-center justify-between text-[11px] font-semibold text-white/60 md:hidden">
            <span>Entrevistas YODA reales</span>
            <span className="inline-flex items-center gap-1 text-quack-amber">
              Desliza las 3 reseñas
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
          </div>

          <div className="scene-3d -mx-4 mt-3 flex snap-x snap-mandatory gap-3.5 overflow-x-auto px-4 pb-3 no-scrollbar md:mx-0 md:mt-8 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0 md:pb-0">
            {testimonials.map((t, i) => (
              <Reveal
                key={t.id}
                delay={i * 100}
                className="w-[82vw] max-w-[320px] shrink-0 snap-center md:w-auto md:max-w-none md:shrink max-md:opacity-100 max-md:transform-none"
              >
                <figure
                  onClick={() => trackEvent("testimonial_view", { id: t.id })}
                  className="card-3d-dark flex h-full flex-col justify-between rounded-3xl border border-white/15 bg-[#181C26] p-5 sm:p-6"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <Quote className="h-5 w-5 text-quack-amber" aria-hidden="true" />
                      <span className="rounded-full bg-quack-amber/15 px-2.5 py-0.5 font-mono text-[11px] font-bold text-quack-amber">
                        ★ {t.score}
                      </span>
                    </div>
                    <blockquote className="mt-3.5 text-sm leading-relaxed text-white/85">
                      “{t.quote}”
                    </blockquote>
                  </div>
                  <figcaption className="mt-5 border-t border-white/10 pt-3">
                    <p className="font-brand text-xs font-bold text-quack-amber">{t.subject}</p>
                    <p className="text-[11px] text-white/60">{t.author}</p>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* Transición curva hacia la sección clara de Precios */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 leading-none text-[#fffcf2]"
      >
        <svg
          viewBox="0 0 1440 72"
          preserveAspectRatio="none"
          className="block h-10 w-full sm:h-14"
        >
          <path
            d="M0,48 C480,0 960,72 1440,16 L1440,72 L0,72 Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </section>
  );
};
