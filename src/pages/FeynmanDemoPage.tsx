import * as React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mic, Sparkles, BookOpen, RotateCcw, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockFeynmanTopics } from "@/mocks/quackData";
import { FeynmanTopic, ChatMessage, FeynmanSessionSummary } from "@/types/feynman";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { useTimer } from "@/hooks/useTimer";
import { feynmanService, isGeminiActive } from "@/services/serviceFactory";
import { ConceptSelector } from "@/components/feynman/ConceptSelector";
import { PushToTalkButton } from "@/components/feynman/PushToTalkButton";
import { TranscriptFeed } from "@/components/feynman/TranscriptFeed";
import { ConceptChecklistCard } from "@/components/feynman/ConceptChecklistCard";
import { SpeechFallbackInput } from "@/components/feynman/SpeechFallbackInput";
import { SessionSummaryModal } from "@/components/feynman/SessionSummaryModal";

export const FeynmanDemoPage: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = React.useState<FeynmanTopic>(mockFeynmanTopics[0]);
  const [isSessionActive, setIsSessionActive] = React.useState<boolean>(false);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [coveredSubtopicIds, setCoveredSubtopicIds] = React.useState<string[]>([]);
  const [isProcessing, setIsProcessing] = React.useState<boolean>(false);
  const [summary, setSummary] = React.useState<FeynmanSessionSummary | null>(null);
  const [forceTextInput, setForceTextInput] = React.useState<boolean>(false);

  // Hook de reconocimiento de voz (STT)
  const speechRecognition = useSpeechRecognition("es-ES");
  // Hook de síntesis de voz (TTS)
  const speechSynthesis = useSpeechSynthesis();
  // Hook de temporizador para medir duración de la sesión
  const sessionTimer = useTimer({ mode: "stopwatch" });

  // Iniciar sesión interactiva
  const handleStartSession = () => {
    setIsSessionActive(true);
    setMessages([]);
    setCoveredSubtopicIds([]);
    setSummary(null);
    sessionTimer.reset();
    sessionTimer.start();
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
      const result = await feynmanService.sendMessage(
        selectedTopic,
        newHistory,
        explanationText.trim(),
        coveredSubtopicIds
      );

      // Actualizar subconceptos cubiertos
      if (result.unlockedSubtopicIds.length > 0) {
        setCoveredSubtopicIds((prev) => Array.from(new Set([...prev, ...result.unlockedSubtopicIds])));
      }

      const quackMsgId = `quack-${Date.now()}`;
      const quackMessage: ChatMessage = {
        id: quackMsgId,
        sender: "quack",
        text: result.reply,
        timestamp: new Date(),
        audioId: quackMsgId,
      };

      setMessages((prev) => [...prev, quackMessage]);

      // Reproducción automática de voz mediante Web Speech Synthesis
      speechSynthesis.speak(result.reply, quackMsgId);
    } catch (err) {
      console.warn("Error al procesar mensaje con Quack:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Push-to-Talk: Al presionar
  const handleStartPtt = () => {
    speechSynthesis.stop();
    speechRecognition.startListening();
  };

  // Push-to-Talk: Al soltar
  const handleEndPtt = () => {
    speechRecognition.stopListening();
    // Esperar un instante para consolidar el último segmento de voz
    setTimeout(() => {
      const fullText = (
        speechRecognition.transcript || speechRecognition.interimTranscript
      ).trim();
      if (fullText) {
        handleProcessStudentExplanation(fullText);
      }
    }, 250);
  };

  // Finalizar sesión y generar balance
  const handleFinishSession = () => {
    sessionTimer.pause();
    speechSynthesis.stop();

    const covered = selectedTopic.subtopics.filter((s) => coveredSubtopicIds.includes(s.id));
    const missing = selectedTopic.subtopics.filter((s) => !coveredSubtopicIds.includes(s.id));
    const percentage =
      selectedTopic.subtopics.length > 0
        ? Math.round((covered.length / selectedTopic.subtopics.length) * 100)
        : 100;

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
      masteredSubtopics: covered,
      missingSubtopics: missing,
      masteryPercentage: percentage,
      pedagogicalAdvice: advice,
    };

    setSummary(sessionSummary);
  };

  return (
    <div className="container py-8 space-y-8 max-w-6xl">
      {/* Header & Navegación */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-6">
        <div>
          <Button asChild variant="ghost" size="sm" className="mb-2 -ml-3 text-muted-foreground">
            <Link to="/">
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Volver al Inicio
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-quack-gunmetal sm:text-3xl flex items-center gap-2.5">
              <Mic className="h-7 w-7 text-quack-caramel" />
              Módulo 1: Feynman Oral (IA Invertida)
            </h1>
            <Badge variant="outline" className="border-quack-amber bg-amber-50 text-quack-gunmetal font-semibold text-xs">
              {isGeminiActive() ? "Gemini 2.5 Flash" : "Motor Mock Socrático"}
            </Badge>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Enseña a tu alumna despistada ("Quack") mediante tu propia voz para erradicar la ilusión de saber.
          </p>
        </div>

        {isSessionActive && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsSessionActive(false);
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

      {/* Vista de Selección de Tema (Paso 1) */}
      {!isSessionActive ? (
        <ConceptSelector
          topics={mockFeynmanTopics}
          selectedTopicId={selectedTopic.id}
          onSelectTopic={(topic) => setSelectedTopic(topic)}
          onStartSession={handleStartSession}
        />
      ) : (
        /* Vista Activa de Diálogo Feynman (Paso 2) */
        <div className="space-y-6">
          {/* Barra de Contexto del Tema */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-amber-100/60 to-quack-dandelion/40 border border-amber-200">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-quack-caramel block">
                Tema en Explicación
              </span>
              <h2 className="font-brand text-lg font-bold text-quack-gunmetal">
                {selectedTopic.title}
              </h2>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              {/* Selector de modo voz vs teclado */}
              {speechRecognition.isSupported && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setForceTextInput(!forceTextInput)}
                  className="text-xs text-slate-600 hover:text-quack-gunmetal"
                >
                  {forceTextInput ? "Usar Micrófono (PTT)" : "Usar Teclado"}
                </Button>
              )}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-12 items-start">
            {/* Columna Izquierda: Historial de Chat y Botón PTT */}
            <div className="lg:col-span-8 space-y-4">
              <TranscriptFeed
                messages={messages}
                isListening={speechRecognition.isListening}
                interimTranscript={speechRecognition.interimTranscript}
                isSpeaking={speechSynthesis.isSpeaking}
                currentSpeakingId={speechSynthesis.currentSpeakingId}
                onPlayAudio={(text, id) => speechSynthesis.speak(text, id)}
                onStopAudio={() => speechSynthesis.stop()}
                initialTopicName={selectedTopic.title}
              />

              {/* Controles de Entrada (PTT o Fallback Escrito) */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                {!speechRecognition.isSupported || forceTextInput ? (
                  <SpeechFallbackInput
                    onSendMessage={handleProcessStudentExplanation}
                    isProcessing={isProcessing}
                    reason={!speechRecognition.isSupported ? "not-supported" : "user-choice"}
                  />
                ) : (
                  <div className="space-y-3">
                    <PushToTalkButton
                      isListening={speechRecognition.isListening}
                      isProcessing={isProcessing}
                      onStartTalk={handleStartPtt}
                      onEndTalk={handleEndPtt}
                    />

                    {speechRecognition.error && (
                      <div className="text-center text-xs text-rose-600 font-medium">
                        {speechRecognition.error}. Si prefieres, activa el modo teclado.
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
