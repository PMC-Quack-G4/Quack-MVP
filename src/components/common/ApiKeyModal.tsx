import * as React from "react";
import { GoogleGenAI } from "@google/genai";
import { Key, CheckCircle, XCircle, Loader2, ExternalLink, Trash2, Cpu, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getActiveApiKey, setActiveApiKey, clearActiveApiKey } from "@/services/serviceFactory";

export interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const [apiKeyInput, setApiKeyInput] = React.useState("");
  const [isTesting, setIsTesting] = React.useState(false);
  const [testStatus, setTestStatus] = React.useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setApiKeyInput(getActiveApiKey());
      setTestStatus("idle");
      setErrorMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentKey = getActiveApiKey();
  const isConnected = Boolean(currentKey);

  const handleTestAndSave = async () => {
    const keyToTest = apiKeyInput.trim();
    if (!keyToTest) {
      setErrorMessage("Por favor ingresa una API Key válida.");
      return;
    }

    setIsTesting(true);
    setTestStatus("idle");
    setErrorMessage(null);

    try {
      const client = new GoogleGenAI({ apiKey: keyToTest });
      const response = await client.models.generateContent({
        model: "gemini-2.0-flash",
        contents: "Di 'OK' para verificar la conexión de prueba.",
      });

      if (response && response.text) {
        setTestStatus("success");
        setActiveApiKey(keyToTest);
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        throw new Error("Respuesta vacía del modelo.");
      }
    } catch (err: unknown) {
      console.warn("Fallo de verificación de Gemini API Key:", err);
      // Intentar con gemini-1.5-flash
      try {
        const client = new GoogleGenAI({ apiKey: keyToTest });
        const resp2 = await client.models.generateContent({
          model: "gemini-1.5-flash",
          contents: "Di 'OK'",
        });
        if (resp2 && resp2.text) {
          setTestStatus("success");
          setActiveApiKey(keyToTest);
          setTimeout(() => {
            onClose();
          }, 1200);
          return;
        }
      } catch {
        // Falló también
      }
      setTestStatus("error");
      const msg = err instanceof Error ? err.message : "Error al conectar con Gemini API. Verifica tu clave.";
      setErrorMessage(msg);
    } finally {
      setIsTesting(false);
    }
  };

  const handleClear = () => {
    clearActiveApiKey();
    setApiKeyInput("");
    setTestStatus("idle");
    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <Card className="w-full max-w-lg rounded-3xl border-2 border-quack-amber shadow-2xl bg-white overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="bg-gradient-to-r from-quack-dandelion via-quack-amber to-quack-sandy p-6 text-quack-gunmetal flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-white/90 p-2 shadow-sm flex items-center justify-center border border-amber-300">
              <Cpu className="h-6 w-6 text-quack-caramel" />
            </div>
            <div>
              <CardTitle className="font-brand text-xl text-quack-gunmetal">
                Configuración de Gemini AI
              </CardTitle>
              <CardDescription className="text-xs text-slate-800 font-medium">
                Conecta el modelo de lenguaje real para Feynman Oral y OCR
              </CardDescription>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-700 hover:bg-white/40 transition-colors"
          >
            ✕
          </button>
        </div>

        <CardContent className="p-6 space-y-5">
          {/* Estado actual */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border">
            <span className="text-xs font-semibold text-slate-600">Estado del Motor:</span>
            {isConnected ? (
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-bold gap-1 text-xs">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                Gemini 2.0 Flash (Activo)
              </Badge>
            ) : (
              <Badge className="bg-sky-50 text-sky-800 border-sky-300 font-semibold gap-1 text-xs">
                Modo: Simulador Local (Mock Inteligente)
              </Badge>
            )}
          </div>

          {/* Explicación amigable */}
          <div className="text-xs text-slate-600 leading-relaxed bg-amber-50/60 border border-amber-200/80 p-3.5 rounded-2xl space-y-1">
            <span className="font-bold text-quack-caramel flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              ¿Por qué usar tu clave de Google AI Studio?
            </span>
            <p>
              Con tu API Key gratuita, Quack razona en tiempo real mediante <strong>Gemini 2.0 Flash</strong>, recordando todo el contexto de tu diálogo oral y analizando fotos de cuaderno con visión artificial.
            </p>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-quack-caramel font-bold hover:underline pt-1"
            >
              Obtén tu API Key gratis en Google AI Studio (sin tarjeta)
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          {/* Campo de entrada de la Key */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Key className="h-3.5 w-3.5 text-quack-caramel" />
              Google Gemini API Key:
            </label>
            <div className="relative">
              <Input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="font-mono text-xs rounded-xl pr-10 border-slate-300"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Tu clave se almacena de forma segura en tu navegador (localStorage) y nunca sale de tu equipo.
            </p>
          </div>

          {/* Feedback de Test */}
          {testStatus === "success" && (
            <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-300 p-3 rounded-xl animate-fadeIn">
              <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>¡Conexión exitosa con Gemini 2.0 Flash! Quack ahora razona con IA real.</span>
            </div>
          )}

          {testStatus === "error" && errorMessage && (
            <div className="flex items-center gap-2 text-xs text-rose-800 bg-rose-50 border border-rose-300 p-3 rounded-xl animate-fadeIn">
              <XCircle className="h-4 w-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t bg-slate-50/70 p-5">
          {isConnected && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 gap-1 rounded-xl w-full sm:w-auto"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Quitar clave (Volver a Mock)
            </Button>
          )}

          <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs rounded-xl w-full sm:w-auto"
            >
              Cerrar
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={handleTestAndSave}
              disabled={isTesting || !apiKeyInput.trim()}
              className="bg-quack-amber hover:bg-amber-400 text-quack-gunmetal font-bold text-xs gap-1.5 rounded-xl shadow-md w-full sm:w-auto"
            >
              {isTesting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Probando conexión...
                </>
              ) : (
                <>
                  <CheckCircle className="h-3.5 w-3.5" />
                  Guardar y Activar
                </>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};
