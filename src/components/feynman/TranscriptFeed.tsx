import * as React from "react";
import { Volume2, VolumeX, User, Sparkles } from "lucide-react";
import { ChatMessage } from "@/types/feynman";
import { MathRenderer } from "@/components/common/MathRenderer";
import { Button } from "@/components/ui/button";

export interface TranscriptFeedProps {
  messages: ChatMessage[];
  isListening: boolean;
  interimTranscript: string;
  isSpeaking: boolean;
  currentSpeakingId: string | null;
  onPlayAudio: (text: string, id: string) => void;
  onStopAudio: () => void;
  initialTopicName: string;
  isProcessing?: boolean;
}

export const TranscriptFeed: React.FC<TranscriptFeedProps> = ({
  messages,
  isListening,
  interimTranscript,
  isSpeaking,
  currentSpeakingId,
  onPlayAudio,
  onStopAudio,
  initialTopicName,
  isProcessing = false,
}) => {
  const bottomRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, interimTranscript, isListening, isProcessing]);

  // Helper para renderizar texto que pueda contener bloques LaTeX inline estilo $f(x)$ o $$f(x)$$
  const renderMessageContent = (text: string) => {
    // Si contiene delimitadores de LaTeX tipo $...$ o $$...$$
    if (text.includes("$")) {
      const parts = text.split(/(\$\$[\s\S]*?\$\$|\$[^\$]*?\$)/g);
      return (
        <span>
          {parts.map((part, idx) => {
            if (part.startsWith("$$") && part.endsWith("$$")) {
              const math = part.slice(2, -2);
              return <MathRenderer key={idx} math={math} block />;
            } else if (part.startsWith("$") && part.endsWith("$")) {
              const math = part.slice(1, -1);
              return <MathRenderer key={idx} math={math} />;
            }
            return <span key={idx}>{part}</span>;
          })}
        </span>
      );
    }
    return <span>{text}</span>;
  };

  return (
    <div className="flex flex-col h-[460px] rounded-2xl border border-slate-200 bg-slate-50/50 overflow-hidden shadow-inner">
      {/* Feed Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {/* Mensaje de bienvenida inicial de Quack */}
        <div className="flex gap-3 items-start max-w-[85%] sm:max-w-[75%]">
          <div className="h-9 w-9 rounded-full bg-quack-dandelion border border-quack-amber flex items-center justify-center p-1 shrink-0 shadow-sm">
            <img src="/brand/quack-logo.png" alt="Quack Avatar" className="h-7 w-7 object-contain" />
          </div>
          <div className="rounded-2xl rounded-tl-sm bg-white border border-amber-200 p-4 shadow-sm text-sm text-slate-800 space-y-2">
            <div className="flex items-center justify-between gap-2 border-b pb-1.5">
              <span className="font-brand font-bold text-xs text-quack-gunmetal flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-quack-caramel" />
                Quack (Tu Alumna)
              </span>
              <span className="text-[10px] text-slate-400">Inicio</span>
            </div>
            <p>
              ¡Hola profe! Tengo muchas ganas de aprender sobre{" "}
              <strong className="text-quack-caramel">{initialTopicName}</strong>, pero la verdad no entiendo nada de la teoría. ¿Podrías explicármelo como si fueras mi tutor personal? ¡Usa tus propias palabras!
            </p>
          </div>
        </div>

        {/* Mensajes del diálogo */}
        {messages.map((message) => {
          const isStudent = message.sender === "student";
          const isPlayingThis = isSpeaking && currentSpeakingId === message.id;

          if (isStudent) {
            return (
              <div key={message.id} className="flex gap-2.5 items-start justify-end max-w-[85%] sm:max-w-[75%] ml-auto">
                <div className="rounded-2xl rounded-tr-sm bg-quack-gunmetal text-white p-4 shadow-sm text-sm space-y-1.5">
                  <div className="flex items-center justify-between gap-3 border-b border-white/20 pb-1">
                    <span className="font-semibold text-xs text-quack-dandelion flex items-center gap-1">
                      <User className="h-3 w-3" />
                      Tú (Profesor)
                    </span>
                    <span className="text-[10px] text-slate-300">
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <div className="leading-relaxed">{renderMessageContent(message.text)}</div>
                </div>
              </div>
            );
          }

          return (
            <div key={message.id} className="flex gap-3 items-start max-w-[85%] sm:max-w-[75%]">
              <div className="h-9 w-9 rounded-full bg-quack-dandelion border border-quack-amber flex items-center justify-center p-1 shrink-0 shadow-sm">
                <img src="/brand/quack-logo.png" alt="Quack Avatar" className="h-7 w-7 object-contain" />
              </div>
              <div className="rounded-2xl rounded-tl-sm bg-white border border-amber-200/80 p-4 shadow-sm text-sm text-slate-800 space-y-2">
                <div className="flex items-center justify-between gap-3 border-b pb-1.5">
                  <span className="font-brand font-bold text-xs text-quack-gunmetal flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-quack-caramel" />
                    Quack (Repregunta socrática)
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (isPlayingThis) {
                          onStopAudio();
                        } else {
                          onPlayAudio(message.text, message.id);
                        }
                      }}
                      className={`h-6 px-2 text-xs gap-1 rounded-md transition-colors ${
                        isPlayingThis
                          ? "bg-amber-100 text-amber-900 border border-amber-300"
                          : "text-slate-500 hover:text-quack-gunmetal hover:bg-slate-100"
                      }`}
                      title={isPlayingThis ? "Detener locución" : "Volver a escuchar audio"}
                    >
                      {isPlayingThis ? (
                        <>
                          <VolumeX className="h-3.5 w-3.5 text-amber-700 animate-pulse" />
                          <span className="font-medium text-[11px]">Detener</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="h-3.5 w-3.5" />
                          <span className="font-medium text-[11px]">Escuchar</span>
                        </>
                      )}
                    </Button>
                    <span className="text-[10px] text-slate-400">
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
                <div className="leading-relaxed text-slate-900">{renderMessageContent(message.text)}</div>
              </div>
            </div>
          );
        })}

        {/* Burbuja activa de escucha en tiempo real */}
        {isListening && (
          <div className="flex gap-2.5 items-start justify-end max-w-[85%] sm:max-w-[75%] ml-auto animate-fadeIn">
            <div className="rounded-2xl rounded-tr-sm bg-quack-gunmetal/85 text-white p-3.5 shadow-md text-sm border-2 border-quack-amber">
              <div className="flex items-center gap-2 mb-1 text-[11px] text-quack-dandelion font-semibold">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                Capturando tu voz en vivo...
              </div>
              <p className="italic text-slate-100 min-h-[20px]">
                {interimTranscript || "Habla con claridad..."}
              </p>
            </div>
          </div>
        )}

        {/* Burbuja animada de Quack pensando / escribiendo */}
        {isProcessing && (
          <div className="flex gap-3 items-start max-w-[85%] sm:max-w-[75%] animate-fadeIn">
            <div className="h-9 w-9 rounded-full bg-quack-dandelion border border-quack-amber flex items-center justify-center p-1 shrink-0 shadow-sm animate-pulse">
              <img src="/brand/quack-logo.png" alt="Quack Avatar" className="h-7 w-7 object-contain" />
            </div>
            <div className="rounded-2xl rounded-tl-sm bg-white border border-amber-200/90 p-3.5 shadow-sm text-sm space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-brand font-bold text-quack-gunmetal">
                <Sparkles className="h-3 w-3 text-quack-caramel" />
                Quack está reflexionando...
              </div>
              <div className="flex items-center gap-2 py-0.5">
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-quack-amber animate-bounce [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 rounded-full bg-quack-sandy animate-bounce [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 rounded-full bg-quack-caramel animate-bounce" />
                </div>
                <span className="text-xs text-slate-500 italic">
                  Analizando tu explicación...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
};
