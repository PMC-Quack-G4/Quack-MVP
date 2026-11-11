import * as React from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FileCheck2, ArrowLeft, Cpu, Database, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockExamProblems } from "@/mocks/quackData";
import { ExamProblem, MockAuditResult, ExamPhase } from "@/types/exam";
import { useAuth } from "@/context/AuthContext";
import { useTimer } from "@/hooks/useTimer";
import { ocrAuditService, isGeminiActive, getActiveModel } from "@/services/serviceFactory";
import { ExamProblemSelector } from "@/components/exam/ExamProblemSelector";
import { ExamFocusMode } from "@/components/exam/ExamFocusMode";
import { EvidenceDropzone } from "@/components/exam/EvidenceDropzone";
import { AuditProgressAnimation } from "@/components/exam/AuditProgressAnimation";
import { AuditSplitView } from "@/components/exam/AuditSplitView";
import { cn } from "@/lib/utils";
import type { ErrorBreakdownCounts } from "@/types";

function formatDuration(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function summarizeErrorSteps(result: MockAuditResult): ErrorBreakdownCounts {
  return result.steps.reduce(
    (acc, step) => {
      if (step.status === "CORRECT") acc.correct += 1;
      else if (step.status === "CONCEPTUAL_ERROR") acc.conceptual += 1;
      else if (step.status === "ALGEBRAIC_ERROR") acc.algebraic += 1;
      else if (step.status === "PROPAGATED_ERROR") acc.propagated += 1;
      return acc;
    },
    { correct: 0, conceptual: 0, algebraic: 0, propagated: 0 }
  );
}

export const ExamPage: React.FC = () => {
  const {
    user,
    courses,
    selectedCourseId,
    setSelectedCourseId,
    getProblemsForCourse,
    getCourseForExamProblem,
    recordPracticeAttempt,
  } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const urlCourseId = searchParams.get("course");
  const urlProblemId = searchParams.get("problem");

  const validInitialCourse = React.useMemo(() => {
    if (urlCourseId && courses.some((c) => c.id === urlCourseId)) return urlCourseId;
    if (selectedCourseId && courses.some((c) => c.id === selectedCourseId)) return selectedCourseId;
    return "all";
  }, [urlCourseId, selectedCourseId, courses]);

  const [courseFilter, setCourseFilter] = React.useState<string>(validInitialCourse);

  React.useEffect(() => {
    if (urlCourseId && courses.some((c) => c.id === urlCourseId)) {
      setCourseFilter(urlCourseId);
      setSelectedCourseId(urlCourseId);
    }
  }, [urlCourseId, courses, setSelectedCourseId]);

  const scopedProblems = React.useMemo(() => {
    const filtered = getProblemsForCourse(courseFilter === "all" ? null : courseFilter);
    return filtered.length > 0 ? filtered : mockExamProblems;
  }, [getProblemsForCourse, courseFilter]);

  const initialProblem = React.useMemo(() => {
    if (urlProblemId) {
      const match = scopedProblems.find((p) => p.id === urlProblemId);
      if (match) return match;
    }
    return scopedProblems[0] ?? mockExamProblems[0];
  }, [urlProblemId, scopedProblems]);

  const [phase, setPhase] = React.useState<ExamPhase>("SETUP");
  const [selectedProblem, setSelectedProblem] = React.useState<ExamProblem>(initialProblem);
  const [selectedImage, setSelectedImage] = React.useState<string>("");
  const [rotation, setRotation] = React.useState<number>(0);
  const [isAuditing, setIsAuditing] = React.useState<boolean>(false);
  const [auditResult, setAuditResult] = React.useState<MockAuditResult | null>(null);
  const [activeEngine, setActiveEngine] = React.useState<"gemini" | "mock">(
    isGeminiActive() ? "gemini" : "mock"
  );

  const auditRecordedRef = React.useRef<boolean>(false);
  const activeModel = getActiveModel();

  // Temporizador de examen a libro cerrado
  const examTimer = useTimer({
    initialSeconds: selectedProblem.estimatedMinutes * 60,
    mode: "countdown",
  });

  // Sincronizar problema si cambia el curso filtrado o parámetro URL
  React.useEffect(() => {
    if (phase !== "SETUP") return;
    if (urlProblemId) {
      const fromUrl = scopedProblems.find((p) => p.id === urlProblemId);
      if (fromUrl) {
        setSelectedProblem(fromUrl);
        examTimer.reset(fromUrl.estimatedMinutes * 60);
        return;
      }
    }
    const stillValid = scopedProblems.some((p) => p.id === selectedProblem.id);
    if (!stillValid && scopedProblems[0]) {
      setSelectedProblem(scopedProblems[0]);
      examTimer.reset(scopedProblems[0].estimatedMinutes * 60);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scopedProblems, urlProblemId, phase]);

  const activeCourse =
    courses.find((c) => c.id === courseFilter) ??
    getCourseForExamProblem(selectedProblem.id);

  // Tiempo invertido en papel durante el examen
  const totalEstimatedSeconds = selectedProblem.estimatedMinutes * 60;
  const elapsedPaperSeconds = Math.max(0, totalEstimatedSeconds - examTimer.seconds);
  const elapsedTimeFormatted = formatDuration(elapsedPaperSeconds);

  const handleSelectCourseFilter = (nextCourseId: string) => {
    setCourseFilter(nextCourseId);
    setSelectedCourseId(nextCourseId === "all" ? null : nextCourseId);
    const nextParams = new URLSearchParams(searchParams);
    if (nextCourseId === "all") {
      nextParams.delete("course");
    } else {
      nextParams.set("course", nextCourseId);
    }
    nextParams.delete("problem");
    setSearchParams(nextParams, { replace: true });
  };

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
    auditRecordedRef.current = false;
    setSelectedImage("");
    setRotation(0);
    setAuditResult(null);
    setActiveEngine(isGeminiActive() ? "gemini" : "mock");
    examTimer.reset(selectedProblem.estimatedMinutes * 60);
    examTimer.start();
    setPhase("SOLVING");
  };

  // Finalizar papel y pasar a carga de evidencia
  const handleFinishPaper = () => {
    examTimer.pause();
    setPhase("UPLOAD");
  };

  const persistExamOutcome = (result: MockAuditResult) => {
    if (auditRecordedRef.current || user?.role === "institution") return;
    auditRecordedRef.current = true;

    const targetCourse = getCourseForExamProblem(selectedProblem.id) ?? activeCourse;
    if (!targetCourse) return;

    const ratio = result.maxScore > 0 ? result.finalScore / result.maxScore : 0;
    const masteryPercent = Math.max(0, Math.min(100, Math.round(ratio * 100)));
    const examScoreOutOf5 = Number((ratio * 5).toFixed(1));

    recordPracticeAttempt({
      courseId: targetCourse.id,
      courseTitle: targetCourse.title,
      topicId: selectedProblem.id,
      topicTitle: selectedProblem.title,
      mode: "ocr",
      masteryPercent,
      examScoreOutOf5,
      durationSeconds: Math.max(60, elapsedPaperSeconds || 240),
      errorCounts: summarizeErrorSteps(result),
    });
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
      persistExamOutcome(result);
    } catch (err) {
      console.warn("Error inesperado en auditoría OCR:", err);
      setActiveEngine("mock");
      const fallbackResult: MockAuditResult = {
        ...selectedProblem.mockAudit,
        engineUsed: "mock",
        warning:
          "Ocurrió un error al procesar la solicitud con Gemini Vision. Se muestra la evaluación pedagógica local.",
      };
      setAuditResult(fallbackResult);
      persistExamOutcome(fallbackResult);
    } finally {
      setIsAuditing(false);
      setPhase("AUDIT");
    }
  };

  return (
    <div className="container py-8 max-w-6xl flex flex-col gap-6">
      {/* Header & Stepper de Fases */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-6">
        <div>
          <Button asChild variant="ghost" size="sm" className="mb-2 -ml-3 text-muted-foreground">
            <Link to={activeCourse ? `/materias/${activeCourse.id}` : "/materias"}>
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Volver a {activeCourse ? activeCourse.title : "Mis Materias"}
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
                className="border-emerald-400 bg-emerald-50 text-emerald-800 font-semibold text-xs py-1 px-2.5 gap-1.5 shadow-2xs"
                title={`Motor de Visión: ${activeModel}`}
              >
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <Cpu className="h-3.5 w-3.5 text-emerald-600" />
                Online ({activeModel})
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="border-slate-300 bg-slate-50 text-slate-700 font-medium text-xs py-1 px-2.5 gap-1.5 shadow-2xs"
                title="Modo pedagógico local activo"
              >
                <Database className="h-3.5 w-3.5 text-slate-500" />
                Modo Local
              </Badge>
            )}
          </div>
          <p className="text-sm text-slate-600 mt-1">
            {user?.name ? `${user.name}: simulacro` : "Simulacro"} a libro cerrado en papel y lápiz con auditoría de créditos parciales y detección de arrastre de error.
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

      {/* Filtro de Contexto por Materia */}
      {phase === "SETUP" && courses.length > 0 && (
        <div
          aria-label="Filtrar simulacros por materia"
          className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3"
        >
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 mr-1">
            <Layers className="size-3.5 text-quack-caramel" aria-hidden="true" />
            Materia:
          </span>
          <button
            type="button"
            onClick={() => handleSelectCourseFilter("all")}
            className={cn(
              "rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors",
              courseFilter === "all"
                ? "bg-quack-gunmetal text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            )}
          >
            Todas mis materias ({courses.length})
          </button>
          {courses.map((course) => (
            <button
              key={course.id}
              type="button"
              onClick={() => handleSelectCourseFilter(course.id)}
              className={cn(
                "rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors",
                courseFilter === course.id
                  ? "bg-quack-amber text-quack-gunmetal font-bold"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              )}
            >
              {course.code} · {course.title}
            </button>
          ))}
        </div>
      )}

      {/* FASE 1: SETUP */}
      {phase === "SETUP" && (
        <ExamProblemSelector
          problems={scopedProblems}
          selectedProblemId={selectedProblem.id}
          onSelectProblem={handleSelectProblem}
          onStartExam={handleStartExam}
        />
      )}

      {/* FASE 2: SOLVING */}
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

      {/* FASE 3: UPLOAD */}
      {phase === "UPLOAD" && !isAuditing && (
        <EvidenceDropzone
          problem={selectedProblem}
          allProblems={scopedProblems}
          selectedImage={selectedImage}
          rotation={rotation}
          onRotate={() => setRotation((prev) => (prev + 90) % 360)}
          onImageSelected={(img) => {
            auditRecordedRef.current = false;
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

      {isAuditing && <AuditProgressAnimation />}

      {/* FASE 4: AUDIT */}
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
