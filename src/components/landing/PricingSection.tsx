import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Award, Building2, Check, CreditCard, GraduationCap, ShieldCheck, Sparkles, Users, X } from "lucide-react";
import { Reveal } from "./Reveal";
import { EMAIL_PATTERN, leadService } from "@/services/leadService";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

type AudienceTab = "b2c" | "b2b";
type BillingCycle = "monthly" | "annual";

interface B2BVolumeTier {
  id: string;
  label: string;
  studentsCountLabel: string;
  thousands: number;
  pricePer1kUsd: number;
  regularPer1kUsd: number;
  totalAnnualUsd: string;
  per1kFormatted: string;
  tag: string;
}

const b2bVolumeTiers: readonly B2BVolumeTier[] = [
  {
    id: "1k",
    label: "1k estudiantes",
    studentsCountLabel: "1,000 estudiantes activos",
    thousands: 1,
    pricePer1kUsd: 12000,
    regularPer1kUsd: 15000,
    per1kFormatted: "$12,000 USD",
    totalAnnualUsd: "$12,000 USD / año",
    tag: "Piloto Early Adopter (-20%)",
  },
  {
    id: "2.5k",
    label: "2.5k estudiantes",
    studentsCountLabel: "2,500 estudiantes activos",
    thousands: 2.5,
    pricePer1kUsd: 11200,
    regularPer1kUsd: 15000,
    per1kFormatted: "$11,200 USD",
    totalAnnualUsd: "$28,000 USD / año",
    tag: "Escuela / 2 Facultades (-25%)",
  },
  {
    id: "5k",
    label: "5k estudiantes",
    studentsCountLabel: "5,000 estudiantes activos",
    thousands: 5,
    pricePer1kUsd: 10000,
    regularPer1kUsd: 15000,
    per1kFormatted: "$10,000 USD",
    totalAnnualUsd: "$50,000 USD / año",
    tag: "Campus STEM (-33%)",
  },
  {
    id: "10k",
    label: "10k+ estudiantes",
    studentsCountLabel: "10,000+ estudiantes activos",
    thousands: 10,
    pricePer1kUsd: 9000,
    regularPer1kUsd: 15000,
    per1kFormatted: "$9,000 USD",
    totalAnnualUsd: "$90,000 USD / año",
    tag: "Universidad Completa (-40%)",
  },
] as const;

/**
 * SECCIÓN 5: PLANES Y PRECIOS EN USD (#precios).
 * - Pestaña 1 (B2C): Para Estudiantes Individuales ($0 USD Free, $4.99 USD/mes Pro, $25 USD Certificación).
 * - Pestaña 2 (B2B): Para Universidades e Instituciones por masas de 1k estudiantes ($12,000 USD por cada 1k en Piloto
 *   hasta $9,000 USD por cada 1k en escala campus).
 */
