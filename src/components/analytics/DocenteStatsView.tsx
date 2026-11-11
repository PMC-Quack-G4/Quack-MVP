import * as React from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Download,
  Eye,
  FileCheck2,
  Flame,
  Mic,
  Search,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { DOCENTE_ANALYTICS_BY_COURSE, TAUGHT_COURSES } from "@/mocks/appData";
import { DualTrendChart, ErrorDonutBreakdown } from "./Charts";
import { cn } from "@/lib/utils";
import type { DominantErrorType, StudentCourseRecord, StudentRiskLevel } from "@/types";

export interface DocenteStatsViewProps {
  initialCourseId?: string | null;
  onCourseChange?: (courseId: string) => void;
}

const RISK_META: Record<
  StudentRiskLevel,
  { label: string; badgeClass: string }
> = {
  optimal: {
    label: "Óptimo",
    badgeClass: "border-emerald-300 bg-emerald-50 text-emerald-800",
  },
  watch: {
    label: "En Observación",
    badgeClass: "border-amber-300 bg-amber-50 text-amber-800",
  },
  at_risk: {
    label: "En Riesgo",
    badgeClass: "border-rose-300 bg-rose-50 text-rose-800",
  },
};

const ERROR_LABEL: Record<DominantErrorType, string> = {
  none: "Sin errores recurrentes",
  conceptual: "Error Conceptual",
  algebraic: "Error Algebraico",
  propagated: "Error Arrastrado",
};

