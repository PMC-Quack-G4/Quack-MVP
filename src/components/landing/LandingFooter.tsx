import * as React from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  Cpu,
  Database,
  Download,
  Mail,
  Plus,
} from "lucide-react";
import { Reveal } from "./Reveal";
import { faqItems, landingConfig } from "@/mocks/landingContent";
import { EMAIL_PATTERN, leadService } from "@/services/leadService";
import { isGeminiActive, getActiveModel } from "@/services/serviceFactory";
import { trackEvent } from "@/lib/analytics";
import { playQuackSound } from "@/lib/quackSound";

/**
 * SECCIÓN 6: PREGUNTAS FRECUENTES + LEAD MAGNET 3D + JUNK DRAWER (Footer — StoryBrand).
 * Fondo oscuro profundo que cierra la página con elegancia y contraste, sin paneles técnicos de verificación.
 */
export const LandingFooter: React.FC = () => {
  const isOnline = isGeminiActive();
  const activeModel = getActiveModel();

  const [email, setEmail] = React.useState("");
  const [leadError, setLeadError] = React.useState<string | null>(null);
  const [leadDone, setLeadDone] = React.useState(false);
  const leadStartedRef = React.useRef(false);

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = email.trim();
    if (!EMAIL_PATTERN.test(clean)) {
      setLeadError("Ingresa un correo válido (ej. camilo@uniandes.edu.co).");
      return;
    }
    setLeadError(null);
    const result = await leadService.capture({
      email: clean,
      source: "footer_lead_magnet",
      variant: "B",
    });
    trackEvent("generate_lead", { source: "checklist_download", mode: result.mode });
    setLeadDone(true);
  };

  return (
    <>
      <section
        id="preguntas"
        aria-labelledby="faq-title"
        className="lp-paper-dark relative scroll-mt-16 overflow-hidden py-16 text-white sm:scroll-mt-20 sm:py-28"
      >
        <div className="mx-auto max-w-4xl px-4 sm:px-8">
          <Reveal className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-quack-amber/40 bg-quack-amber/10 px-3.5 py-1 font-brand text-[11px] font-bold uppercase tracking-[0.18em] text-quack-amber sm:text-xs sm:tracking-[0.2em]">
              Preguntas frecuentes
            </span>
            <h2
              id="faq-title"
              className="mt-4 font-brand text-2xl font-bold text-white sm:text-4xl"
            >
              Respuestas claras antes de empezar
            </h2>
          </Reveal>

          <div className="mt-8 space-y-3 sm:mt-10 sm:space-y-3.5">
            {faqItems.map((item, i) => (
              <Reveal key={item.id} delay={i * 60}>
                <details className="faq-item group rounded-2xl border border-white/15 bg-[#1B202C] px-4 py-3.5 transition-all open:border-quack-amber open:shadow-[0_10px_30px_-10px_rgba(255,200,0,0.2)] sm:px-6 sm:py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-brand text-sm font-bold text-white sm:text-base">
                    <span>{item.question}</span>
                    <span className="faq-icon flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-quack-amber text-quack-gunmetal transition-transform duration-200">
                      <Plus className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </summary>
                  <p className="mt-3 border-t border-white/10 pt-3 text-sm leading-relaxed text-white/80">
                    {item.answer}
                  </p>
                </details>
              </Reveal>
            ))}
          </div>

          {/* Lead Magnet en Tarjeta 3D */}
          <Reveal delay={140} className="scene-3d mt-12 sm:mt-16">
            <div
              id="guia-gratis"
              className="card-3d-amber rounded-3xl border-2 border-quack-amber bg-gradient-to-br from-[#232938] to-[#151922] p-5 text-white sm:p-9"
            >
              <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-[1.15fr_0.85fr]">
                <div>
                  <span className="inline-block rounded-full bg-quack-amber px-3 py-0.5 font-brand text-[11px] font-bold text-quack-gunmetal">
                    Recurso gratuito
                  </span>
                  <h3 className="mt-3 font-brand text-2xl font-bold text-white">
                    Checklist Anti‑Ilusión de Competencia
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/80">
                    Recibe gratis la guía imprimible de 1 página con los 5 autochequeos para verificar tu dominio 48
                    horas antes de cualquier parcial.
                  </p>
                </div>

                <div>
                  {!leadDone ? (
                    <form onSubmit={handleLeadSubmit} noValidate className="space-y-2.5">
                      <label htmlFor="footer-lead-email" className="sr-only">
                        Tu correo universitario
                      </label>
                      <input
                        id="footer-lead-email"
                        type="email"
                        required
                        value={email}
                        onFocus={() => {
                          if (!leadStartedRef.current) {
                            leadStartedRef.current = true;
                            trackEvent("form_start", { form_type: "lead_magnet_checklist" });
                          }
                        }}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (leadError) setLeadError(null);
                        }}
                        placeholder="tu.correo@uniandes.edu.co"
                        className="h-11 w-full rounded-xl border-2 border-white bg-white px-3.5 text-sm font-medium text-quack-gunmetal placeholder:text-quack-gunmetal/45 focus:border-quack-amber focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="btn-toy btn-toy-light h-11 w-full cursor-pointer bg-quack-amber text-xs text-quack-gunmetal sm:text-sm"
                      >
                        <Download className="h-4 w-4" aria-hidden="true" />
                        Descargar checklist gratis
                      </button>
                      {leadError && (
                        <p role="alert" className="text-xs font-semibold text-quack-sandy">
                          {leadError}
                        </p>
                      )}
                    </form>
                  ) : (
                    <div className="rounded-2xl border border-quack-amber bg-white/10 p-4">
                      <p className="flex items-center gap-2 font-brand text-sm font-bold text-quack-amber">
                        <CheckCircle2 className="h-4 w-4" /> ¡Checklist listo!
                      </p>
                      <a
                        href={landingConfig.leadMagnetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackEvent("lead_magnet_download", { source: "footer" })}
                        className="btn-toy btn-toy-light mt-3 h-10 w-full bg-quack-amber text-xs text-quack-gunmetal"
                      >
                        <Download className="h-4 w-4" /> Abrir Checklist Imprimible
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Junk Drawer (Pie de página StoryBrand en fondo oscuro) */}
      <footer className="border-t border-white/10 bg-[#0D1017] text-white">
        <div className="mx-auto max-w-6xl px-4 pt-12 pb-24 sm:px-8 sm:py-12">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2.5">
              <Link
                to="/"
                onClick={() => playQuackSound("footer_logo_easter_egg")}
                className="inline-flex items-center gap-2.5"
              >
                <img
                  src="/brand/quack-logo.png"
                  alt=""
                  className="h-9 w-9 object-contain"
                />
                <span className="font-brand text-xl font-bold text-white">quack</span>
              </Link>
              <p className="text-xs leading-relaxed text-white/65">
                La primera IA a la que tú le enseñas. Estudio activo para Programación, Ciencias e Ingeniería.
              </p>
              <div className="pt-1">
                {isOnline ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">
                    <Cpu className="h-3 w-3" aria-hidden="true" /> Motor IA activo ({activeModel})
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[11px] font-semibold text-white/75">
                    <Database className="h-3 w-3" aria-hidden="true" /> Modo Demo Local
                  </span>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-brand text-xs font-bold uppercase tracking-wider text-quack-amber">
                Producto y Planes
              </h4>
              <ul className="mt-3 space-y-2 text-xs text-white/75">
                <li>
                  <Link to="/feynman" className="hover:text-quack-amber hover:underline">
                    Feynman Oral (Voz e IA Invertida)
                  </Link>
                </li>
                <li>
                  <Link to="/parcial-ciegas" className="hover:text-quack-amber hover:underline">
                    Parcial a Ciegas (Auditoría OCR)
                  </Link>
                </li>
                <li>
                  <a href="#precios" className="hover:text-quack-amber hover:underline">
                    Planes B2C y B2B (USD)
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-brand text-xs font-bold uppercase tracking-wider text-quack-amber">
                Universidades y Disciplinas
              </h4>
              <ul className="mt-3 space-y-2 text-xs text-white/75">
                <li>
                  <a href="#instituciones" className="hover:text-quack-amber hover:underline">
                    Cursos Ready‑to‑Go vía LTI
                  </a>
                </li>
                <li>
                  <a href="#instituciones" className="hover:text-quack-amber hover:underline">
                    Estadísticas de Éxito Estudiantil
                  </a>
                </li>
                <li className="text-white/55">
                  Programación, Algoritmia, Química, Biología, Física y Matemáticas.
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-brand text-xs font-bold uppercase tracking-wider text-quack-amber">
                Contacto
              </h4>
              <ul className="mt-3 space-y-2 text-xs text-white/75">
                <li>
                  <a
                    href={`mailto:${landingConfig.contactEmail}`}
                    className="inline-flex items-center gap-1.5 hover:text-quack-amber hover:underline"
                  >
                    <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                    {landingConfig.contactEmail}
                  </a>
                </li>
                <li className="text-white/55">
                  ISIS‑2007 · Diseño de Productos e Innovación en TI · Universidad de los Andes.
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t border-white/10 pt-5 text-center text-xs text-white/50 sm:text-left">
            <p>© {new Date().getFullYear()} Quack · Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </>
  );
};
