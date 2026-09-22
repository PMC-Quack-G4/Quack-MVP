/**
 * Tipos específicos para el Módulo 1: Feynman Oral.
 */

export interface SubtopicKey {
  id: string;
  name: string;
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
}
