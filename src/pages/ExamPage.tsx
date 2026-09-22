import * as React from "react";
import { Link } from "react-router-dom";
import {
  FileCheck2,
  Clock,
  UploadCloud,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RotateCw,
  ArrowLeft,
  Award,
  Play,
  FileImage,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MathRenderer } from "@/components/common/MathRenderer";
import { ExamProblem, AuditStep } from "@/types/exam";

const sampleProblem: ExamProblem = {
  id: "calc-diff-01",
  title: "Derivación con Regla de la Cadena y Logaritmos",
  subject: "Cálculo Diferencial",
  difficulty: "Medio",
  statementLatex: "f(x) = \\ln\\left((x^2 + 3x + 1)^5\\right). \\quad \\text{Calcular } f'(x) \\text{ simplificando la expresión al máximo.}",
  estimatedMinutes: 15,
  defaultSampleImage: "/samples/sample_exam_derivatives.svg",
  mockAudit: {
    finalScore: 4.5,
    maxScore: 5.0,
    summary: "Excelente aplicación de las propiedades de logaritmos antes de derivar. El desarrollo algebraico es completamente riguroso.",
    steps: [
      {
        stepNumber: 1,
        latexExpression: "f(x) = \\ln\\left((x^2 + 3x + 1)^5\\right)",
        status: "CORRECT",
        feedback: "Expresión inicial planteada de forma fidedigna.",
      },
      {
        stepNumber: 2,
        latexExpression: "f(x) = 5 \\cdot \\ln(x^2 + 3x + 1)",
        status: "CORRECT",
        feedback: "Uso óptimo de la propiedad \\ln(u^k) = k \\ln(u) para simplificar la función antes de derivar.",
      },
      {
        stepNumber: 3,
        latexExpression: "f'(x) = 5 \\cdot \\frac{d}{dx}\\left[\\ln(x^2 + 3x + 1)\\right]",
        status: "CORRECT",
        feedback: "Aplicación de linealidad de la derivada con factor constante.",
      },
      {
        stepNumber: 4,
        latexExpression: "f'(x) = 5 \\cdot \\left(\\frac{2x + 3}{x^2 + 3x + 1}\\right)",
        status: "CORRECT",
        feedback: "Regla de la cadena aplicada correctamente: u'(x) / u(x).",
      },
      {
        stepNumber: 5,
        latexExpression: "f'(x) = \\frac{10x + 15}{x^2 + 3x + 1}",
        status: "CORRECT",
        feedback: "Distribución del factor escalar en el numerador sin errores aritméticos.",
      },
    ],
  },
};

type ExamPhase = "SETUP" | "SOLVING" | "UPLOAD" | "AUDIT";

