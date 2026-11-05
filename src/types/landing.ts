/**
 * Tipos de dominio de la landing page (StoryBrand).
 */

export type HeroVariantId = "A" | "B";

export interface HeroVariant {
  id: HeroVariantId;
  /** Parte inicial del titular. */
  lead: string;
  /** Fragmento resaltado con subrayado "a mano". */
  highlight: string;
  /** Cierre opcional del titular. */
  tail?: string;
}

export interface LandingMetric {
  id: string;
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  label: string;
  /** Fuente visible del dato (credibilidad). */
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
  quote: string;
  author: string;
  role: string;
  /** true mientras la cita no provenga de una entrevista real verificada. */
  isPlaceholder: boolean;
}

export type MilestoneStatus = "done" | "current" | "next";

export interface Milestone {
  id: string;
  period: string;
  title: string;
  description: string;
  status: MilestoneStatus;
}

export interface ComparisonRow {
  id: string;
  criterion: string;
  genericAi: string;
  tutor: string;
  quack: string;
}

export interface PlanStep {
  id: string;
  title: string;
  description: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

/** Ubicaciones de CTA para medir qué botón convierte mejor. */
export type CtaLocation =
  | "header"
  | "hero"
  | "solutions_feynman"
  | "solutions_exam"
  | "plan"
  | "final"
  | "mobile_sticky"
  | "lead_success";
