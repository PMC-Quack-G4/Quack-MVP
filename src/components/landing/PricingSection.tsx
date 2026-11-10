import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Check,
  CreditCard,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  Users,
  X,
} from "lucide-react";
import { Reveal } from "./Reveal";
import { EMAIL_PATTERN, leadService } from "@/services/leadService";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

type AudienceTab = "b2c" | "b2b";
type BillingCycle = "monthly" | "annual";

interface B2BMassPackage {
  id: string;
  studentsLabel: string;
  blocksLabel: string;
  discountBadge: string;
  featured?: boolean;
  totalStandardUsd: string;
  totalAnnualUsd: string;
  totalSavedUsd: string;
  per1kRateUsd: string;
  per1kSavedUsd: string;
  fitDescription: string;
  ctaLabel: string;
}

/**
 * Paquetes B2B escalonados por masas de 1,000 estudiantes.
 * Tarifa estándar de referencia: $15,000 USD / año por cada 1,000 estudiantes ($15 USD/estudiante).
 * - 1,000 est.  (1 bloque):  $12,000 USD/año (vs $15k  -> ahorra $3,000/1k  | $3,000 total)
 * - 3,000 est.  (3 bloques): $33,000 USD/año (vs $45k  -> ahorra $4,000/1k  | $12,000 total)
 * - 5,000 est.  (5 bloques): $50,000 USD/año (vs $75k  -> ahorra $5,000/1k  | $25,000 total)
 * - 10,000 est. (10 bloques): $90,000 USD/año (vs $150k -> ahorra $6,000/1k | $60,000 total)
 */
const b2bMassPackages: readonly B2BMassPackage[] = [
  {
    id: "campus_1k",
    studentsLabel: "1,000 estudiantes",
    blocksLabel: "1 bloque de 1k estudiantes",
    discountBadge: "Piloto · 20% DTO",
    totalStandardUsd: "$15,000 USD",
    totalAnnualUsd: "$12,000 USD",
    totalSavedUsd: "$3,000 USD / año",
    per1kRateUsd: "$12,000 USD",
    per1kSavedUsd: "$3,000 USD por cada 1k",
    fitDescription: "Ideal para piloto en 1 departamento o facultad.",
    ctaLabel: "Cotizar 1,000 est.",
  },
  {
    id: "campus_3k",
    studentsLabel: "3,000 estudiantes",
    blocksLabel: "3 bloques de 1k estudiantes",
    discountBadge: "Escala · 27% DTO",
    totalStandardUsd: "$45,000 USD",
    totalAnnualUsd: "$33,000 USD",
    totalSavedUsd: "$12,000 USD / año",
    per1kRateUsd: "$11,000 USD",
    per1kSavedUsd: "$4,000 USD por cada 1k",
    fitDescription: "Cobertura para 2 o 3 facultades de Ingeniería y Ciencias.",
    ctaLabel: "Cotizar 3,000 est.",
  },
  {
    id: "campus_5k",
    studentsLabel: "5,000 estudiantes",
    blocksLabel: "5 bloques de 1k estudiantes",
    discountBadge: "Más elegido · 33% DTO",
    featured: true,
    totalStandardUsd: "$75,000 USD",
    totalAnnualUsd: "$50,000 USD",
    totalSavedUsd: "$25,000 USD / año",
    per1kRateUsd: "$10,000 USD",
    per1kSavedUsd: "$5,000 USD por cada 1k",
    fitDescription: "Campus completo en carreras STEM, Química y Biología.",
    ctaLabel: "Cotizar 5,000 est.",
  },
  {
    id: "campus_10k",
    studentsLabel: "10,000 estudiantes",
    blocksLabel: "10 bloques de 1k estudiantes",
    discountBadge: "Universidad · 40% DTO",
    totalStandardUsd: "$150,000 USD",
    totalAnnualUsd: "$90,000 USD",
    totalSavedUsd: "$60,000 USD / año",
    per1kRateUsd: "$9,000 USD",
    per1kSavedUsd: "$6,000 USD por cada 1k",
    fitDescription: "Licencia global multianual para toda la universidad.",
    ctaLabel: "Cotizar 10,000 est.",
  },
] as const;

