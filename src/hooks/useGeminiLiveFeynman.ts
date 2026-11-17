import * as React from "react";
import { FeynmanTopic, SubtopicScoreData } from "@/types/feynman";
import { LiveAudioPlayer, LiveAudioRecorder } from "@/lib/liveAudio";
import {
  GeminiLiveFeynmanSession,
  LiveConnectionStatus,
  LiveFeynmanEvaluationPayload,
} from "@/services/geminiLiveFeynmanService";

export interface UseGeminiLiveFeynmanOptions {
  onUserMessageFinalized: (text: string) => void;
  onQuackMessageFinalized: (text: string) => void;
  onEvaluation: (payload: LiveFeynmanEvaluationPayload) => void;
  onFallbackNeeded: (reason: string) => void;
}

export interface UseGeminiLiveFeynmanReturn {
  connectionStatus: LiveConnectionStatus;
  connectedModel: string | null;
  isMicActive: boolean;
  isHandsFree: boolean;
  isQuackSpeaking: boolean;
  isQuackThinking: boolean;
  micLevel: number;
  liveUserTranscript: string;
  liveQuackTranscript: string;
  micError: string | null;
  connectSession: (
    topic: FeynmanTopic,
    subtopicScores?: Record<string, SubtopicScoreData>,
    activeSubtopicId?: string
  ) => Promise<boolean>;
  disconnectSession: () => void;
  startMic: () => Promise<void>;
  stopMic: () => void;
  toggleHandsFree: () => Promise<void>;
  sendText: (text: string) => void;
  stopQuackAudio: () => void;
}

/**
 * Hook que orquesta la sesión bidireccional de Gemini Live API
 * junto con captura PCM 16 kHz y reproducción nativa PCM 24 kHz.
 */
