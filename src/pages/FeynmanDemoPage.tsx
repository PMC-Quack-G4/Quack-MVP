import * as React from "react";
import { Link } from "react-router-dom";
import {
  Mic,
  BrainCircuit,
  FileCheck2,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Award,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MathRenderer } from "@/components/common/MathRenderer";
import { mockActiveSession } from "@/mocks/quackData";
import { FeynmanSession } from "@/types";

export const FeynmanDemoPage: React.FC = () => {
  const [session] = React.useState<FeynmanSession>(mockActiveSession);

  return (
    <div className="container py-8 space-y-8">
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-6">
        <div className="space-y-1">
          <Button asChild variant="ghost" size="sm" className="mb-2 -ml-3 text-muted-foreground">
            <Link to="/">
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Regresar al Inicio
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Simulacro Método Feynman
            </h1>
            <Badge variant="outline" className="border-blue-300 text-blue-700 bg-blue-50">
              Fase: {session.phase.replace("_", " ")}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {session.topic} — {session.subject.replace("-", " ")}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-emerald-800">
            <Award className="h-5 w-5 text-emerald-600" />
            <div className="text-right">
              <div className="text-xs text-emerald-600 font-medium">Dominio Estimado</div>
              <div className="text-lg font-bold leading-none">{session.masteryScore}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Target Formula Section */}
      <Card className="border-blue-100 bg-blue-50/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-blue-900 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-600" />
            Concepto y Fórmula Objetivo
          </CardTitle>
          <CardDescription>
            {session.formula.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl bg-white p-4 border border-blue-100 shadow-sm text-center">
            <MathRenderer math={session.formula.latex} block className="text-xl sm:text-2xl text-blue-950" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {session.formula.variables.map((v) => (
              <div key={v.symbol} className="rounded-lg bg-white p-2.5 border text-xs space-y-1">
                <div className="font-semibold text-slate-800 flex items-center gap-1">
                  <MathRenderer math={v.symbol} />
                  <span className="text-slate-500 font-normal">({v.name})</span>
                </div>
                <div className="text-slate-500 font-mono text-[11px]">{v.unit}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Voice Explanation & AI Reflection */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-slate-900">
              <Mic className="h-4 w-4 text-primary" />
              1. Explicación Oral del Estudiante
            </CardTitle>
            <CardDescription>
              Transcripción por voz analizada por el agente inteligente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <blockquote className="rounded-lg border-l-4 border-primary bg-slate-50 p-4 text-sm italic text-slate-700">
              "{session.studentExplanationTranscript}"
            </blockquote>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-slate-900">
              <BrainCircuit className="h-4 w-4 text-purple-600" />
              2. Respuesta del Agente Invertido
            </CardTitle>
            <CardDescription>
              Retroalimentación basada en el RAG curricular
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border-l-4 border-purple-500 bg-purple-50/50 p-4 text-sm text-purple-950">
              {session.aiReflectionFeedback}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* OCR Validation Step-by-Step */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileCheck2 className="h-5 w-5 text-primary" />
              3. Validación Autónoma por Pasos (OCR a Papel)
            </h2>
            <p className="text-xs text-muted-foreground">
              Evaluación paso a paso de los cálculos manuscritos con reconocimiento de fórmulas KaTeX.
            </p>
          </div>
          <Badge variant="outline">
            {session.ocrSteps.length} Pasos Evaluados
          </Badge>
        </div>

        <div className="space-y-4">
          {session.ocrSteps.map((step) => (
            <Card key={step.stepNumber} className={step.isCorrect ? "border-slate-200" : "border-amber-200 bg-amber-50/10"}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Paso {step.stepNumber}: {step.stepTitle}
                  </span>
                  {step.isCorrect ? (
                    <Badge variant="success" className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Correcto ({Math.round(step.confidenceScore * 100)}%)
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <XCircle className="h-3 w-3" />
                      Discrepancia ({Math.round(step.confidenceScore * 100)}%)
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg bg-slate-50 p-3 border">
                    <span className="text-[11px] font-medium text-slate-500 block mb-1">
                      LaTeX detectado por OCR:
                    </span>
                    <MathRenderer math={step.detectedLatex} block className="text-base text-slate-900" />
                  </div>

                  <div className="rounded-lg bg-slate-50 p-3 border">
                    <span className="text-[11px] font-medium text-slate-500 block mb-1">
                      LaTeX esperado (RAG):
                    </span>
                    <MathRenderer math={step.expectedLatex} block className="text-base text-slate-900" />
                  </div>
                </div>

                <div className="text-xs text-slate-600 bg-slate-50 rounded-md p-2.5 border">
                  <strong className="text-slate-800">Evaluación del paso: </strong>
                  {step.feedback}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
