import * as React from "react";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  RotateCcw,
  RotateCw,
  Award,
  Sparkles,
  ArrowRight,
  ZoomIn,
  CheckCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MathRenderer } from "@/components/common/MathRenderer";
import { MockAuditResult, StepStatus, ExamProblem } from "@/types/exam";

export interface AuditSplitViewProps {
  problem: ExamProblem;
  auditResult: MockAuditResult;
  selectedImage: string;
  rotation: number;
  onRotate: () => void;
  onSelectAnotherProblem: () => void;
  onReuploadEvidence: () => void;
}

export const AuditSplitView: React.FC<AuditSplitViewProps> = ({
  problem,
  auditResult,
  selectedImage,
  rotation,
  onRotate,
  onSelectAnotherProblem,
  onReuploadEvidence,
}) => {
  const [isZoomed, setIsZoomed] = React.useState(false);

  const renderStatusBadge = (status: StepStatus) => {
    switch (status) {
      case "CORRECT":
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-300 font-bold gap-1 text-xs">
            <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
            CORRECTO
          </Badge>
        );
      case "ALGEBRAIC_ERROR":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-900 border-amber-300 font-bold gap-1 text-xs">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
            ERROR ALGEBRAICO / CÁLCULO
          </Badge>
        );
      case "CONCEPTUAL_ERROR":
        return (
          <Badge variant="outline" className="bg-rose-50 text-rose-900 border-rose-300 font-bold gap-1 text-xs">
            <XCircle className="h-3.5 w-3.5 text-rose-600" />
            ERROR CONCEPTUAL PROFUNDO
          </Badge>
        );
      case "PROPAGATED_ERROR":
        return (
          <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-300 font-bold gap-1 text-xs">
            <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
            ARRASTRE DE ERROR PREVIO
          </Badge>
        );
    }
  };

  const scorePercentage = (auditResult.finalScore / auditResult.maxScore) * 100;
  const isHighPass = scorePercentage >= 80;

  return (
    <div className="space-y-6">
      {/* Banner de Rúbrica y Diagnóstico Global */}
      <div
        className={`rounded-3xl border-2 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm ${
          isHighPass
            ? "border-emerald-300 bg-gradient-to-br from-emerald-50 via-emerald-50/50 to-white"
            : "border-amber-300 bg-gradient-to-br from-amber-50 via-amber-50/50 to-white"
        }`}
      >
        <div className="space-y-2 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              className={
                isHighPass
                  ? "bg-emerald-600 text-white font-bold text-xs"
                  : "bg-quack-caramel text-white font-bold text-xs"
              }
            >
              <Award className="h-3.5 w-3.5 mr-1" />
              {auditResult.diagnosisTitle || "Auditoría KaTeX Completada"}
            </Badge>
            <span className="text-xs text-slate-500 font-medium">
              {problem.title} — {problem.subject}
            </span>
          </div>

          <h2 className="font-brand text-2xl font-bold text-quack-gunmetal leading-snug">
            Diagnóstico Analítico de Créditos Parciales
          </h2>

          <p className="text-sm text-slate-700 leading-relaxed">
            {auditResult.summary}
          </p>
        </div>

        {/* Calificación Final Destacada */}
        <div className="rounded-2xl bg-white border-2 border-slate-200/80 p-4 sm:p-6 text-center shadow-md shrink-0 self-stretch md:self-auto min-w-[180px]">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Calificación Obtenida
          </span>
          <div className="font-brand text-4xl sm:text-5xl font-black text-quack-gunmetal tracking-tight leading-none">
            {auditResult.finalScore.toFixed(1)}
            <span className="text-xl text-slate-400 font-normal"> / {auditResult.maxScore.toFixed(1)}</span>
          </div>
          <div className="mt-2 text-[11px] font-semibold text-slate-500">
            {auditResult.steps.filter((s) => s.status === "CORRECT").length} de {auditResult.steps.length} pasos impecables
          </div>
        </div>
      </div>

      {/* Vista Dividida en 2 Columnas (Split View) */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Panel Izquierdo: Fotografía Original del Cuaderno */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-quack-caramel" />
              Evidencia Manuscrita Original
            </span>

            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onRotate}
                className="h-7 px-2 text-[11px] gap-1 bg-white rounded-lg shadow-2xs"
                title="Rotar imagen 90 grados"
              >
                <RotateCw className="h-3 w-3" />
                Rotar ({rotation}°)
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsZoomed(!isZoomed)}
                className="h-7 px-2 text-[11px] gap-1 bg-white rounded-lg shadow-2xs"
              >
                <ZoomIn className="h-3 w-3" />
                {isZoomed ? "Ajustar" : "Zoom"}
              </Button>
            </div>
          </div>

          <div className="rounded-3xl border-2 border-slate-200 bg-white p-3 shadow-sm sticky top-20 overflow-hidden">
            <div className={`overflow-auto transition-all ${isZoomed ? "max-h-[700px]" : "max-h-[500px]"}`}>
              <img
                src={selectedImage}
                alt="Hoja manuscrita de examen"
                style={{ transform: `rotate(${rotation}deg)` }}
                className={`rounded-2xl transition-transform duration-300 w-full object-contain mx-auto ${
                  isZoomed ? "scale-125 my-8 cursor-zoom-out" : "cursor-zoom-in"
                }`}
                onClick={() => setIsZoomed(!isZoomed)}
              />
            </div>
            <p className="text-[10px] text-slate-400 text-center mt-2">
              Haz clic en la imagen para alternar zoom • La segmentación analiza renglón a renglón
            </p>
          </div>
        </div>

        {/* Panel Derecho: Auditoría Paso a Paso en KaTeX */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-quack-gunmetal">
              Desglose Analítico en KaTeX ({auditResult.steps.length} Pasos Evaluados)
            </span>
            <span className="text-[11px] text-quack-caramel font-semibold">
              Motor de Auditoría Simbólica
            </span>
          </div>

          {auditResult.steps.map((step) => {
            const isCorrect = step.status === "CORRECT";
            const isAlgebraic = step.status === "ALGEBRAIC_ERROR";
            const isConceptual = step.status === "CONCEPTUAL_ERROR";

            return (
              <Card
                key={step.stepNumber}
                className={`rounded-2xl border-2 shadow-sm transition-all overflow-hidden ${
                  isCorrect
                    ? "border-slate-200 bg-white"
                    : isAlgebraic
                    ? "border-amber-300 bg-amber-50/15"
                    : isConceptual
                    ? "border-rose-300 bg-rose-50/15"
                    : "border-slate-300 bg-slate-50/40"
                }`}
              >
                <CardHeader className="py-3 px-5 border-b bg-slate-50/50 flex flex-row items-center justify-between">
                  <span className="font-bold text-xs text-slate-700">
                    Paso #{step.stepNumber}
                  </span>
                  {renderStatusBadge(step.status)}
                </CardHeader>

                <CardContent className="p-5 space-y-3">
                  {/* Expresión en KaTeX */}
                  <div className="rounded-xl bg-slate-50/80 p-3.5 border text-center shadow-inner">
                    <MathRenderer math={step.latexExpression} block className="text-base sm:text-lg text-slate-900" />
                  </div>

                  {/* Feedback puntual del paso */}
                  <div className="text-xs text-slate-700 leading-relaxed bg-white/70 p-3 rounded-xl border border-slate-100">
                    <strong className="text-quack-gunmetal">Evaluación analítica: </strong>
                    {step.feedback}
                  </div>

                  {/* Sugerencia de corrección con KaTeX (si hubo fallo) */}
                  {step.suggestedFixLatex && (
                    <div className="rounded-xl bg-amber-50/80 border border-amber-200 p-3 space-y-1.5">
                      <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1 uppercase tracking-wide">
                        <CheckCheck className="h-3.5 w-3.5 text-amber-700" />
                        Sugerencia de Corrección Matemática:
                      </span>
                      <MathRenderer math={step.suggestedFixLatex} block className="text-sm text-slate-900" />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {/* Botones de acción tras la auditoría */}
          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-between items-center border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={onSelectAnotherProblem}
              className="w-full sm:w-auto rounded-xl text-xs"
            >
              Elegir Otro Problema del Catálogo
            </Button>

            <Button
              size="sm"
              onClick={onReuploadEvidence}
              className="w-full sm:w-auto bg-quack-gunmetal hover:bg-slate-800 text-white font-bold rounded-xl text-xs gap-1.5 shadow-sm"
            >
              Subir Otra Evidencia o Foto
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
