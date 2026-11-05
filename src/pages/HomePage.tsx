import * as React from "react";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { HeroSection } from "@/components/landing/HeroSection";
import { StakesSection } from "@/components/landing/StakesSection";
import { SuccessSection } from "@/components/landing/SuccessSection";
import { GuideSection } from "@/components/landing/GuideSection";
import { SolutionsSection } from "@/components/landing/SolutionsSection";
import { PlanSection } from "@/components/landing/PlanSection";
import { LeadGeneratorSection } from "@/components/landing/LeadGeneratorSection";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { CtaButton } from "@/components/landing/CtaButton";
import { initAnalytics } from "@/lib/analytics";

/**
 * LANDING PAGE PRINCIPAL — Metodología StoryBrand + ISIS-2007
 *
 * Estructura secuencial:
 *  1. Encabezado minimalista (Logo + CTA en esquina superior derecha)
 *  2. Hero (Grunt Test en < 5 s: Qué ofrecemos, Cómo mejora tu vida, CTA directo + escena 3D)
 *  3. Costo de la inacción / Fracaso (La ilusión de competencia y hoja en blanco)
 *  4. Escenario de éxito (Transformación antes vs. después con tarjetas 3D)
 *  5. El Guía (Empatía + Autoridad: métricas, principios cognitivos, comparativa, testimonios e hitos)
 *  6. Catálogo de soluciones (Simulador Feynman Oral + Inspector Parcial a Ciegas OCR)
 *  7. El Plan en 3 Pasos ("Piedras en el arroyo")
 *  8. Generador de prospectos (Lead Magnet: Checklist anti-ilusión descargable)
 *  9. Cajón de deshechos / Junk Drawer (FAQ + CTA final + Footer completo)
 */
export const HomePage: React.FC = () => {
  const [showStickyMobile, setShowStickyMobile] = React.useState(false);

  React.useEffect(() => {
    initAnalytics();
  }, []);

  React.useEffect(() => {
    const onScroll = () => {
      setShowStickyMobile(window.scrollY > 520);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#fffcf2] text-quack-gunmetal selection:bg-quack-amber selection:text-quack-gunmetal">
      <a
        href="#contenido-principal"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-xl focus:bg-quack-amber focus:px-4 focus:py-2 focus:font-brand focus:font-bold focus:text-quack-gunmetal"
      >
        Saltar al contenido principal
      </a>

      <LandingHeader />

      <main id="contenido-principal">
        <HeroSection />
        <StakesSection />
        <SuccessSection />
        <GuideSection />
        <SolutionsSection />
        <PlanSection />
        <LeadGeneratorSection />
      </main>

      <LandingFooter />

      {/* Barra móvil flotante para conversión rápida en pantallas pequeñas */}
      {showStickyMobile && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-quack-gunmetal bg-[#fffcf2]/95 p-3 shadow-[0_-10px_25px_-10px_rgba(59,65,81,0.3)] backdrop-blur-md sm:hidden">
          <CtaButton to="/feynman" location="mobile_sticky" size="md" className="w-full">
            Practicar gratis ahora
          </CtaButton>
        </div>
      )}
    </div>
  );
};
