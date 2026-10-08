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
  Lightbulb,
  Clock,
  Cpu,
  Database,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MathRenderer } from "@/components/common/MathRenderer";
import { MockAuditResult, StepStatus, ExamProblem } from "@/types/exam";

export interface AuditSplitViewProps {
  problem: ExamProblem;
  auditResult: MockAuditResult;
  selectedImage: string;
  rotation: number;
  elapsedTimeFormatted?: string;
  onRotate: () => void;
  onRetryAudit: () => void;
  onSelectAnotherProblem: () => void;
  onReuploadEvidence: () => void;
}

export const AuditSplitView: React.FC<AuditSplitViewProps> = ({
  problem,
  auditResult,
  selectedImage,
  rotation,
  elapsedTimeFormatted,
  onRotate,
  onRetryAudit,
  onSelectAnotherProblem,
  onReuploadEvidence,
}) => {
  const [isZoomed, setIsZoomed] = React.useState(false);
  const [warningDismissed, setWarningDismissed] = React.useState(false);

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
  const isPassing = scorePercentage >= 60 && scorePercentage < 80;

  const correctCount = auditResult.steps.filter((s) => s.status === "CORRECT").length;
  const algebraicErrorCount = auditResult.steps.filter((s) => s.status === "ALGEBRAIC_ERROR").length;
  const propagatedCount = auditResult.steps.filter((s) => s.status === "PROPAGATED_ERROR").length;
  const conceptualErrorCount = auditResult.steps.filter((s) => s.status === "CONCEPTUAL_ERROR").length;

  const completionPct =
    typeof auditResult.completionPercentage === "number"
      ? auditResult.completionPercentage
      : Math.round(scorePercentage);

  return (
    <div className="flex flex-col gap-6">
      {/* Alerta en caso de conmutación automática a Mock por pico de demanda */}
      {auditResult.warning && !warningDismissed && (
        <div
          role="alert"
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 text-xs bg-amber-50 border border-amber-300 rounded-2xl text-amber-900 "
        >
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 text-quack-caramel shrink-0" />
            <span>{auditResult.warning}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <Button
              type="button"
              size="sm"
              onClick={onRetryAudit}
              className="h-7 px-3 text-xs bg-quack-gunmetal hover:bg-slate-800 text-white rounded-xl gap-1.5 font-semibold"
            >
              <RotateCcw className="h-3 w-3 text-quack-amber" />
              Reintentar con Gemini Vision
            </Button>
            <button
              type="button"
              onClick={() => setWarningDismissed(true)}
              className="text-amber-700 hover:text-amber-900 font-bold px-2 py-0.5 rounded text-xs"
              aria-label="Cerrar advertencia"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Banner de Rúbrica y Diagnóstico Global */}
      <div
        className={`rounded-3xl border-2 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6  ${
          isHighPass
            ? "border-emerald-300 bg-emerald-50"
            : isPassing
            ? "border-amber-300 bg-amber-50"
            : "border-rose-300 bg-rose-50"
        }`}
      >
        <div className="space-y-3 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              className={
                isHighPass
                  ? "bg-emerald-600 text-white font-bold text-xs"
                  : isPassing
                  ? "bg-quack-caramel text-white font-bold text-xs"
                  : "bg-rose-600 text-white font-bold text-xs"
              }
            >
              <Award className="h-3.5 w-3.5 mr-1" />
              {auditResult.diagnosisTitle || "Auditoría KaTeX Completada"}
            </Badge>

            {auditResult.engineUsed === "gemini" ? (
              <Badge
                variant="outline"
                className="border-emerald-400 bg-white text-emerald-800 text-[11px] font-semibold gap-1"
              >
                <Cpu className="h-3 w-3 text-emerald-600" />
                Auditado con Gemini Vision
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="border-slate-300 bg-white text-slate-700 text-[11px] font-medium gap-1"
              >
                <Database className="h-3 w-3 text-slate-500" />
                Evaluador Local
              </Badge>
            )}

            {elapsedTimeFormatted && (
              <Badge
                variant="outline"
                className="border-slate-300 bg-white text-slate-600 text-[11px] font-medium gap-1"
              >
                <Clock className="h-3 w-3 text-quack-caramel" />
                Tiempo en papel: {elapsedTimeFormatted}
              </Badge>
            )}
          </div>

          <div>
            <span className="text-xs text-slate-500 font-semibold block">
              {problem.subject} — {problem.title}
            </span>
            <h2 className="font-brand text-2xl font-bold text-quack-gunmetal leading-snug mt-0.5">
              Diagnóstico Analítico de Créditos Parciales
            </h2>
          </div>

          <p className="text-sm text-slate-700 leading-relaxed">
            {auditResult.summary}
          </p>

          {auditResult.pedagogicalRecommendation && (
            <div className="rounded-2xl bg-white border border-slate-200 p-3.5 flex items-start gap-2.5 text-xs text-slate-700 ">
              <Lightbulb className="h-4 w-4 text-quack-amber shrink-0 mt-0.5" />
              <div>
                <strong className="text-quack-gunmetal font-bold">Recomendación Pedagógica de Quack: </strong>
                {auditResult.pedagogicalRecommendation}
              </div>
            </div>
          )}
        </div>

        {/* Calificación Final Destacada y Métricas */}
        <div className="rounded-2xl bg-white border-2 border-slate-200 p-5 text-center  shrink-0 self-stretch md:self-auto min-w-[220px] flex flex-col justify-center gap-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Calificación del Parcial
            </span>
            <div
              className={`font-brand text-4xl sm:text-5xl font-black tracking-tight leading-none ${
                isHighPass
                  ? "text-emerald-700"
                  : isPassing
                  ? "text-quack-gunmetal"
                  : "text-rose-700"
              }`}
            >
              {auditResult.finalScore.toFixed(1)}
              <span className="text-xl text-slate-400 font-normal">
                {" "}
                / {auditResult.maxScore.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Barra de avance / dominio del procedimiento */}
          <div className="space-y-1 text-left">
            <div className="flex justify-between text-[11px] font-semibold text-slate-600">
              <span>Avance Lógico</span>
              <span>{completionPct}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isHighPass
                    ? "bg-emerald-500"
                    : isPassing
                    ? "bg-quack-amber"
                    : "bg-rose-500"
                }`}
                style={{ width: `${Math.min(100, Math.max(0, completionPct))}%` }}
              />
            </div>
          </div>

          {/* Resumen de conteo de pasos */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1 border-t border-slate-100 text-[11px] font-semibold">
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              {correctCount} Correctos
            </span>
            {algebraicErrorCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                {algebraicErrorCount} Algebraicos
              </span>
            )}
            {propagatedCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300">
                {propagatedCount} Arrastre
              </span>
            )}
            {conceptualErrorCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
                {conceptualErrorCount} Conceptuales
              </span>
            )}
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
              Evidencia Manuscrita Entregada
            </span>

            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onRotate}
                className="h-7 px-2 text-[11px] gap-1 bg-white rounded-lg "
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
                className="h-7 px-2 text-[11px] gap-1 bg-white rounded-lg "
              >
                <ZoomIn className="h-3 w-3" />
                {isZoomed ? "Ajustar" : "Zoom"}
              </Button>
            </div>
          </div>

          <div className="rounded-3xl border-2 border-slate-200 bg-white p-3  sticky top-20 overflow-hidden">
            <div className={`overflow-auto transition-all ${isZoomed ? "max-h-[700px]" : "max-h-[520px]"}`}>
              <img
                src={selectedImage}
                alt="Hoja manuscrita de examen evaluada"
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
              Desglose Analítico en KaTeX ({auditResult.steps.length} {auditResult.steps.length === 1 ? "Paso Evaluado" : "Pasos Evaluados"})
            </span>
            <span className="text-[11px] text-quack-caramel font-semibold">
              Auditoría Simbólica Paso a Paso
            </span>
          </div>

          {auditResult.steps.map((step) => {
            const isCorrect = step.status === "CORRECT";
            const isAlgebraic = step.status === "ALGEBRAIC_ERROR";
            const isConceptual = step.status === "CONCEPTUAL_ERROR";

            return (
              <Card
                key={step.stepNumber}
                className={`rounded-2xl border-2  transition-all overflow-hidden ${
                  isCorrect
                    ? "border-slate-200 bg-white"
                    : isAlgebraic
                    ? "border-amber-300 bg-amber-50/15"
                    : isConceptual
                    ? "border-rose-300 bg-rose-50/15"
                    : "border-slate-300 bg-slate-50/40"
                }`}
              >
                <CardHeader className="py-3 px-5 border-b flex flex-row items-center justify-between">
                  <span className="font-bold text-xs text-slate-700">
                    Paso #{step.stepNumber}
                  </span>
                  {renderStatusBadge(step.status)}
                </CardHeader>

                <CardContent className="p-5 space-y-3">
                  {/* Expresión en KaTeX */}
                  <div className="rounded-xl bg-slate-50 p-3.5 border text-center  overflow-x-auto">
                    <MathRenderer math={step.latexExpression} block className="text-base sm:text-lg text-quack-gunmetal" />
                  </div>

                  {/* Feedback puntual del paso */}
                  <div className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-slate-100">
                    <strong className="text-quack-gunmetal">Evaluación analítica: </strong>
                    {step.feedback}
                  </div>

                  {/* Sugerencia de corrección con KaTeX (si hubo fallo) */}
                  {step.suggestedFixLatex && (
                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 space-y-1.5 overflow-x-auto">
                      <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1 uppercase tracking-wide">
                        <CheckCheck className="h-3.5 w-3.5 text-amber-700" />
                        Corrección Matemática Esperada:
                      </span>
                      <MathRenderer math={step.suggestedFixLatex} block className="text-sm text-quack-gunmetal" />
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
              className="w-full sm:w-auto bg-quack-gunmetal hover:bg-slate-800 text-white font-bold rounded-xl text-xs gap-1.5 "
            >
              Subir Otra Evidencia o Tomar Foto
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
