import { FeynmanTopic, ChatMessage } from "@/types/feynman";
import { IFeynmanService, FeynmanEvaluationResult } from "./types";

/**
 * Servicio Mock para Feynman Oral.
 * Implementa de forma determinista la personalidad de "Quack: alumna curiosa y despistada".
 * Detecta conceptos clave, formula contrapreguntas socráticas y desbloquea subconceptos progresivamente.
 */
export class MockFeynmanService implements IFeynmanService {
  async sendMessage(
    topic: FeynmanTopic,
    _history: ChatMessage[],
    studentInput: string,
    currentCoveredIds: string[]
  ): Promise<FeynmanEvaluationResult> {
    // Simular un retardo natural de reflexión humana/IA (600ms)
    await new Promise((res) => setTimeout(res, 650));

    const normalizedInput = studentInput
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    const newUnlockedIds: string[] = [];

    // 1. Buscar coincidencias con los triggers temáticos
    let matchedReply: string | null = null;

    for (const dialogue of topic.mockDialogue) {
      const hasTrigger = dialogue.triggerWords.some((w) => {
        const normalizedTrigger = w
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");
        return normalizedInput.includes(normalizedTrigger);
      });

      if (hasTrigger) {
        matchedReply = dialogue.quackReply;
        if (
          dialogue.unlocksSubtopicId &&
          !currentCoveredIds.includes(dialogue.unlocksSubtopicId) &&
          !newUnlockedIds.includes(dialogue.unlocksSubtopicId)
        ) {
          newUnlockedIds.push(dialogue.unlocksSubtopicId);
        }
        break;
      }
    }

    // 2. Si no hubo coincidencia directa pero el estudiante dio una explicación sustancial
    if (!matchedReply) {
      const uncoveredSubtopics = topic.subtopics.filter(
        (s) => !currentCoveredIds.includes(s.id) && !newUnlockedIds.includes(s.id)
      );

      if (uncoveredSubtopics.length > 0) {
        // Seleccionar el próximo subtema pendiente para contrapreguntar
        const nextTarget = uncoveredSubtopics[0];
        matchedReply = `Mmm, entiendo lo que dices, pero ¿cómo se conecta eso con "${nextTarget.name}"? ¿Podrías darme un ejemplo concreto?`;
        // Si la explicación tiene más de 12 palabras, consideramos que avanzó
        if (studentInput.trim().split(/\s+/).length > 10) {
          newUnlockedIds.push(nextTarget.id);
        }
      } else {
        // Todos los subtemas cubiertos
        matchedReply =
          "¡Guao, ahora sí me quedó clarísimo todo el concepto! Has conectado cada parte sin saltos raros. ¡Muchas gracias por explicármelo, profe!";
      }
    }

    const allCoveredIds = Array.from(new Set([...currentCoveredIds, ...newUnlockedIds]));
    const totalSubtopics = topic.subtopics.length;
    const progress = totalSubtopics > 0 ? Math.round((allCoveredIds.length / totalSubtopics) * 100) : 100;

    const detectedGaps = topic.subtopics
      .filter((s) => !allCoveredIds.includes(s.id))
      .map((s) => s.name);

    return {
      reply: matchedReply || topic.fallbackReply,
      unlockedSubtopicIds: newUnlockedIds,
      detectedGaps,
      masteryProgressPercentage: progress,
    };
  }
}

export const mockFeynmanService = new MockFeynmanService();
