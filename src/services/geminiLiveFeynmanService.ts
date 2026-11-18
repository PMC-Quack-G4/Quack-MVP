import {
  GoogleGenAI,
  Modality,
  Type,
  type LiveServerMessage,
  type Session,
  type Tool,
} from "@google/genai";
import { FeynmanTopic, SubtopicScoreData } from "@/types/feynman";
import { getActiveLiveModel } from "@/lib/aiConfig";

export type LiveConnectionStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "error"
  | "closed";

export interface LiveFeynmanEvaluationPayload {
  unlockedSubtopicIds: string[];
  partialSubtopicIds: string[];
  failedSubtopicIds: string[];
  nextActiveSubtopicId?: string;
  isSessionFinished: boolean;
}

export interface GeminiLiveSessionCallbacks {
  onStatusChange?: (status: LiveConnectionStatus) => void;
  onModelConnected?: (model: string) => void;
  onUserTranscript?: (text: string, isFinal: boolean) => void;
  onQuackTranscript?: (text: string, isFinal: boolean) => void;
  onQuackAudioChunk?: (base64Pcm24k: string) => void;
  onInterrupted?: () => void;
  onTurnComplete?: () => void;
  onEvaluation?: (payload: LiveFeynmanEvaluationPayload) => void;
  onError?: (message: string) => void;
}

const EVALUATION_TOOL: Tool = {
  functionDeclarations: [
    {
      name: "report_feynman_evaluation",
      description:
        "Actualiza el progreso del estudiante en el tablero de subconceptos cuando domina uno o varios subtemas (100%), alcanza el límite de 3 intentos con dominio parcial (50%) o fallido (0%), cambia al siguiente subtema o finaliza la sesión.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          unlockedSubtopicIds: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description:
              "IDs de subconceptos que el estudiante explicó con claridad y rigor conceptual (100%).",
          },
          partialSubtopicIds: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description:
              "IDs de subconceptos con entendimiento medio (50%) tras agotar 3 intentos.",
          },
          failedSubtopicIds: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description:
              "IDs de subconceptos no dominados (0%) tras agotar 3 intentos.",
          },
          nextActiveSubtopicId: {
            type: Type.STRING,
            description: "ID del siguiente subconcepto pendiente por evaluar.",
          },
          isSessionFinished: {
            type: Type.BOOLEAN,
            description:
              "true cuando todos los subconceptos del temario han sido evaluados.",
          },
        },
      },
    },
  ],
};

function buildLiveSystemInstruction(
  topic: FeynmanTopic,
  subtopicScores?: Record<string, SubtopicScoreData>,
  activeSubtopicId?: string
): string {
  const currentActive = activeSubtopicId || topic.subtopics[0]?.id || "";
  const subtopicsList = topic.subtopics
    .map((s) => {
      const score = subtopicScores?.[s.id];
      const statusText = score
        ? `${score.status.toUpperCase()} (${score.score}%)`
        : "PENDING";
      const isCurrent = s.id === currentActive ? " [SUBCONCEPTO ACTIVO INICIAL]" : "";
      return `- ID: "${s.id}" | Nombre: "${s.name}" | Descripción: "${s.description || ""}" | Estado: ${statusText}${isCurrent}`;
    })
    .join("\n");

  return `Eres Quack, alumna universitaria curiosa y algo despistada. El usuario es tu profesor: NUNCA expliques teoría ni des respuestas; haz contrapreguntas socráticas cortas en español latinoamericano (máximo 2-3 oraciones, sin Markdown ni JSON).

Tema: "${topic.title}" (${topic.category}).
Contexto: ${topic.promptContext}
Subconceptos:
${subtopicsList}

Reglas:
1. Si tu profe comete un error o falacia, NUNCA lo valides; muestra perplejidad y haz una pregunta socrática corta.
2. Si domina uno o varios subconceptos con rigor, desbloquéalos todos en "report_feynman_evaluation" ("unlockedSubtopicIds").
3. Máximo 3 intentos por subconcepto: al 3er intento fallido, califícalo en "partialSubtopicIds" (50%) o "failedSubtopicIds" (0%), pasa "nextActiveSubtopicId" al siguiente pendiente y cambia de tema en voz alta.
4. Llama siempre a "report_feynman_evaluation" al cambiar el estado de cualquier subconcepto o al terminar todos ("isSessionFinished": true).`;
}

/**
 * Sesión bidireccional en tiempo real con Gemini Live API (@google/genai `ai.live.connect`).
 * Soporta audio nativo de entrada/salida, transcripción en vivo, barge-in y function calling.
 */
