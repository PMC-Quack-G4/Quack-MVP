/**
 * Utilidades Web Audio API para captura de micrófono (PCM 16 kHz mono)
 * y reproducción gapless de audio nativo de Gemini Live (PCM 24 kHz mono).
 */

const TARGET_INPUT_SAMPLE_RATE = 16000;
const OUTPUT_SAMPLE_RATE = 24000;

/**
 * Convierte un ArrayBuffer en base64 sin desbordar la pila de llamadas.
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = "";
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const slice = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...slice);
  }
  return btoa(binary);
}

/**
 * Decodifica una cadena base64 PCM 16-bit little-endian a Int16Array.
 */
export function base64ToInt16Array(base64: string): Int16Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Int16Array(bytes.buffer);
}

/**
 * Remuestrea audio Float32 de cualquier frecuencia a PCM Int16 de 16 kHz.
 */
export function downsampleTo16kHz(
  input: Float32Array,
  inputSampleRate: number
): Int16Array {
  if (inputSampleRate === TARGET_INPUT_SAMPLE_RATE) {
    const out = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return out;
  }

  const ratio = inputSampleRate / TARGET_INPUT_SAMPLE_RATE;
  const outputLength = Math.max(1, Math.round(input.length / ratio));
  const output = new Int16Array(outputLength);

  let offsetResult = 0;
  let offsetBuffer = 0;
  while (offsetResult < outputLength) {
    const nextOffsetBuffer = Math.min(
      input.length,
      Math.round((offsetResult + 1) * ratio)
    );
    let accum = 0;
    let count = 0;
    for (let i = offsetBuffer; i < nextOffsetBuffer; i++) {
      accum += input[i];
      count++;
    }
    const sample = count > 0 ? accum / count : 0;
    const clamped = Math.max(-1, Math.min(1, sample));
    output[offsetResult] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
    offsetResult++;
    offsetBuffer = nextOffsetBuffer;
  }

  return output;
}

function computeRmsLevel(samples: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < samples.length; i++) {
    sum += samples[i] * samples[i];
  }
  const rms = Math.sqrt(sum / Math.max(1, samples.length));
  return Math.min(1, rms * 4);
}

const WORKLET_PROCESSOR_CODE = `
class QuackPcmCaptureProcessor extends AudioWorkletProcessor {
  process(inputs) {
    const input = inputs[0];
    if (input && input[0] && input[0].length > 0) {
      this.port.postMessage(input[0].slice());
    }
    return true;
  }
}
registerProcessor("quack-pcm-capture", QuackPcmCaptureProcessor);
`;

export interface LiveAudioRecorderCallbacks {
  onPcmChunk: (base64Pcm: string, level: number) => void;
  onError?: (err: Error) => void;
}

/**
 * Captura audio del micrófono en tiempo real y emite chunks PCM 16 kHz en base64.
 */
export class LiveAudioRecorder {
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private workletNode: AudioWorkletNode | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private workletBlobUrl: string | null = null;
  private active = false;

  isRecording(): boolean {
    return this.active;
  }

  async start(callbacks: LiveAudioRecorderCallbacks): Promise<void> {
    if (this.active) return;

    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      throw new Error(
        "El navegador no soporta captura de micrófono (getUserMedia)."
      );
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const audioContext = new AudioCtx();
    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }

    const sourceNode = audioContext.createMediaStreamSource(stream);
    const inputSampleRate = audioContext.sampleRate;
    const chunkTargetSamples = Math.max(1024, Math.round(inputSampleRate * 0.1)); // ~100ms chunks
    let pendingBuffer: number[] = [];

    const emitSamples = (floatSamples: Float32Array) => {
      if (!this.active) return;
      for (let i = 0; i < floatSamples.length; i++) {
        pendingBuffer.push(floatSamples[i]);
      }
      if (pendingBuffer.length < chunkTargetSamples) return;

      const chunk = new Float32Array(pendingBuffer);
      pendingBuffer = [];
      const level = computeRmsLevel(chunk);
      const pcm16 = downsampleTo16kHz(chunk, inputSampleRate);
      const base64 = arrayBufferToBase64(pcm16.buffer as ArrayBuffer);
      callbacks.onPcmChunk(base64, level);
    };

    this.stream = stream;
    this.audioContext = audioContext;
    this.sourceNode = sourceNode;
    this.active = true;