export const DocenteStatsView: React.FC<DocenteStatsViewProps> = ({
  initialCourseId,
  onCourseChange,
}) => {
  const { user } = useAuth();
  const defaultCourseId =
    initialCourseId && DOCENTE_ANALYTICS_BY_COURSE[initialCourseId]
      ? initialCourseId
      : TAUGHT_COURSES[0]?.id ?? "campus-algoritmia";

  const [selectedCourseId, setSelectedCourseId] = React.useState<string>(defaultCourseId);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [riskFilter, setRiskFilter] = React.useState<"all" | StudentRiskLevel>("all");
  const [selectedStudent, setSelectedStudent] = React.useState<StudentCourseRecord | null>(null);
  const [csvFeedback, setCsvFeedback] = React.useState<string | null>(null);
  const [notifiedStudents, setNotifiedStudents] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    if (initialCourseId && DOCENTE_ANALYTICS_BY_COURSE[initialCourseId]) {
      setSelectedCourseId(initialCourseId);
    }
  }, [initialCourseId]);

  React.useEffect(() => {
    if (!selectedStudent) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedStudent(null);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [selectedStudent]);

  const courseStats =
    DOCENTE_ANALYTICS_BY_COURSE[selectedCourseId] ??
    DOCENTE_ANALYTICS_BY_COURSE["campus-calculo"];

  const handleSelectCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
    setSelectedStudent(null);
    setSearchQuery("");
    setRiskFilter("all");
    onCourseChange?.(courseId);
  };

  const handleExportCsv = () => {
    const header = "Codigo,Estudiante,Feynman_%,Parcial_OCR_Sobre_5,Sesiones,Minutos,Nivel_Riesgo,Error_Dominante\n";
    const rows = courseStats.students
      .map((s) =>
        [
          s.studentCode,
          `"${s.name}"`,
          s.feynmanAvg,
          s.ocrAvgOutOf5.toFixed(1),
          s.sessionsCount,
          s.activeMinutes,
          RISK_META[s.riskLevel].label,
          `"${ERROR_LABEL[s.dominantError]}"`,
        ].join(",")
      )
      .join("\n");

    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `quack_docente_${courseStats.courseCode}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setCsvFeedback(`Reporte CSV de ${courseStats.courseCode} descargado`);
    setTimeout(() => setCsvFeedback(null), 4000);
  };

  const filteredStudents = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return courseStats.students.filter((stu) => {
      const matchesRisk = riskFilter === "all" || stu.riskLevel === riskFilter;
      const matchesQuery =
        !q ||
        stu.name.toLowerCase().includes(q) ||
        stu.studentCode.toLowerCase().includes(q);
      return matchesRisk && matchesQuery;
    });
  }, [courseStats.students, riskFilter, searchQuery]);

  const trendPoints = courseStats.weeklyMasteryTrend.map((w) => ({
    label: w.week,
    seriesA: w.feynmanMastery,
    seriesB: w.ocrScorePercent,
  }));

  const participationPct = Math.round(
    (courseStats.activeThisWeekCount / Math.max(1, courseStats.enrolledCount)) * 100
  );

  return (
    <div className="flex flex-col gap-8">
      {/* Encabezado Docente + Selector de Curso */}
      <div className="flex flex-col gap-5 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-quack-dandelion text-quack-gunmetal border border-quack-amber/50 font-semibold">
                <Users className="size-3.5 mr-1.5 text-quack-caramel" aria-hidden="true" />
                Vista Docente · Seguimiento de Cohorte y Estudiantes
              </Badge>
              <Badge variant="outline" className="border-slate-200 text-slate-600">
                {user?.institutionName || "Universidad de los Andes"}
              </Badge>
            </div>
            <h1 className="font-brand text-2xl sm:text-3xl font-bold text-quack-gunmetal">
              Panel Académico de {user?.name}
            </h1>
            <p className="text-sm text-slate-600 max-w-2xl">
              Analiza el desempeño global de cada materia que dictas, detecta cuellos de botella por subconcepto e inspecciona el progreso individual de cada estudiante.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={handleExportCsv}
              className="rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-quack-gunmetal font-semibold gap-2"
            >
              <Download className="size-4 text-quack-caramel" aria-hidden="true" />
              Exportar CSV
            </Button>
            <Button
              asChild
              className="rounded-xl bg-quack-amber hover:bg-quack-sandy text-quack-gunmetal font-brand font-bold shadow-none gap-2"
            >
              <Link to={`/materias/${courseStats.courseId}`}>
                <BookOpen className="size-4" aria-hidden="true" />
                Ver Temas del Curso
              </Link>
            </Button>
          </div>
        </div>

        {csvFeedback && (
          <div
            role="status"
            className="flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-800"
          >
            <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
            {csvFeedback}
          </div>
        )}

        {/* Selector de Materias Dictadas */}
        <div
          role="tablist"
          aria-label="Cursos dictados por el docente"
          className="flex flex-wrap gap-2 border-t border-slate-100 pt-4"
        >
          {TAUGHT_COURSES.map((course) => {
            const isSelected = course.id === courseStats.courseId;
            return (
              <button
                key={course.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => handleSelectCourse(course.id)}
                className={cn(
                  "flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-left text-xs transition-colors",
                  isSelected
                    ? "border-quack-gunmetal bg-quack-gunmetal text-white"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                )}
              >
                <span
                  className={cn(
                    "font-mono text-[11px] font-bold px-2 py-0.5 rounded-lg",
                    isSelected
                      ? "bg-quack-amber text-quack-gunmetal"
                      : "bg-white text-slate-600 border border-slate-200"
                  )}
                >
                  {course.code.split("·")[0].trim()}
                </span>
                <span className="font-brand font-bold">{course.title}</span>
                <span
                  className={cn(
                    "text-[11px] tabular-nums",
                    isSelected ? "text-white/75" : "text-slate-500"
                  )}
                >
                  ({course.enrolledStudentsCount} est.)
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4 KPIs del Curso Seleccionado */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-slate-200 bg-white rounded-2xl shadow-none">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center justify-between">
              Participación Semanal
              <Users className="size-4 text-sky-600" aria-hidden="true" />
            </CardDescription>
            <CardTitle className="font-brand text-3xl font-bold text-quack-gunmetal tabular-nums">
              {courseStats.activeThisWeekCount} / {courseStats.enrolledCount}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-600 tabular-nums">
            {participationPct}% del grupo practicó sin tutor externo esta semana
          </CardContent>
        </Card>

        <Card className="border border-slate-200 bg-white rounded-2xl shadow-none">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center justify-between">
              Dominio Feynman Cohorte
              <Mic className="size-4 text-quack-caramel" aria-hidden="true" />
            </CardDescription>
            <CardTitle className="font-brand text-3xl font-bold text-quack-gunmetal tabular-nums">
              {courseStats.avgFeynmanMastery}%
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-600">
            Comprensión conceptual demostrada en voz alta
          </CardContent>
        </Card>

        <Card className="border border-slate-200 bg-white rounded-2xl shadow-none">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center justify-between">
              Promedio Parcial OCR
              <FileCheck2 className="size-4 text-emerald-600" aria-hidden="true" />
            </CardDescription>
            <CardTitle className="font-brand text-3xl font-bold text-quack-gunmetal tabular-nums">
              {courseStats.avgOcrScoreOutOf5.toFixed(1)} / 5.0
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-600">
            Calificación promedio en simulacros manuscritos a libro cerrado
          </CardContent>
        </Card>

        <Card className="border border-rose-200 bg-rose-50/40 rounded-2xl shadow-none">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-rose-700 flex items-center justify-between">
              Alertas Tempranas
              <AlertTriangle className="size-4 text-rose-600" aria-hidden="true" />
            </CardDescription>
            <CardTitle className="font-brand text-3xl font-bold text-rose-900 tabular-nums">
              {courseStats.atRiskCount} est.
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-rose-800">
            Presentan bloqueos conceptuales críticos antes del próximo corte
          </CardContent>
        </Card>
      </div>

      {/* Gráficas de Evolución del Curso y Taxonomía */}
      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-7 min-w-0 border border-slate-200 bg-white rounded-3xl shadow-none">
          <CardHeader>
            <CardTitle className="font-brand text-xl font-bold text-quack-gunmetal">
              Evolución del Curso ({courseStats.courseCode})
            </CardTitle>
            <CardDescription>
              Progreso promedio semanal en explicación socrática vs. desempeño escrito en papel.
            </CardDescription>
          </CardHeader>
          <CardContent className="min-w-0">
            <DualTrendChart
              title={`Tendencia de dominio en ${courseStats.courseTitle}`}
              seriesALabel="Dominio Feynman Cohorte (%)"
              seriesBLabel="Nota Parcial OCR (%)"
              seriesAColor="#FFC800"
              seriesBColor="#3B4151"
              points={trendPoints}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-5 min-w-0 border border-slate-200 bg-white rounded-3xl shadow-none">
          <CardHeader>
            <CardTitle className="font-brand text-xl font-bold text-quack-gunmetal">
              Taxonomía de Errores del Grupo
            </CardTitle>
            <CardDescription>
              Clasificación agregada de todos los pasos manuscritos auditados en la sección.
            </CardDescription>
          </CardHeader>
          <CardContent className="min-w-0">
            <ErrorDonutBreakdown
              counts={courseStats.errorDistribution}
              title={`Distribución de errores en ${courseStats.courseCode}`}
            />
          </CardContent>
        </Card>
      </div>

      {/* Mapa de Cuellos de Botella por Subconcepto */}
      <Card className="border border-slate-200 bg-white rounded-3xl shadow-none">
        <CardHeader>
          <CardTitle className="font-brand text-xl font-bold text-quack-gunmetal flex items-center gap-2">
            <Flame className="size-5 text-quack-caramel" aria-hidden="true" />
            Cuellos de Botella por Subconcepto (Agenda Sugerida de Clase)
          </CardTitle>
          <CardDescription>
            Subconceptos específicos donde tus estudiantes muestran mayor bloqueo conceptual o algebraico al intentar explicarlos sin IA generativa.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courseStats.bottlenecks.map((bn) => {
            const blockedPct = Math.round(
              (bn.blockedStudentsCount / Math.max(1, bn.totalStudentsCount)) * 100
            );
            return (
              <div
                key={bn.id}
                className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/50 p-4"
              >
                <div className="flex flex-col gap-2 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[11px] font-bold",
                        bn.dominantFailure === "conceptual"
                          ? "border-rose-300 bg-rose-50 text-rose-800"
                          : "border-amber-300 bg-amber-50 text-amber-800"
                      )}
                    >
                      {bn.dominantFailure === "conceptual"
                        ? "Fallo Conceptual"
                        : "Fallo Algebraico"}
                    </Badge>
                    <span className="text-xs font-bold text-rose-700 tabular-nums">
                      {blockedPct}% bloqueados ({bn.blockedStudentsCount} est.)
                    </span>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      {bn.topicTitle}
                    </p>
                    <h3 className="font-brand text-base font-bold text-quack-gunmetal mt-0.5">
                      {bn.subconceptName}
                    </h3>
                  </div>

                  <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-quack-caramel"
                      style={{ width: `${Math.max(8, bn.masteryPercent)}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 tabular-nums">
                    Dominio actual de cohorte: <strong className="text-quack-gunmetal">{bn.masteryPercent}%</strong>
                  </p>
                </div>

                <div className="rounded-xl border border-amber-200 bg-white p-3 text-xs text-slate-700">
                  <span className="font-bold text-quack-caramel flex items-center gap-1 mb-0.5">
                    <Sparkles className="size-3.5" aria-hidden="true" />
                    Recomendación para próxima clase:
                  </span>
                  {bn.suggestedAction}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Seguimiento Global e Individual de Estudiantes */}
      <Card className="border border-slate-200 bg-white rounded-3xl shadow-none">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="font-brand text-xl font-bold text-quack-gunmetal">
              Seguimiento por Estudiante ({courseStats.sectionLabel})
            </CardTitle>
            <CardDescription>
              Haz clic en cualquier estudiante para auditar sus temas evaluados, últimos diálogos Feynman y errores en parcial OCR.
            </CardDescription>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative">
              <Search
                className="size-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <Input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar nombre o código…"
                aria-label="Buscar estudiante por nombre o código"
                className="pl-9 h-9 rounded-xl border-slate-200 bg-slate-50 text-xs w-full sm:w-56"
              />
            </div>

            <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 text-xs">
              {(
                [
                  { id: "all", label: "Todos" },
                  { id: "at_risk", label: "En Riesgo" },
                  { id: "watch", label: "Observación" },
                  { id: "optimal", label: "Óptimo" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setRiskFilter(tab.id)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg font-semibold transition-colors",
                    riskFilter === tab.id
                      ? "bg-white text-quack-gunmetal"
                      : "text-slate-600 hover:text-quack-gunmetal"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {filteredStudents.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
              No se encontraron estudiantes que coincidan con el filtro aplicado.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 pr-4">Estudiante</th>
                    <th className="py-3 px-3">Feynman</th>
                    <th className="py-3 px-3">Parcial OCR</th>
                    <th className="py-3 px-3 hidden sm:table-cell">Sesiones</th>
                    <th className="py-3 px-3 hidden md:table-cell">Error Dominante</th>
                    <th className="py-3 px-3">Estado</th>
                    <th className="py-3 pl-3 text-right">Detalle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((stu) => {
                    const risk = RISK_META[stu.riskLevel];
                    return (
                      <tr
                        key={stu.id}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="py-3.5 pr-4">
                          <div className="flex items-center gap-3">
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-quack-dandelion/70 font-brand text-xs font-bold text-quack-gunmetal">
                              {stu.initials}
                            </span>
                            <div>
                              <p className="font-bold text-quack-gunmetal">{stu.name}</p>
                              <p className="text-xs text-slate-500 tabular-nums">
                                Cód. {stu.studentCode} • {stu.lastActivityLabel}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 font-bold text-quack-gunmetal tabular-nums">
                          {stu.feynmanAvg}%
                        </td>
                        <td className="py-3.5 px-3 font-bold text-quack-gunmetal tabular-nums">
                          {stu.ocrAvgOutOf5.toFixed(1)} / 5.0
                        </td>
                        <td className="py-3.5 px-3 text-xs text-slate-600 tabular-nums hidden sm:table-cell">
                          {stu.sessionsCount} ({stu.activeMinutes} min)
                        </td>
                        <td className="py-3.5 px-3 text-xs text-slate-600 hidden md:table-cell">
                          {ERROR_LABEL[stu.dominantError]}
                        </td>
                        <td className="py-3.5 px-3">
                          <Badge variant="outline" className={cn("text-[11px] font-bold", risk.badgeClass)}>
                            {risk.label}
                          </Badge>
                        </td>
                        <td className="py-3.5 pl-3 text-right">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedStudent(stu)}
                            className="rounded-xl border-slate-200 bg-white hover:bg-quack-dandelion/40 text-quack-gunmetal text-xs font-semibold gap-1.5"
                          >
                            <Eye className="size-3.5 text-quack-caramel" aria-hidden="true" />
                            Inspeccionar
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Inspección Individual del Estudiante */}
      {selectedStudent && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="student-detail-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4 backdrop-blur-xs"
        >
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl flex flex-col gap-5">
            <button
              type="button"
              onClick={() => setSelectedStudent(null)}
              aria-label="Cerrar detalle del estudiante"
              className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-quack-gunmetal"
            >
              <X className="size-4" aria-hidden="true" />
            </button>

            {/* Encabezado Estudiante */}
            <div className="flex items-start gap-4 pr-10">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-quack-amber font-brand text-base font-bold text-quack-gunmetal">
                {selectedStudent.initials}
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2
                    id="student-detail-title"
                    className="font-brand text-2xl font-bold text-quack-gunmetal"
                  >
                    {selectedStudent.name}
                  </h2>
                  <Badge
                    variant="outline"
                    className={cn("font-bold", RISK_META[selectedStudent.riskLevel].badgeClass)}
                  >
                    {RISK_META[selectedStudent.riskLevel].label}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 tabular-nums">
                  Código {selectedStudent.studentCode} • {courseStats.courseCode} •{" "}
                  {selectedStudent.sessionsCount} sesiones ({selectedStudent.activeMinutes} min totales)
                </p>
              </div>
            </div>

            {/* Métricas Resumen */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Feynman Oral
                </p>
                <p className="font-brand text-2xl font-bold text-quack-gunmetal tabular-nums mt-0.5">
                  {selectedStudent.feynmanAvg}%
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Parcial OCR
                </p>
                <p className="font-brand text-2xl font-bold text-quack-gunmetal tabular-nums mt-0.5">
                  {selectedStudent.ocrAvgOutOf5.toFixed(1)} / 5.0
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Error Dominante
                </p>
                <p className="font-brand text-sm font-bold text-quack-caramel mt-1.5">
                  {ERROR_LABEL[selectedStudent.dominantError]}
                </p>
              </div>
            </div>

            {/* Desglose por Tema */}
            <div className="flex flex-col gap-2.5">
              <h3 className="font-brand text-base font-bold text-quack-gunmetal">
                Desempeño por Tema Evaluado
              </h3>
              {selectedStudent.topicBreakdown.map((tb) => (
                <div
                  key={tb.topicTitle}
                  className="rounded-2xl border border-slate-200 p-3.5 flex flex-col gap-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-bold text-quack-gunmetal">{tb.topicTitle}</span>
                    <div className="flex items-center gap-2 text-xs font-bold tabular-nums">
                      <span className="rounded-lg bg-quack-dandelion/60 px-2 py-0.5 text-quack-gunmetal">
                        Feynman: {tb.feynmanScore}%
                      </span>
                      <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-quack-gunmetal">
                        OCR: {tb.ocrScoreOutOf5.toFixed(1)}/5
                      </span>
                    </div>
                  </div>
                  {tb.bottleneckSubtopic && (
                    <p className="text-xs text-rose-700 font-medium">
                      Punto de bloqueo detectado: {tb.bottleneckSubtopic}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Sesiones Recientes */}
            <div className="flex flex-col gap-2.5">
              <h3 className="font-brand text-base font-bold text-quack-gunmetal">
                Últimas Sesiones Registradas
              </h3>
              {selectedStudent.recentSessions.map((sess) => (
                <div
                  key={sess.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-bold text-quack-gunmetal">
                      {sess.mode} • {sess.topicTitle}
                    </span>
                    <Badge variant="outline" className="bg-white font-bold tabular-nums">
                      {sess.scoreLabel}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600">{sess.diagnosisNote}</p>
                  <span className="text-[11px] text-slate-400">{sess.dateLabel}</span>
                </div>
              ))}
            </div>

            {/* Intervención Recomendada */}
            <div className="rounded-2xl border border-amber-200 bg-quack-dandelion/25 p-4 flex flex-col gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-quack-caramel flex items-center gap-1.5">
                  <Sparkles className="size-3.5" aria-hidden="true" />
                  Intervención Pedagógica Recomendada
                </span>
                <p className="text-sm font-medium text-quack-gunmetal mt-1">
                  {selectedStudent.recommendedIntervention}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                {notifiedStudents[selectedStudent.id] ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                    <CheckCircle2 className="size-4" aria-hidden="true" />
                    Recordatorio enviado por Bloque Neón LTI
                  </span>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() =>
                      setNotifiedStudents((prev) => ({
                        ...prev,
                        [selectedStudent.id]: true,
                      }))
                    }
                    className="rounded-xl bg-quack-gunmetal hover:bg-slate-800 text-white text-xs font-semibold"
                  >
                    Asignar refuerzo socrático vía LTI
                  </Button>
                )}

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedStudent(null)}
                  className="rounded-xl text-xs text-slate-600"
                >
                  Cerrar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
