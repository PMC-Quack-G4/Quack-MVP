import { FeynmanTopic, ChatMessage, SubtopicScoreData } from "@/types/feynman";
import { ExamProblem, MockAuditResult } from "@/types/exam";

export interface FeynmanEvaluationResult {
  reply: string;
  unlockedSubtopicIds: string[]; // 100% de dominio
  partialSubtopicIds?: string[];  // 50% de dominio
  failedSubtopicIds?: string[];   // 0% de dominio (agotó los 3 intentos)
  nextActiveSubtopicId?: string;  // Siguiente subtema al que Quack hace transición
  isSessionFinished?: boolean;    // true si ya no quedan subtemas por evaluar
  detectedGaps?: string[];
  masteryProgressPercentage?: number;
  engineUsed?: "gemini" | "mock";
  warning?: string;
}

export interface IFeynmanService {
  sendMessage(
    topic: FeynmanTopic,
    history: ChatMessage[],
    studentInput: string,
    currentCoveredIds: string[],
    subtopicScores?: Record<string, SubtopicScoreData>,
    activeSubtopicId?: string
  ): Promise<FeynmanEvaluationResult>;
}

export interface IOcrAuditService {
  auditSolution(
    problem: ExamProblem,
    imageBase64OrUrl: string
  ): Promise<MockAuditResult>;
}
