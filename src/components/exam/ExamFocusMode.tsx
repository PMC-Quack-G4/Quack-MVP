import * as React from "react";
import { Clock, Pause, Play, UploadCloud, AlertCircle, FileEdit, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MathRenderer } from "@/components/common/MathRenderer";
import { ExamProblem } from "@/types/exam";

export interface ExamFocusModeProps {
  problem: ExamProblem;
  formattedTime: string;
  isRunning: boolean;
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
  onFinishPaper: () => void;
  onBackToSelector: () => void;
}

export const ExamFocusMode: React.FC<ExamFocusModeProps> = ({
  problem,
  formattedTime,
  isPaused,
  onPause,
  onResume,
  onFinishPaper,
  onBackToSelector,
}) => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Botón de retroceso seguro */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBackToSelector}
          className="text-slate-500 hover:text-quack-gunmetal -ml-2 gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" />
          Abandonar / Cambiar Ejercicio
        </Button>

        <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800 text-xs gap-1.5">
          <FileEdit className="h-3.5 w-3.5 text-amber-600" />
          Modo Examen Activo (A Libro Cerrado)
        </Badge>
      </div>

      <Card className="border-2 border-slate-300  rounded-3xl overflow-hidden bg-white">
        <CardHeader className="border-b/70 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <Badge variant="secondary" className="text-xs mb-1">
                {problem.subject}
              </Badge>
              <CardTitle className="font-brand text-2xl text-quack-gunmetal">
                {problem.title}
              </CardTitle>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Clock className="h-4 w-4 text-quack-caramel" />
              <span>Tiempo sugerido: {problem.estimatedMinutes} minutos</span>
            </div>
          </div>
          <CardDescription className="text-xs text-slate-600">
            Resuelve este problema a mano en una hoja física en blanco con lápiz o esfero. No uses calculadoras simbólicas ni apuntes digitales.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8 p-6 sm:p-8">
          {/* Enunciado Oficial destacado en KaTeX */}
          <div className="rounded-2xl bg-slate-50 border-2 border-slate-200 p-6 sm:p-8 text-center ">
            <span className="text-xs uppercase font-bold text-slate-500 tracking-wider block mb-3">
              Enunciado Oficial del Examen
            </span>
            <MathRenderer
              math={problem.statementLatex}
              block
              className="text-xl sm:text-2xl font-medium text-quack-gunmetal leading-relaxed overflow-x-auto py-2"
            />
          </div>

          {/* Cronómetro de Enfoque con Controles */}
          <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-amber-50 border border-amber-200 space-y-4">
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${isPaused ? "bg-amber-500" : "bg-emerald-500 animate-pulse"}`} />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                {isPaused ? "Cronómetro Pausado" : "Tiempo de Examen en Curso"}
              </span>
            </div>

            <div className="font-mono text-5xl sm:text-6xl font-extrabold text-quack-gunmetal tracking-tight select-none">
              {formattedTime}
            </div>

            <div className="flex items-center gap-3">
              {isPaused ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onResume}
                  className="gap-1.5 rounded-xl border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                >
                  <Play className="h-4 w-4" />
                  Reanudar Cronómetro
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onPause}
                  className="gap-1.5 rounded-xl border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
                >
                  <Pause className="h-4 w-4" />
                  Pausar Cronómetro
                </Button>
              )}
            </div>

            <p className="text-xs text-slate-500 text-center max-w-md flex items-center gap-1.5 pt-1">
              <AlertCircle className="h-3.5 w-3.5 text-quack-caramel shrink-0" />
              Trabaja en tu cuaderno o papel físico. Cuando hayas alcanzado tu resultado, pulsa el botón inferior.
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t/60 p-6">
          <span className="text-xs text-slate-500 text-center sm:text-left">
            Al confirmar, el cronómetro se detendrá y podrás tomar o subir la foto de tu hoja manuscrita.
          </span>

          <Button
            size="lg"
            onClick={onFinishPaper}
            className="w-full sm:w-auto bg-quack-amber hover:bg-amber-400 text-quack-gunmetal font-bold rounded-xl  gap-2"
          >
            <UploadCloud className="h-5 w-5" />
            He terminado en papel (Subir foto)
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
