import * as React from "react";
import {
  AlertTriangle,
  Award,
  Building2,
  CheckCircle2,
  Download,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { INSTITUTIONAL_IMPACT_STATS } from "@/mocks/appData";
import { DualTrendChart } from "./Charts";
import { cn } from "@/lib/utils";
import type { DepartmentImpactRow } from "@/types";

type FacultyFilter = "Todas" | DepartmentImpactRow["faculty"];

const FACULTIES: readonly FacultyFilter[] = [
  "Todas",
  "Ingeniería de Sistemas",
  "Matemáticas",
  "Física",
  "Química y Biología",
];

export const DirectivoStatsView: React.FC = () => {
  const { user } = useAuth();
  const data = INSTITUTIONAL_IMPACT_STATS;

  const [selectedFaculty, setSelectedFaculty] = React.useState<FacultyFilter>("Todas");
  const [acknowledgedAlerts, setAcknowledgedAlerts] = React.useState<Record<string, boolean>>({});
  const [exportMessage, setExportMessage] = React.useState<string | null>(null);

  const filteredDepartments = React.useMemo(() => {
    if (selectedFaculty === "Todas") return data.departmentImpact;
    return data.departmentImpact.filter((row) => row.faculty === selectedFaculty);
  }, [data.departmentImpact, selectedFaculty]);

  const filteredWarnings = React.useMemo(() => {
    if (selectedFaculty === "Todas") return data.earlyWarnings;
    return data.earlyWarnings.filter((w) => w.faculty === selectedFaculty);
  }, [data.earlyWarnings, selectedFaculty]);

  const timelinePoints = data.cohortTimeline.map((pt) => ({
    label: pt.weekLabel,
    milestone: pt.milestone,
    seriesA: pt.withQuackScore,
    seriesB: pt.withoutQuackScore,
  }));

  const deltaApproval = (data.quackPassRatePercent - data.baselinePassRatePercent).toFixed(1);
  const adoptionRate = Math.round((data.activeStudents / data.licensedSeats) * 100);

  const handleExportSummary = () => {
    const header = "Facultad,Codigo,Asignatura,Estudiantes,Aprobacion_Sin_Quack_%,Aprobacion_Con_Quack_%,Dominio_Promedio_%,Reduccion_Ilusion_%\n";
    const rows = filteredDepartments
      .map((d) =>
        [
          `"${d.faculty}"`,
          d.courseCode,
          `"${d.courseTitle}"`,
          d.studentsCount,
          d.baselinePassRate,
          d.quackPassRate,
          d.avgMasteryPercent,
          d.illusionGapReductionPercent,
        ].join(",")
      )
      .join("\n");

    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "quack_campus_impacto_institucional.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportMessage("Resumen ejecutivo descargado en formato CSV");
    setTimeout(() => setExportMessage(null), 4000);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Encabezado Directivo + Filtro por Facultad */}
      <div className="flex flex-col gap-5 rounded-3xl border border-quack-gunmetal/15 bg-white p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-quack-gunmetal text-quack-amber border border-quack-gunmetal font-semibold">
                <Building2 className="size-3.5 mr-1.5" aria-hidden="true" />
                Vista Directivo · Estadísticas de Éxito Estudiantil
              </Badge>
              <Badge variant="outline" className="border-slate-200 text-slate-600">
                {data.academicPeriod}
              </Badge>
            </div>
            <h1 className="font-brand text-2xl sm:text-3xl font-bold text-quack-gunmetal">
              Impacto Institucional Quack Campus — {user?.institutionName || "Universidad de los Andes"}
            </h1>
            <p className="text-sm text-slate-600 max-w-2xl">
              Evaluación agregada para decanaturas y vicerrectoría académica ({user?.name}): evolución de aprobación, retención STEM y reducción de la ilusión de competencia respecto a cohortes sin Quack.
            </p>
          </div>

          <Button
            type="button"
            onClick={handleExportSummary}
            className="rounded-xl bg-quack-gunmetal hover:bg-slate-800 text-white font-brand font-bold shadow-none gap-2 self-start lg:self-auto"
          >
            <Download className="size-4 text-quack-amber" aria-hidden="true" />
            Exportar Resumen Ejecutivo
          </Button>
        </div>

        {exportMessage && (
          <div
            role="status"
            className="flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-800"
          >
            <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
            {exportMessage}
          </div>
        )}

        {/* Filtro por Facultad */}
        <div
          role="tablist"
          aria-label="Filtrar impacto por facultad o departamento"
          className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4"
        >
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mr-1">
            Facultad:
          </span>
          {FACULTIES.map((fac) => {
            const active = selectedFaculty === fac;
            return (
              <button
                key={fac}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSelectedFaculty(fac)}
                className={cn(
                  "rounded-xl border px-3.5 py-1.5 text-xs font-semibold transition-colors",
                  active
                    ? "border-quack-gunmetal bg-quack-amber text-quack-gunmetal font-bold"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                )}
              >
                {fac}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4 Hero KPIs de Impacto Directivo */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-2 border-quack-amber bg-[#151922] text-white rounded-2xl shadow-none">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-quack-amber flex items-center justify-between">
              Tasa de Aprobación STEM
              <TrendingUp className="size-4 text-quack-amber" aria-hidden="true" />
            </CardDescription>
            <CardTitle className="font-brand text-3xl font-bold text-white tabular-nums">
              {data.quackPassRatePercent}%
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-white/80 tabular-nums">
            <strong className="text-emerald-400">+{deltaApproval} pts</strong> frente al{" "}
            {data.baselinePassRatePercent}% histórico sin Quack
          </CardContent>
        </Card>

        <Card className="border border-slate-200 bg-white rounded-2xl shadow-none">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center justify-between">
              Retención Primer Año
              <Award className="size-4 text-emerald-600" aria-hidden="true" />
            </CardDescription>
            <CardTitle className="font-brand text-3xl font-bold text-quack-gunmetal tabular-nums">
              {data.stemRetentionPercent}%
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-600 tabular-nums">
            <strong className="text-emerald-700">+{data.retentionDeltaPoints} pts</strong> de permanencia en materias filtro
          </CardContent>
        </Card>

        <Card className="border border-slate-200 bg-white rounded-2xl shadow-none">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center justify-between">
              Adopción Licencia Campus
              <Users className="size-4 text-sky-600" aria-hidden="true" />
            </CardDescription>
            <CardTitle className="font-brand text-3xl font-bold text-quack-gunmetal tabular-nums">
              {data.activeStudents.toLocaleString("es-CO")} / {data.licensedSeats.toLocaleString("es-CO")}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-600 tabular-nums">
            {adoptionRate}% de asientos activos vía Bloque Neón LTI
          </CardContent>
        </Card>

        <Card className="border border-slate-200 bg-white rounded-2xl shadow-none">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center justify-between">
              Ilusión de Competencia
              <Sparkles className="size-4 text-quack-caramel" aria-hidden="true" />
            </CardDescription>
            <CardTitle className="font-brand text-3xl font-bold text-quack-caramel tabular-nums">
              -{data.illusionGapReductionPercent}%
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-600">
            Reducción en la brecha entre confianza previa y desempeño real en papel
          </CardContent>
        </Card>
      </div>

      {/* Evolución Longitudinal Con Quack vs Sin Quack + Correlación por Frecuencia */}
      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-7 min-w-0 border border-slate-200 bg-white rounded-3xl shadow-none">
          <CardHeader>
            <CardTitle className="font-brand text-xl font-bold text-quack-gunmetal">
              Trayectoria de Dominio: Con Quack vs. Grupo Control Sin Quack
            </CardTitle>
            <CardDescription>
              Comparativa de desempeño en evaluaciones estandarizadas entre Semana 1 y Pre-Final (hitos académicos marcados).
            </CardDescription>
          </CardHeader>
          <CardContent className="min-w-0">
            <DualTrendChart
              title="Comparativa institucional cohorte con Quack vs sin Quack"
              seriesALabel="Cohorte con Quack (%)"
              seriesBLabel="Cohorte control sin Quack (%)"
              seriesAColor="#FFC800"
              seriesBColor="#64748B"
              seriesBStyle="dashed"
              points={timelinePoints}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-5 min-w-0 border border-slate-200 bg-white rounded-3xl shadow-none">
          <CardHeader>
            <CardTitle className="font-brand text-xl font-bold text-quack-gunmetal">
              Correlación por Intensidad de Uso
            </CardTitle>
            <CardDescription>
              Relación directa entre frecuencia semanal de práctica activa y tasa de aprobación final.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3.5">
            {data.usageIntensityTiers.map((tier, idx) => (
              <div
                key={tier.tierLabel}
                className={cn(
                  "rounded-2xl border p-4 flex flex-col gap-2",
                  idx === 2
                    ? "border-quack-amber bg-quack-dandelion/25"
                    : "border-slate-200 bg-slate-50/60"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-brand text-sm font-bold text-quack-gunmetal">
                    {tier.tierLabel}
                  </h3>
                  <Badge
                    variant="outline"
                    className="bg-white font-bold tabular-nums text-quack-gunmetal"
                  >
                    {tier.avgFinalGradeOutOf5.toFixed(1)} / 5.0 prom.
                  </Badge>
                </div>
                <p className="text-xs text-slate-600">{tier.description}</p>
                <div className="flex items-center gap-3 pt-1">
                  <div className="h-2.5 flex-1 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        idx === 2
                          ? "bg-emerald-500"
                          : idx === 1
                          ? "bg-quack-amber"
                          : "bg-slate-400"
                      )}
                      style={{ width: `${tier.passRatePercent}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-quack-gunmetal tabular-nums shrink-0">
                    {tier.passRatePercent}% aprueba
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Impacto por Asignatura y Radar 48h */}
      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-7 min-w-0 border border-slate-200 bg-white rounded-3xl shadow-none">
          <CardHeader>
            <CardTitle className="font-brand text-xl font-bold text-quack-gunmetal">
              Impacto por Asignatura y Facultad ({selectedFaculty})
            </CardTitle>
            <CardDescription>
              Comparación de aprobación histórica (línea base) frente a la cohorte activa con Quack Campus.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {filteredDepartments.map((row) => {
              const lift = row.quackPassRate - row.baselinePassRate;
              return (
                <div
                  key={row.id}
                  className="rounded-2xl border border-slate-200 p-4 flex flex-col gap-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        {row.faculty} • {row.courseCode} • {row.studentsCount} estudiantes
                      </span>
                      <h3 className="font-brand text-base font-bold text-quack-gunmetal">
                        {row.courseTitle}
                      </h3>
                    </div>
                    <Badge className="bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold tabular-nums">
                      +{lift} pts aprobación
                    </Badge>
                  </div>

                  {/* Barras comparativas */}
                  <div className="grid gap-2 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="w-24 sm:w-28 text-slate-500 shrink-0">Sin Quack:</span>
                      <div className="h-2 flex-1 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-slate-400"
                          style={{ width: `${row.baselinePassRate}%` }}
                        />
                      </div>
                      <span className="w-10 text-right font-semibold text-slate-600 tabular-nums">
                        {row.baselinePassRate}%
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="w-24 sm:w-28 font-bold text-quack-gunmetal shrink-0">Con Quack:</span>
                      <div className="h-2.5 flex-1 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-quack-amber"
                          style={{ width: `${row.quackPassRate}%` }}
                        />
                      </div>
                      <span className="w-10 text-right font-bold text-quack-gunmetal tabular-nums">
                        {row.quackPassRate}%
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 border-t border-slate-100 pt-2 tabular-nums">
                    <span>
                      Dominio temático promedio: <strong className="text-quack-gunmetal">{row.avgMasteryPercent}%</strong>
                    </span>
                    <span>
                      Reducción ilusión de competencia: <strong className="text-quack-caramel">-{row.illusionGapReductionPercent}%</strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="lg:col-span-5 min-w-0 border border-slate-200 bg-white rounded-3xl shadow-none">
          <CardHeader>
            <CardTitle className="font-brand text-xl font-bold text-quack-gunmetal flex items-center gap-2">
              <ShieldAlert className="size-5 text-rose-600" aria-hidden="true" />
              Radar Pre-Parcial (48h–72h)
            </CardTitle>
            <CardDescription>
              Conceptos con mayor tasa de bloqueo antes de exámenes programados en el LMS.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3.5">
            {filteredWarnings.length === 0 ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 text-center text-xs text-emerald-800">
                No hay alertas críticas activas para la facultad seleccionada en las próximas 72 horas.
              </div>
            ) : (
              filteredWarnings.map((warn) => {
                const isSent = Boolean(acknowledgedAlerts[warn.id]);
                return (
                  <div
                    key={warn.id}
                    className="rounded-2xl border border-rose-200 bg-rose-50/35 p-4 flex flex-col gap-2.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-[11px] font-bold text-rose-800">
                        <AlertTriangle className="size-3" aria-hidden="true" />
                        {warn.examWindowLabel}
                      </span>
                      <span className="text-xs font-bold text-rose-800 tabular-nums">
                        {warn.affectedPercent}% afectados ({warn.affectedStudents} est.)
                      </span>
                    </div>

                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        {warn.courseTitle}
                      </p>
                      <h3 className="font-brand text-sm font-bold text-quack-gunmetal mt-0.5">
                        {warn.blockedConcept}
                      </h3>
                    </div>

                    <p className="text-xs text-slate-700">{warn.recommendedAction}</p>

                    <div className="pt-1">
                      {isSent ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                          <CheckCircle2 className="size-4" aria-hidden="true" />
                          Coordinación departamental notificada vía LTI
                        </span>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setAcknowledgedAlerts((prev) => ({ ...prev, [warn.id]: true }))
                          }
                          className="rounded-xl border-rose-300 bg-white hover:bg-rose-50 text-rose-900 text-xs font-semibold"
                        >
                          Activar cápsula de refuerzo LTI
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