/**
 * SECCIÓN 5: PLANES Y PRECIOS EN USD (#precios).
 * - Pestaña 1 (B2C): Para Estudiantes Individuales (Free y suscripción Pro).
 * - Pestaña 2 (B2B): Para Universidades mostrando el PRECIO TOTAL ANUAL por cohorte
 *   y el AHORRO EXPLÍCITO por cada bloque de 1k estudiantes sobre la tarifa estándar ($15k/1k).
 */
export const PricingSection: React.FC = () => {
  const navigate = useNavigate();
  const [audienceTab, setAudienceTab] = React.useState<AudienceTab>("b2c");
  const [billing, setBilling] = React.useState<BillingCycle>("monthly");

  const [selectedModalPlan, setSelectedModalPlan] = React.useState<{
    id: string;
    title: string;
    priceLabel: string;
    isCampus?: boolean;
  } | null>(null);

  const openCheckout = (plan: {
    id: string;
    title: string;
    priceLabel: string;
    isCampus?: boolean;
  }) => {
    trackEvent("click_cta", {
      location: `pricing_${plan.id}`,
      plan: plan.id,
      audience: audienceTab,
    });
    trackEvent("begin_checkout", {
      plan: plan.id,
      price: plan.priceLabel,
    });
    setSelectedModalPlan(plan);
  };

  return (
    <section
      id="precios"
      aria-labelledby="pricing-title"
      className="lp-paper relative isolate overflow-hidden pt-20 pb-28 sm:pt-28 sm:pb-36"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border-2 border-quack-gunmetal bg-quack-dandelion px-3.5 py-1 font-brand text-xs font-bold uppercase tracking-[0.2em] text-quack-gunmetal shadow-[3px_3px_0_0_#3B4151]">
            Planes y precios
          </span>
          <h2
            id="pricing-title"
            className="mt-4 font-brand text-3xl font-bold leading-tight text-quack-gunmetal text-balance sm:text-5xl"
          >
            Elige tu modalidad:{" "}
            <span className="marker-highlight">Estudiante o Universidad</span>
          </h2>

          {/* Pestañas Principales 3D: B2C (Estudiantes) vs B2B (Universidades) */}
          <div
            role="tablist"
            aria-label="Modalidad de precios"
            className="mt-8 inline-flex flex-wrap justify-center gap-2 rounded-2xl border-2 border-quack-gunmetal bg-[#151922] p-1.5 shadow-[6px_6px_0_0_#FFC800]"
          >
            <button
              type="button"
              role="tab"
              aria-selected={audienceTab === "b2c"}
              onClick={() => {
                setAudienceTab("b2c");
                trackEvent("pricing_tab_switch", { tab: "b2c" });
              }}
              className={cn(
                "inline-flex cursor-pointer items-center gap-2 rounded-xl px-5 py-2.5 font-brand text-xs font-bold transition-all sm:text-sm",
                audienceTab === "b2c"
                  ? "bg-quack-amber text-quack-gunmetal shadow-[0_4px_14px_rgba(255,200,0,0.45)]"
                  : "text-white/75 hover:text-white"
              )}
            >
              <GraduationCap className="h-4 w-4" aria-hidden="true" />
              Para Estudiantes
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={audienceTab === "b2b"}
              onClick={() => {
                setAudienceTab("b2b");
                trackEvent("pricing_tab_switch", { tab: "b2b" });
              }}
              className={cn(
                "inline-flex cursor-pointer items-center gap-2 rounded-xl px-5 py-2.5 font-brand text-xs font-bold transition-all sm:text-sm",
                audienceTab === "b2b"
                  ? "bg-quack-amber text-quack-gunmetal shadow-[0_4px_14px_rgba(255,200,0,0.45)]"
                  : "text-white/75 hover:text-white"
              )}
            >
              <Building2 className="h-4 w-4" aria-hidden="true" />
              Para Universidades
            </button>
          </div>
        </Reveal>

        {/* =====================================================================
            PESTAÑA 1: B2C — ESTUDIANTES INDIVIDUALES (Precios en USD)
           ===================================================================== */}
        {audienceTab === "b2c" ? (
          <div key="b2c-panel" className="animate-pop mt-10">
            {/* Selector Mensual / Anual */}
            <div className="flex justify-center">
              <div className="inline-flex rounded-2xl border-2 border-quack-gunmetal bg-white p-1 shadow-[3px_3px_0_0_#3B4151]">
                <button
                  type="button"
                  onClick={() => setBilling("monthly")}
                  className={cn(
                    "cursor-pointer rounded-xl px-4 py-1.5 font-brand text-xs font-bold transition-colors sm:text-sm",
                    billing === "monthly"
                      ? "bg-quack-gunmetal text-white"
                      : "text-quack-gunmetal/70 hover:text-quack-gunmetal"
                  )}
                >
                  Mensual
                </button>
                <button
                  type="button"
                  onClick={() => setBilling("annual")}
                  className={cn(
                    "cursor-pointer rounded-xl px-4 py-1.5 font-brand text-xs font-bold transition-colors sm:text-sm",
                    billing === "annual"
                      ? "bg-quack-amber text-quack-gunmetal"
                      : "text-quack-gunmetal/70 hover:text-quack-gunmetal"
                  )}
                >
                  Anual (Ahorra 37%)
                </button>
              </div>
            </div>

            <div className="scene-3d mx-auto mt-10 grid max-w-4xl gap-6 md:grid-cols-2">
              {/* 1. Quack Free */}
              <article className="card-3d-light flex h-full flex-col justify-between rounded-3xl border-2 border-quack-gunmetal bg-white p-7">
                <div>
                  <p className="font-brand text-xs font-bold uppercase tracking-wider text-quack-caramel">
                    Para empezar hoy
                  </p>
                  <h3 className="mt-1 font-brand text-2xl font-bold text-quack-gunmetal">
                    Quack Free
                  </h3>
                  <p className="mt-4 font-brand text-4xl font-bold tracking-tight text-quack-gunmetal tabular-nums">
                    $0 USD
                  </p>
                  <p className="mt-1 text-xs font-medium text-quack-gunmetal/65">
                    Gratis siempre · Sin tarjeta de crédito
                  </p>

                  <ul className="mt-6 space-y-2.5 border-t border-quack-gunmetal/10 pt-5 text-sm text-quack-gunmetal/85">
                    {[
                      "3 sesiones orales Feynman por semana",
                      "1 simulacro de Parcial a Ciegas OCR por semana",
                      "Sube hasta 2 documentos propios / semana (PDF o código)",
                      "Acceso a materias demo (Algoritmos, Química, Biología, Física)",
                    ].map((feat) => (
                      <li key={feat} className="flex items-start gap-2.5">
                        <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
                          <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
                        </span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8">
                  <button
                    type="button"
                    onClick={() => {
                      trackEvent("click_cta", { location: "pricing_free", plan: "free" });
                      navigate("/feynman");
                    }}
                    className="btn-toy h-12 w-full cursor-pointer bg-quack-gunmetal text-sm text-white hover:bg-[#454c5f]"
                  >
                    Probar gratis ahora
                  </button>
                </div>
              </article>

              {/* 2. Quack Pro (Destacado en 3D Oscuro + Dorado) */}
              <article className="card-3d-amber relative flex h-full flex-col justify-between rounded-3xl border-2 border-quack-gunmetal bg-[#151922] p-7 text-white">
                <span className="absolute -top-3.5 right-6 inline-flex items-center gap-1 rounded-full border-2 border-quack-gunmetal bg-quack-amber px-3 py-0.5 font-brand text-[11px] font-bold text-quack-gunmetal">
                  <Sparkles className="h-3 w-3" aria-hidden="true" /> Más elegido
                </span>

                <div>
                  <p className="font-brand text-xs font-bold uppercase tracking-wider text-quack-amber">
                    Suscripción individual ilimitada
                  </p>
                  <h3 className="mt-1 font-brand text-2xl font-bold text-white">Quack Pro</h3>
                  <p className="mt-4 font-brand text-4xl font-bold tracking-tight text-quack-amber tabular-nums">
                    {billing === "annual" ? "$37.50 USD" : "$4.99 USD"}
                  </p>
                  <p className="mt-1 text-xs font-medium text-white/75">
                    {billing === "annual"
                      ? "por año (equivale a $3.12 USD / mes · ahorras 37%)"
                      : "por mes (o $37.50 USD / año)"}
                  </p>

                  <ul className="mt-6 space-y-2.5 border-t border-white/15 pt-5 text-sm text-white/90">
                    {[
                      "Carga ilimitada de tu propio material (diapositivas, PDFs, código)",
                      "Sesiones orales Feynman ilimitadas con voz e IA socrática",
                      "Parciales a Ciegas OCR ilimitados con crédito parcial paso a paso",
                      "Acceso prioritario a Fase 0: Repetición Espaciada (Próximamente)",
                    ].map((feat) => (
                      <li key={feat} className="flex items-start gap-2.5">
                        <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-quack-amber text-quack-gunmetal">
                          <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
                        </span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8">
                  <button
                    type="button"
                    onClick={() =>
                      openCheckout({
                        id: "pro",
                        title: "Quack Pro Individual",
                        priceLabel:
                          billing === "annual"
                            ? "$37.50 USD / año ($3.12 USD/mes)"
                            : "$4.99 USD / mes",
                      })
                    }
                    className="btn-toy btn-toy-light h-12 w-full cursor-pointer bg-quack-amber text-sm text-quack-gunmetal hover:bg-[#ffd21f]"
                  >
                    Activar Quack Pro
                  </button>
                </div>
              </article>
            </div>
          </div>
        ) : (
          /* =====================================================================
              PESTAÑA 2: B2B — UNIVERSIDADES (Precio Total + Ahorro por cada 1k)
             ===================================================================== */
          <div key="b2b-panel" className="animate-pop mt-10">
            {/* Aclaración cristalina arriba de las 4 tarjetas */}
            <div className="mx-auto max-w-3xl text-center">
              <p className="inline-flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-quack-gunmetal/20 bg-white px-4 py-2 text-xs font-medium text-quack-gunmetal shadow-2xs sm:text-sm">
                <Users className="h-4 w-4 text-quack-caramel" aria-hidden="true" />
                <span>
                  Tarifa estándar: <strong className="line-through text-quack-gunmetal/55">$15,000 USD</strong>{" "}
                  por cada 1,000 estudiantes/año. Entre mayor sea tu masa estudiantil,{" "}
                  <strong className="text-quack-caramel">más ahorras por cada 1k:</strong>
                </span>
              </p>
            </div>

            {/* 4 Paquetes en orden ascendente por Precio Total Anual */}
            <div className="scene-3d mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {b2bMassPackages.map((pkg) => {
                const isFeatured = Boolean(pkg.featured);
                return (
                  <article
                    key={pkg.id}
                    className={cn(
                      "relative flex h-full flex-col justify-between rounded-3xl border-2 p-6",
                      isFeatured
                        ? "card-3d-amber border-quack-amber bg-[#151922] text-white"
                        : "card-3d-light border-quack-gunmetal bg-white text-quack-gunmetal"
                    )}
                  >
                    {/* Badge de descuento arriba */}
                    <span
                      className={cn(
                        "inline-flex w-fit items-center gap-1 rounded-full border px-2.5 py-0.5 font-brand text-[11px] font-bold",
                        isFeatured
                          ? "border-quack-amber bg-quack-amber text-quack-gunmetal"
                          : "border-quack-gunmetal/20 bg-quack-dandelion text-quack-gunmetal"
                      )}
                    >
                      {pkg.discountBadge}
                    </span>

                    <div className="mt-4">
                      {/* Tamaño del paquete */}
                      <h3
                        className={cn(
                          "font-brand text-xl font-bold",
                          isFeatured ? "text-white" : "text-quack-gunmetal"
                        )}
                      >
                        {pkg.studentsLabel}
                      </h3>
                      <p
                        className={cn(
                          "text-xs font-medium",
                          isFeatured ? "text-white/65" : "text-quack-gunmetal/60"
                        )}
                      >
                        {pkg.blocksLabel}
                      </p>

                      {/* Precio anterior tachado + PRECIO TOTAL ANUAL prominente */}
                      <div className="mt-4">
                        <p
                          className={cn(
                            "font-mono text-xs line-through",
                            isFeatured ? "text-white/45" : "text-quack-gunmetal/45"
                          )}
                        >
                          Antes: {pkg.totalStandardUsd} / año
                        </p>
                        <p
                          className={cn(
                            "mt-0.5 font-brand text-3xl font-bold tracking-tight tabular-nums",
                            isFeatured ? "text-quack-amber" : "text-quack-gunmetal"
                          )}
                        >
                          {pkg.totalAnnualUsd}
                        </p>
                        <p
                          className={cn(
                            "text-xs font-bold uppercase tracking-wider",
                            isFeatured ? "text-white/75" : "text-quack-gunmetal/65"
                          )}
                        >
                          Total anual institucional
                        </p>
                      </div>

                      {/* Bloque explícito de ahorro total y por cada 1k */}
                      <div
                        className={cn(
                          "mt-4 rounded-2xl border p-3 text-xs",
                          isFeatured
                            ? "border-emerald-400/35 bg-emerald-500/10"
                            : "border-emerald-600/25 bg-emerald-50"
                        )}
                      >
                        <p
                          className={cn(
                            "flex items-center gap-1.5 font-brand font-bold",
                            isFeatured ? "text-emerald-300" : "text-emerald-800"
                          )}
                        >
                          <TrendingDown className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                          Ahorras {pkg.totalSavedUsd}
                        </p>
                        <div
                          className={cn(
                            "mt-1.5 space-y-0.5 border-t pt-1.5 text-[11px] leading-snug",
                            isFeatured
                              ? "border-emerald-400/20 text-white/80"
                              : "border-emerald-700/15 text-quack-gunmetal/80"
                          )}
                        >
                          <p>
                            Te queda en <strong>{pkg.per1kRateUsd}</strong> por cada 1k
                          </p>
                          <p
                            className={cn(
                              "font-semibold",
                              isFeatured ? "text-quack-amber" : "text-quack-caramel"
                            )}
                          >
                            Ahorro de {pkg.per1kSavedUsd}
                          </p>
                        </div>
                      </div>

                      <p
                        className={cn(
                          "mt-3 text-xs leading-relaxed",
                          isFeatured ? "text-white/75" : "text-quack-gunmetal/75"
                        )}
                      >
                        {pkg.fitDescription}
                      </p>
                    </div>

                    <div className="mt-6">
                      <button
                        type="button"
                        onClick={() =>
                          openCheckout({
                            id: pkg.id,
                            title: `Quack Campus · ${pkg.studentsLabel}`,
                            priceLabel: `Total: ${pkg.totalAnnualUsd} / año (${pkg.per1kRateUsd} por cada 1k · ahorras ${pkg.totalSavedUsd})`,
                            isCampus: true,
                          })
                        }
                        className={cn(
                          "btn-toy h-11 w-full cursor-pointer text-xs sm:text-sm",
                          isFeatured
                            ? "btn-toy-light bg-quack-amber text-quack-gunmetal hover:bg-[#ffd21f]"
                            : "bg-quack-gunmetal text-white hover:bg-[#454c5f]"
                        )}
                      >
                        {pkg.ctaLabel}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Una única barra oscura unificada con todo lo que incluye Quack Campus */}
            <div className="mt-8 rounded-3xl border-2 border-quack-gunmetal bg-[#151922] p-6 text-white shadow-[8px_8px_0_0_#FFC800] sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-brand text-xs font-bold uppercase tracking-wider text-quack-amber">
                    Incluido en todos los paquetes universitarios Quack Campus
                  </p>
                  <div className="mt-3 grid gap-3 text-xs text-white/90 sm:grid-cols-3 sm:text-sm">
                    <span className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-quack-amber" strokeWidth={3} />
                      <span>
                        <strong>Cursos Ready‑to‑Go vía LTI</strong> (Bloque Neón, Canvas, Brightspace)
                      </span>
                    </span>
                    <span className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-quack-amber" strokeWidth={3} />
                      <span>
                        <strong>Estadísticas de Éxito Estudiantil</strong> y alertas por cohorte
                      </span>
                    </span>
                    <span className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-quack-amber" strokeWidth={3} />
                      <span>
                        <strong>Todas las áreas STEM:</strong> Programación, Química, Biología y Cálculo
                      </span>
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    openCheckout({
                      id: "campus_custom_10k_plus",
                      title: "Licencia Institucional a Medida (+10,000 estudiantes)",
                      priceLabel: "Cotización personalizada multi‑campus (desde $9,000 USD por cada 1k)",
                      isCampus: true,
                    })
                  }
                  className="btn-toy btn-toy-light h-11 shrink-0 cursor-pointer bg-quack-amber px-5 text-xs text-quack-gunmetal sm:text-sm"
                >
                  ¿Más de 10k estudiantes? Cotizar a medida
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Transición diagonal hacia el cierre oscuro */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 leading-none text-[#151922]"
      >
        <svg
          viewBox="0 0 1440 72"
          preserveAspectRatio="none"
          className="block h-10 w-full sm:h-16"
        >
          <path d="M0,12 L1440,64 L1440,72 L0,72 Z" fill="currentColor" />
        </svg>
      </div>

      {selectedModalPlan && (
        <CheckoutModal
          plan={selectedModalPlan}
          onClose={() => setSelectedModalPlan(null)}
        />
      )}
    </section>
  );
};

interface CheckoutModalProps {
  plan: {
    id: string;
    title: string;
    priceLabel: string;
    isCampus?: boolean;
  };
  onClose: () => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ plan, onClose }) => {
  const navigate = useNavigate();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [institution, setInstitution] = React.useState("");
  const [paymentMethod, setPaymentMethod] = React.useState<"card" | "local">("card");
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [completed, setCompleted] = React.useState(false);
  const startedRef = React.useRef(false);

  const notifyFormStart = () => {
    if (!startedRef.current) {
      startedRef.current = true;
      trackEvent("form_start", { form_type: plan.id });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!EMAIL_PATTERN.test(cleanEmail)) {
      setError("Ingresa un correo válido (ej. camilo@uniandes.edu.co).");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await leadService.capture({
        email: cleanEmail,
        source: `checkout_${plan.id}_${paymentMethod}`,
        variant: name.trim() || institution.trim() || "checkout",
      });
      trackEvent("generate_lead", { plan: plan.id, method: paymentMethod });
      trackEvent("purchase", {
        plan: plan.id,
        price_label: plan.priceLabel,
        method: plan.isCampus ? "b2b_invoice" : paymentMethod,
      });
      setCompleted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs animate-fadeIn"
    >
      <div className="relative w-full max-w-md rounded-3xl border-2 border-quack-amber bg-[#151922] p-6 text-white shadow-[10px_10px_0_0_#FFC800] sm:p-7">
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar ventana"
          className="absolute right-4 top-4 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-quack-amber hover:text-quack-gunmetal"
        >
          <X className="h-4 w-4" />
        </button>

        {!completed ? (
          <form onSubmit={handleSubmit} noValidate>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-quack-amber px-3 py-0.5 font-brand text-xs font-bold text-quack-gunmetal">
              <CreditCard className="h-3.5 w-3.5" aria-hidden="true" />{" "}
              {plan.isCampus ? "Cotización B2B por Volumen" : "Activación Instantánea"}
            </span>
            <h3 id="checkout-modal-title" className="mt-3 font-brand text-2xl font-bold text-white">
              {plan.title}
            </h3>
            <p className="mt-1 text-xs font-bold text-quack-amber">{plan.priceLabel}</p>

            <div className="mt-4 space-y-3">
              <div>
                <label htmlFor="checkout-name" className="block text-xs font-bold text-white/85">
                  {plan.isCampus ? "Nombre y cargo" : "Tu nombre"}
                </label>
                <input
                  id="checkout-name"
                  type="text"
                  value={name}
                  onFocus={notifyFormStart}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={plan.isCampus ? "Dr. Alejandro Morales · Decano" : "Camilo Rodríguez"}
                  className="mt-1 h-11 w-full rounded-xl border border-white/20 bg-[#0E1118] px-3.5 text-sm font-medium text-white placeholder:text-white/40 focus:border-quack-amber focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="checkout-email" className="block text-xs font-bold text-white/85">
                  Correo institucional o personal *
                </label>
                <input
                  id="checkout-email"
                  type="email"
                  required
                  value={email}
                  onFocus={notifyFormStart}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="camilo@uniandes.edu.co"
                  className="mt-1 h-11 w-full rounded-xl border border-white/20 bg-[#0E1118] px-3.5 text-sm font-medium text-white placeholder:text-white/40 focus:border-quack-amber focus:outline-none"
                />
              </div>

              {plan.isCampus ? (
                <div>
                  <label htmlFor="checkout-inst" className="block text-xs font-bold text-white/85">
                    Universidad / Facultad
                  </label>
                  <input
                    id="checkout-inst"
                    type="text"
                    value={institution}
                    onFocus={notifyFormStart}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="Universidad de los Andes · Fac. Ingeniería"
                    className="mt-1 h-11 w-full rounded-xl border border-white/20 bg-[#0E1118] px-3.5 text-sm font-medium text-white placeholder:text-white/40 focus:border-quack-amber focus:outline-none"
                  />
                </div>
              ) : (
                <div>
                  <span className="block text-xs font-bold text-white/85">Método de pago (USD)</span>
                  <div className="mt-1.5 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("card")}
                      className={cn(
                        "cursor-pointer rounded-xl border px-3 py-2 text-xs font-bold transition-colors",
                        paymentMethod === "card"
                          ? "border-quack-amber bg-quack-amber text-quack-gunmetal"
                          : "border-white/20 bg-[#0E1118] text-white/70"
                      )}
                    >
                      Tarjeta / PayPal (USD)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("local")}
                      className={cn(
                        "cursor-pointer rounded-xl border px-3 py-2 text-xs font-bold transition-colors",
                        paymentMethod === "local"
                          ? "border-quack-amber bg-quack-amber text-quack-gunmetal"
                          : "border-white/20 bg-[#0E1118] text-white/70"
                      )}
                    >
                      PSE / Nequi
                    </button>
                  </div>
                </div>
              )}

              {error && (
                <p role="alert" className="text-xs font-bold text-quack-sandy">
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-toy btn-toy-light mt-5 h-12 w-full cursor-pointer bg-quack-amber text-sm text-quack-gunmetal"
            >
              {submitting
                ? "Procesando…"
                : plan.isCampus
                  ? "Solicitar propuesta institucional"
                  : "Confirmar y pasar a practicar"}
            </button>

            <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] font-medium text-white/65">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
              Sin cláusulas de permanencia
            </p>
          </form>
        ) : (
          <div className="py-3 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
              <Check className="h-6 w-6" strokeWidth={3} />
            </div>
            <h3 className="mt-3 font-brand text-2xl font-bold text-white">
              {plan.isCampus ? "¡Solicitud registrada!" : "¡Tu acceso está listo!"}
            </h3>
            <p className="mt-2 text-sm text-white/80">
              {plan.isCampus
                ? "Te contactaremos en menos de 24 horas con el acceso al entorno Ready-to-Go y al panel de Estadísticas de Éxito Estudiantil."
                : "Hemos activado tu entorno interactivo para que empieces a entrenar hoy mismo."}
            </p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate("/feynman");
                }}
                className="btn-toy btn-toy-light h-11 flex-1 cursor-pointer bg-quack-amber text-xs text-quack-gunmetal"
              >
                Ir a Feynman Oral ahora
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold text-white hover:bg-white/20"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
