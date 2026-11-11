import * as React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Award,
  BookOpen,
  Clock,
  FileCheck2,
  Flame,
  GraduationCap,
  Mic,
  Sparkles,
  Target,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { DualTrendChart, ErrorDonutBreakdown } from "./Charts";
import { cn } from "@/lib/utils";

export const StudentStatsView: React.FC = () => {
  const { user, courses, practiceHistory, getStudentPersonalStats } = useAuth();
  const stats = getStudentPersonalStats();
  const isCampus = user?.role === "student_campus";

  const trendPoints = stats.weeklySeries.map((pt) => ({
    label: pt.label,
    seriesA: pt.feynmanPercent,
    seriesB: pt.ocrPercent,
  }));

  const recentLogs = [...practiceHistory].reverse().slice(0, 5);

  return (
    <div className="flex flex-col gap-8">
      {/* Encabezado de Rendimiento Personal */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-quack-dandelion text-quack-gunmetal border border-quack-amber/50 font-semibold">
              <GraduationCap className="size-3.5 mr-1.5 text-quack-caramel" aria-hidden="true" />
              Rendimiento Personal · {isCampus ? "Quack Campus" : "Quack Pro"}
            </Badge>
            {user?.institutionName && (
              <Badge variant="outline" className="border-slate-200 text-slate-600">
                {user.institutionName}
              </Badge>
            )}
          </div>
          <h1 className="font-brand text-2xl sm:text-3xl font-bold text-quack-gunmetal">
            Tus Estadísticas de Aprendizaje, {user?.name}
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl">
            {isCampus
              ? "Seguimiento de dominio en tus materias matriculadas vía LTI. Cada sesión oral y parcial manuscrito actualiza tus métricas en tiempo real."
              : "Progreso calculado únicamente sobre las materias y apuntes propios que subiste a tu espacio personal."}
          </p>
        </div>

        <Button
          asChild
          className="rounded-xl bg-quack-amber hover:bg-quack-sandy text-quack-gunmetal font-brand font-bold shadow-none shrink-0 self-start md:self-auto"
        >
          <Link to="/materias">
            <BookOpen className="size-4 mr-2" aria-hidden="true" />
            Ir a Mis Materias
          </Link>
        </Button>
      </div>

      {/* 4 KPIs Principales */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-slate-200 bg-white rounded-2xl shadow-none">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center justify-between">
              Dominio Global
              <Target className="size-4 text-quack-caramel" aria-hidden="true" />
            </CardDescription>
            <CardTitle className="font-brand text-3xl font-bold text-quack-gunmetal tabular-nums">
              {stats.globalMasteryPercent}%
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-600">
            Promedio ponderado en {courses.length} {courses.length === 1 ? "materia" : "materias"} activas
          </CardContent>
        </Card>

        <Card className="border border-slate-200 bg-white rounded-2xl shadow-none">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center justify-between">
              Promedio Parcial OCR
              <FileCheck2 className="size-4 text-emerald-600" aria-hidden="true" />
            </CardDescription>
            <CardTitle className="font-brand text-3xl font-bold text-quack-gunmetal tabular-nums">
              {stats.avgExamScoreOutOf5 > 0 ? `${stats.avgExamScoreOutOf5.toFixed(1)} / 5.0` : "Sin parciales"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-600">
            Auditoría paso a paso con crédito parcial
          </CardContent>
        </Card>

        <Card className="border border-slate-200 bg-white rounded-2xl shadow-none">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center justify-between">
              Práctica Activa
              <Clock className="size-4 text-sky-600" aria-hidden="true" />
            </CardDescription>
            <CardTitle className="font-brand text-3xl font-bold text-quack-gunmetal tabular-nums">
              {stats.totalSessions} sesiones
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-600 tabular-nums">
            {stats.activeMinutes} min de estudio sin ayudas externas
          </CardContent>
        </Card>

        <Card className="border border-slate-200 bg-white rounded-2xl shadow-none">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center justify-between">
              Racha & Subconceptos
              <Flame className="size-4 text-quack-sandy" aria-hidden="true" />
            </CardDescription>
            <CardTitle className="font-brand text-3xl font-bold text-quack-gunmetal tabular-nums">
              {stats.streakDays} días
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-600 tabular-nums">
            {stats.unlockedSubconcepts} subconceptos explicados a Quack
          </CardContent>
        </Card>
      </div>

      {/* Gráficas: Evolución vs Desglose de Errores */}
      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-7 min-w-0 border border-slate-200 bg-white rounded-3xl shadow-none">
          <CardHeader>
            <CardTitle className="font-brand text-xl font-bold text-quack-gunmetal">
              Evolución: Explicación Oral (Feynman) vs. Papel (OCR)
            </CardTitle>
            <CardDescription>
              Comparativa entre lo que logras explicar en voz alta y tu rigor al resolver a libro cerrado.
            </CardDescription>
          </CardHeader>
          <CardContent className="min-w-0">
            <DualTrendChart
              title="Evolución personal Feynman vs Parcial OCR"
              seriesALabel="Dominio Feynman Oral (%)"
              seriesBLabel="Nota Parcial OCR (%)"
              seriesAColor="#FFC800"
              seriesBColor="#3B4151"
              points={trendPoints}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-5 min-w-0 border border-slate-200 bg-white rounded-3xl shadow-none flex flex-col">
          <CardHeader>
            <CardTitle className="font-brand text-xl font-bold text-quack-gunmetal">
              Radiografía de Errores en Papel
            </CardTitle>
            <CardDescription>
              Clasificación de tus pasos manuscritos auditados por Quack OCR.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between gap-5 min-w-0">
            <ErrorDonutBreakdown counts={stats.errorTaxonomy} />

            {stats.recommendedAction && (
              <div className="rounded-2xl border border-amber-200 bg-quack-dandelion/25 p-4 flex flex-col gap-2 min-w-0">
                <span className="text-[11px] font-bold uppercase tracking-wider text-quack-caramel flex items-center gap-1.5">
                  <Sparkles className="size-3.5" aria-hidden="true" />
                  Siguiente paso recomendado
                </span>
                <p className="text-sm font-bold text-quack-gunmetal">
                  {stats.recommendedAction.topicTitle} ({stats.recommendedAction.courseTitle})
                </p>
                <p className="text-xs text-slate-700">{stats.recommendedAction.reason}</p>
                <Button
                  asChild
                  size="sm"
                  className="mt-1 w-fit rounded-xl bg-quack-gunmetal hover:bg-slate-800 text-white font-semibold gap-1.5"
                >
                  <Link
                    to={
                      stats.recommendedAction.mode === "feynman"
                        ? `/feynman?course=${stats.recommendedAction.courseId}&topic=${stats.recommendedAction.topicId}`
                        : `/parcial-ciegas?course=${stats.recommendedAction.courseId}&problem=${stats.recommendedAction.topicId}`
                    }
                  >
                    {stats.recommendedAction.mode === "feynman" ? (
                      <Mic className="size-3.5 text-quack-amber" aria-hidden="true" />
                    ) : (
                      <FileCheck2 className="size-3.5 text-quack-amber" aria-hidden="true" />
                    )}
                    Practicar ahora
                    <ArrowRight className="size-3.5" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Desglose por Materia y Registro de Sesiones */}
      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-7 min-w-0 border border-slate-200 bg-white rounded-3xl shadow-none">
          <CardHeader>
            <CardTitle className="font-brand text-xl font-bold text-quack-gunmetal">
              Dominio por Materia y Tema
            </CardTitle>
            <CardDescription>
              {isCampus
                ? "Asignaturas oficiales sincronizadas de tu matrícula."
                : "Materias generadas a partir de tu material cargado."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 min-w-0">
            {courses.map((course) => {
              const avgCourse =
                course.topics.length > 0
                  ? Math.round(
                      course.topics.reduce((s, t) => s + t.masteryPercent, 0) /
                        course.topics.length
                    )
                  : 0;

              return (
                <div
                  key={course.id}
                  className="rounded-2xl border border-slate-200 p-4 flex flex-col gap-3 min-w-0"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 min-w-0">
                    <div className="min-w-0">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        {course.code} • {course.discipline}
                      </span>
                      <h3 className="font-brand text-base font-bold text-quack-gunmetal">
                        {course.title}
                      </h3>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "font-bold tabular-nums",
                        avgCourse >= 80
                          ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                          : avgCourse >= 50
                          ? "border-amber-300 bg-amber-50 text-amber-800"
                          : "border-rose-300 bg-rose-50 text-rose-800"
                      )}
                    >
                      {avgCourse}% dominio
                    </Badge>
                  </div>

                  <div className="flex flex-col gap-2">
                    {course.topics.map((topic) => (
                      <div key={topic.id} className="flex flex-col gap-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-700 truncate pr-2">
                            {topic.title}
                          </span>
                          <span className="font-bold text-quack-gunmetal tabular-nums shrink-0">
                            {topic.masteryPercent}%
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              topic.masteryPercent >= 80
                                ? "bg-emerald-500"
                                : topic.masteryPercent >= 50
                                ? "bg-quack-amber"
                                : "bg-quack-caramel"
                            )}
                            style={{ width: `${Math.max(4, topic.masteryPercent)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="lg:col-span-5 min-w-0 border border-slate-200 bg-white rounded-3xl shadow-none">
          <CardHeader>
            <CardTitle className="font-brand text-xl font-bold text-quack-gunmetal flex items-center gap-2">
              <Award className="size-5 text-quack-caramel shrink-0" aria-hidden="true" />
              Historial Reciente
            </CardTitle>
            <CardDescription>
              Tus últimas sesiones completadas en Feynman Oral y Parcial OCR.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 min-w-0">
            {recentLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 px-4 py-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-xl",
                      log.mode === "feynman"
                        ? "bg-quack-dandelion/60 text-quack-gunmetal"
                        : "bg-slate-100 text-quack-gunmetal"
                    )}
                  >
                    {log.mode === "feynman" ? (
                      <Mic className="size-4" aria-hidden="true" />
                    ) : (
                      <FileCheck2 className="size-4" aria-hidden="true" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-quack-gunmetal truncate">
                      {log.topicTitle}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {log.courseTitle} • {log.dateLabel}
                    </p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="shrink-0 font-bold tabular-nums border-slate-200 bg-slate-50 text-quack-gunmetal"
                >
                  {log.mode === "ocr" && log.examScoreOutOf5
                    ? `${log.examScoreOutOf5.toFixed(1)}/5.0`
                    : `${log.masteryPercent}%`}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
