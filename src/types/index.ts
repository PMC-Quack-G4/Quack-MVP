/**
 * Exportación centralizada de tipos para Quack MVP.
 */

export * from "./feynman";
export * from "./exam";

export type StemSubject =
  | "fisica-mecanica"
  | "calculo-integral"
  | "algebra-lineal"
  | "ecuaciones-diferenciales";

export type SessionPhase =
  | "preparacion"
  | "explicacion_voz"
  | "retroalimentacion_agente"
  | "evaluacion_ocr"
  | "completado";

export interface StemVariable {
  symbol: string;
  name: string;
  unit: string;
  description: string;
}

export interface FormulaDefinition {
  id: string;
  name: string;
  latex: string;
  subject: StemSubject;
  description: string;
  variables: StemVariable[];
}

export interface OcrStepEvaluation {
  stepNumber: number;
  stepTitle: string;
  detectedLatex: string;
  expectedLatex: string;
  isCorrect: boolean;
  confidenceScore: number;
  feedback: string;
}

export interface FeynmanSession {
  id: string;
  topic: string;
  subject: StemSubject;
  formula: FormulaDefinition;
  phase: SessionPhase;
  studentExplanationTranscript: string;
  aiReflectionFeedback: string;
  ocrSteps: OcrStepEvaluation[];
  masteryScore: number;
  createdAt: string;
}

export interface NavigationItem {
  name: string;
  path: string;
  iconName: string;
  badge?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  timestamp: string;
}
