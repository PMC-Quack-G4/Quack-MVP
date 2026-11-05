import * as React from "react";
import { CheckCircle2, Download, FileText, Mail, Sparkles } from "lucide-react";
import { Reveal } from "./Reveal";
import { CtaButton } from "./CtaButton";
import { landingConfig } from "@/mocks/landingContent";
import { EMAIL_PATTERN, leadService } from "@/services/leadService";
import { trackEvent } from "@/lib/analytics";
import { usePointerTilt } from "@/hooks/usePointerTilt";

/**
 * GENERADOR DE PROSPECTOS (Lead Magnet — StoryBrand):
 * Ofrece un recurso gratuito y tangible a cambio del correo para quienes aún
 * no están en semana de parciales pero quieren prepararse mejor.
 */
export const LeadGeneratorSection: React.FC = () => {
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const previewTiltRef = usePointerTilt<HTMLDivElement>(8);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const clean = email.trim();
    if (!EMAIL_PATTERN.test(clean)) {
      setError("Ingresa un correo válido (ej. tu.nombre@uniandes.edu.co).");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const result = await leadService.capture({
        email: clean,
        source: "lead_magnet_checklist",
        variant: "storybrand_v1",
      });
      trackEvent("lead_capture", { mode: result.mode });
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="guia-gratis"
      aria-labelledby="lead-title"
      className="relative overflow-hidden bg-quack-gunmetal py-24 text-white sm:py-32"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-quack-amber/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-quack-caramel/25 blur-3xl"
      />

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full bg-quack-amber/20 px-3.5 py-1.5 font-brand text-xs font-bold uppercase tracking-wider text-quack-amber">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Recurso gratuito para tus parciales
            </span>
            <h2
              id="lead-title"
              className="mt-5 font-brand text-3xl font-bold leading-tight text-balance sm:text-5xl"
            >
              Descarga gratis el{" "}
              <span className="text-quack-amber">Checklist anti‑ilusión de competencia</span>
            </h2>
            <p className="mt-4 max-w-xl text-lg text-white/80">
              Una guía rápida de 1 página con los 5 autochequeos que debes hacer 48 horas antes de cualquier parcial de
              Cálculo, Física o Álgebra para saber si de verdad dominas el tema.
            </p>

            <ul className="mt-6 space-y-2.5 text-sm text-white/85">
              {[
                "La prueba de los 90 segundos sin mirar apuntes.",
                "Cómo distinguir un error de signo de un vacío conceptual.",
                "Plantilla imprimible de simulacro a libro cerrado.",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-quack-amber" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            {!submitted ? (
              <form onSubmit={handleSubmit} noValidate className="mt-8 max-w-xl">
                <label htmlFor="lead-email" className="block text-xs font-bold uppercase tracking-wider text-white/75">
                  Tu correo universitario o personal
                </label>
                <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                  <div className="relative flex-1">
                    <Mail
                      className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-quack-gunmetal/50"
                      aria-hidden="true"
                    />
                    <input
                      id="lead-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError(null);
                      }}
                      placeholder="camilo@uniandes.edu.co"
                      className="h-14 w-full rounded-2xl border-2 border-white bg-white pl-12 pr-4 text-base font-medium text-quack-gunmetal placeholder:text-quack-gunmetal/45 focus:border-quack-amber focus:outline-none"
                      aria-invalid={Boolean(error)}
                      aria-describedby={error ? "lead-email-error" : undefined}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-toy btn-toy-light h-14 bg-quack-amber px-7 text-base text-quack-gunmetal hover:bg-quack-dandelion disabled:opacity-60"
                  >
                    <Download className="h-5 w-5" aria-hidden="true" />
                    {submitting ? "Enviando…" : "Recibir el checklist gratis"}
                  </button>
                </div>
                {error && (
                  <p id="lead-email-error" role="alert" className="mt-2 text-sm font-medium text-quack-sandy">
                    {error}
                  </p>
                )}
                <p className="mt-3 text-xs text-white/60">
                  Cero spam. Solo recursos de estudio activo y acceso anticipado a nuevas materias del piloto.
                </p>
              </form>
            ) : (
              <div
                role="status"
                className="mt-8 rounded-3xl border-2 border-quack-amber bg-white/10 p-6 backdrop-blur-sm"
              >
                <div className="flex items-center gap-3 text-quack-amber">
                  <CheckCircle2 className="h-6 w-6 shrink-0" aria-hidden="true" />
                  <p className="font-brand text-xl font-bold">¡Listo! Tu checklist está desbloqueado</p>
                </div>
                <p className="mt-2 text-sm text-white/85">
                  Ábrelo ahora para imprimirlo o guardarlo en PDF, o pasa directo a practicar un tema en Quack.
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <a
                    href={landingConfig.leadMagnetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackEvent("lead_magnet_download", { source: "form_success" })}
                    className="btn-toy btn-toy-light h-12 bg-quack-amber px-6 text-sm text-quack-gunmetal"
                  >
                    <Download className="h-4 w-4" aria-hidden="true" />
                    Abrir y descargar checklist
                  </a>
                  <CtaButton to="/feynman" location="lead_success" tone="light" size="md">
                    Probar Quack ahora
                  </CtaButton>
                </div>
              </div>
            )}
          </Reveal>

          {/* Tarjeta 3D con vista previa del recurso */}
          <Reveal delay={180}>
            <div ref={previewTiltRef} className="scene-3d mx-auto max-w-md">
              <div className="tilt-stage relative rounded-[28px] border-2 border-quack-amber bg-[#fffcf2] p-7 text-quack-gunmetal shadow-[14px_18px_0_0_#FFC800]">
                <div className="flex items-center justify-between border-b-2 border-dashed border-quack-gunmetal/20 pb-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-quack-dandelion px-3 py-1 font-brand text-xs font-bold">
                    <FileText className="h-3.5 w-3.5" aria-hidden="true" /> Guía imprimible · 1 pág.
                  </span>
                  <img src="/brand/quack-logo.png" alt="" className="h-9 w-9 object-contain" />
                </div>

                <h3 className="mt-5 font-brand text-xl font-bold leading-snug">
                  {landingConfig.leadMagnetTitle}
                </h3>
                <p className="mt-1 text-xs font-medium text-quack-gunmetal/65">
                  Marca cada casilla 48 horas antes de tu examen:
                </p>

                <ul className="mt-4 space-y-2.5 text-sm">
                  {[
                    "¿Puedo explicar el teorema en voz alta sin usar jerga?",
                    "¿Sé cuándo NO aplica la fórmula?",
                    "¿Resolví al menos 1 problema completo a mano con tiempo?",
                    "¿Identifiqué el paso exacto donde suelo perder signos?",
                    "¿Puedo deducir las unidades del resultado final?",
                  ].map((check, i) => (
                    <li
                      key={check}
                      className="flex items-start gap-2.5 rounded-xl border border-quack-gunmetal/10 bg-white p-2.5"
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 border-quack-gunmetal bg-quack-amber font-brand text-xs font-bold">
                        {i + 1}
                      </span>
                      <span className="font-medium leading-snug text-quack-gunmetal/90">{check}</span>
                    </li>
                  ))}
                </ul>

                <p className="mt-4 text-center font-hand text-xl text-quack-caramel">
                  “Si dudas en una, practícala con Quack”
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};