export const PricingSection: React.FC = () => {
  const navigate = useNavigate();
  const [audienceTab, setAudienceTab] = React.useState<AudienceTab>("b2c");
  const [billing, setBilling] = React.useState<BillingCycle>("monthly");
  const [selectedVolumeId, setSelectedVolumeId] = React.useState<string>("1k");

  const [selectedModalPlan, setSelectedModalPlan] = React.useState<{
    id: string;
    title: string;
    priceLabel: string;
    isCampus?: boolean;
  } | null>(null);

  const activeVolume =
    b2bVolumeTiers.find((v) => v.id === selectedVolumeId) ?? b2bVolumeTiers[0];

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
            Planes y precios en USD
          </span>
          <h2
            id="pricing-title"
            className="mt-4 font-brand text-3xl font-bold leading-tight text-quack-gunmetal text-balance sm:text-5xl"
          >
            Elige tu modalidad:{" "}
            <span className="marker-highlight">Estudiante o Universidad</span>
          </h2>

          {/* Pestañas Principales 3D: B2C (Estudiantes) vs B2B (Instituciones por cada 1k) */}
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
              Para Estudiantes (B2C)
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
              Para Universidades (B2B · Por cada 1k estudiantes)
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

            <div className="scene-3d mt-10 grid gap-6 lg:grid-cols-3">
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

              {/* 3. Certificación de Dominio Autónomo (Pay-per-Use en USD) */}
              <article className="card-3d-light flex h-full flex-col justify-between rounded-3xl border-2 border-quack-gunmetal bg-white p-7">
                <div>
                  <p className="inline-flex items-center gap-1.5 font-brand text-xs font-bold uppercase tracking-wider text-quack-caramel">
                    <Award className="h-3.5 w-3.5" aria-hidden="true" /> Pay‑per‑Use · Sin suscripción
                  </p>
                  <h3 className="mt-1 font-brand text-2xl font-bold text-quack-gunmetal">
                    Certificación STEM
                  </h3>
                  <p className="mt-4 font-brand text-4xl font-bold tracking-tight text-quack-gunmetal tabular-nums">
                    $25 USD
                  </p>
                  <p className="mt-1 text-xs font-medium text-quack-gunmetal/65">
                    por examen oficial auditado
                  </p>

                  <ul className="mt-6 space-y-2.5 border-t border-quack-gunmetal/10 pt-5 text-sm text-quack-gunmetal/85">
                    {[
                      "Examen supervisado a libro cerrado con cronómetro y auditoría OCR + Oral",
                      "Credencial verificable para postular a monitorías académicas y pasantías",
                      "Desglose de dominio conceptual y procedimental avalado por rúbrica",
                      "Disponible en Algoritmia, Estructuras de Datos, Cálculo, Física y Química",
                    ].map((feat) => (
                      <li key={feat} className="flex items-start gap-2.5">
                        <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-quack-dandelion text-quack-gunmetal">
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
                        id: "certificacion",
                        title: "Certificación de Dominio Autónomo",
                        priceLabel: "$25 USD (Pago único por examen auditado)",
                      })
                    }
                    className="btn-toy h-12 w-full cursor-pointer bg-quack-dandelion text-sm text-quack-gunmetal hover:bg-quack-amber"
                  >
                    Agendar examen ($25 USD)
                  </button>
                </div>
              </article>
            </div>
          </div>
        ) : (
          /* =====================================================================
              PESTAÑA 2: B2B — UNIVERSIDADES E INSTITUCIONES (Masas de 1k estudiantes en USD)
             ===================================================================== */
          <div key="b2b-panel" className="animate-pop mt-10">
            {/* Selector Interactivo de Masas por cada 1k estudiantes */}
            <div className="mx-auto max-w-4xl rounded-3xl border-2 border-quack-gunmetal bg-[#151922] p-6 text-white shadow-[10px_10px_0_0_#FFC800] sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 font-brand text-xs font-bold uppercase tracking-wider text-quack-amber">
                    <Users className="h-4 w-4" aria-hidden="true" /> Calculadora por volumen (Masas de 1k estudiantes)
                  </span>
                  <h3 className="mt-1 font-brand text-xl font-bold text-white sm:text-2xl">
                    Selecciona el tamaño de tu cohorte o campus:
                  </h3>
                </div>
                <span className="rounded-full border border-quack-amber/50 bg-quack-amber/15 px-3 py-1 font-mono text-xs font-bold text-quack-amber">
                  {activeVolume.tag}
                </span>
              </div>

              {/* Botones de masa estudiantil (1k, 2.5k, 5k, 10k+) */}
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {b2bVolumeTiers.map((vol) => {
                  const isSelected = vol.id === activeVolume.id;
                  return (
                    <button
                      key={vol.id}
                      type="button"
                      onClick={() => {
                        setSelectedVolumeId(vol.id);
                        trackEvent("b2b_volume_select", { volume: vol.id });
                      }}
                      className={cn(
                        "cursor-pointer rounded-2xl border-2 p-3.5 text-left transition-all",
                        isSelected
                          ? "border-quack-amber bg-quack-amber text-quack-gunmetal shadow-[0_6px_20px_rgba(255,200,0,0.35)]"
                          : "border-white/15 bg-white/5 text-white hover:border-white/35"
                      )}
                    >
                      <p className="font-brand text-base font-bold sm:text-lg">{vol.label}</p>
                      <p
                        className={cn(
                          "mt-0.5 font-mono text-xs font-bold",
                          isSelected ? "text-quack-gunmetal/80" : "text-quack-amber"
                        )}
                      >
                        {vol.per1kFormatted} / 1k
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Resumen dinámico del bloque seleccionado */}
              <div className="mt-6 grid items-center gap-6 rounded-2xl border border-white/15 bg-[#0E1118] p-5 sm:grid-cols-[1.2fr_0.8fr]">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
                    Tarifa institucional por cada 1,000 estudiantes ({activeVolume.studentsCountLabel})
                  </p>
                  <div className="mt-1 flex flex-wrap items-baseline gap-3">
                    <span className="font-brand text-3xl font-bold text-quack-amber sm:text-4xl">
                      {activeVolume.per1kFormatted}
                    </span>
                    <span className="text-sm font-semibold text-white/80">
                      por cada 1k estudiantes / año
                    </span>
                    <span className="font-mono text-xs text-white/45 line-through">
                      $15,000 USD / 1k
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-white/70">
                    Inversión total anual para {activeVolume.label}:{" "}
                    <strong className="text-white">{activeVolume.totalAnnualUsd}</strong> (equivale a{" "}
                    <strong className="text-quack-amber">
                      ${(activeVolume.pricePer1kUsd / 1000).toFixed(2)} USD
                    </strong>{" "}
                    por estudiante al año).
                  </p>
                </div>

                <div className="flex sm:justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      openCheckout({
                        id: `campus_${activeVolume.id}`,
                        title: `Quack Campus (${activeVolume.label})`,
                        priceLabel: `${activeVolume.per1kFormatted} por cada 1k estudiantes · Total: ${activeVolume.totalAnnualUsd}`,
                        isCampus: true,
                      })
                    }
                    className="btn-toy btn-toy-light h-12 w-full cursor-pointer bg-quack-amber px-6 text-sm text-quack-gunmetal sm:w-auto"
                  >
                    Cotizar paquete {activeVolume.label}
                  </button>
                </div>
              </div>
            </div>

            {/* 2 Tarjetas B2B Comparativas en 3D */}
            <div className="scene-3d mt-8 grid gap-6 md:grid-cols-2">
              <article className="card-3d-light flex h-full flex-col justify-between rounded-3xl border-2 border-quack-gunmetal bg-white p-7">
                <div>
                  <span className="inline-block rounded-full bg-quack-dandelion px-3 py-1 font-brand text-xs font-bold text-quack-gunmetal">
                    Facultad / Piloto Early Adopter
                  </span>
                  <h3 className="mt-3 font-brand text-2xl font-bold text-quack-gunmetal">
                    Bloque Base · 1k Estudiantes
                  </h3>
                  <p className="mt-3 font-brand text-4xl font-bold text-quack-gunmetal tabular-nums">
                    $12,000 USD{" "}
                    <span className="text-base font-semibold text-quack-gunmetal/65">
                      / 1k estudiantes al año
                    </span>
                  </p>
                  <p className="mt-1 text-xs font-medium text-quack-caramel">
                    Tarifa Early Adopter ($12 USD por estudiante/año · Estándar: $15,000 USD / 1k)
                  </p>

                  <ul className="mt-6 space-y-2.5 border-t border-quack-gunmetal/10 pt-5 text-sm text-quack-gunmetal/85">
                    {[
                      "Integración LTI Ready-to-Go (Canvas, Brightspace, Bloque Neón) para 1,000 estudiantes",
                      "Cursos preconfigurados en Programación, Algoritmia, Química, Biología, Física y Cálculo",
                      "Panel de Estadísticas de Éxito Estudiantil por cohorte y asignatura",
                      "Detección temprana de cuellos de botella conceptuales antes de cada corte",
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
                    onClick={() =>
                      openCheckout({
                        id: "campus_1k_pilot",
                        title: "Piloto Facultad · 1k Estudiantes",
                        priceLabel: "$12,000 USD / año por cada 1k estudiantes ($12 USD/estudiante)",
                        isCampus: true,
                      })
                    }
                    className="btn-toy h-12 w-full cursor-pointer bg-quack-gunmetal text-sm text-white hover:bg-[#454c5f]"
                  >
                    Solicitar Piloto 1k ($12,000 USD)
                  </button>
                </div>
              </article>

              <article className="card-3d-amber flex h-full flex-col justify-between rounded-3xl border-2 border-quack-gunmetal bg-[#151922] p-7 text-white">
                <div>
                  <span className="inline-block rounded-full bg-quack-amber px-3 py-1 font-brand text-xs font-bold text-quack-gunmetal">
                    Escala Campus · 5k a 10k+ Estudiantes
                  </span>
                  <h3 className="mt-3 font-brand text-2xl font-bold text-white">
                    Licencia Multianual por Masas
                  </h3>
                  <p className="mt-3 font-brand text-4xl font-bold text-quack-amber tabular-nums">
                    $9,000 – $10,000 USD{" "}
                    <span className="text-base font-semibold text-white/75">
                      / 1k estudiantes al año
                    </span>
                  </p>
                  <p className="mt-1 text-xs font-medium text-white/75">
                    Descuento escalonado por volumen desde 5,000 hasta +10,000 estudiantes
                  </p>

                  <ul className="mt-6 space-y-2.5 border-t border-white/15 pt-5 text-sm text-white/90">
                    {[
                      "Todo lo del Piloto + Despliegue transversal en todas las facultades STEM y Ciencias",
                      "Dashboard Ejecutivo para Decanaturas: retención estudiantil, ROI > 50x y analítica histórica",
                      "Parametrización completa con sílabos, rúbricas y bancos de parciales de la institución",
                      "Soporte prioritario SLA 99.9% y acompañamiento pedagógico continuo",
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
                        id: "campus_mass_scale",
                        title: `Licencia Campus Masiva (${activeVolume.label})`,
                        priceLabel: `${activeVolume.per1kFormatted} por cada 1k estudiantes (${activeVolume.totalAnnualUsd})`,
                        isCampus: true,
                      })
                    }
                    className="btn-toy btn-toy-light h-12 w-full cursor-pointer bg-quack-amber text-sm text-quack-gunmetal hover:bg-[#ffd21f]"
                  >
                    Agendar Demo Institucional
                  </button>
                </div>
              </article>
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
