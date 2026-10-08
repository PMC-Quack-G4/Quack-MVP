import * as React from "react";
import { CheckCircle2, Circle, Clock, CheckCheck, Award, AlertCircle, XCircle, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SubtopicKey, SubtopicScoreData } from "@/types/feynman";

export interface ConceptChecklistCardProps {
  subtopics: SubtopicKey[];
  coveredIds: string[];
  subtopicScores?: Record<string, SubtopicScoreData>;
  activeSubtopicId?: string;
  sessionDuration: string;
  onFinishSession: () => void;
}

export const ConceptChecklistCard: React.FC<ConceptChecklistCardProps> = ({
  subtopics,
  coveredIds,
  subtopicScores,
  activeSubtopicId,
  sessionDuration,
  onFinishSession,
}) => {
  const totalCount = subtopics.length;

  // Cálculo ponderado exacto del porcentaje de dominio (100, 50, 0)
  const totalScoreSum = subtopics.reduce((acc, s) => {
    const scoreData = subtopicScores?.[s.id];
    if (scoreData) {
      return acc + scoreData.score;
    }
    return acc + (coveredIds.includes(s.id) ? 100 : 0);
  }, 0);

  const progressPercent = totalCount > 0 ? Math.round(totalScoreSum / totalCount) : 0;
  const masteredCount = subtopics.filter(
    (s) => subtopicScores?.[s.id]?.status === "mastered" || coveredIds.includes(s.id)
  ).length;
  const allMastered = masteredCount === totalCount && totalCount > 0;

  return (
    <Card className="border-slate-200  rounded-2xl overflow-hidden bg-white">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <Badge className="bg-quack-dandelion text-quack-gunmetal border-quack-amber/40 font-semibold text-[11px]">
            Auditoría en Tiempo Real
          </Badge>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
            <Clock className="h-3.5 w-3.5 text-quack-caramel" />
            <span>{sessionDuration}</span>
          </div>
        </div>
        <CardTitle className="font-brand text-base text-quack-gunmetal mt-1">
          Subconceptos Clave a Explicar
        </CardTitle>
        <CardDescription className="text-xs text-slate-500">
          Máximo 3 intentos por subtema. Quack avanza automáticamente para evitar estancamientos.
        </CardDescription>

        {/* Barra de progreso de dominio */}
        <div className="space-y-1 pt-2">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-600">Dominio Alcanzado:</span>
            <span className={allMastered ? "text-emerald-600 font-bold" : "text-quack-caramel"}>
              {progressPercent}% ({masteredCount}/{totalCount} dominados)
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                allMastered
                  ? "bg-emerald-500"
                  : progressPercent >= 50
                  ? "bg-gradient-to-r from-quack-amber to-emerald-500"
                  : "bg-gradient-to-r from-quack-sandy to-quack-amber"
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        {subtopics.map((subtopic) => {
          const scoreData = subtopicScores?.[subtopic.id];
          const isMastered = scoreData?.status === "mastered" || coveredIds.includes(subtopic.id);
          const isPartial = scoreData?.status === "partial";
          const isFailed = scoreData?.status === "failed";
          const isEvaluating =
            !isMastered &&
            !isPartial &&
            !isFailed &&
            (subtopic.id === activeSubtopicId || scoreData?.status === "evaluating");
          const attempts = scoreData?.attempts || 0;

          return (
            <div
              key={subtopic.id}
              className={`p-3 rounded-xl border transition-all duration-200 ${
                isMastered
                  ? "border-emerald-200 bg-emerald-50 text-emerald-950 "
                  : isPartial
                  ? "border-amber-300 bg-amber-50 text-amber-950 "
                  : isFailed
                  ? "border-slate-300 bg-slate-100/60 text-slate-700"
                  : isEvaluating
                  ? "border-amber-400 bg-amber-50 text-quack-gunmetal ring-2 ring-quack-amber"
                  : "border-slate-200 bg-slate-50/40 text-slate-700"
              }`}
            >
              <div className="flex items-start gap-2.5">
                {isMastered ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : isPartial ? (
                  <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                ) : isFailed ? (
                  <XCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                ) : isEvaluating ? (
                  <Sparkles className="h-4 w-4 text-quack-caramel shrink-0 mt-0.5 animate-pulse" />
                ) : (
                  <Circle className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                )}

                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between gap-1 flex-wrap">
                    <span
                      className={`text-xs font-bold ${
                        isMastered
                          ? "text-emerald-900"
                          : isPartial
                          ? "text-amber-950"
                          : isEvaluating
                          ? "text-quack-gunmetal"
                          : "text-slate-800"
                      }`}
                    >
                      {subtopic.name}
                    </span>

                    {isMastered ? (
                      <Badge
                        variant="outline"
                        className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px] py-0 px-1.5 h-4"
                      >
                        Dominado (100%)
                      </Badge>
                    ) : isPartial ? (
                      <Badge
                        variant="outline"
                        className="bg-amber-100 text-amber-900 border-amber-300 text-[10px] py-0 px-1.5 h-4 font-semibold"
                      >
                        Parcial (50%)
                      </Badge>
                    ) : isFailed ? (
                      <Badge
                        variant="outline"
                        className="bg-slate-200 text-slate-700 border-slate-300 text-[10px] py-0 px-1.5 h-4"
                      >
                        0% Dominio
                      </Badge>
                    ) : isEvaluating ? (
                      <Badge
                        variant="outline"
                        className="bg-quack-amber text-quack-gunmetal border-amber-400 text-[10px] py-0 px-1.5 h-4 font-bold animate-pulse"
                      >
                        Evaluando ({Math.min(attempts + 1, 3)}/3)
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-slate-100 text-slate-600 border-slate-300 text-[10px] py-0 px-1.5 h-4"
                      >
                        Pendiente
                      </Badge>
                    )}
                  </div>
                  {subtopic.description && (
                    <p className="text-[11px] text-slate-500 leading-snug">
                      {subtopic.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>

      <CardFooter className="pt-2 pb-4 px-4 border-t flex flex-col gap-2">
        <Button
          onClick={onFinishSession}
          className={`w-full font-semibold rounded-xl text-xs gap-1.5 ${
            allMastered
              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
              : "bg-quack-gunmetal hover:bg-slate-800 text-white"
          }`}
        >
          {allMastered ? (
            <>
              <CheckCheck className="h-4 w-4" />
              ¡Dominio Completo! Finalizar Sesión
            </>
          ) : (
            <>
              <Award className="h-4 w-4" />
              Finalizar y Ver Balance de Dominio
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
