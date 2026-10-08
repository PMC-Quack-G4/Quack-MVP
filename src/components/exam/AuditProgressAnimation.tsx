import * as React from "react";
import { Loader2, CheckCircle2, ScanLine, Calculator, CheckCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const AuditProgressAnimation: React.FC = () => {
  const [activeStep, setActiveStep] = React.useState<number>(1);

  React.useEffect(() => {
    const timer1 = setTimeout(() => setActiveStep(2), 600);
    const timer2 = setTimeout(() => setActiveStep(3), 1200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div className="max-w-md mx-auto py-12 px-4 animate-fadeIn">
      <Card className="rounded-3xl border-2 border-quack-amber  bg-white overflow-hidden text-center">
        <CardContent className="p-8 space-y-6">
          {/* Mascota Quack con escáner animado */}
        <div className="relative mx-auto h-28 w-28 flex items-center justify-center">
          <div className="absolute inset-0 rounded-3xl bg-quack-dandelion/40 animate-ping opacity-50" />
          <div className="relative z-10 h-24 w-24 rounded-2xl bg-quack-dandelion border-2 border-quack-amber p-2 flex items-center justify-center ">
            <img src="/brand/quack-logo.png" alt="Quack Auditing" className="h-16 w-16 object-contain" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-quack-gunmetal text-white p-2 rounded-xl  animate-bounce">
            <Loader2 className="h-5 w-5 animate-spin text-quack-amber" />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-brand text-xl font-bold text-quack-gunmetal">
            Auditoría OCR en Proceso
          </h3>
          <p className="text-xs text-slate-500">
            Revisando rigor algebraico, consistencia simbólica y otorgando crédito parcial.
          </p>
        </div>

        {/* Lista de Fases de Auditoría */}
        <div className="space-y-3 text-left bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-3">
            {activeStep > 1 ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            ) : (
              <ScanLine className="h-5 w-5 text-quack-caramel shrink-0 animate-pulse" />
            )}
            <div className="text-xs">
              <span className={`font-bold block ${activeStep >= 1 ? "text-quack-gunmetal" : "text-slate-400"}`}>
                1. Lectura de trazos manuscritos (OCR)
              </span>
              <span className="text-[11px] text-slate-500">Reconociendo caligrafía y símbolos físicos</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {activeStep > 2 ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            ) : activeStep === 2 ? (
              <Calculator className="h-5 w-5 text-quack-caramel shrink-0 animate-pulse" />
            ) : (
              <div className="h-5 w-5 rounded-full border-2 border-slate-300 shrink-0" />
            )}
            <div className="text-xs">
              <span className={`font-bold block ${activeStep >= 2 ? "text-quack-gunmetal" : "text-slate-400"}`}>
                2. Segmentación a notación KaTeX
              </span>
              <span className="text-[11px] text-slate-500">Estructuración formal de renglones matemáticos</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {activeStep === 3 ? (
              <CheckCheck className="h-5 w-5 text-quack-amber shrink-0 animate-bounce" />
            ) : (
              <div className="h-5 w-5 rounded-full border-2 border-slate-300 shrink-0" />
            )}
            <div className="text-xs">
              <span className={`font-bold block ${activeStep === 3 ? "text-quack-gunmetal" : "text-slate-400"}`}>
                3. Verificación de lógica y arrastre de error
              </span>
              <span className="text-[11px] text-slate-500">Distinción de fallos algebraicos vs conceptuales</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
  );
};
