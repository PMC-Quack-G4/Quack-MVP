import * as React from "react";
import { Link } from "react-router-dom";
import { FileCheck2, ArrowLeft, Cpu, Database, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockExamProblems } from "@/mocks/quackData";
import { ExamProblem, MockAuditResult, ExamPhase } from "@/types/exam";
import { useTimer } from "@/hooks/useTimer";
import { ocrAuditService, isGeminiActive, subscribeToApiKeyChange } from "@/services/serviceFactory";
import { ExamProblemSelector } from "@/components/exam/ExamProblemSelector";
import { ExamFocusMode } from "@/components/exam/ExamFocusMode";
import { EvidenceDropzone } from "@/components/exam/EvidenceDropzone";
import { AuditProgressAnimation } from "@/components/exam/AuditProgressAnimation";
import { AuditSplitView } from "@/components/exam/AuditSplitView";
import { ApiKeyModal } from "@/components/common/ApiKeyModal";

export const ExamPage: React.FC = () => {
  const [phase, setPhase] = React.useState<ExamPhase>("SETUP");
  const [selectedProblem, setSelectedProblem] = React.useState<ExamProblem>(mockExamProblems[0]);
  const [selectedImage, setSelectedImage] = React.useState<string>(mockExamProblems[0].defaultSampleImage);
  const [rotation, setRotation] = React.useState<number>(0);
  const [isAuditing, setIsAuditing] = React.useState<boolean>(false);
  const [auditResult, setAuditResult] = React.useState<MockAuditResult | null>(null);
  const [hasGeminiKey, setHasGeminiKey] = React.useState<boolean>(isGeminiActive());
  const [isKeyModalOpen, setIsKeyModalOpen] = React.useState<boolean>(false);

  // Suscripción reactiva a cambios de API key
  React.useEffect(() => {
    const unsub = subscribeToApiKeyChange(() => {
      setHasGeminiKey(isGeminiActive());
    });
    return unsub;
  }, []);

  // Temporizador de examen a libro cerrado
  const examTimer = useTimer({
    initialSeconds: selectedProblem.estimatedMinutes * 60,
    mode: "countdown",
  });

  // Cuando cambia el problema seleccionado
  const handleSelectProblem = (problem: ExamProblem) => {
    setSelectedProblem(problem);
    setSelectedImage(problem.defaultSampleImage);
    setRotation(0);
    examTimer.reset(problem.estimatedMinutes * 60);
  };

  // Comenzar examen (fase SOLVING)
  const handleStartExam = () => {
    examTimer.reset(selectedProblem.estimatedMinutes * 60);
    examTimer.start();
    setPhase("SOLVING");
  };

  // Finalizar papel y pasar a carga de evidencia
  const handleFinishPaper = () => {
    examTimer.pause();
    setPhase("UPLOAD");
  };

  // Iniciar auditoría OCR
  const handleStartAudit = async () => {
    setIsAuditing(true);

    try {
      const result = await ocrAuditService.auditSolution(selectedProblem, selectedImage);
      setAuditResult(result);
    } catch (err) {
      console.warn("Error en auditoría OCR:", err);
      setAuditResult(selectedProblem.mockAudit);
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
            <Link to="/">
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Volver al Inicio
            </Link>
          </Button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-quack-gunmetal sm:text-3xl flex items-center gap-2.5">
              <FileCheck2 className="h-7 w-7 text-quack-gunmetal" />
              Módulo 2: Parcial a Ciegas OCR
            </h1>

            <button
              type="button"
              onClick={() => setIsKeyModalOpen(true)}
              className="focus:outline-none"
            >
              {hasGeminiKey ? (
                <Badge className="border-emerald-400 bg-emerald-50 text-emerald-800 font-semibold text-xs py-1 px-2.5 hover:bg-emerald-100 gap-1.5 transition-colors cursor-pointer shadow-2xs">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <Cpu className="h-3.5 w-3.5 text-emerald-600" />
                  Gemini 2.0 Flash Vision
                  <Settings className="h-3 w-3 text-slate-400 ml-0.5" />
                </Badge>
              ) : (
                <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-900 font-medium text-xs py-1 px-2.5 hover:bg-amber-100 gap-1.5 transition-colors cursor-pointer shadow-2xs">
                  <Database className="h-3.5 w-3.5 text-quack-caramel" />
                  Auditor Simbólico Mock
                  <span className="text-[10px] text-quack-caramel font-bold underline">
                    Conectar IA
                  </span>
                </Badge>
              )}
            </button>
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
                ? "bg-white text-quack-gunmetal shadow-sm font-bold"
                : "text-slate-500"
            }`}
          >
            1. Problema
          </span>
          <span
            className={`px-3 py-1.5 rounded-xl transition-all ${
              phase === "SOLVING"
                ? "bg-white text-quack-caramel shadow-sm font-bold"
                : "text-slate-500"
            }`}
          >
            2. Enfoque Papel
          </span>
          <span
            className={`px-3 py-1.5 rounded-xl transition-all ${
              phase === "UPLOAD"
                ? "bg-white text-quack-amber shadow-sm font-bold"
                : "text-slate-500"
            }`}
          >
            3. Evidencia Foto
          </span>
          <span
            className={`px-3 py-1.5 rounded-xl transition-all ${
              phase === "AUDIT"
                ? "bg-white text-emerald-700 shadow-sm font-bold"
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
          problems={mockExamProblems}
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

      {/* FASE 3: UPLOAD (Arrastre de Foto y Previsualización) */}
      {phase === "UPLOAD" && !isAuditing && (
        <EvidenceDropzone
          selectedImage={selectedImage}
          rotation={rotation}
          onRotate={() => setRotation((prev) => (prev + 90) % 360)}
          onImageSelected={(img) => {
            setSelectedImage(img);
            setRotation(0);
          }}
          onClearImage={() => setSelectedImage("")}
          onBackToTimer={() => setPhase("SOLVING")}
          onStartAudit={handleStartAudit}
          isAuditing={isAuditing}
        />
      )}

      {/* ANIMACIÓN DE PROGRESO OCR */}
      {isAuditing && <AuditProgressAnimation />}

      {/* FASE 4: AUDIT (Split View en KaTeX con Badges de Error) */}
      {phase === "AUDIT" && auditResult && !isAuditing && (
        <AuditSplitView
          problem={selectedProblem}
          auditResult={auditResult}
          selectedImage={selectedImage}
          rotation={rotation}
          onRotate={() => setRotation((prev) => (prev + 90) % 360)}
          onSelectAnotherProblem={() => setPhase("SETUP")}
          onReuploadEvidence={() => setPhase("UPLOAD")}
        />
      )}

      {/* Modal para configurar la API Key de Gemini */}
      <ApiKeyModal isOpen={isKeyModalOpen} onClose={() => setIsKeyModalOpen(false)} />
    </div>
  );
};
