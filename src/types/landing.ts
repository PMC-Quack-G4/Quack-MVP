import type { StepStatus } from "./exam";

/**
 * Tipos de dominio de la landing page (StoryBrand + Modelo de Negocio Quack).
 */

export type HeroVariantId = "A" | "B";

export interface HeroVariant {
  id: HeroVariantId;
  badgeText: string;
  /** Parte inicial del titular. */
  lead: string;
  /** Fragmento resaltado con subrayado "a mano". */
  highlight: string;
  /** Cierre opcional del titular. */
  tail?: string;
  subtitle: string;
  primaryCtaText: string;
}

export interface LandingMetric {
  id: string;
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  label: string;
  /** Fuente visible del dato (credibilidad YODA). */
  source?: string;
}

export interface StakeItem {
  id: string;
  title: string;
  description: string;
}

export interface TransformationItem {
  id: string;
  before: string;
  after: string;
}

export interface Testimonial {
  id: string;
  code: string;
  quote: string;
  author: string;
  subject: string;
  score: string;
}

export interface PlanStep {
  id: string;
  badge: string;
  title: string;
  description: string;
}

export interface PricingTier {
  id: "free" | "pro" | "campus";
  name: string;
  audience: string;
  badge?: string;
  popular?: boolean;
  priceCopMonthly: string;
  priceCopAnnual: string;
  priceUsdMonthly: string;
  priceUsdAnnual: string;
  billingNote: string;
  valueAnchor: string;
  description: string;
  features: readonly string[];
  ctaLabel: string;
  ctaAction: "try_free" | "checkout_pro" | "contact_campus";
}

export interface SubjectDiscipline {
  id: string;
  name: string;
  area: string;
  exampleTopic: string;
  snippet: string;
  isMath?: boolean;
}

export interface FeynmanSubjectDemo {
  id: string;
  discipline: string;
  topic: string;
  modeTag: string;
  subconcepts: readonly { id: string; label: string; covered: boolean }[];
  messages: readonly {
    id: string;
    sender: "student" | "quack";
    text: string;
  }[];
}

export interface AuditStepDemo {
  stepNumber: number;
  expression: string;
  isLatex?: boolean;
  status: StepStatus;
  feedback: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

/** Ubicaciones de CTA para medir qué botón convierte mejor en GA4. */
export type CtaLocation =
  | "header"
  | "hero_primary"
  | "hero_secondary"
  | "solutions_feynman"
  | "solutions_exam"
  | "institutional_pilot"
  | "pricing_free"
  | "pricing_pro"
  | "pricing_campus"
  | "final"
  | "mobile_sticky"
  | "lead_success";
