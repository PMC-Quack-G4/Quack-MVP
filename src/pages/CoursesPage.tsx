import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BookOpen,
  Building2,
  FileCode2,
  FileText,
  FileUp,
  GraduationCap,
  Layers,
  Plus,
  Sparkles,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MaterialUploadModal } from "@/components/courses/MaterialUploadModal";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import type { CourseAccentTone } from "@/types";

const TONE_STRIPE: Record<CourseAccentTone, string> = {
  amber: "bg-quack-amber",
  emerald: "bg-emerald-500",
  sky: "bg-sky-500",
  caramel: "bg-quack-caramel",
  violet: "bg-violet-500",
};

const TONE_BADGE: Record<CourseAccentTone, string> = {
  amber: "bg-amber-50 text-amber-900 border-amber-200",
  emerald: "bg-emerald-50 text-emerald-900 border-emerald-200",
  sky: "bg-sky-50 text-sky-900 border-sky-200",
  caramel: "bg-orange-50 text-orange-900 border-orange-200",
  violet: "bg-violet-50 text-violet-900 border-violet-200",
};

export const CoursesPage: React.FC = () => {
  const { user, courses, setSelectedCourseId } = useAuth();
  const navigate = useNavigate();

  const [uploadOpen, setUploadOpen] = React.useState(false);
  const [uploadCourseId, setUploadCourseId] = React.useState<string | undefined>(undefined);

  if (!user) return null;

  const isCampus = user.role === "student_campus";
  const isIndividual = user.role === "student_individual";
  const isInstitution = user.role === "institution";

  const openNewMaterialModal = (courseId?: string) => {
    setUploadCourseId(courseId);
    setUploadOpen(true);
  };

  return (
    <div className="container py-8 max-w-6xl flex flex-col gap-8">
      {/* Encabezado personalizado con el nombre ingresado */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {isCampus && (
              <Badge className="bg-quack-dandelion text-quack-gunmetal border border-quack-amber/50 font-semibold">
                <Building2 className="size-3.5 mr-1.5 text-quack-caramel" aria-hidden="true" />
                Quack Campus · Ready-to-Go vía LTI
              </Badge>
            )}
            {isIndividual && (
              <Badge className="bg-quack-dandelion text-quack-gunmetal border border-quack-amber/50 font-semibold">
                <Sparkles className="size-3.5 mr-1.5 text-quack-caramel" aria-hidden="true" />
                Quack Pro · Espacio Personal
              </Badge>
            )}
            {isInstitution && (
              <Badge className="bg-quack-gunmetal text-quack-amber border border-quack-gunmetal font-semibold">
                <Users className="size-3.5 mr-1.5" aria-hidden="true" />
                Docente & Institución · Mis Cursos Dictados
              </Badge>
            )}
            {user.institutionName && (
              <Badge variant="outline" className="border-slate-200 text-slate-600">
                {user.institutionName}
              </Badge>
            )}
          </div>

          <h1 className="font-brand text-2xl sm:text-3xl font-bold text-quack-gunmetal">
            ¡Hola, {user.name}! {isInstitution ? "Tus Cursos Asignados" : "Tus Materias"}
          </h1>

          <p className="text-sm text-slate-600 max-w-2xl">
            {isCampus &&
              "Estas son tus materias oficiales sincronizadas automáticamente desde Bloque Neón. Entra a cualquier materia para practicar exclusivamente los temas evaluables de su sílabo."}
            {isIndividual &&
              "En tu espacio individual solo ves las materias creadas a partir de tu propio material. Sube un nuevo PDF, apunte o archivo de código para generar sesiones Feynman y Parciales OCR al instante."}
            {isInstitution &&
              "Supervisa los cursos que dictas este semestre: inspecciona los temas evaluados, detecta cuellos de botella en tiempo real o abre el panel estratégico institucional."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {isIndividual && (
            <Button
              type="button"
              onClick={() => openNewMaterialModal(undefined)}
              className="rounded-xl bg-quack-amber hover:bg-quack-sandy text-quack-gunmetal font-brand font-bold shadow-none gap-2"
            >
              <Plus className="size-4" aria-hidden="true" />
              Subir Material
            </Button>
          )}

          {isInstitution ? (
            <>
              <Button
                asChild
                variant="outline"
                className="rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-quack-gunmetal font-semibold gap-2"
              >
                <Link to="/estadisticas?scope=docente">
                  <BarChart3 className="size-4 text-quack-caramel" aria-hidden="true" />
                  Estadísticas Docente
                </Link>
              </Button>
              <Button
                asChild
                className="rounded-xl bg-quack-gunmetal hover:bg-slate-800 text-white font-brand font-bold shadow-none gap-2"
              >
                <Link to="/estadisticas?scope=directivo">
                  <Building2 className="size-4 text-quack-amber" aria-hidden="true" />
                  Impacto Directivo
                </Link>
              </Button>
            </>
          ) : (
            <Button
              asChild
              variant={isCampus ? "default" : "outline"}
              className={cn(
                "rounded-xl font-brand font-bold shadow-none gap-2",
                isCampus
                  ? "bg-quack-amber hover:bg-quack-sandy text-quack-gunmetal"
                  : "border-slate-200 bg-white hover:bg-slate-50 text-quack-gunmetal"
              )}
            >
              <Link to="/estadisticas">
                <BarChart3 className="size-4 text-quack-caramel" aria-hidden="true" />
                Mis Estadísticas
              </Link>
            </Button>
          )}
        </div>
      </section>

      {/* Banner informativo contextual (B2B Ready-to-Go vs B2C Upload vs Directivo) */}
      {isCampus && (
        <div className="rounded-2xl border border-amber-200 bg-quack-dandelion/20 px-4 py-3 flex items-center gap-3 text-xs text-slate-700">
          <GraduationCap className="size-4 text-quack-caramel shrink-0" aria-hidden="true" />
          <span>
            <strong>Modo Ready-to-Go activo:</strong> Los temas y simulacros de cada asignatura ya fueron configurados por tus docentes vía LTI; no necesitas subir archivos ni ajustar prompts.
          </span>
        </div>
      )}

      {/* Grilla de Materias */}
      <section aria-label="Listado de materias disponibles" className="grid gap-6 md:grid-cols-2">
        {courses.map((course) => {
          const avgMastery =
            course.topics.length > 0
              ? Math.round(
                  course.topics.reduce((acc, t) => acc + t.masteryPercent, 0) /
                    course.topics.length
                )
              : 0;
          const bottleneckPreview = course.topics.find((t) => Boolean(t.bottleneckAlert));

          return (
            <Card
              key={course.id}
              className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-none flex flex-col justify-between transition-colors hover:border-slate-300"
            >
              <div>
                <div className={cn("h-1.5 w-full", TONE_STRIPE[course.accentTone])} />

                <CardHeader className="pb-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Badge
                      variant="outline"
                      className={cn("text-[11px] font-bold", TONE_BADGE[course.accentTone])}
                    >
                      {course.code} • {course.discipline}
                    </Badge>
                    <span className="text-xs font-semibold text-slate-500">
                      {course.semester}
                    </span>
                  </div>

                  <CardTitle className="font-brand text-xl font-bold text-quack-gunmetal mt-2">
                    {course.title}
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-600 leading-relaxed">
                    {course.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex flex-col gap-4">
                  {/* Metadatos por rol */}
                  {isInstitution ? (
                    <div className="flex flex-col gap-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600 font-medium">
                          {course.enrolledStudentsCount ?? 0} estudiantes matriculados
                        </span>
                        <span className="font-bold text-quack-gunmetal tabular-nums">
                          Dominio cohorte: {course.cohortAvgMastery ?? avgMastery}%
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-quack-amber"
                          style={{
                            width: `${Math.max(6, course.cohortAvgMastery ?? avgMastery)}%`,
                          }}
                        />
                      </div>
                      {bottleneckPreview?.bottleneckAlert && (
                        <div className="rounded-xl border border-rose-200 bg-rose-50/60 px-3 py-2 text-xs text-rose-800 flex items-start gap-2">
                          <AlertTriangle className="size-3.5 text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
                          <span>{bottleneckPreview.bottleneckAlert}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600 font-medium">
                          {course.professorName
                            ? `Docente: ${course.professorName}`
                            : `${course.materials?.length ?? 0} archivo(s) propios`}
                        </span>
                        <span className="font-bold text-quack-gunmetal tabular-nums">
                          Dominio: {avgMastery}%
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            avgMastery >= 80
                              ? "bg-emerald-500"
                              : avgMastery >= 50
                              ? "bg-quack-amber"
                              : "bg-quack-caramel"
                          )}
                          style={{ width: `${Math.max(5, avgMastery)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Vista previa de archivos subidos en B2C */}
                  {isIndividual && course.materials && course.materials.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {course.materials.map((mat) => (
                        <span
                          key={mat.id}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-mono text-slate-700"
                        >
                          {mat.fileType === "code" ? (
                            <FileCode2 className="size-3 text-quack-caramel" aria-hidden="true" />
                          ) : (
                            <FileText className="size-3 text-quack-caramel" aria-hidden="true" />
                          )}
                          {mat.fileName}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Temas dentro de la materia */}
                  <div className="flex flex-col gap-1.5 pt-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Layers className="size-3.5" aria-hidden="true" />
                      {course.topics.length}{" "}
                      {course.topics.length === 1 ? "tema disponible" : "temas disponibles"}
                    </span>
                    <ul className="flex flex-col gap-1 text-xs text-slate-700">
                      {course.topics.map((t) => (
                        <li
                          key={t.id}
                          className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-1.5"
                        >
                          <span className="truncate font-medium">{t.title}</span>
                          <span className="shrink-0 font-bold text-quack-gunmetal tabular-nums">
                            {isInstitution ? `${t.cohortMasteryPercent ?? t.masteryPercent}%` : `${t.masteryPercent}%`}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </div>

              <CardFooter className="border-t border-slate-100 bg-slate-50/50 px-6 py-4 flex flex-wrap items-center justify-between gap-2">
                {isInstitution ? (
                  <>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCourseId(course.id)}
                      className="rounded-xl border-slate-200 bg-white text-quack-gunmetal font-semibold gap-1.5"
                    >
                      <Link to={`/materias/${course.id}`}>
                        <BookOpen className="size-3.5 text-quack-caramel" aria-hidden="true" />
                        Ver Temas
                      </Link>
                    </Button>
                    <Button
                      asChild
                      size="sm"
                      className="rounded-xl bg-quack-amber hover:bg-quack-sandy text-quack-gunmetal font-brand font-bold shadow-none gap-1.5"
                    >
                      <Link to={`/estadisticas?scope=docente&course=${course.id}`}>
                        <BarChart3 className="size-3.5" aria-hidden="true" />
                        Estadísticas del Curso
                      </Link>
                    </Button>
                  </>
                ) : (
                  <>
                    {isIndividual ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => openNewMaterialModal(course.id)}
                        className="rounded-xl text-xs font-semibold text-slate-600 hover:text-quack-gunmetal gap-1.5"
                      >
                        <FileUp className="size-3.5 text-quack-caramel" aria-hidden="true" />
                        Subir apunte aquí
                      </Button>
                    ) : (
                      <span className="text-xs font-medium text-slate-500">
                        Solo temas del sílabo
                      </span>
                    )}

                    <Button
                      asChild
                      size="sm"
                      onClick={() => setSelectedCourseId(course.id)}
                      className="rounded-xl bg-quack-gunmetal hover:bg-slate-800 text-white font-brand font-bold shadow-none gap-1.5"
                    >
                      <Link to={`/materias/${course.id}`}>
                        Entrar a la materia
                        <ArrowRight className="size-3.5 text-quack-amber" aria-hidden="true" />
                      </Link>
                    </Button>
                  </>
                )}
              </CardFooter>
            </Card>
          );
        })}

        {/* Tarjeta dedicada de acción para Subir Material en Estudiante Individual */}
        {isIndividual && (
          <button
            type="button"
            onClick={() => openNewMaterialModal(undefined)}
            className="min-h-[260px] rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50/70 hover:bg-quack-dandelion/20 hover:border-quack-amber p-8 flex flex-col items-center justify-center text-center gap-3 transition-colors cursor-pointer"
          >
            <div className="flex size-14 items-center justify-center rounded-2xl bg-quack-amber text-quack-gunmetal">
              <FileUp className="size-7" aria-hidden="true" />
            </div>
            <h2 className="font-brand text-xl font-bold text-quack-gunmetal">
              + Agregar Nueva Materia desde tus Apuntes
            </h2>
            <p className="text-xs text-slate-600 max-w-sm leading-relaxed">
              Sube un PDF, presentación, notas Markdown o código fuente. Quack generará al instante los subconceptos Feynman y un Parcial a Ciegas OCR adaptado.
            </p>
          </button>
        )}
      </section>

      {isIndividual && (
        <MaterialUploadModal
          open={uploadOpen}
          onClose={() => setUploadOpen(false)}
          existingCourses={courses}
          defaultCourseId={uploadCourseId}
          onSuccess={(createdCourseId) => {
            setSelectedCourseId(createdCourseId);
            navigate(`/materias/${createdCourseId}`);
          }}
        />
      )}
    </div>
  );
};
