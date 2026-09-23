import * as React from "react";
import { Send, Keyboard, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export interface SpeechFallbackInputProps {
  onSendMessage: (text: string) => void;
  isProcessing: boolean;
  reason?: "not-supported" | "user-choice";
}

export const SpeechFallbackInput: React.FC<SpeechFallbackInputProps> = ({
  onSendMessage,
  isProcessing,
  reason = "not-supported",
}) => {
  const [inputText, setInputText] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isProcessing) return;
    onSendMessage(inputText.trim());
    setInputText("");
  };

  return (
    <div className="w-full space-y-2 p-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
      {reason === "not-supported" && (
        <div className="flex items-center gap-2 text-xs text-amber-800 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
          <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
          <span>
            Tu navegador no soporta captura por voz nativa. Usa este campo escrito para no bloquear tu sesión con Quack.
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Input
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
          className="bg-quack-amber hover:bg-amber-400 text-quack-gunmetal font-bold rounded-xl px-4 gap-1.5 shrink-0 shadow-sm"
        >
          <Send className="h-4 w-4" />
          <span className="hidden sm:inline">Enviar</span>
        </Button>
      </form>
    </div>
  );
};
