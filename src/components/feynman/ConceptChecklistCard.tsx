import * as React from "react";
import { CheckCircle2, Circle, Clock, CheckCheck, Award } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SubtopicKey } from "@/types/feynman";

export interface ConceptChecklistCardProps {
  subtopics: SubtopicKey[];
  coveredIds: string[];
  sessionDuration: string;
  onFinishSession: () => void;
}

export const ConceptChecklistCard: React.FC<ConceptChecklistCardProps> = ({
  subtopics,
  coveredIds,
  sessionDuration,
  onFinishSession,
}) => {
  const coveredCount = subtopics.filter((s) => coveredIds.includes(s.id)).length;
  const totalCount = subtopics.length;
  const progressPercent = totalCount > 0 ? Math.round((coveredCount / totalCount) * 100) : 0;
  const allMastered = coveredCount === totalCount && totalCount > 0;

  return (
    <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
      <CardHeader className="pb-3 border-b bg-slate-50/50">
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
          Quack marca los conceptos dominados cuando los verbalizas con claridad.
        </CardDescription>

        {/* Barra de progreso de dominio */}
        <div className="space-y-1 pt-2">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-600">Dominio Alcanzado:</span>
            <span className={allMastered ? "text-emerald-600 font-bold" : "text-quack-caramel"}>
              {progressPercent}% ({coveredCount}/{totalCount})
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                allMastered
                  ? "bg-emerald-500"
                  : progressPercent > 50
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
          const isCovered = coveredIds.includes(subtopic.id);

          return (
            <div
              key={subtopic.id}
              className={`p-3 rounded-xl border transition-all duration-200 ${
                isCovered
                  ? "border-emerald-200 bg-emerald-50/40 text-emerald-950"
                  : "border-slate-200 bg-slate-50/40 text-slate-700"
              }`}
            >
              <div className="flex items-start gap-2.5">
                {isCovered ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <Circle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                )}

                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className={`text-xs font-bold ${isCovered ? "text-emerald-900" : "text-slate-800"}`}>
                      {subtopic.name}
                    </span>
                    {isCovered ? (
                      <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px] py-0 px-1.5 h-4">
                        Cubierto
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-300 text-[10px] py-0 px-1.5 h-4">
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

      <CardFooter className="pt-2 pb-4 px-4 border-t bg-slate-50/50 flex flex-col gap-2">
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
