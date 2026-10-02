import { FeynmanTopic, ChatMessage } from "@/types/feynman";
import { ExamProblem, MockAuditResult } from "@/types/exam";

export interface FeynmanEvaluationResult {
  reply: string;
  unlockedSubtopicIds: string[];
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
    currentCoveredIds: string[]
  ): Promise<FeynmanEvaluationResult>;
}

export interface IOcrAuditService {
  auditSolution(
    problem: ExamProblem,
    imageBase64OrUrl: string
  ): Promise<MockAuditResult>;
}