export class GeminiLiveFeynmanSession {
  private session: Session | null = null;
  private status: LiveConnectionStatus = "idle";
  private callbacks: GeminiLiveSessionCallbacks;
  private validSubtopicIds: Set<string>;
  private activeModelName = "";

  private currentUserTranscript = "";
  private currentQuackTranscript = "";

  constructor(topic: FeynmanTopic, callbacks: GeminiLiveSessionCallbacks) {
    this.callbacks = callbacks;
    this.validSubtopicIds = new Set(topic.subtopics.map((s) => s.id));
  }

  private setStatus(next: LiveConnectionStatus) {
    this.status = next;
    this.callbacks.onStatusChange?.(next);
  }

  getStatus(): LiveConnectionStatus {
    return this.status;
  }

  getModelName(): string {
    return this.activeModelName;
  }

  async connect(
    topic: FeynmanTopic,
    subtopicScores?: Record<string, SubtopicScoreData>,
    activeSubtopicId?: string
  ): Promise<string> {
    this.setStatus("connecting");

    const tokenRes = await fetch("/api/ai/live-token", {
      method: "POST",
      headers: { Accept: "application/json" },
    });

    if (!tokenRes.ok) {
      let errMsg = "No se pudo obtener un token efímero para Gemini Live.";
      try {
        const payload = (await tokenRes.json()) as { error?: string };
        if (payload.error) errMsg = payload.error;
      } catch {
        // Ignore non-JSON error body
      }
      this.setStatus("error");
      throw new Error(errMsg);
    }

    const tokenPayload = (await tokenRes.json()) as {
      token?: string;
      liveModel?: string;
    };
    const ephemeralToken = tokenPayload.token?.trim();
    if (!ephemeralToken) {
      this.setStatus("error");
      throw new Error("El servidor no devolvió un token efímero válido para Gemini Live.");
    }

    const client = new GoogleGenAI({
      apiKey: ephemeralToken,
      httpOptions: { apiVersion: "v1alpha" },
    });
    const systemInstruction = buildLiveSystemInstruction(
      topic,
      subtopicScores,
      activeSubtopicId
    );

    const primaryLiveModel = tokenPayload.liveModel?.trim() || getActiveLiveModel();
    const candidateModels = Array.from(
      new Set([
        primaryLiveModel,
        "gemini-2.5-flash-native-audio-preview-12-2025",
        "gemini-2.5-flash-native-audio-preview-09-2025",
        "gemini-live-2.5-flash-preview",
      ])
    ).filter(Boolean);

    let lastError: unknown = null;

    for (const model of candidateModels) {
      try {
        const session = await client.live.connect({
          model,
          config: {
            responseModalities: [Modality.AUDIO],
            systemInstruction,
            temperature: 0.7,
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: "Aoede",
                },
              },
            },
            inputAudioTranscription: {},
            outputAudioTranscription: {},
            contextWindowCompression: {
              triggerTokens: "6000",
              slidingWindow: {
                targetTokens: "3000",
              },
            },
            tools: [EVALUATION_TOOL],
          },
          callbacks: {
            onopen: () => {
              this.setStatus("connected");
            },
            onmessage: (message: LiveServerMessage) => {
              this.handleServerMessage(message);
            },
            onerror: (errEvent: ErrorEvent) => {
              const msg =
                errEvent?.message ||
                "Error en la conexión WebSocket con Gemini Live.";
              console.warn("[GeminiLive] Error de socket:", errEvent);
              this.setStatus("error");
              this.callbacks.onError?.(msg);
            },
            onclose: () => {
              if (this.status !== "closed") {
                this.setStatus("closed");
              }
            },
          },
        });

