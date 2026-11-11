import * as React from "react";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { HeroSection } from "@/components/landing/HeroSection";
import { StakesSection } from "@/components/landing/StakesSection";
import { SolutionsSection } from "@/components/landing/SolutionsSection";
import { GuideSection } from "@/components/landing/GuideSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { CtaButton } from "@/components/landing/CtaButton";
import { initAnalytics } from "@/lib/analytics";

/**
 * LANDING PAGE PRINCIPAL DE QUACK — Metodología StoryBrand + Rúbrica Semana 12 ISIS-2007.
 *
 * Estructura compacta, sin fatiga de scroll y 100% orientada a conversión:
 *  1. LandingHeader: Logo con sonido "¡Quack!", acceso directo a Precios/Instituciones y CTA dominante.
 *  2. HeroSection: Grunt Test en < 5 s (Qué ofrece, Cómo mejora tu vida, Cómo comprarlo/probarlo + Escena 3D).
 *  3. StakesSection: Costo de la inacción ($4.5M–$6M COP) + Transformación Sin Quack vs. Con Quack.
 *  4. SolutionsSection: El Plan en 3 Pasos + Demo multidisciplinaria (Algoritmos, Química, Biología, Física) + Repetición Espaciada (en hoja de ruta).
 *  5. GuideSection: Para Universidades (Cursos Ready-to-Go + Estadísticas de Éxito Estudiantil) vs. Individuales (Subir propio material) + Evidencia YODA.
 *  6. PricingSection: Planes Free y suscripciones Quack Pro (B2C) y Quack Campus (B2B).
 *  7. LandingFooter: FAQ + Lead Magnet + Junk Drawer + Panel en vivo de Prueba A/B y GA4.
 */
export const HomePage: React.FC = () => {
  const [showStickyMobile, setShowStickyMobile] = React.useState(false);

  React.useEffect(() => {
    const cleanup = initAnalytics();
    return cleanup;
  }, []);

  React.useEffect(() => {
    const onScroll = () => {
      setShowStickyMobile(window.scrollY > 480);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen overflow-x-clip bg-[#fffcf2] text-quack-gunmetal selection:bg-quack-amber selection:text-quack-gunmetal">
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
        <SolutionsSection />
        <GuideSection />
        <PricingSection />
      </main>

      <LandingFooter />

      {/* Barra móvil flotante con acceso a Precios y Prueba */}
      {showStickyMobile && (
        <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-2 border-t-2 border-quack-gunmetal bg-[#fffcf2]/95 px-4 pt-2.5 pb-[max(0.65rem,env(safe-area-inset-bottom))] shadow-[0_-10px_25px_-10px_rgba(59,65,81,0.3)] backdrop-blur-md sm:hidden">
          <a
            href="#precios"
            className="flex h-11 items-center justify-center rounded-xl border-2 border-quack-gunmetal bg-white px-4 font-brand text-xs font-bold text-quack-gunmetal"
          >
            Precios
          </a>
          <CtaButton to="/login" location="mobile_sticky" size="md" className="flex-1 text-xs">
            Probar ahora
          </CtaButton>
        </div>
      )}
    </div>
  );
};
