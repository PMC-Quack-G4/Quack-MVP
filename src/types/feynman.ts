/**
 * Tipos específicos para el Módulo 1: Feynman Oral (IA Invertida).
 */

export interface SubtopicKey {
  id: string;
  name: string;
  description?: string;
  covered: boolean;
}

export interface FeynmanDialogueTrigger {
  triggerWords: string[];
  quackReply: string;
  unlocksSubtopicId?: string;
}

export interface FeynmanTopic {
  id: string;
  title: string;
  category: string;
  difficulty: "Básico" | "Intermedio" | "Avanzado";
  formulaLatex?: string;
  promptContext: string;
  subtopics: SubtopicKey[];
  mockDialogue: FeynmanDialogueTrigger[];
  fallbackReply: string;
}

export interface ChatMessage {
  id: string;
  sender: "student" | "quack";
  text: string;
  timestamp: Date;
  audioId?: string;
}

export interface FeynmanSessionSummary {
  topicId: string;
  topicTitle: string;
  durationSeconds: number;
  totalExplanations: number;
  masteredSubtopics: SubtopicKey[];
  missingSubtopics: SubtopicKey[];
  masteryPercentage: number;
  pedagogicalAdvice: string;
}
