import * as React from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FileCheck2, ArrowLeft, Cpu, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockExamProblems } from "@/mocks/quackData";
import { ExamProblem, MockAuditResult, ExamPhase } from "@/types/exam";
import { useTimer } from "@/hooks/useTimer";
import { ocrAuditService, isGeminiActive, getActiveModel } from "@/services/serviceFactory";
import { ExamProblemSelector } from "@/components/exam/ExamProblemSelector";
import { ExamFocusMode } from "@/components/exam/ExamFocusMode";
import { EvidenceDropzone } from "@/components/exam/EvidenceDropzone";
import { AuditProgressAnimation } from "@/components/exam/AuditProgressAnimation";
import { AuditSplitView } from "@/components/exam/AuditSplitView";

function formatDuration(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export const ExamPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const moduleParam = searchParams.get("module");

  const filteredProblems = React.useMemo(() => {
    if (!moduleParam) return mockExamProblems;
    if (moduleParam === "algebra") return mockExamProblems.filter(p => p.subject === "Álgebra Lineal");
    if (moduleParam === "calculo") return mockExamProblems.filter(p => p.subject === "Cálculo Diferencial" || p.subject === "Cálculo Integral");
    if (moduleParam === "fisica") return mockExamProblems.filter(p => p.subject === "Física Mecánica");
    return mockExamProblems;
  }, [moduleParam]);

  const [phase, setPhase] = React.useState<ExamPhase>("SETUP");
  const [selectedProblem, setSelectedProblem] = React.useState<ExamProblem>(filteredProblems[0] || mockExamProblems[0]);
  const [selectedImage, setSelectedImage] = React.useState<string>("");
  const [rotation, setRotation] = React.useState<number>(0);
  const [isAuditing, setIsAuditing] = React.useState<boolean>(false);
  const [auditResult, setAuditResult] = React.useState<MockAuditResult | null>(null);
  const [activeEngine, setActiveEngine] = React.useState<"gemini" | "mock">(
    isGeminiActive() ? "gemini" : "mock"
  );

  const activeModel = getActiveModel();

  // Temporizador de examen a libro cerrado
  const examTimer = useTimer({
    initialSeconds: selectedProblem.estimatedMinutes * 60,
    mode: "countdown",
  });

  // Tiempo invertido en papel durante el examen
  const totalEstimatedSeconds = selectedProblem.estimatedMinutes * 60;
  const elapsedPaperSeconds = Math.max(0, totalEstimatedSeconds - examTimer.seconds);
  const elapsedTimeFormatted = formatDuration(elapsedPaperSeconds);

  // Cuando cambia el problema seleccionado
  const handleSelectProblem = (problem: ExamProblem) => {
    setSelectedProblem(problem);
    setSelectedImage("");
    setRotation(0);
    setAuditResult(null);
    examTimer.reset(problem.estimatedMinutes * 60);
  };

  // Comenzar examen (fase SOLVING)
  const handleStartExam = () => {
    setSelectedImage("");
    setRotation(0);
    setAuditResult(null);
    setActiveEngine(isGeminiActive() ? "gemini" : "mock");
    examTimer.reset(selectedProblem.estimatedMinutes * 60);
    examTimer.start();
    setPhase("SOLVING");
  };

  // Finalizar papel y pasar a carga de evidencia (inicia vacía para subir foto o usar cámara)
  const handleFinishPaper = () => {
    examTimer.pause();
    setPhase("UPLOAD");
  };

  // Iniciar auditoría OCR con Gemini Vision (o fallback local)
  const handleStartAudit = async () => {
    if (!selectedImage) return;
    setIsAuditing(true);

    try {
      const result = await ocrAuditService.auditSolution(
        selectedProblem,
        selectedImage,
        rotation
      );
      if (result.engineUsed) {
        setActiveEngine(result.engineUsed);
      }
      setAuditResult(result);
    } catch (err) {
      console.warn("Error inesperado en auditoría OCR:", err);
      setActiveEngine("mock");
      setAuditResult({
        ...selectedProblem.mockAudit,
        engineUsed: "mock",
        warning:
          "Ocurrió un error al procesar la solicitud con Gemini Vision. Se muestra la evaluación pedagógica local.",
      });
    } finally {
      setIsAuditing(false);
      setPhase("AUDIT");
    }
  };

  return (
    <div className="container py-8 max-w-6xl space-y-8">
      {/* Header & Stepper de Fases */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-6">
        <div>
          <Button asChild variant="ghost" size="sm" className="mb-2 -ml-3 text-muted-foreground">
            <Link to="/dashboard">
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Volver al Panel
            </Link>
          </Button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-quack-gunmetal sm:text-3xl flex items-center gap-2.5">
              <FileCheck2 className="h-7 w-7 text-quack-gunmetal" />
              Módulo 2: Parcial a Ciegas OCR
            </h1>

            {activeEngine === "gemini" ? (
              <Badge
                variant="outline"
                className="border-emerald-400 bg-emerald-50 text-emerald-800 font-semibold text-xs py-1 px-2.5 gap-1.5 "
                title={`Motor de Visión: ${activeModel}`}
              >
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <Cpu className="h-3.5 w-3.5 text-emerald-600" />
                Online ({activeModel})
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="border-slate-300 bg-slate-50 text-slate-700 font-medium text-xs py-1 px-2.5 gap-1.5 "
                title="Modo pedagógico local activo"
              >
                <Database className="h-3.5 w-3.5 text-slate-500" />
                Modo Local
              </Badge>
            )}
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Simulacro a libro cerrado en papel y lápiz con auditoría de créditos parciales y detección de arrastre de error.
          </p>
        </div>

        {/* Phase Stepper Pills */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-100 p-1.5 rounded-2xl text-xs font-semibold">
          <span
            className={`px-3 py-1.5 rounded-xl transition-all ${
              phase === "SETUP"
                ? "bg-white text-quack-gunmetal  font-bold"
                : "text-slate-500"
            }`}
          >
            1. Problema
          </span>
          <span
            className={`px-3 py-1.5 rounded-xl transition-all ${
              phase === "SOLVING"
                ? "bg-white text-quack-caramel  font-bold"
                : "text-slate-500"
            }`}
          >
            2. Enfoque Papel
          </span>
          <span
            className={`px-3 py-1.5 rounded-xl transition-all ${
              phase === "UPLOAD"
                ? "bg-white text-quack-amber  font-bold"
                : "text-slate-500"
            }`}
          >
            3. Evidencia Foto
          </span>
          <span
            className={`px-3 py-1.5 rounded-xl transition-all ${
              phase === "AUDIT"
                ? "bg-white text-emerald-700  font-bold"
                : "text-slate-500"
            }`}
          >
            4. Auditoría KaTeX
          </span>
        </div>
      </div>

      {/* RENDERIZADO CONDICIONAL POR FASES */}

      {/* FASE 1: SETUP */}
      {phase === "SETUP" && (
        <ExamProblemSelector
          problems={filteredProblems}
          selectedProblemId={selectedProblem.id}
          onSelectProblem={handleSelectProblem}
          onStartExam={handleStartExam}
        />
      )}

      {/* FASE 2: SOLVING (Modo Enfoque con Cronómetro) */}
      {phase === "SOLVING" && (
        <ExamFocusMode
          problem={selectedProblem}
          formattedTime={examTimer.formattedTime}
          isRunning={examTimer.isRunning}
          isPaused={examTimer.isPaused}
          onPause={examTimer.pause}
          onResume={examTimer.resume}
          onFinishPaper={handleFinishPaper}
          onBackToSelector={() => {
            examTimer.reset();
            setPhase("SETUP");
          }}
        />
      )}

      {/* FASE 3: UPLOAD (Captura con Cámara, Arrastre de Foto y Previsualización) */}
      {phase === "UPLOAD" && !isAuditing && (
        <EvidenceDropzone
          problem={selectedProblem}
          allProblems={filteredProblems}
          selectedImage={selectedImage}
          rotation={rotation}
          onRotate={() => setRotation((prev) => (prev + 90) % 360)}
          onImageSelected={(img) => {
            setSelectedImage(img);
            setRotation(0);
          }}
          onClearImage={() => {
            setSelectedImage("");
            setRotation(0);
          }}
          onBackToTimer={() => setPhase("SOLVING")}
          onStartAudit={handleStartAudit}
          isAuditing={isAuditing}
        />
      )}

      {/* ANIMACIÓN DE PROGRESO OCR */}
      {isAuditing && <AuditProgressAnimation />}

      {/* FASE 4: AUDIT (Split View en KaTeX con Badges de Error y Nota Final) */}
      {phase === "AUDIT" && auditResult && !isAuditing && (
        <AuditSplitView
          problem={selectedProblem}
          auditResult={auditResult}
          selectedImage={selectedImage}
          rotation={rotation}
          elapsedTimeFormatted={elapsedTimeFormatted}
          onRotate={() => setRotation((prev) => (prev + 90) % 360)}
          onRetryAudit={handleStartAudit}
          onSelectAnotherProblem={() => {
            setSelectedImage("");
            setRotation(0);
            setAuditResult(null);
            setPhase("SETUP");
          }}
          onReuploadEvidence={() => setPhase("UPLOAD")}
        />
      )}
    </div>
  );
};
