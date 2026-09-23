import * as React from "react";
import { Sparkles, ArrowRight, BookOpen, Layers } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MathRenderer } from "@/components/common/MathRenderer";
import { FeynmanTopic } from "@/types/feynman";

export interface ConceptSelectorProps {
  topics: FeynmanTopic[];
  selectedTopicId: string;
  onSelectTopic: (topic: FeynmanTopic) => void;
  onStartSession: () => void;
}

export const ConceptSelector: React.FC<ConceptSelectorProps> = ({
  topics,
  selectedTopicId,
  onSelectTopic,
  onStartSession,
}) => {
  const currentSelected = topics.find((t) => t.id === selectedTopicId) || topics[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Badge className="bg-quack-dandelion text-quack-gunmetal border-quack-amber/40 mb-2 font-medium">
            <Sparkles className="h-3 w-3 mr-1 text-quack-caramel" />
            Paso 1: Temario Oficial STEM
          </Badge>
          <h2 className="font-brand text-2xl font-bold text-quack-gunmetal">
            Elige el concepto que le vas a enseñar a Quack
          </h2>
          <p className="text-sm text-slate-600">
            Asume el rol de docente. Quack no sabe nada y necesita que le expliques desde cero con tus propias palabras.
          </p>
        </div>

        {currentSelected && (
          <Button
            size="lg"
            onClick={onStartSession}
            className="bg-quack-amber hover:bg-amber-500 text-quack-gunmetal font-bold shadow-md gap-2 rounded-xl shrink-0 self-start sm:self-auto transition-all transform hover:scale-[1.02]"
          >
            Iniciar Sesión con Quack
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {topics.map((topic) => {
          const isSelected = topic.id === selectedTopicId;

          return (
            <Card
              key={topic.id}
              onClick={() => onSelectTopic(topic)}
              className={`cursor-pointer transition-all duration-200 border-2 rounded-2xl overflow-hidden hover:shadow-md ${
                isSelected
                  ? "border-quack-amber bg-quack-dandelion/15 shadow-sm ring-2 ring-quack-amber/30"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="secondary" className="bg-slate-100 text-slate-700 text-xs">
                    <BookOpen className="h-3 w-3 mr-1 text-slate-500" />
                    {topic.category}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`text-[11px] ${
                      topic.difficulty === "Básico"
                        ? "border-emerald-300 text-emerald-700 bg-emerald-50"
                        : topic.difficulty === "Intermedio"
                        ? "border-amber-300 text-amber-700 bg-amber-50"
                        : "border-rose-300 text-rose-700 bg-rose-50"
                    }`}
                  >
                    {topic.difficulty}
                  </Badge>
                </div>
                <CardTitle className="font-brand text-lg text-quack-gunmetal mt-2">
                  {topic.title}
                </CardTitle>
                <CardDescription className="text-xs text-slate-600 line-clamp-2">
                  {topic.promptContext}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                {topic.formulaLatex && (
                  <div className="rounded-xl bg-slate-50/80 p-2.5 border text-center">
                    <MathRenderer math={topic.formulaLatex} block className="text-base text-slate-900" />
                  </div>
                )}

                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Layers className="h-3 w-3" />
                    Subconceptos clave que auditará Quack:
                  </span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {topic.subtopics.map((sub) => (
                      <span
                        key={sub.id}
                        className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] bg-slate-100 text-slate-700 border border-slate-200"
                      >
                        {sub.name}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-0 flex justify-between items-center text-xs text-slate-500 border-t bg-slate-50/40 py-2.5 px-6">
                <span>{topic.subtopics.length} subconceptos críticos</span>
                <span className={`font-semibold ${isSelected ? "text-quack-caramel" : "text-slate-400"}`}>
                  {isSelected ? "✓ Seleccionado para enseñar" : "Click para elegir"}
                </span>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
