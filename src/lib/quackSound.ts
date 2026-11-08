import { trackEvent } from "@/lib/analytics";

let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;
  if (!sharedAudioCtx) {
    sharedAudioCtx = new AudioCtx();
  }
  if (sharedAudioCtx.state === "suspended") {
    void sharedAudioCtx.resume();
  }
  return sharedAudioCtx;
}

/**
 * Reproduce un sonido sintetizado de patito ("¡Quack! 🦆") usando Web Audio API.
 * Cero dependencias externas, 0 KB de red y respuesta instantánea.
 */
export function playQuackSound(source = "duck_logo"): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Oscilador principal con timbre nasal (sawtooth filtrado con formant sweep)
    const osc = ctx.createOscillator();
    const subOsc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = "sawtooth";
    subOsc.type = "triangle";

    // Curva de tono característica de un "cuac" (sube rápido y cae con inflexión)
    osc.frequency.setValueAtTime(310, now);
    osc.frequency.exponentialRampToValueAtTime(620, now + 0.055);
    osc.frequency.exponentialRampToValueAtTime(420, now + 0.14);
    osc.frequency.exponentialRampToValueAtTime(250, now + 0.24);

    subOsc.frequency.setValueAtTime(155, now);
    subOsc.frequency.exponentialRampToValueAtTime(310, now + 0.055);
    subOsc.frequency.exponentialRampToValueAtTime(190, now + 0.24);

    // Filtro pasa-banda vocal ("wah" del pico del pato)
    filter.type = "bandpass";
    filter.Q.setValueAtTime(4.5, now);
    filter.frequency.setValueAtTime(850, now);
    filter.frequency.exponentialRampToValueAtTime(1850, now + 0.06);
    filter.frequency.exponentialRampToValueAtTime(920, now + 0.24);

    // Envolvente de volumen percusiva y limpia
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.28, now + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.16, now + 0.12);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.26);

    osc.connect(filter);
    subOsc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    subOsc.start(now);
    osc.stop(now + 0.27);
    subOsc.stop(now + 0.27);

    trackEvent("quack_easter_egg", { source });
  } catch {
    // Si el navegador bloquea el audio, fallamos en silencio sin afectar la UI.
  }
}
