import * as React from "react";
import { Send, Keyboard, AlertCircle, Mic } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export interface SpeechFallbackInputProps {
  onSendMessage: (text: string) => void;
  isProcessing: boolean;
  reason?: "not-supported" | "user-choice";
  onSwitchToVoice?: () => void;
}

export const SpeechFallbackInput: React.FC<SpeechFallbackInputProps> = ({
  onSendMessage,
  isProcessing,
  reason = "not-supported",
  onSwitchToVoice,
}) => {
  const [inputText, setInputText] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isProcessing) return;
    onSendMessage(inputText.trim());
    setInputText("");
  };

  return (
    <div className="w-full space-y-3 p-1">
      {reason === "not-supported" && (
        <div className="flex items-center gap-2 text-xs text-amber-800 bg-amber-50 px-3 py-2 rounded-xl border border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
          <span>
            Tu navegador no soporta captura por voz nativa. Usa este campo escrito para no bloquear tu sesión con Quack.
          </span>
        </div>
      )}

      {reason === "user-choice" && onSwitchToVoice && (
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
          <span className="flex items-center gap-1.5 font-medium text-slate-600">
            <Keyboard className="h-3.5 w-3.5 text-quack-caramel" />
            Entrada por texto habilitada
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onSwitchToVoice}
            className="h-7 px-2.5 text-xs text-quack-caramel hover:text-quack-gunmetal hover:bg-amber-50 gap-1.5 rounded-lg font-semibold transition-colors"
          >
            <Mic className="h-3.5 w-3.5" />
            Volver a voz (Recomendado)
          </Button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isProcessing}
            placeholder="Escribe aquí tu explicación con tus propias palabras (Enter para enviar)..."
            className="pr-10 rounded-xl border-slate-300 focus-visible:ring-quack-amber text-sm"
          />
          <Keyboard className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        </div>

        <Button
          type="submit"
          disabled={!inputText.trim() || isProcessing}
          className="bg-quack-amber hover:bg-quack-sandy text-quack-gunmetal font-bold rounded-xl px-4 gap-1.5 shrink-0 "
        >
          <Send className="h-4 w-4" />
          <span className="hidden sm:inline">Enviar</span>
        </Button>
      </form>
    </div>
  );
};
