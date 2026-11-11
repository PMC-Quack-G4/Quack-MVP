import * as React from "react";
import { Link, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock,
  FileCheck2,
  FileCode2,
  FileText,
  FileUp,
  Layers,
  Mic,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MaterialUploadModal } from "@/components/courses/MaterialUploadModal";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import type { TopicProgressStatus } from "@/types";

const STATUS_BADGE: Record<
  TopicProgressStatus,
  { label: string; className: string }
> = {
  mastered: {
    label: "Dominado",
    className: "border-emerald-300 bg-emerald-50 text-emerald-800",
  },
  in_progress: {
    label: "En Progreso",
    className: "border-amber-300 bg-amber-50 text-amber-800",
  },
  pending: {
    label: "Por Estudiar",
    className: "border-slate-300 bg-slate-100 text-slate-700",
  },
};

export const CourseDetailPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const {
    user,
    courses,
    getCourseById,
    setSelectedCourseId,
    getTopicsForCourse,
  } = useAuth();

  const [uploadOpen, setUploadOpen] = React.useState(false);

  const course = getCourseById(courseId);

  React.useEffect(() => {
    if (course) {
      setSelectedCourseId(course.id);
    }
  }, [course, setSelectedCourseId]);

  if (!user) return null;

  if (!course) {
    return (
      <div className="container py-16 max-w-3xl text-center flex flex-col items-center gap-4">
        <BookOpen className="size-10 text-slate-400" aria-hidden="true" />
        <h1 className="font-brand text-2xl font-bold text-quack-gunmetal">
          Esta materia no pertenece a tu espacio actual
        </h1>
        <p className="text-sm text-slate-600 max-w-md">
          Es posible que hayas cambiado de rol o que la materia seleccionada corresponda a otra modalidad de estudio.
        </p>
        <Button
          asChild
          className="rounded-xl bg-quack-amber hover:bg-quack-sandy text-quack-gunmetal font-brand font-bold shadow-none"
        >
          <Link to="/materias">
            <ArrowLeft className="size-4 mr-2" aria-hidden="true" />
            Volver a Mis Materias
          </Link>
        </Button>
      </div>
    );
  }

  const isIndividual = user.role === "student_individual";
  const isInstitution = user.role === "institution";
  const courseFeynmanTopics = getTopicsForCourse(course.id);

  const avgMastery =
    course.topics.length > 0
      ? Math.round(
          course.topics.reduce((acc, t) => acc + t.masteryPercent, 0) /
            course.topics.length
        )
      : 0;

  return (
    <div className="container py-8 max-w-6xl flex flex-col gap-8">
      {/* Navegación Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="-ml-3 text-slate-600 hover:text-quack-gunmetal"
        >
          <Link to="/materias">
            <ArrowLeft className="size-4 mr-1.5" aria-hidden="true" />
            Volver a {isInstitution ? "Mis Cursos" : "Mis Materias"}
          </Link>
        </Button>

        <span className="text-xs font-medium text-slate-500">
          {course.code} • {course.semester}
        </span>
      </div>

      {/* Encabezado de la Materia */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-quack-dandelion text-quack-gunmetal border border-quack-amber/50 font-semibold">
              {course.code}
            </Badge>
            <Badge variant="outline" className="border-slate-200 text-slate-600">
              {course.discipline}
            </Badge>
            {course.professorName && (
              <Badge variant="outline" className="border-slate-200 text-slate-600">
                {course.professorName}
              </Badge>
            )}
          </div>

          <h1 className="font-brand text-2xl sm:text-3xl font-bold text-quack-gunmetal">
            {course.title}
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl">{course.description}</p>
        </div>

        <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3 shrink-0">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-left sm:text-right">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              {isInstitution ? "Dominio Promedio Cohorte" : "Tu Dominio en la Materia"}
            </span>
            <span className="font-brand text-2xl font-bold text-quack-gunmetal tabular-nums">
              {isInstitution ? `${course.cohortAvgMastery ?? avgMastery}%` : `${avgMastery}%`}
            </span>
          </div>

          {isIndividual && (
            <Button
              type="button"
              onClick={() => setUploadOpen(true)}
              className="rounded-xl bg-quack-amber hover:bg-quack-sandy text-quack-gunmetal font-brand font-bold shadow-none gap-2"
            >
              <FileUp className="size-4" aria-hidden="true" />
              Subir apunte a esta materia
            </Button>
          )}

          {isInstitution && (
            <Button
              asChild
              className="rounded-xl bg-quack-gunmetal hover:bg-slate-800 text-white font-brand font-bold shadow-none gap-2"
            >
              <Link to={`/estadisticas?scope=docente&course=${course.id}`}>
                <BarChart3 className="size-4 text-quack-amber" aria-hidden="true" />
                Ver Estadísticas del Curso
              </Link>
            </Button>
          )}
        </div>
      </section>

      {/* Materiales subidos (solo para Estudiante Individual) */}
      {isIndividual && course.materials && course.materials.length > 0 && (
        <section aria-label="Archivos de estudio cargados" className="flex flex-col gap-3">
          <h2 className="font-brand text-lg font-bold text-quack-gunmetal">
            Tu Material Cargado ({course.materials.length})
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {course.materials.map((mat) => (
              <div
                key={mat.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 flex items-start gap-3"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-quack-dandelion/50 text-quack-caramel">
                  {mat.fileType === "code" ? (
                    <FileCode2 className="size-5" aria-hidden="true" />
                  ) : (
                    <FileText className="size-5" aria-hidden="true" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-mono text-xs font-bold text-quack-gunmetal truncate">
                      {mat.fileName}
                    </p>
                    <span className="text-[11px] text-slate-400 shrink-0">
                      {mat.sizeLabel} • {mat.uploadedAt}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{mat.summary}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Lista de Temas Exclusivos de Esta Materia */}
      <section aria-label="Temas de estudio en esta materia" className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="font-brand text-xl font-bold text-quack-gunmetal">
              Temas y Evaluaciones de {course.title}
            </h2>
            <p className="text-xs text-slate-600">
              {isInstitution
                ? "Previsualiza los simuladores exactamente como los viven tus estudiantes en este curso."
                : "Solo se muestran los temas que corresponden a esta asignatura."}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {course.topics.map((topic) => {
            const matchedFeynman = courseFeynmanTopics.find(
              (ft) => ft.id === topic.feynmanTopicId
            );
            const statusMeta = STATUS_BADGE[topic.status];
            const displayedMastery = isInstitution
              ? topic.cohortMasteryPercent ?? topic.masteryPercent
              : topic.masteryPercent;

            return (
              <Card
                key={topic.id}
                className="rounded-3xl border border-slate-200 bg-white shadow-none"
              >
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-quack-caramel">
                      {topic.unitLabel}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500 tabular-nums">
                        <Clock className="size-3.5" aria-hidden="true" />
                        ~{topic.estimatedMinutes} min
                      </span>
                      <Badge
                        variant="outline"
                        className={cn("text-[11px] font-bold", statusMeta.className)}
                      >
                        {topic.status === "mastered" && (
                          <CheckCircle2 className="size-3 mr-1" aria-hidden="true" />
                        )}
                        {isInstitution
                          ? `Cohorte: ${displayedMastery}%`
                          : `${statusMeta.label} (${displayedMastery}%)`}
                      </Badge>
                    </div>
                  </div>

                  <CardTitle className="font-brand text-xl font-bold text-quack-gunmetal mt-1">
                    {topic.title}
                  </CardTitle>
                  <CardDescription className="text-sm text-slate-600">
                    {topic.summary}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex flex-col gap-4">
                  {/* Barra de dominio */}
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        displayedMastery >= 80
                          ? "bg-emerald-500"
                          : displayedMastery >= 50
                          ? "bg-quack-amber"
                          : "bg-quack-caramel"
                      )}
                      style={{ width: `${Math.max(5, displayedMastery)}%` }}
                    />
                  </div>

                  {/* Alerta de cuello de botella para Docente */}
                  {isInstitution && topic.bottleneckAlert && (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50/60 px-4 py-2.5 text-xs text-rose-800 flex items-center gap-2">
                      <AlertTriangle className="size-4 text-rose-600 shrink-0" aria-hidden="true" />
                      <span>
                        <strong>Alerta del grupo:</strong> {topic.bottleneckAlert}
                      </span>
                    </div>
                  )}

                  {/* Subconceptos que evaluará Quack */}
                  {matchedFeynman && (
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Layers className="size-3.5" aria-hidden="true" />
                        Subconceptos evaluados en Feynman Oral:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {matchedFeynman.subtopics.map((sub) => (
                          <span
                            key={sub.id}
                            className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700"
                          >
                            {sub.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Botones de Práctica Directa */}
                  <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
                    {topic.feynmanTopicId && (
                      <Button
                        asChild
                        className="rounded-xl bg-quack-amber hover:bg-quack-sandy text-quack-gunmetal font-brand font-bold shadow-none gap-2"
                      >
                        <Link
                          to={`/feynman?course=${course.id}&topic=${topic.feynmanTopicId}`}
                        >
                          <Mic className="size-4" aria-hidden="true" />
                          {isInstitution
                            ? "Probar Feynman Oral"
                            : "Explícale a Quack (Feynman)"}
                          <ArrowRight className="size-4" aria-hidden="true" />
                        </Link>
                      </Button>
                    )}

                    {topic.examProblemId && (
                      <Button
                        asChild
                        variant="outline"
                        className="rounded-xl border-quack-gunmetal/25 bg-white hover:bg-slate-50 text-quack-gunmetal font-brand font-bold gap-2"
                      >
                        <Link
                          to={`/parcial-ciegas?course=${course.id}&problem=${topic.examProblemId}`}
                        >
                          <FileCheck2 className="size-4 text-quack-caramel" aria-hidden="true" />
                          {isInstitution
                            ? "Probar Parcial OCR"
                            : "Simulacro Parcial a Ciegas"}
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {isIndividual && (
        <MaterialUploadModal
          open={uploadOpen}
          onClose={() => setUploadOpen(false)}
          existingCourses={courses}
          defaultCourseId={course.id}
        />
      )}
    </div>
  );
};
