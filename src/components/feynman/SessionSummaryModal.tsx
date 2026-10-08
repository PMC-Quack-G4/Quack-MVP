import * as React from "react";
import { Award, Clock, CheckCircle2, AlertTriangle, ArrowRight, RotateCcw } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FeynmanSessionSummary } from "@/types/feynman";

export interface SessionSummaryModalProps {
  summary: FeynmanSessionSummary;
  onRestart: () => void;
  onChooseOtherTopic: () => void;
  onReviewChat: () => void;
}

export const SessionSummaryModal: React.FC<SessionSummaryModalProps> = ({
  summary,
  onRestart,
  onChooseOtherTopic,
  onReviewChat,
}) => {
  const isHighMastery = summary.masteryPercentage >= 75;

  const formatMinutes = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-quack-gunmetal  animate-fadeIn">
      <Card className="w-full max-w-xl rounded-3xl border-2 border-quack-amber  bg-white overflow-hidden animate-scaleUp">
        {/* Banner Superior con Identidad Quack */}
        <div className="relative bg-gradient-to-r from-quack-dandelion via-quack-amber to-quack-sandy p-6 text-quack-gunmetal flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-white p-2  shrink-0 flex items-center justify-center border border-amber-300">
            <img src="/brand/quack-logo.png" alt="Quack Rubber Duck" className="h-12 w-12 object-contain" />
          </div>
          <div>
            <Badge className="bg-white text-quack-gunmetal font-bold border-0 text-[10px] uppercase tracking-wider mb-1">
              Balance Final de Sesión
            </Badge>
            <CardTitle className="font-brand text-2xl text-quack-gunmetal leading-tight">
              {summary.topicTitle}
            </CardTitle>
            <p className="text-xs text-slate-800 font-medium mt-0.5">
              Diagnóstico de Active Recall y Combate a la Ilusión de Competencia
            </p>
          </div>
        </div>

        <CardHeader className="pt-4 pb-2">
          {/* Métricas clave en cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-slate-50 border p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-slate-500 mb-1">
                <Clock className="h-3.5 w-3.5 text-quack-caramel" />
                Tiempo
              </div>
              <div className="text-lg font-bold text-quack-gunmetal">
                {formatMinutes(summary.durationSeconds)}
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 border p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-slate-500 mb-1">
                <Award className="h-3.5 w-3.5 text-quack-amber" />
                Dominio
              </div>
              <div className={`text-lg font-extrabold ${isHighMastery ? "text-emerald-600" : "text-amber-600"}`}>
                {summary.masteryPercentage}%
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 border p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-slate-500 mb-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                Intervenciones
              </div>
              <div className="text-lg font-bold text-quack-gunmetal">
                {summary.totalExplanations}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 py-2">
          {/* Subconceptos Dominados */}
          {summary.masteredSubtopics.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5 uppercase tracking-wide">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Conceptos Dominados al 100% ({summary.masteredSubtopics.length}):
              </div>
              <div className="flex flex-wrap gap-1.5">
                {summary.masteredSubtopics.map((item) => (
                  <Badge
                    key={item.id}
                    variant="outline"
                    className="bg-emerald-50 text-emerald-800 border-emerald-300 text-xs py-1"
                  >
                    ✓ {item.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Subconceptos con Dominio Parcial (50%) */}
          {summary.partialSubtopics && summary.partialSubtopics.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5 uppercase tracking-wide">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                Dominio Parcial / Intuición Inicial 50% ({summary.partialSubtopics.length}):
              </div>
              <div className="flex flex-wrap gap-1.5">
                {summary.partialSubtopics.map((item) => (
                  <Badge
                    key={item.id}
                    variant="outline"
                    className="bg-amber-50 text-amber-900 border-amber-300 text-xs py-1 font-medium"
                  >
                    ◐ {item.name} (50%)
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Lagunas detectadas (0%) */}
          {summary.missingSubtopics.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wide">
                <AlertTriangle className="h-4 w-4 text-slate-500" />
                Conceptos No Dominados / Pendientes ({summary.missingSubtopics.length}):
              </div>
              <div className="flex flex-wrap gap-1.5">
                {summary.missingSubtopics.map((item) => (
                  <Badge
                    key={item.id}
                    variant="outline"
                    className="bg-amber-50 text-amber-800 border-amber-300 text-xs py-1"
                  >
                    ⚠ {item.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Consejo pedagógico */}
          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-3.5 text-xs text-slate-700 space-y-1">
            <span className="font-bold text-quack-caramel block">
              💡 Consejo Pedagógico de Quack:
            </span>
            <p className="leading-relaxed">
              {summary.pedagogicalAdvice}
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-2 border-t p-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onReviewChat}
            className="w-full sm:w-auto text-xs"
          >
            Revisar Conversación
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onRestart}
            className="w-full sm:w-auto text-xs gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reintentar Tema
          </Button>

          <Button
            size="sm"
            onClick={onChooseOtherTopic}
            className="w-full sm:w-auto sm:ml-auto bg-quack-amber hover:bg-quack-sandy text-quack-gunmetal font-bold text-xs gap-1.5 rounded-xl "
          >
            Elegir Otro Concepto
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
