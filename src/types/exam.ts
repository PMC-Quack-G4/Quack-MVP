/**
 * Tipos específicos para el Módulo 2: Parcial a Ciegas OCR.
 */

export type StepStatus =
  | "CORRECT"
  | "ALGEBRAIC_ERROR"
  | "CONCEPTUAL_ERROR"
  | "PROPAGATED_ERROR";

export interface AuditStep {
  stepNumber: number;
  latexExpression: string;
  status: StepStatus;
  feedback: string;
  suggestedFixLatex?: string;
}

export interface MockAuditResult {
  finalScore: number;
  maxScore: number;
  summary: string;
  diagnosisTitle?: string;
  steps: AuditStep[];
  engineUsed?: "gemini" | "mock";
  warning?: string;
  isValidSubmission?: boolean;
  completionPercentage?: number;
  pedagogicalRecommendation?: string;
}

export interface ExamProblem {
  id: string;
  title: string;
  subject: string;
  difficulty: "Fácil" | "Medio" | "Difícil";
  statementLatex: string;
  estimatedMinutes: number;
  defaultSampleImage: string;
  mockAudit: MockAuditResult;
}

export type ExamPhase = "SETUP" | "SOLVING" | "UPLOAD" | "AUDIT";