export function useGeminiLiveFeynman(
  options: UseGeminiLiveFeynmanOptions
): UseGeminiLiveFeynmanReturn {
  const [connectionStatus, setConnectionStatus] =
    React.useState<LiveConnectionStatus>("idle");
  const [connectedModel, setConnectedModel] = React.useState<string | null>(
    null
  );
  const [isMicActive, setIsMicActive] = React.useState(false);
  const [isHandsFree, setIsHandsFree] = React.useState(false);
  const [isQuackSpeaking, setIsQuackSpeaking] = React.useState(false);
  const [isQuackThinking, setIsQuackThinking] = React.useState(false);
  const [micLevel, setMicLevel] = React.useState(0);
  const [liveUserTranscript, setLiveUserTranscript] = React.useState("");
  const [liveQuackTranscript, setLiveQuackTranscript] = React.useState("");
  const [micError, setMicError] = React.useState<string | null>(null);

  const sessionRef = React.useRef<GeminiLiveFeynmanSession | null>(null);
  const recorderRef = React.useRef<LiveAudioRecorder | null>(null);
  const playerRef = React.useRef<LiveAudioPlayer | null>(null);
  const optionsRef = React.useRef(options);
  optionsRef.current = options;

  const isHandsFreeRef = React.useRef(false);
  isHandsFreeRef.current = isHandsFree;

  const micDesiredRef = React.useRef(false);
  const micStartTimeRef = React.useRef(0);
  const audioChunksSentRef = React.useRef(0);
  const hasSpeechAudioRef = React.useRef(false);
  const thinkingTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearThinkingTimeout = React.useCallback(() => {
    if (thinkingTimeoutRef.current) {
      clearTimeout(thinkingTimeoutRef.current);
      thinkingTimeoutRef.current = null;
    }
  }, []);

  const startThinkingWithTimeout = React.useCallback(() => {
    clearThinkingTimeout();
    setIsQuackThinking(true);
    thinkingTimeoutRef.current = setTimeout(() => {
      thinkingTimeoutRef.current = null;
      setIsQuackThinking(false);
    }, 10000);
  }, [clearThinkingTimeout]);

  const disconnectSession = React.useCallback(() => {
    micDesiredRef.current = false;
    clearThinkingTimeout();
    if (recorderRef.current) {
      recorderRef.current.stop();
      recorderRef.current = null;
    }
    if (playerRef.current) {
      playerRef.current.dispose();
      playerRef.current = null;
    }
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    setIsMicActive(false);
    setIsHandsFree(false);
    setIsQuackSpeaking(false);
    setIsQuackThinking(false);
    setMicLevel(0);
    setLiveUserTranscript("");
    setLiveQuackTranscript("");
    setConnectionStatus("idle");
  }, [clearThinkingTimeout]);

  React.useEffect(() => {
    return () => {
      disconnectSession();
    };
  }, [disconnectSession]);

  const connectSession = React.useCallback(
    async (
      topic: FeynmanTopic,
      subtopicScores?: Record<string, SubtopicScoreData>,
      activeSubtopicId?: string
    ): Promise<boolean> => {
      disconnectSession();
      setMicError(null);
      setConnectionStatus("connecting");

      const player = new LiveAudioPlayer((playing) => {
        setIsQuackSpeaking(playing);
      });
      playerRef.current = player;

      const session = new GeminiLiveFeynmanSession(topic, {
        onStatusChange: (status) => {
          setConnectionStatus(status);
        },
        onModelConnected: (model) => {
          setConnectedModel(model);
        },
        onUserTranscript: (text, isFinal) => {
          if (text.trim()) {
            hasSpeechAudioRef.current = true;
          }
          if (isFinal) {
            setLiveUserTranscript("");
            if (text.trim()) {
              optionsRef.current.onUserMessageFinalized(text.trim());
            }
          } else {
            setLiveUserTranscript(text);
          }
        },
        onQuackTranscript: (text, isFinal) => {
          clearThinkingTimeout();
          setIsQuackThinking(false);
          if (isFinal) {
            setLiveQuackTranscript("");
            if (text.trim()) {
              optionsRef.current.onQuackMessageFinalized(text.trim());
            }
          } else {
            setLiveQuackTranscript(text);
          }
        },
        onQuackAudioChunk: (base64Pcm24k) => {
          clearThinkingTimeout();
          setIsQuackThinking(false);
          playerRef.current?.enqueuePcm24k(base64Pcm24k);
        },
        onInterrupted: () => {
          clearThinkingTimeout();
          playerRef.current?.interrupt();
          setLiveQuackTranscript("");
          setIsQuackThinking(false);
        },
        onTurnComplete: () => {
          clearThinkingTimeout();
          setIsQuackThinking(false);
        },
        onEvaluation: (payload) => {
          optionsRef.current.onEvaluation(payload);
        },
        onError: (msg) => {
          optionsRef.current.onFallbackNeeded(msg);
        },
      });

      sessionRef.current = session;

      try {
        const model = await session.connect(
          topic,
          subtopicScores,
          activeSubtopicId
        );
        setConnectedModel(model);
        return true;
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : "No se pudo conectar con Gemini Live API.";
        console.warn("[useGeminiLiveFeynman] Fallback requerido:", msg);
        disconnectSession();
        optionsRef.current.onFallbackNeeded(msg);
        return false;
      }
    },
    [disconnectSession]
  );

  const startMic = React.useCallback(async () => {
    if (!sessionRef.current || sessionRef.current.getStatus() !== "connected") {
      return;
    }
    if (recorderRef.current?.isRecording()) return;

    // Barge-in local: silenciar a Quack al empezar a hablar
    playerRef.current?.interrupt();
    clearThinkingTimeout();
    setIsQuackThinking(false);
    setMicError(null);

    micDesiredRef.current = true;
    micStartTimeRef.current = Date.now();
    audioChunksSentRef.current = 0;
    hasSpeechAudioRef.current = false;

    const recorder = new LiveAudioRecorder();
    recorderRef.current = recorder;

    let lastSpeechTime = 0;
    let isStreamingSpeech = false;
    const SPEECH_THRESHOLD = 0.015;
    const SILENCE_HANGOVER_MS = 700;

    try {
      await recorder.start({
        onPcmChunk: (base64Pcm, level) => {
          if (!micDesiredRef.current) return;
          setMicLevel(level);

          const now = Date.now();
          if (level > SPEECH_THRESHOLD) {
            hasSpeechAudioRef.current = true;
            lastSpeechTime = now;
            isStreamingSpeech = true;
          }

          const withinHangover =
            lastSpeechTime > 0 && now - lastSpeechTime <= SILENCE_HANGOVER_MS;

          if (level > SPEECH_THRESHOLD || withinHangover) {
            audioChunksSentRef.current += 1;
            sessionRef.current?.sendAudioChunk(base64Pcm);
          } else if (isStreamingSpeech) {
            isStreamingSpeech = false;
            sessionRef.current?.endAudioStream();
          }
        },
        onError: (err) => {
          setMicError(err.message);
        },
      });

      // Si el usuario soltó el botón antes de que terminara getUserMedia
      if (!micDesiredRef.current) {
        recorder.stop();
        if (recorderRef.current === recorder) {
          recorderRef.current = null;
        }
        setIsMicActive(false);
        return;
      }

      setIsMicActive(true);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "No se pudo acceder al micrófono.";
      setMicError(msg);
      setIsMicActive(false);
      setIsHandsFree(false);
      micDesiredRef.current = false;
      recorder.stop();
      recorderRef.current = null;
    }
  }, [clearThinkingTimeout]);

  const stopMic = React.useCallback(() => {
    micDesiredRef.current = false;
    if (recorderRef.current) {
      recorderRef.current.stop();
      recorderRef.current = null;
    }
    setIsMicActive(false);
    setMicLevel(0);

    if (
      !isHandsFreeRef.current &&
      sessionRef.current?.getStatus() === "connected"
    ) {
      const pressDurationMs = Date.now() - micStartTimeRef.current;
      const hadChunks = audioChunksSentRef.current > 0;
      const hadSpeech = hasSpeechAudioRef.current;

      if (hadChunks) {
        sessionRef.current.endAudioStream();
      }

      if (!hadChunks || pressDurationMs < 250 || !hadSpeech) {
        setIsQuackThinking(false);
        setMicError("No se detectó voz. Mantén presionado el botón mientras hablas.");
        return;
      }

      startThinkingWithTimeout();
    }
  }, [startThinkingWithTimeout]);

  const toggleHandsFree = React.useCallback(async () => {
    if (isHandsFreeRef.current) {
      setIsHandsFree(false);
      if (recorderRef.current) {
        recorderRef.current.stop();
        recorderRef.current = null;
      }
      setIsMicActive(false);
      setMicLevel(0);
      sessionRef.current?.endAudioStream();
    } else {
      setIsHandsFree(true);
      await startMic();
    }
  }, [startMic]);

  const sendText = React.useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      if (sessionRef.current?.getStatus() === "connected") {
        playerRef.current?.interrupt();
        setMicError(null);
        startThinkingWithTimeout();
        optionsRef.current.onUserMessageFinalized(trimmed);
        sessionRef.current.sendTextMessage(trimmed);
      }
    },
    [startThinkingWithTimeout]
  );

  const stopQuackAudio = React.useCallback(() => {
    playerRef.current?.interrupt();
  }, []);

  return {
    connectionStatus,
    connectedModel,
    isMicActive,
    isHandsFree,
    isQuackSpeaking,
    isQuackThinking,
    micLevel,
    liveUserTranscript,
    liveQuackTranscript,
    micError,
    connectSession,
    disconnectSession,
    startMic,
    stopMic,
    toggleHandsFree,
    sendText,
    stopQuackAudio,
  };
}