    try {
      if (audioContext.audioWorklet) {
        const blob = new Blob([WORKLET_PROCESSOR_CODE], {
          type: "application/javascript",
        });
        this.workletBlobUrl = URL.createObjectURL(blob);
        await audioContext.audioWorklet.addModule(this.workletBlobUrl);
        const workletNode = new AudioWorkletNode(
          audioContext,
          "quack-pcm-capture"
        );
        workletNode.port.onmessage = (event: MessageEvent<Float32Array>) => {
          emitSamples(event.data);
        };
        sourceNode.connect(workletNode);
        const silentGain = audioContext.createGain();
        silentGain.gain.value = 0;
        workletNode.connect(silentGain);
        silentGain.connect(audioContext.destination);
        this.workletNode = workletNode;
        return;
      }
    } catch (workletErr) {
      console.warn(
        "[LiveAudioRecorder] AudioWorklet no disponible, usando ScriptProcessor fallback:",
        workletErr
      );
    }

    // Fallback compatible con navegadores sin AudioWorklet
    const processor = audioContext.createScriptProcessor(2048, 1, 1);
    processor.onaudioprocess = (event: AudioProcessingEvent) => {
      const channelData = event.inputBuffer.getChannelData(0);
      emitSamples(channelData);
    };
    sourceNode.connect(processor);
    const silentGain = audioContext.createGain();
    silentGain.gain.value = 0;
    processor.connect(silentGain);
    silentGain.connect(audioContext.destination);
    this.scriptProcessor = processor;
  }

  stop(): void {
    this.active = false;

    if (this.workletNode) {
      try {
        this.workletNode.port.onmessage = null;
        this.workletNode.disconnect();
      } catch {
        // No-op
      }
      this.workletNode = null;
    }

    if (this.scriptProcessor) {
      try {
        this.scriptProcessor.onaudioprocess = null;
        this.scriptProcessor.disconnect();
      } catch {
        // No-op
      }
      this.scriptProcessor = null;
    }

    if (this.sourceNode) {
      try {
        this.sourceNode.disconnect();
      } catch {
        // No-op
      }
      this.sourceNode = null;
    }

    if (this.stream) {
      for (const track of this.stream.getTracks()) {
        track.stop();
      }
      this.stream = null;
    }

    if (this.audioContext) {
      void this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }

    if (this.workletBlobUrl) {
      URL.revokeObjectURL(this.workletBlobUrl);
      this.workletBlobUrl = null;
    }
  }
}

/**
 * Reproductor Web Audio API para chunks PCM 24 kHz devueltos por Gemini Live.
 * Soporta reproducción continua sin cortes e interrupción inmediata (barge-in).
 */
export class LiveAudioPlayer {
  private audioContext: AudioContext | null = null;
  private nextPlayTime = 0;
  private activeSources = new Set<AudioBufferSourceNode>();
  private onPlaybackChange?: (isPlaying: boolean) => void;

  constructor(onPlaybackChange?: (isPlaying: boolean) => void) {
    this.onPlaybackChange = onPlaybackChange;
  }

  private ensureContext(): AudioContext {
    if (!this.audioContext || this.audioContext.state === "closed") {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      this.audioContext = new AudioCtx({ sampleRate: OUTPUT_SAMPLE_RATE });
    }
    if (this.audioContext.state === "suspended") {
      void this.audioContext.resume();
    }
    return this.audioContext;
  }

  enqueuePcm24k(base64Pcm: string): void {
    if (!base64Pcm) return;
    const ctx = this.ensureContext();
    const int16 = base64ToInt16Array(base64Pcm);
    if (int16.length === 0) return;

    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) {
      float32[i] = int16[i] / 32768;
    }

    const buffer = ctx.createBuffer(1, float32.length, OUTPUT_SAMPLE_RATE);
    buffer.getChannelData(0).set(float32);

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);

    const now = ctx.currentTime;
    const startAt = Math.max(now + 0.015, this.nextPlayTime);
    this.nextPlayTime = startAt + buffer.duration;

    const wasEmpty = this.activeSources.size === 0;
    this.activeSources.add(source);
    if (wasEmpty) {
      this.onPlaybackChange?.(true);
    }

    source.onended = () => {
      this.activeSources.delete(source);
      if (this.activeSources.size === 0) {
        this.nextPlayTime = 0;
        this.onPlaybackChange?.(false);
      }
    };

    source.start(startAt);
  }

  interrupt(): void {
    for (const source of this.activeSources) {
      try {
        source.onended = null;
        source.stop();
        source.disconnect();
      } catch {
        // No-op
      }
    }
    this.activeSources.clear();
    this.nextPlayTime = 0;
    this.onPlaybackChange?.(false);
  }

  dispose(): void {
    this.interrupt();
    if (this.audioContext && this.audioContext.state !== "closed") {
      void this.audioContext.close().catch(() => {});
    }
    this.audioContext = null;
  }
}
