import * as React from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Mic, BookOpen, RotateCcw, Cpu, Database, Keyboard, AlertCircle, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockFeynmanTopics } from "@/mocks/quackData";
import { FeynmanTopic, ChatMessage, FeynmanSessionSummary, SubtopicScoreData } from "@/types/feynman";
import { useAuth } from "@/context/AuthContext";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { useTimer } from "@/hooks/useTimer";
import { feynmanService, isGeminiActive, getActiveModel } from "@/services/serviceFactory";
import { ConceptSelector } from "@/components/feynman/ConceptSelector";
import { PushToTalkButton } from "@/components/feynman/PushToTalkButton";
import { TranscriptFeed } from "@/components/feynman/TranscriptFeed";
import { ConceptChecklistCard } from "@/components/feynman/ConceptChecklistCard";
import { SpeechFallbackInput } from "@/components/feynman/SpeechFallbackInput";
import { SessionSummaryModal } from "@/components/feynman/SessionSummaryModal";
import { cn } from "@/lib/utils";

export const FeynmanDemoPage: React.FC = () => {
  const {
    user,
    courses,
    selectedCourseId,
    setSelectedCourseId,
    getTopicsForCourse,
    getCourseForFeynmanTopic,
    recordPracticeAttempt,
  } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const urlCourseId = searchParams.get("course");
  const urlTopicId = searchParams.get("topic");

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

  const scopedTopics = React.useMemo(() => {
    const filtered = getTopicsForCourse(courseFilter === "all" ? null : courseFilter);
    return filtered.length > 0 ? filtered : mockFeynmanTopics;
  }, [getTopicsForCourse, courseFilter]);

  const initialTopic = React.useMemo(() => {
    if (urlTopicId) {
      const match = scopedTopics.find((t) => t.id === urlTopicId);
      if (match) return match;
    }
    return scopedTopics[0] ?? mockFeynmanTopics[0];
  }, [urlTopicId, scopedTopics]);

  const [selectedTopic, setSelectedTopic] = React.useState<FeynmanTopic>(initialTopic);
  const [isSessionActive, setIsSessionActive] = React.useState<boolean>(false);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [coveredSubtopicIds, setCoveredSubtopicIds] = React.useState<string[]>([]);
  const [isProcessing, setIsProcessing] = React.useState<boolean>(false);
  const [summary, setSummary] = React.useState<FeynmanSessionSummary | null>(null);
  const [forceTextInput, setForceTextInput] = React.useState<boolean>(false);
  const [activeEngine, setActiveEngine] = React.useState<"gemini" | "mock">(isGeminiActive() ? "gemini" : "mock");
  const [serviceWarning, setServiceWarning] = React.useState<string | null>(null);
  const [subtopicScores, setSubtopicScores] = React.useState<Record<string, SubtopicScoreData>>({});
  const [activeSubtopicId, setActiveSubtopicId] = React.useState<string>(
    initialTopic.subtopics[0]?.id || ""
  );

  // Evita registrar múltiples intentos para una misma sesión concluida
  const recordedAttemptRef = React.useRef<boolean>(false);

  // Sincronizar tema seleccionado si cambia la materia filtrada o el rol del usuario
  React.useEffect(() => {
    if (isSessionActive) return;
    if (urlTopicId) {
      const fromUrl = scopedTopics.find((t) => t.id === urlTopicId);
      if (fromUrl) {
        setSelectedTopic(fromUrl);
        setActiveSubtopicId(fromUrl.subtopics[0]?.id || "");
        return;
      }
    }
    const stillValid = scopedTopics.some((t) => t.id === selectedTopic.id);
    if (!stillValid && scopedTopics[0]) {
      setSelectedTopic(scopedTopics[0]);
      setActiveSubtopicId(scopedTopics[0].subtopics[0]?.id || "");
    }
  }, [scopedTopics, urlTopicId, selectedTopic.id, isSessionActive]);

  const activeModel = getActiveModel();

  const speechRecognition = useSpeechRecognition("es-ES");
  const speechSynthesis = useSpeechSynthesis();
  const sessionTimer = useTimer({ mode: "stopwatch" });

  const activeCourse =
    courses.find((c) => c.id === courseFilter) ??
    getCourseForFeynmanTopic(selectedTopic.id);

  const handleSelectCourseFilter = (nextCourseId: string) => {
    setCourseFilter(nextCourseId);
    setSelectedCourseId(nextCourseId === "all" ? null : nextCourseId);
    const nextParams = new URLSearchParams(searchParams);
    if (nextCourseId === "all") {
      nextParams.delete("course");
    } else {
      nextParams.set("course", nextCourseId);
    }
    nextParams.delete("topic");
    setSearchParams(nextParams, { replace: true });
  };

  // Iniciar sesión interactiva
  const handleStartSession = () => {
    recordedAttemptRef.current = false;
    setIsSessionActive(true);
    setMessages([]);
    setCoveredSubtopicIds([]);
    setSummary(null);
    setForceTextInput(false);
    setServiceWarning(null);
    setActiveEngine(isGeminiActive() ? "gemini" : "mock");
    sessionTimer.reset();
    sessionTimer.start();

    const initialScores: Record<string, SubtopicScoreData> = {};
    selectedTopic.subtopics.forEach((s, idx) => {
      initialScores[s.id] = {
        subtopicId: s.id,
        status: idx === 0 ? "evaluating" : "pending",
        score: 0,
        attempts: 0,
      };
    });
    setSubtopicScores(initialScores);
    setActiveSubtopicId(selectedTopic.subtopics[0]?.id || "");
  };

  // Enviar mensaje del estudiante a Quack (vía voz o fallback de texto)
  const handleProcessStudentExplanation = async (explanationText: string) => {
    if (!explanationText.trim() || isProcessing) return;

    speechRecognition.resetTranscript();

    const studentMessage: ChatMessage = {
      id: `student-${Date.now()}`,
      sender: "student",
      text: explanationText.trim(),
      timestamp: new Date(),
    };

    const newHistory = [...messages, studentMessage];
    setMessages(newHistory);
    setIsProcessing(true);

    try {
      const currentAttempts = (subtopicScores[activeSubtopicId]?.attempts || 0) + 1;
      const updatedScores: Record<string, SubtopicScoreData> = {
        ...subtopicScores,
        [activeSubtopicId]: {
          subtopicId: activeSubtopicId,
          status: subtopicScores[activeSubtopicId]?.status || "evaluating",
          score: subtopicScores[activeSubtopicId]?.score || 0,
          attempts: currentAttempts,
        },
      };

      const result = await feynmanService.sendMessage(
        selectedTopic,
        newHistory,
        explanationText.trim(),
        coveredSubtopicIds,
        updatedScores,
        activeSubtopicId
      );

      if (result.engineUsed) {
        setActiveEngine(result.engineUsed);
      }
      setServiceWarning(result.warning || null);

      const nextScores: Record<string, SubtopicScoreData> = { ...updatedScores };

      if (result.unlockedSubtopicIds.length > 0) {
        result.unlockedSubtopicIds.forEach((id) => {
          nextScores[id] = {
            subtopicId: id,
            status: "mastered",
            score: 100,
            attempts: id === activeSubtopicId ? currentAttempts : (nextScores[id]?.attempts || 1),
          };
        });
      }

      if (result.partialSubtopicIds && result.partialSubtopicIds.length > 0) {
        result.partialSubtopicIds.forEach((id) => {
          if (!result.unlockedSubtopicIds.includes(id)) {
            nextScores[id] = {
              subtopicId: id,
              status: "partial",
              score: 50,
              attempts: id === activeSubtopicId ? currentAttempts : (nextScores[id]?.attempts || 1),
            };
          }
        });
      }

      if (result.failedSubtopicIds && result.failedSubtopicIds.length > 0) {
        result.failedSubtopicIds.forEach((id) => {
          if (
            !result.unlockedSubtopicIds.includes(id) &&
            (!result.partialSubtopicIds || !result.partialSubtopicIds.includes(id))
          ) {
            nextScores[id] = {
              subtopicId: id,
              status: "failed",
              score: 0,
              attempts: id === activeSubtopicId ? Math.max(currentAttempts, 3) : 3,
            };
          }
        });
      }

      if (
        currentAttempts >= 3 &&
        nextScores[activeSubtopicId]?.status === "evaluating" &&
        !result.unlockedSubtopicIds.includes(activeSubtopicId) &&
        (!result.partialSubtopicIds || !result.partialSubtopicIds.includes(activeSubtopicId)) &&
        (!result.failedSubtopicIds || !result.failedSubtopicIds.includes(activeSubtopicId))
      ) {
        nextScores[activeSubtopicId] = {
          subtopicId: activeSubtopicId,
          status: "failed",
          score: 0,
          attempts: 3,
        };
      }

      const newCoveredIds = Array.from(
        new Set([
          ...coveredSubtopicIds,
          ...result.unlockedSubtopicIds,
        ])
      );
      setCoveredSubtopicIds(newCoveredIds);

      let nextActiveId = result.nextActiveSubtopicId;
      const currentStatus = nextScores[activeSubtopicId]?.status;
      const isActiveDone =
        currentStatus === "mastered" || currentStatus === "partial" || currentStatus === "failed";

      if (!nextActiveId && isActiveDone) {
        const nextPending = selectedTopic.subtopics.find((s) => {
          const st = nextScores[s.id]?.status;
          return st !== "mastered" && st !== "partial" && st !== "failed";
        });
        nextActiveId = nextPending?.id;
      }

      if (nextActiveId) {
        setActiveSubtopicId(nextActiveId);
        if (nextScores[nextActiveId]?.status === "pending") {
          nextScores[nextActiveId].status = "evaluating";
        }
      }

      setSubtopicScores(nextScores);

      const quackMsgId = `quack-${Date.now()}`;
      const quackMessage: ChatMessage = {
        id: quackMsgId,
        sender: "quack",
        text: result.reply,
        timestamp: new Date(),
        audioId: quackMsgId,
      };

      setMessages((prev) => [...prev, quackMessage]);

      const allEvaluated = selectedTopic.subtopics.every((s) => {
        const st = nextScores[s.id]?.status;
        return st === "mastered" || st === "partial" || st === "failed";
      });

      const isFinished = Boolean(result.isSessionFinished || allEvaluated);

      if (isFinished) {
        let finishTriggered = false;
        const triggerFinish = () => {
          if (finishTriggered) return;
          finishTriggered = true;
          setTimeout(() => {
            handleFinishSession(nextScores);
          }, 700);
        };

        speechSynthesis.speak(result.reply, quackMsgId, () => {
          triggerFinish();
        });

        const wordCount = result.reply.trim().split(/\s+/).length;
        const estimatedDurationMs = Math.max(5000, Math.round(wordCount * 450) + 2500);
        setTimeout(() => {
          triggerFinish();
        }, estimatedDurationMs);
      } else {
        speechSynthesis.speak(result.reply, quackMsgId);
      }
    } catch (err) {
      console.warn("Error al procesar mensaje con Quack:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartPtt = () => {
    speechSynthesis.stop();
    speechRecognition.startListening();
  };

  const handleEndPtt = () => {
    speechRecognition.stopListening();
    setTimeout(() => {
      const fullText = (
        speechRecognition.transcript || speechRecognition.interimTranscript
      ).trim();
      if (fullText) {
        handleProcessStudentExplanation(fullText);
      }
    }, 250);
  };

  const handleFinishSession = (customScores?: Record<string, SubtopicScoreData>) => {
    sessionTimer.pause();
    speechSynthesis.stop();

    const scoresToUse = customScores || subtopicScores;

    const mastered = selectedTopic.subtopics.filter(
      (s) => scoresToUse[s.id]?.status === "mastered" || coveredSubtopicIds.includes(s.id)
    );
    const partial = selectedTopic.subtopics.filter(
      (s) => scoresToUse[s.id]?.status === "partial"
    );
    const missing = selectedTopic.subtopics.filter(
      (s) => !mastered.some((m) => m.id === s.id) && !partial.some((p) => p.id === s.id)
    );

    const totalCount = selectedTopic.subtopics.length;
    const totalScoreSum = selectedTopic.subtopics.reduce((acc, s) => {
      const itemScore = scoresToUse[s.id]?.score;
      if (typeof itemScore === "number") return acc + itemScore;
      if (coveredSubtopicIds.includes(s.id)) return acc + 100;
      return acc;
    }, 0);

    const percentage = totalCount > 0 ? Math.round(totalScoreSum / totalCount) : 100;

    let advice = "";
    if (percentage === 100) {
      advice =
        "¡Excelente trabajo pedagógico! Lograste explicar cada subconcepto sin recurrir a atajos ni tecnicismos vacíos. Has erradicado la ilusión de competencia en este tema.";
    } else if (percentage >= 50) {
      advice = `Buen avance verbalizando el razonamiento. Te recomendamos reforzar los aspectos pendientes (${missing
        .map((m) => m.name)
        .join(", ")}) formulando analogías directas sin fórmulas complejas.`;
    } else {
      advice =
        "Detectamos vacíos iniciales al conectar la intuición física o matemática. Intenta explicarle a Quack pensando en qué le pasaría a una persona común si experimentara este fenómeno.";
    }

    const sessionSummary: FeynmanSessionSummary = {
      topicId: selectedTopic.id,
      topicTitle: selectedTopic.title,
      durationSeconds: sessionTimer.seconds,
      totalExplanations: messages.filter((m) => m.sender === "student").length,
      masteredSubtopics: mastered,
      partialSubtopics: partial,
      missingSubtopics: missing,
      masteryPercentage: percentage,
      pedagogicalAdvice: advice,
    };

    // Registrar progreso real en la sesión del estudiante (Campus o Individual)
    if (!recordedAttemptRef.current && user?.role !== "institution") {
      recordedAttemptRef.current = true;
      const targetCourse = getCourseForFeynmanTopic(selectedTopic.id) ?? activeCourse;
      if (targetCourse) {
        recordPracticeAttempt({
          courseId: targetCourse.id,
          courseTitle: targetCourse.title,
          topicId: selectedTopic.id,
          topicTitle: selectedTopic.title,
          mode: "feynman",
          masteryPercent: percentage,
          durationSeconds: Math.max(60, sessionTimer.seconds),
        });
      }
    }

    setSummary(sessionSummary);
  };

  return (
    <div className="container py-8 flex flex-col gap-6 max-w-6xl">
      {/* Header & Navegación */}
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
              <Mic className="h-7 w-7 text-quack-caramel" />
              Módulo 1: Feynman Oral (IA Invertida)
            </h1>

            {activeEngine === "gemini" ? (
              <Badge
                variant="outline"
                className="border-emerald-400 bg-emerald-50 text-emerald-800 font-semibold text-xs py-1 px-2.5 gap-1.5 shadow-2xs"
                title={`Motor de IA: ${activeModel}`}
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
            {user?.name ? `${user.name}, enseña` : "Enseña"} a tu alumna curiosa ("Quack") mediante tu propia voz para erradicar la ilusión de saber.
          </p>
        </div>

        {isSessionActive && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsSessionActive(false);
                setForceTextInput(false);
                speechSynthesis.stop();
              }}
              className="gap-1.5 rounded-xl text-xs"
            >
              <BookOpen className="h-3.5 w-3.5" />
              Cambiar Tema
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleStartSession}
              className="gap-1.5 rounded-xl text-xs"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reiniciar
            </Button>
          </div>
        )}
      </div>

      {/* Filtro de Contexto por Materia (Paso previo para mantener aislamiento real por curso) */}
      {!isSessionActive && courses.length > 0 && (
        <div
          aria-label="Filtrar temas por materia matriculada"
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

      {/* Vista de Selección de Tema (Paso 1) */}
      {!isSessionActive ? (
        <ConceptSelector
          topics={scopedTopics}
          selectedTopicId={selectedTopic.id}
          onSelectTopic={(topic) => {
            setSelectedTopic(topic);
            setActiveSubtopicId(topic.subtopics[0]?.id || "");
          }}
          onStartSession={handleStartSession}
        />
      ) : (
        /* Vista Activa de Diálogo Feynman (Paso 2) */
        <div className="space-y-6">
          {/* Barra de Contexto del Tema */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-amber-100/60 to-quack-dandelion/40 border border-amber-200">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-quack-caramel block">
                {activeCourse ? `${activeCourse.code} · ${activeCourse.title}` : "Tema en Explicación"}
              </span>
              <h2 className="font-brand text-lg font-bold text-quack-gunmetal">
                {selectedTopic.title}
              </h2>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              {speechRecognition.isSupported && (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border bg-white/90 text-quack-gunmetal shadow-2xs border-amber-200">
                    {forceTextInput ? (
                      <>
                        <Keyboard className="h-3.5 w-3.5 text-quack-caramel" />
                        Texto activo
                      </>
                    ) : (
                      <>
                        <Mic className="h-3.5 w-3.5 text-quack-caramel" />
                        Voz activa (Por defecto)
                      </>
                    )}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setForceTextInput(!forceTextInput)}
                    className="h-7 text-xs rounded-lg border-amber-200 bg-white/80 hover:bg-white text-slate-700 hover:text-quack-gunmetal gap-1 shadow-2xs"
                  >
                    {forceTextInput ? (
                      <>
                        <Mic className="h-3 w-3 text-quack-caramel" />
                        Volver a Voz
                      </>
                    ) : (
                      <>
                        <Keyboard className="h-3 w-3 text-slate-500" />
                        Opción Texto
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-12 items-start">
            {/* Columna Izquierda: Historial de Chat y Botón PTT */}
            <div className="lg:col-span-8 space-y-4">
              {serviceWarning && (
                <div className="flex items-center justify-between gap-3 p-3 text-xs bg-amber-50 border border-amber-300 rounded-xl text-amber-900 shadow-2xs animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-quack-caramel shrink-0" />
                    <span>{serviceWarning}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setServiceWarning(null)}
                    className="text-amber-700 hover:text-amber-900 font-bold px-1.5 py-0.5 rounded text-xs"
                    aria-label="Cerrar advertencia"
                  >
                    ✕
                  </button>
                </div>
              )}

              <TranscriptFeed
                messages={messages}
                isListening={speechRecognition.isListening}
                interimTranscript={speechRecognition.interimTranscript}
                isSpeaking={speechSynthesis.isSpeaking}
                currentSpeakingId={speechSynthesis.currentSpeakingId}
                onPlayAudio={(text, id) => speechSynthesis.speak(text, id)}
                onStopAudio={() => speechSynthesis.stop()}
                initialTopicName={selectedTopic.title}
                isProcessing={isProcessing}
              />

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                {!speechRecognition.isSupported || forceTextInput ? (
                  <SpeechFallbackInput
                    onSendMessage={handleProcessStudentExplanation}
                    isProcessing={isProcessing}
                    reason={!speechRecognition.isSupported ? "not-supported" : "user-choice"}
                    onSwitchToVoice={speechRecognition.isSupported ? () => setForceTextInput(false) : undefined}
                  />
                ) : (
                  <div className="space-y-3">
                    <PushToTalkButton
                      isListening={speechRecognition.isListening}
                      isProcessing={isProcessing}
                      onStartTalk={handleStartPtt}
                      onEndTalk={handleEndPtt}
                      onEnableTextInput={() => setForceTextInput(true)}
                    />

                    {speechRecognition.error && (
                      <div className="text-center text-xs text-rose-600 font-medium">
                        {speechRecognition.error}. Si prefieres, puedes habilitar la opción por texto.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Columna Derecha: Checklist de Subconceptos y Auditoría */}
            <div className="lg:col-span-4 sticky top-20">
              <ConceptChecklistCard
                subtopics={selectedTopic.subtopics}
                coveredIds={coveredSubtopicIds}
                subtopicScores={subtopicScores}
                activeSubtopicId={activeSubtopicId}
                sessionDuration={sessionTimer.formattedTime}
                onFinishSession={handleFinishSession}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal de Balance Final */}
      {summary && (
        <SessionSummaryModal
          summary={summary}
          onRestart={handleStartSession}
          onChooseOtherTopic={() => {
            setSummary(null);
            setIsSessionActive(false);
          }}
          onReviewChat={() => setSummary(null)}
        />
      )}
    </div>
  );
};