export const ExamPage: React.FC = () => {
  const [phase, setPhase] = React.useState<ExamPhase>("SETUP");
  const [secondsLeft, setSecondsLeft] = React.useState<number>(15 * 60);
  const [selectedImage, setSelectedImage] = React.useState<string>(sampleProblem.defaultSampleImage);
  const [rotation, setRotation] = React.useState<number>(0);
  const [isAuditing, setIsAuditing] = React.useState<boolean>(false);

  // Temporizador de examen
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (phase === "SOLVING" && secondsLeft > 0) {
      timer = setInterval(() => {
        setSecondsLeft((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [phase, secondsLeft]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartExam = () => {
    setSecondsLeft(sampleProblem.estimatedMinutes * 60);
    setPhase("SOLVING");
  };

  const handleFinishPaper = () => {
    setPhase("UPLOAD");
  };

  const handleStartAudit = () => {
    setIsAuditing(true);
    setTimeout(() => {
      setIsAuditing(false);
      setPhase("AUDIT");
    }, 1500);
  };

  const renderStatusBadge = (status: AuditStep["status"]) => {
    switch (status) {
      case "CORRECT":
        return (
          <Badge variant="success" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            CORRECTO
          </Badge>
        );
      case "ALGEBRAIC_ERROR":
        return (
          <Badge variant="secondary" className="bg-amber-100 text-amber-900 border-amber-300 gap-1">
            <AlertTriangle className="h-3 w-3 text-amber-600" />
            ERROR ALGEBRAICO
          </Badge>
        );
      case "CONCEPTUAL_ERROR":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            ERROR CONCEPTUAL
          </Badge>
        );
      case "PROPAGATED_ERROR":
        return (
          <Badge variant="outline" className="text-slate-600 border-slate-300 gap-1">
            ARRASTRE DE ERROR
          </Badge>
        );
    }
  };

  return (
    <div className="container py-8 max-w-5xl space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-6">
        <div>
          <Button asChild variant="ghost" size="sm" className="mb-2 -ml-3 text-muted-foreground">
            <Link to="/">
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Volver al Inicio
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl flex items-center gap-2.5">
            <FileCheck2 className="h-7 w-7 text-primary" />
            Módulo 2: Parcial a Ciegas OCR
          </h1>
          <p className="text-sm text-muted-foreground">
            Simulacro en papel a libro cerrado con auditoría de créditos parciales en KaTeX.
          </p>
        </div>

        {/* Phase Stepper Pills */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-100 p-1.5 rounded-lg text-xs font-semibold">
          <span className={`px-2.5 py-1 rounded-md ${phase === "SETUP" || phase === "SOLVING" ? "bg-white text-primary shadow-sm" : "text-slate-500"}`}>
            1. Enfoque
          </span>
          <span className={`px-2.5 py-1 rounded-md ${phase === "UPLOAD" ? "bg-white text-primary shadow-sm" : "text-slate-500"}`}>
            2. Foto
          </span>
          <span className={`px-2.5 py-1 rounded-md ${phase === "AUDIT" ? "bg-white text-primary shadow-sm" : "text-slate-500"}`}>
            3. Auditoría
          </span>
        </div>
      </div>

      {/* FASE 1: SETUP & SOLVING */}
      {(phase === "SETUP" || phase === "SOLVING") && (
        <div className="space-y-6">
          <Card className="border-slate-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge variant="secondary">{sampleProblem.subject}</Badge>
                <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                  <Clock className="h-4 w-4 text-primary" />
                  Tiempo Estimado: {sampleProblem.estimatedMinutes} min
                </div>
              </div>
              <CardTitle className="text-xl mt-2">{sampleProblem.title}</CardTitle>
              <CardDescription>
                Resuelve el siguiente ejercicio en una hoja en blanco con lápiz o bolígrafo, sin consultar material de apoyo.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="rounded-xl bg-slate-50 border p-6 text-center">
                <span className="text-xs uppercase font-semibold text-slate-500 block mb-2">
                  Enunciado Oficial
                </span>
                <MathRenderer math={sampleProblem.statementLatex} block className="text-xl sm:text-2xl text-slate-900" />
              </div>

              {phase === "SOLVING" && (
                <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-primary/[0.03] border border-primary/20 space-y-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                    Cronómetro de Parcial en Curso
                  </span>
                  <div className="font-mono text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
                    {formatTime(secondsLeft)}
                  </div>
                  <p className="text-xs text-muted-foreground text-center max-w-md">
                    Mantén tu concentración en el papel. Al finalizar todo el procedimiento manuscrito, presiona el botón inferior.
                  </p>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex justify-end gap-3 border-t bg-slate-50/50 pt-4">
              {phase === "SETUP" ? (
                <Button size="lg" onClick={handleStartExam} className="gap-2">
                  <Play className="h-4 w-4" />
                  Comenzar Parcial a Ciegas
                </Button>
              ) : (
                <Button size="lg" onClick={handleFinishPaper} className="gap-2">
                  <UploadCloud className="h-4 w-4" />
                  He terminado en papel (Subir foto)
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      )}

      {/* FASE 2: UPLOAD */}
      {phase === "UPLOAD" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Carga de Evidencia Manuscrita</CardTitle>
              <CardDescription>
                Sube una fotografía de tu desarrollo en papel o utiliza una muestra predefinida para probar la auditoría.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Presets rápidos */}
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase text-slate-500">
                  Muestras de Examen Rápidas (Prueba Inmediata):
                </span>
                <div className="flex flex-wrap gap-3">
                  <Button
                    type="button"
                    variant={selectedImage.includes("derivatives") ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedImage("/samples/sample_exam_derivatives.svg")}
                    className="gap-2"
                  >
                    <FileImage className="h-4 w-4" />
                    Muestra 1: Cálculo (Derivadas)
                  </Button>

                  <Button
                    type="button"
                    variant={selectedImage.includes("physics") ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedImage("/samples/sample_exam_physics.svg")}
                    className="gap-2"
                  >
                    <FileImage className="h-4 w-4" />
                    Muestra 2: Física (Impulso)
                  </Button>
                </div>
              </div>

              {/* Preview Area */}
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl p-6 bg-slate-50/50">
                <div className="relative max-w-sm overflow-hidden rounded-lg border bg-white shadow-sm">
                  <img
                    src={selectedImage}
                    alt="Evidencia manuscrita"
                    style={{ transform: `rotate(${rotation}deg)` }}
                    className="transition-transform duration-300 max-h-80 object-contain w-full"
                  />
                </div>

                <div className="flex items-center gap-3 mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setRotation((prev) => (prev + 90) % 360)}
                    className="gap-1.5"
                  >
                    <RotateCw className="h-3.5 w-3.5" />
                    Rotar 90°
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    Formato detectado: Imagen Vectorial / Foto
                  </span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-between border-t bg-slate-50/50 pt-4">
              <Button variant="ghost" onClick={() => setPhase("SOLVING")}>
                Regresar al cronómetro
              </Button>
              <Button
                size="lg"
                onClick={handleStartAudit}
                disabled={isAuditing}
                className="gap-2"
              >
                {isAuditing ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Segmentando y auditando con OCR...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Evaluar procedimiento con OCR
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* FASE 3: AUDIT */}
      {phase === "AUDIT" && (
        <div className="space-y-6">
          {/* Summary Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl bg-emerald-50 border border-emerald-200 p-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Award className="h-6 w-6 text-emerald-600" />
                <h2 className="text-lg font-bold text-emerald-950">Auditoría Paso a Paso Completada</h2>
              </div>
              <p className="text-xs sm:text-sm text-emerald-800">
                {sampleProblem.mockAudit.summary}
              </p>
            </div>

            <div className="text-right self-start sm:self-auto">
              <div className="text-xs text-emerald-600 font-semibold uppercase">Calificación Parcial</div>
              <div className="text-3xl font-extrabold text-emerald-950 leading-none">
                {sampleProblem.mockAudit.finalScore} <span className="text-sm font-medium text-emerald-700">/ {sampleProblem.mockAudit.maxScore}</span>
              </div>
            </div>
          </div>

          {/* Two-column Audit Split View */}
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Columna Izquierda: Imagen manuscrita */}
            <div className="lg:col-span-5 space-y-3">
              <div className="text-xs font-semibold uppercase text-slate-500">
                Hoja de Examen Manuscrita
              </div>
              <div className="rounded-xl border bg-white p-3 shadow-sm sticky top-20">
                <img
                  src={selectedImage}
                  alt="Desarrollo manuscrito"
                  style={{ transform: `rotate(${rotation}deg)` }}
                  className="rounded-lg w-full max-h-[500px] object-contain"
                />
              </div>
            </div>

            {/* Columna Derecha: Pasos extraídos en KaTeX */}
            <div className="lg:col-span-7 space-y-4">
              <div className="text-xs font-semibold uppercase text-slate-500 flex justify-between">
                <span>Desglose Analítico en LaTeX ({sampleProblem.mockAudit.steps.length} Pasos)</span>
                <span className="text-primary font-mono text-[11px]">Motor de Crédito Parcial</span>
              </div>

              {sampleProblem.mockAudit.steps.map((step) => (
                <Card key={step.stepNumber} className="border-slate-200 shadow-sm">
                  <CardHeader className="py-3 px-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">
                        Paso {step.stepNumber}
                      </span>
                      {renderStatusBadge(step.status)}
                    </div>
                  </CardHeader>

                  <CardContent className="py-2 px-4 space-y-2">
                    <div className="rounded-lg bg-slate-50 p-3 border text-center">
                      <MathRenderer math={step.latexExpression} block className="text-base text-slate-900" />
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {step.feedback}
                    </p>
                  </CardContent>
                </Card>
              ))}

              <div className="pt-4 flex justify-between">
                <Button variant="outline" onClick={() => setPhase("SETUP")}>
                  Probar otro ejercicio
                </Button>
                <Button onClick={() => setPhase("UPLOAD")}>
                  Subir otra evidencia
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
