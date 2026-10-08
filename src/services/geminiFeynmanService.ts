import { IFeynmanService, FeynmanEvaluationResult, SubtopicScoreData } from "./types";
import { FeynmanTopic, ChatMessage } from "@/types/feynman";

/**
 * Servicio Feynman que ahora se conecta al backend local/Dockerizado.
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
    
    const response = await fetch('/api/feynman', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic,
        history,
        studentInput,
        currentCoveredIds,
        subtopicScores,
        activeSubtopicId
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP error ${response.status}`);
    }

    return await response.json();
  }
}

export const geminiFeynmanService = new GeminiFeynmanService();
