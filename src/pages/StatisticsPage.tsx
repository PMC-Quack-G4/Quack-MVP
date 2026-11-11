import * as React from "react";
import { useSearchParams } from "react-router-dom";
import { Building2, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { StudentStatsView } from "@/components/analytics/StudentStatsView";
import { DocenteStatsView } from "@/components/analytics/DocenteStatsView";
import { DirectivoStatsView } from "@/components/analytics/DirectivoStatsView";
import { cn } from "@/lib/utils";
import type { InstitutionScope } from "@/types";

export const StatisticsPage: React.FC = () => {
  const { user, institutionScope, setInstitutionScope } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const scopeParam = searchParams.get("scope");
  const courseParam = searchParams.get("course");

  // Sincronizar scope de URL (?scope=docente|directivo) cuando cambia externamente
  React.useEffect(() => {
    if (user?.role !== "institution") return;
    if (scopeParam === "docente" || scopeParam === "directivo") {
      if (institutionScope !== scopeParam) {
        setInstitutionScope(scopeParam);
      }
    }
  }, [user?.role, scopeParam, institutionScope, setInstitutionScope]);

  const handleScopeSwitch = (nextScope: InstitutionScope) => {
    setInstitutionScope(nextScope);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("scope", nextScope);
    setSearchParams(nextParams, { replace: true });
  };

  const handleCourseChange = (courseId: string) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("scope", "docente");
    nextParams.set("course", courseId);
    setSearchParams(nextParams, { replace: true });
  };

  if (!user) return null;

  return (
    <div className="container py-8 max-w-6xl flex flex-col gap-6">
      {/* Selector Dual Exclusivo para Usuario Institución (Docente ↔ Directivo) */}
      {user.role === "institution" && (
        <section
          aria-label="Selector de perspectiva institucional"
          className="rounded-3xl border border-slate-200 bg-white p-2 sm:p-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
        >
          <div className="px-3 py-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-quack-caramel block">
              Perspectiva Institucional Dual
            </span>
            <p className="text-xs text-slate-600">
              Alterna entre tus cursos dictados (Docente) y la analítica global de impacto (Directivo).
            </p>
          </div>

          <div
            role="tablist"
            aria-label="Cambiar entre Vista Docente y Vista Directivo"
            className="grid grid-cols-2 gap-1.5 rounded-2xl bg-slate-100 p-1"
          >
            <button
              type="button"
              role="tab"
              aria-selected={institutionScope === "docente"}
              onClick={() => handleScopeSwitch("docente")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl px-4 py-2 font-brand text-xs font-bold transition-colors",
                institutionScope === "docente"
                  ? "bg-quack-amber text-quack-gunmetal"
                  : "text-slate-600 hover:text-quack-gunmetal"
              )}
            >
              <Users className="size-4 shrink-0" aria-hidden="true" />
              <span>Vista Docente</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={institutionScope === "directivo"}
              onClick={() => handleScopeSwitch("directivo")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl px-4 py-2 font-brand text-xs font-bold transition-colors",
                institutionScope === "directivo"
                  ? "bg-quack-gunmetal text-white"
                  : "text-slate-600 hover:text-quack-gunmetal"
              )}
            >
              <Building2 className="size-4 shrink-0" aria-hidden="true" />
              <span>Vista Directivo</span>
            </button>
          </div>
        </section>
      )}

      {/* Contenido adaptado al rol activo */}
      {user.role === "institution" ? (
        institutionScope === "docente" ? (
          <DocenteStatsView
            initialCourseId={courseParam}
            onCourseChange={handleCourseChange}
          />
        ) : (
          <DirectivoStatsView />
        )
      ) : (
        <StudentStatsView />
      )}
    </div>
  );
};
