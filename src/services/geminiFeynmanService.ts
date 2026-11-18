import { FeynmanTopic, ChatMessage, SubtopicScoreData } from "@/types/feynman";
import { IFeynmanService, FeynmanEvaluationResult } from "./types";

/**
 * Servicio Feynman conectado al endpoint seguro `/api/ai/feynman`.
 * Mantiene `GEMINI_API_KEY` exclusivamente en el servidor.
 */
export class GeminiFeynmanService implements IFeynmanService {
  async sendMessage(
    topic: FeynmanTopic,
    history: ChatMessage[],
    studentInput: string,
    currentCoveredIds: string[],
    subtopicScores?: Record<string, SubtopicScoreData>,
    activeSubtopicId?: string
  ): Promise<FeynmanEvaluationResult> {
    const response = await fetch("/api/ai/feynman", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        topic: {
          id: topic.id,
          title: topic.title,
          category: topic.category,
          promptContext: topic.promptContext,
          fallbackReply: topic.fallbackReply,
          subtopics: topic.subtopics.map((s) => ({
            id: s.id,
            name: s.name,
            description: s.description,
          })),
        },
        history: history.slice(-8).map((msg) => ({
          sender: msg.sender,
          text: msg.text,
        })),
        studentInput,
        currentCoveredIds,
        subtopicScores,
        activeSubtopicId,
      }),
    });

    if (!response.ok) {
      let message = `HTTP ${response.status}`;
      try {
        const errPayload = (await response.json()) as { error?: string };
        if (errPayload.error) message = errPayload.error;
      } catch {
        // Ignore non-JSON error body
      }
      throw new Error(message);
    }

    return (await response.json()) as FeynmanEvaluationResult;
  }
}

export const geminiFeynmanService = new GeminiFeynmanService();