        this.session = session;
        this.activeModelName = model;
        this.setStatus("connected");
        this.callbacks.onModelConnected?.(model);
        return model;
      } catch (err) {
        console.warn(`[GeminiLive] Falló conexión con modelo ${model}:`, err);
        lastError = err;
      }
    }

    this.setStatus("error");
    throw (
      lastError ||
      new Error("No se pudo establecer conexión con Gemini Live API.")
    );
  }

  private handleServerMessage(message: LiveServerMessage): void {
    const serverContent = message.serverContent;

    if (serverContent) {
      if (serverContent.interrupted) {
        this.currentQuackTranscript = "";
        this.callbacks.onInterrupted?.();
      }

      // Audio nativo devuelto por Gemini Live
      const parts = serverContent.modelTurn?.parts;
      if (parts && parts.length > 0) {
        for (const part of parts) {
          if (part.inlineData?.data) {
            this.callbacks.onQuackAudioChunk?.(part.inlineData.data);
          }
        }
      }

      // Transcripción en vivo del estudiante
      const inputText =
        serverContent.inputTranscription?.text ??
        serverContent.interimInputTranscription?.text;
      if (typeof inputText === "string" && inputText.length > 0) {
        const isInterim = Boolean(
          serverContent.interimInputTranscription?.text &&
            !serverContent.inputTranscription?.text
        );
        if (!isInterim) {
          this.currentUserTranscript = this.mergeTranscriptChunk(
            this.currentUserTranscript,
            inputText
          );
          this.callbacks.onUserTranscript?.(this.currentUserTranscript, false);
        } else {
          this.callbacks.onUserTranscript?.(
            this.mergeTranscriptChunk(this.currentUserTranscript, inputText),
            false
          );
        }
      }

      // Transcripción en vivo de Quack
      const outputText = serverContent.outputTranscription?.text;
      if (typeof outputText === "string" && outputText.length > 0) {
        this.currentQuackTranscript = this.mergeTranscriptChunk(
          this.currentQuackTranscript,
          outputText
        );
        this.callbacks.onQuackTranscript?.(this.currentQuackTranscript, false);
      }

      if (serverContent.turnComplete) {
        if (this.currentUserTranscript.trim()) {
          this.callbacks.onUserTranscript?.(
            this.currentUserTranscript.trim(),
            true
          );
          this.currentUserTranscript = "";
        }
        if (this.currentQuackTranscript.trim()) {
          this.callbacks.onQuackTranscript?.(
            this.currentQuackTranscript.trim(),
            true
          );
          this.currentQuackTranscript = "";
        }
        this.callbacks.onTurnComplete?.();
      }
    }

    // Tool calls en tiempo real para actualizar checklist de subconceptos
    if (message.toolCall?.functionCalls?.length) {
      const functionResponses = [];

      for (const call of message.toolCall.functionCalls) {
        if (call.name === "report_feynman_evaluation") {
          const args = (call.args || {}) as Record<string, unknown>;
          const filterIds = (val: unknown): string[] =>
            Array.isArray(val)
              ? val.filter(
                  (id): id is string =>
                    typeof id === "string" && this.validSubtopicIds.has(id)
                )
              : [];

          const payload: LiveFeynmanEvaluationPayload = {
            unlockedSubtopicIds: filterIds(args.unlockedSubtopicIds),
            partialSubtopicIds: filterIds(args.partialSubtopicIds),
            failedSubtopicIds: filterIds(args.failedSubtopicIds),
            nextActiveSubtopicId:
              typeof args.nextActiveSubtopicId === "string" &&
              this.validSubtopicIds.has(args.nextActiveSubtopicId)
                ? args.nextActiveSubtopicId
                : undefined,
            isSessionFinished: Boolean(args.isSessionFinished),
          };

          this.callbacks.onEvaluation?.(payload);

          functionResponses.push({
            id: call.id,
            name: call.name,
            response: { result: "ok" },
          });
        }
      }

      if (functionResponses.length > 0 && this.session) {
        try {
          this.session.sendToolResponse({ functionResponses });
        } catch (err) {
          console.warn("[GeminiLive] Error al enviar toolResponse:", err);
        }
      }
    }
  }

  private mergeTranscriptChunk(existing: string, incoming: string): string {
    if (!existing) return incoming;
    if (!incoming) return existing;
    if (incoming.startsWith(existing)) return incoming;
    return `${existing}${incoming}`;
  }

  sendAudioChunk(base64Pcm16k: string): void {
    if (!this.session || this.status !== "connected") return;
    try {
      this.session.sendRealtimeInput({
        audio: {
          data: base64Pcm16k,
          mimeType: "audio/pcm;rate=16000",
        },
      });
    } catch (err) {
      console.warn("[GeminiLive] Error enviando audio PCM:", err);
    }
  }

  endAudioStream(): void {
    if (!this.session || this.status !== "connected") return;
    try {
      this.session.sendRealtimeInput({ audioStreamEnd: true });
    } catch {
      // No-op
    }
  }

  sendTextMessage(text: string): void {
    if (!this.session || this.status !== "connected" || !text.trim()) return;
    try {
      this.session.sendClientContent({
        turns: [{ role: "user", parts: [{ text: text.trim() }] }],
        turnComplete: true,
      });
    } catch (err) {
      console.warn("[GeminiLive] Error enviando texto a Live:", err);
    }
  }

  close(): void {
    this.setStatus("closed");
    if (this.session) {
      try {
        this.session.close();
      } catch {
        // No-op
      }
      this.session = null;
    }
    this.currentUserTranscript = "";
    this.currentQuackTranscript = "";
  }
}
