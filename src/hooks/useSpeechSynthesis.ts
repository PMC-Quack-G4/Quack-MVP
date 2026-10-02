import * as React from "react";

export interface UseSpeechSynthesisReturn {
  isSupported: boolean;
  isSpeaking: boolean;
  currentSpeakingId: string | null;
  speak: (text: string, id?: string, onEnd?: () => void) => void;
  stop: () => void;
}

/**
 * Hook para síntesis de voz (Text-to-Speech) de las respuestas de Quack.
 * Prioriza voces en español latinoamericano o castellano y otorga a Quack un tono fresco y socrático.
 */
export function useSpeechSynthesis(): UseSpeechSynthesisReturn {
  const [isSpeaking, setIsSpeaking] = React.useState<boolean>(false);
  const [currentSpeakingId, setCurrentSpeakingId] = React.useState<string | null>(null);
  const activeUtteranceRef = React.useRef<SpeechSynthesisUtterance | null>(null);

  const isSupported = React.useMemo(() => {
    return typeof window !== "undefined" && "speechSynthesis" in window;
  }, []);

  const stop = React.useCallback(() => {
    if (!isSupported) return;
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignorar fallos de cancelación
    }
    activeUtteranceRef.current = null;
    setIsSpeaking(false);
    setCurrentSpeakingId(null);
  }, [isSupported]);

  const speak = React.useCallback(
    (text: string, id?: string, onEnd?: () => void) => {
      if (!isSupported || !text.trim()) {
        if (onEnd) onEnd();
        return;
      }

      // Cancelar cualquier audio en reproducción previa
      try {
        window.speechSynthesis.cancel();
      } catch {
        // No-op
      }

      const utterance = new SpeechSynthesisUtterance(text);
      activeUtteranceRef.current = utterance;
      utterance.lang = "es-ES";
      // Tono ligeramente más ágil y juvenil para Quack ("alumna curiosa")
      utterance.rate = 1.05;
      utterance.pitch = 1.15;

      // Buscar voz en español disponible
      const voices = window.speechSynthesis.getVoices();
      const spanishVoice = voices.find(
        (v) => v.lang.startsWith("es") || v.lang.includes("es-") || v.lang.includes("es_")
      );
      if (spanishVoice) {
        utterance.voice = spanishVoice;
      }

      let hasEnded = false;
      const finish = () => {
        if (hasEnded) return;
        hasEnded = true;
        activeUtteranceRef.current = null;
        setIsSpeaking(false);
        setCurrentSpeakingId(null);
        if (onEnd) {
          onEnd();
        }
      };

      utterance.onstart = () => {
        setIsSpeaking(true);
        if (id) setCurrentSpeakingId(id);
      };

      utterance.onend = () => {
        finish();
      };

      utterance.onerror = (e) => {
        // En algunos casos 'interrupted' o 'canceled' se dispara al llamar a cancel()
        if (e.error !== "canceled" && e.error !== "interrupted") {
          console.warn("Error en SpeechSynthesis:", e.error);
        }
        finish();
      };

      try {
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn("Fallo al reproducir locución:", err);
        finish();
      }
    },
    [isSupported]
  );

  React.useEffect(() => {
    return () => {
      if (isSupported) {
        try {
          window.speechSynthesis.cancel();
        } catch {
          // No-op
        }
      }
    };
  }, [isSupported]);

  return {
    isSupported,
    isSpeaking,
    currentSpeakingId,
    speak,
    stop,
  };
}
