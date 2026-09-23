import * as React from "react";

// Declaración de tipos para SpeechRecognition si no están en el DOM global
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: ((this: ISpeechRecognition, ev: Event) => void) | null;
  onresult: ((this: ISpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: ISpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((this: ISpeechRecognition, ev: Event) => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => ISpeechRecognition;
    webkitSpeechRecognition?: new () => ISpeechRecognition;
  }
}

export interface UseSpeechRecognitionReturn {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

/**
 * Hook personalizado para interactuar con la Web Speech API (Speech-to-Text).
 * Optimizado para el botón Push-to-Talk (PTT) con soporte de transcripción en tiempo real y fallback accesible.
 */
export function useSpeechRecognition(lang = "es-ES"): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = React.useState<boolean>(false);
  const [transcript, setTranscript] = React.useState<string>("");
  const [interimTranscript, setInterimTranscript] = React.useState<string>("");
  const [error, setError] = React.useState<string | null>(null);

  const recognitionRef = React.useRef<ISpeechRecognition | null>(null);

  // Detección segura de soporte en navegador
  const isSupported = React.useMemo(() => {
    return typeof window !== "undefined" && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  }, []);

  React.useEffect(() => {
    if (!isSupported) return;

    const SpeechRecClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecClass) return;

    try {
      const recognition = new SpeechRecClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = lang;

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let currentInterim = "";
        let finalChunk = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcriptSegment = result[0]?.transcript || "";
          if (result.isFinal) {
            finalChunk += transcriptSegment + " ";
          } else {
            currentInterim += transcriptSegment;
          }
        }

        if (finalChunk) {
          setTranscript((prev) => (prev ? `${prev} ${finalChunk.trim()}` : finalChunk.trim()));
        }
        setInterimTranscript(currentInterim);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        // En algunos casos 'no-speech' es común al soltar rápido el botón PTT
        if (event.error === "no-speech") {
          setIsListening(false);
          return;
        }
        setError(`Error de reconocimiento: ${event.error}`);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript("");
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.warn("No fue posible inicializar SpeechRecognition:", err);
      setError("No fue posible inicializar el reconocedor de voz.");
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // No-op
        }
      }
    };
  }, [isSupported, lang]);

  const startListening = React.useCallback(() => {
    if (!isSupported || !recognitionRef.current) {
      setError("El reconocimiento de voz no está soportado en este navegador.");
      return;
    }

    setError(null);
    try {
      recognitionRef.current.start();
    } catch {
      // Si ya estaba escuchando, intentar reiniciar
      try {
        recognitionRef.current.stop();
        recognitionRef.current.start();
      } catch (err) {
        console.warn("Error al iniciar escucha PTT:", err);
      }
    }
  }, [isSupported]);

  const stopListening = React.useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch (err) {
      console.warn("Error al detener escucha PTT:", err);
    }
    setIsListening(false);
  }, []);

  const resetTranscript = React.useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
    setError(null);
  }, []);

  return {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    resetTranscript,
  };
}
