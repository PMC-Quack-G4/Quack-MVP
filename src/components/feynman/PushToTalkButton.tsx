import * as React from "react";
import { Mic, MicOff, Loader2, Volume2, Keyboard, Radio } from "lucide-react";

export interface PushToTalkButtonProps {
  isListening: boolean;
  isProcessing: boolean;
  disabled?: boolean;
  micLevel?: number;
  isHandsFree?: boolean;
  onToggleHandsFree?: () => void;
  onStartTalk: () => void;
  onEndTalk: () => void;
  onEnableTextInput?: () => void;
}

/**
 * Botón principal Push-to-Talk (PTT) y modo Conversación en Vivo para el Método Feynman Oral.
 * Soporta PTT clásico (mantener presionado) y modo manos libres continuo con Gemini Live.
 */
export const PushToTalkButton: React.FC<PushToTalkButtonProps> = ({
  isListening,
  isProcessing,
  disabled = false,
  micLevel = 0,
  isHandsFree = false,
  onToggleHandsFree,
  onStartTalk,
  onEndTalk,
  onEnableTextInput,
}) => {
  const isInteractingRef = React.useRef(false);

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (disabled || isProcessing) return;
    if (isHandsFree && onToggleHandsFree) {
      e.preventDefault();
      void onToggleHandsFree();
      return;
    }
    e.preventDefault();
    isInteractingRef.current = true;
    onStartTalk();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (isHandsFree) return;
    if (isInteractingRef.current) {
      e.preventDefault();
      isInteractingRef.current = false;
      onEndTalk();
    }
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (isHandsFree) return;
    if (isInteractingRef.current) {
      e.preventDefault();
      isInteractingRef.current = false;
      onEndTalk();
    }
  };

  // Soporte de accesibilidad por teclado (mantener presionada la barra espaciadora)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (isHandsFree) return;
    if (e.code === "Space" && !isListening && !isProcessing && !disabled) {
      e.preventDefault();
      isInteractingRef.current = true;
      onStartTalk();
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (isHandsFree) return;
    if (e.code === "Space" && isInteractingRef.current) {
      e.preventDefault();
      isInteractingRef.current = false;
      onEndTalk();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {/* Contenedor relativo para halos luminosos */}
      <div className="relative flex items-center justify-center">
        {/* Onda expansiva de escucha activa reactiva al nivel del micrófono */}
        {isListening && (
          <>
            <span
              className="absolute h-28 w-28 sm:h-32 sm:w-32 rounded-full bg-quack-amber/40 animate-ping"
              style={micLevel > 0 ? { transform: `scale(${1 + micLevel * 0.35})` } : undefined}
            />
            <span
              className="absolute h-36 w-36 sm:h-40 sm:w-40 rounded-full bg-quack-sandy/20 animate-pulse"
              style={micLevel > 0 ? { transform: `scale(${1 + micLevel * 0.25})` } : undefined}
            />
          </>
        )}

        <button
          type="button"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerCancel}
          onPointerCancel={handlePointerCancel}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          disabled={disabled || isProcessing}
          aria-label={
            isHandsFree
              ? "Conversación en vivo activa, haz clic para silenciar micrófono"
              : isListening
              ? "Escuchando explicación oral, suelta para enviar"
              : isProcessing
              ? "Quack está reflexionando"
              : "Mantén presionado para hablar con Quack"
          }
          className={`relative z-10 flex h-24 w-24 sm:h-28 sm:w-28 flex-col items-center justify-center rounded-full border-4 shadow-xl transition-all duration-200 select-none cursor-pointer outline-none focus-visible:ring-4 focus-visible:ring-quack-amber ${
            isListening
              ? "scale-105 border-quack-caramel bg-gradient-to-br from-quack-amber via-quack-sandy to-quack-caramel text-white shadow-quack-amber/50 shadow-2xl"
              : isProcessing
              ? "border-amber-300 bg-amber-50 text-quack-gunmetal cursor-wait"
              : "border-quack-amber bg-quack-amber hover:bg-amber-400 text-quack-gunmetal hover:scale-105 active:scale-95 shadow-amber-300/40"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {isProcessing ? (
            <div className="flex flex-col items-center gap-1">
              <Loader2 className="h-8 w-8 animate-spin text-quack-caramel" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-quack-gunmetal">
                Pensando
              </span>
            </div>
          ) : isListening ? (
            <div className="flex flex-col items-center gap-1">
              {/* Animación de barras de audio en tiempo real */}
              <div className="flex items-center gap-1 h-6">
                <span className="w-1 bg-white rounded-full h-3 animate-pulse" />
                <span className="w-1 bg-white rounded-full h-6 animate-pulse [animation-delay:150ms]" />
                <span className="w-1 bg-white rounded-full h-4 animate-pulse [animation-delay:300ms]" />
                <span className="w-1 bg-white rounded-full h-5 animate-pulse [animation-delay:450ms]" />
              </div>
              <span className="text-[10px] font-bold tracking-wider text-white uppercase">
                {isHandsFree ? "En Vivo" : "Suelta"}
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <Mic className="h-8 w-8 text-quack-gunmetal" />
              <span className="text-[11px] font-brand font-bold text-quack-gunmetal tracking-tight">
                Hablar
              </span>
            </div>
          )}
        </button>
      </div>

      {/* Rótulo de estado interactivo */}
      <div className="mt-4 text-center">
        {isListening ? (
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 border border-amber-300 px-4 py-1.5 text-xs font-semibold text-amber-900 animate-pulse">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
            {isHandsFree
              ? "Conversación en vivo con Quack... Habla con naturalidad (clic para pausar)"
              : "Escuchando tu explicación... Suelta para enviar a Quack"}
          </div>
        ) : isProcessing ? (
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 border border-slate-300 px-4 py-1.5 text-xs font-medium text-slate-700">
            <Volume2 className="h-3.5 w-3.5 text-quack-caramel animate-bounce" />
            Quack está reflexionando sobre lo dicho...
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs font-medium text-slate-600">
              <span className="font-semibold text-quack-gunmetal">Mantén presionado</span> con el ratón, dedo o barra espaciadora para hablar.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-0.5">
              {onToggleHandsFree && (
                <button
                  type="button"
                  onClick={() => void onToggleHandsFree()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 transition-all active:scale-95 shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                  aria-label="Activar conversación continua en vivo"
                  title="Habla con Quack sin mantener presionado el botón (detección automática de voz)"
                >
                  <Radio className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Conversación Continua</span>
                </button>
              )}

              {onEnableTextInput && (
                <button
                  type="button"
                  onClick={onEnableTextInput}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-slate-600 hover:text-quack-gunmetal bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all hover:border-amber-300 active:scale-95 shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-quack-amber"
                  aria-label="Habilitar opción por texto"
                  title="Habilitar opción para escribir tu explicación por texto"
                >
                  <Keyboard className="h-3.5 w-3.5 text-quack-caramel" />
                  <span>Habilitar opción por texto</span>
                </button>
              )}
            </div>
          </div>
        )}

        {isListening && isHandsFree && onToggleHandsFree && (
          <div className="mt-2">
            <button
              type="button"
              onClick={() => void onToggleHandsFree()}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all"
            >
              <MicOff className="h-3.5 w-3.5" />
              <span>Pausar micrófono continuo</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
