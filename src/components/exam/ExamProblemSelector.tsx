import * as React from "react";
import { Clock, ArrowRight, BookOpen, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MathRenderer } from "@/components/common/MathRenderer";
import { ExamProblem } from "@/types/exam";

export interface ExamProblemSelectorProps {
  problems: ExamProblem[];
  selectedProblemId: string;
  onSelectProblem: (problem: ExamProblem) => void;
  onStartExam: () => void;
}

export const ExamProblemSelector: React.FC<ExamProblemSelectorProps> = ({
  problems,
  selectedProblemId,
  onSelectProblem,
  onStartExam,
}) => {
  const currentProblem = problems.find((p) => p.id === selectedProblemId) || problems[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Badge className="bg-slate-100 text-quack-gunmetal border-slate-300 font-semibold text-xs mb-2">
            Paso 1: Selección de Problema
          </Badge>
          <h2 className="font-brand text-2xl font-bold text-quack-gunmetal">
            Elige un ejercicio de nivel examen oficial
          </h2>
          <p className="text-sm text-slate-600">
            Pon a prueba tu dominio a libro cerrado sin pantallas intermedias ni trampas digitales.
          </p>
        </div>

        {currentProblem && (
          <Button
            size="lg"
            onClick={onStartExam}
            className="bg-quack-gunmetal hover:bg-slate-800 text-white font-bold rounded-xl shadow-md gap-2 shrink-0 self-start sm:self-auto transition-transform hover:scale-[1.02]"
          >
            Comenzar Parcial a Ciegas
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {problems.map((problem) => {
          const isSelected = problem.id === selectedProblemId;

          return (
            <Card
              key={problem.id}
              onClick={() => onSelectProblem(problem)}
              className={`cursor-pointer transition-all duration-200 border-2 rounded-2xl overflow-hidden hover:shadow-md ${
                isSelected
                  ? "border-quack-gunmetal bg-slate-50/80 shadow-md ring-2 ring-quack-gunmetal/20"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="secondary" className="bg-slate-100 text-slate-700 text-xs">
                    <BookOpen className="h-3 w-3 mr-1 text-slate-500" />
                    {problem.subject}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`text-[11px] ${
                        problem.difficulty === "Fácil"
                          ? "border-emerald-300 text-emerald-700 bg-emerald-50"
                          : problem.difficulty === "Medio"
                          ? "border-amber-300 text-amber-700 bg-amber-50"
                          : "border-rose-300 text-rose-700 bg-rose-50"
                      }`}
                    >
                      {problem.difficulty}
                    </Badge>
                    <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      {problem.estimatedMinutes} min
                    </span>
                  </div>
                </div>
                <CardTitle className="font-brand text-lg text-quack-gunmetal mt-2">
                  {problem.title}
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Ejercicio diseñado para medir rigor algebraico y deducción de créditos parciales.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="rounded-xl bg-slate-50 p-4 border text-center">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                    Enunciado del Problema
                  </span>
                  <MathRenderer math={problem.statementLatex} block className="text-base text-slate-900" />
                </div>
              </CardContent>

              <CardFooter className="pt-0 flex justify-between items-center text-xs text-slate-500 border-t bg-slate-50/40 py-2.5 px-6">
                <span className="flex items-center gap-1 text-quack-caramel font-medium">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Resolución manual en papel
                </span>
                <span className={`font-semibold ${isSelected ? "text-quack-gunmetal font-bold" : "text-slate-400"}`}>
                  {isSelected ? "✓ Seleccionado" : "Click para elegir"}
                </span>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
