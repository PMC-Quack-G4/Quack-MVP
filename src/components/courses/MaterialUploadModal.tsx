import * as React from "react";
import {
  CheckCircle2,
  FileCode2,
  FileText,
  FileUp,
  Loader2,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { INDIVIDUAL_QUICK_TEMPLATES } from "@/mocks/appData";
import { generateStudyBundleFromMaterial } from "@/services/materialGeneratorService";
import { cn } from "@/lib/utils";
import type { Course, CourseAccentTone } from "@/types";

export interface MaterialUploadModalProps {
  open: boolean;
  onClose: () => void;
  existingCourses: Course[];
  defaultCourseId?: string;
  onSuccess?: (courseId: string) => void;
}

const DISCIPLINES = [
  "Programación y Algoritmia",
  "Matemáticas Universitarias",
  "Física y Electrónica",
  "Química y Biología",
  "Ingeniería y Sistemas",
] as const;

const ACCENT_BY_DISCIPLINE: Record<string, CourseAccentTone> = {
  "Programación y Algoritmia": "amber",
  "Matemáticas Universitarias": "sky",
  "Física y Electrónica": "caramel",
  "Química y Biología": "emerald",
  "Ingeniería y Sistemas": "violet",
};

function inferFileType(fileName: string): "pdf" | "code" | "notes" | "slides" {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".pdf")) return "pdf";
  if (lower.endsWith(".ppt") || lower.endsWith(".pptx")) return "slides";
  if (
    lower.endsWith(".py") ||
    lower.endsWith(".ts") ||
    lower.endsWith(".tsx") ||
    lower.endsWith(".js") ||
    lower.endsWith(".java") ||
    lower.endsWith(".cpp") ||
    lower.endsWith(".c")
  ) {
    return "code";
  }
  return "notes";
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const MaterialUploadModal: React.FC<MaterialUploadModalProps> = ({
  open,
  onClose,
  existingCourses,
  defaultCourseId,
  onSuccess,
}) => {
  const { addMaterialToWorkspace } = useAuth();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [targetMode, setTargetMode] = React.useState<"new_course" | "existing_course">(
    defaultCourseId ? "existing_course" : "new_course"
  );
  const [selectedCourseId, setSelectedCourseId] = React.useState<string>(
    defaultCourseId || existingCourses[0]?.id || ""
  );
  const [courseTitle, setCourseTitle] = React.useState("");
  const [discipline, setDiscipline] = React.useState<string>(DISCIPLINES[0]);
  const [fileName, setFileName] = React.useState("");
  const [fileType, setFileType] = React.useState<"pdf" | "code" | "notes" | "slides">("pdf");
  const [sizeLabel, setSizeLabel] = React.useState("1.2 MB");
  const [rawNotes, setRawNotes] = React.useState("");
  const [isDragging, setIsDragging] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    setTargetMode(defaultCourseId ? "existing_course" : "new_course");
    setSelectedCourseId(defaultCourseId || existingCourses[0]?.id || "");
    setErrorMsg(null);
  }, [open, defaultCourseId, existingCourses]);

  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isProcessing) onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, isProcessing, onClose]);

  if (!open) return null;

  const handleFilePicked = (file: File) => {
    setErrorMsg(null);
    setFileName(file.name);
    setFileType(inferFileType(file.name));
    setSizeLabel(formatBytes(file.size));

    if (!courseTitle.trim() && targetMode === "new_course") {
      const cleanName = file.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ");
      setCourseTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }

    const isReadableText =
      file.type.startsWith("text/") ||
      /\.(txt|md|py|ts|tsx|js|jsx|java|cpp|c|csv|json)$/i.test(file.name);

    if (isReadableText) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const content = typeof ev.target?.result === "string" ? ev.target.result : "";
        setRawNotes(content.slice(0, 4000));
      };
      reader.readAsText(file);
    } else if (!rawNotes.trim()) {
      setRawNotes(
        `Apuntes extraídos del documento ${file.name}. Conceptos fundamentales, definiciones, derivaciones y aplicaciones prácticas para estudio activo.`
      );
    }
  };

  const applyQuickTemplate = (tplId: string) => {
    const tpl = INDIVIDUAL_QUICK_TEMPLATES.find((t) => t.id === tplId);
    if (!tpl) return;
    setErrorMsg(null);
    setFileName(tpl.fileName);
    setFileType(tpl.fileType);
    setSizeLabel("840 KB");
    setDiscipline(tpl.discipline);
    setRawNotes(tpl.contentPreview);
    if (targetMode === "new_course") {
      setCourseTitle(tpl.courseTitle);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetCourse = existingCourses.find((c) => c.id === selectedCourseId);
    const effectiveTitle =
      targetMode === "existing_course" && targetCourse
        ? targetCourse.title
        : courseTitle.trim();
    const effectiveDiscipline =
      targetMode === "existing_course" && targetCourse
        ? targetCourse.discipline
        : discipline;

    if (!effectiveTitle) {
      setErrorMsg("Indica el nombre de la materia o selecciona una materia existente.");
      return;
    }

    if (!fileName.trim() && rawNotes.trim().length < 10) {
      setErrorMsg("Sube un archivo, elige una plantilla rápida o pega un resumen de tus apuntes.");
      return;
    }

    setErrorMsg(null);
    setIsProcessing(true);

    try {
      const bundle = await generateStudyBundleFromMaterial({
        courseTitle: effectiveTitle,
        discipline: effectiveDiscipline,
        fileName: fileName.trim() || "apuntes_personales.md",
        fileType,
        sizeLabel,
        rawTextContent: rawNotes.trim() || effectiveTitle,
        accentTone: ACCENT_BY_DISCIPLINE[effectiveDiscipline] ?? "sky",
      });

      const createdCourseId = addMaterialToWorkspace({
        mode: targetMode,
        existingCourseId: targetMode === "existing_course" ? selectedCourseId : undefined,
        courseTitle: effectiveTitle,
        discipline: effectiveDiscipline,
        accentTone: ACCENT_BY_DISCIPLINE[effectiveDiscipline] ?? "sky",
        bundle,
      });

      setCourseTitle("");
      setFileName("");
      setRawNotes("");
      onClose();
      onSuccess?.(createdCourseId);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-modal-title"
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl">
        <button
          type="button"
          onClick={onClose}
          disabled={isProcessing}
          aria-label="Cerrar ventana de subida de material"
          className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-quack-gunmetal"
        >
          <X className="size-4" aria-hidden="true" />
        </button>

        <div className="flex flex-col gap-1.5 pr-8">
          <Badge className="w-fit bg-quack-dandelion text-quack-gunmetal border border-quack-amber/50 font-semibold">
            <FileUp className="size-3.5 mr-1.5 text-quack-caramel" aria-hidden="true" />
            Quack Pro · Material Propio
          </Badge>
          <h2
            id="upload-modal-title"
            className="font-brand text-2xl font-bold text-quack-gunmetal"
          >
            Sube tus apuntes, código o PDFs
          </h2>
          <p className="text-sm text-slate-600">
            Quack extraerá los subconceptos clave para interrogarte en Feynman Oral y preparará un simulacro de Parcial a Ciegas.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
          {/* Modo: Nueva materia vs Materia existente */}
          {existingCourses.length > 0 && (
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setTargetMode("new_course")}
                className={cn(
                  "rounded-xl py-2 font-brand text-xs font-bold transition-colors",
                  targetMode === "new_course"
                    ? "bg-white text-quack-gunmetal"
                    : "text-slate-600 hover:text-quack-gunmetal"
                )}
              >
                + Crear nueva materia
              </button>
              <button
                type="button"
                onClick={() => setTargetMode("existing_course")}
                className={cn(
                  "rounded-xl py-2 font-brand text-xs font-bold transition-colors",
                  targetMode === "existing_course"
                    ? "bg-white text-quack-gunmetal"
                    : "text-slate-600 hover:text-quack-gunmetal"
                )}
              >
                Agregar a materia existente
              </button>
            </div>
          )}

          {targetMode === "new_course" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="upload-course-title" className="text-xs font-bold text-quack-gunmetal">
                  Nombre de la Materia *
                </label>
                <Input
                  id="upload-course-title"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  placeholder="Ej. Química General II"
                  className="rounded-xl border-slate-200 bg-slate-50"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="upload-discipline" className="text-xs font-bold text-quack-gunmetal">
                  Área / Disciplina STEM
                </label>
                <select
                  id="upload-discipline"
                  value={discipline}
                  onChange={(e) => setDiscipline(e.target.value)}
                  className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-quack-gunmetal focus:outline-none focus:ring-2 focus:ring-quack-amber"
                >
                  {DISCIPLINES.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="upload-existing-course" className="text-xs font-bold text-quack-gunmetal">
                Selecciona tu materia
              </label>
              <select
                id="upload-existing-course"
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-quack-gunmetal focus:outline-none focus:ring-2 focus:ring-quack-amber"
              >
                {existingCourses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} ({c.discipline})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Plantillas de prueba en 1 clic */}
          <div className="rounded-2xl border border-amber-200 bg-quack-dandelion/20 p-3.5 flex flex-col gap-2">
            <span className="text-xs font-bold text-quack-gunmetal flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-quack-caramel" aria-hidden="true" />
              Cargar material de muestra en 1 clic (para demo rápida):
            </span>
            <div className="flex flex-wrap gap-2">
              {INDIVIDUAL_QUICK_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => applyQuickTemplate(tpl.id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors",
                    fileName === tpl.fileName
                      ? "border-quack-gunmetal bg-quack-amber text-quack-gunmetal"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  )}
                >
                  {tpl.fileType === "code" ? (
                    <FileCode2 className="size-3.5 text-quack-caramel" aria-hidden="true" />
                  ) : (
                    <FileText className="size-3.5 text-quack-caramel" aria-hidden="true" />
                  )}
                  {tpl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Zona Drag & Drop de archivo */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,.md,.py,.ts,.tsx,.js,.java,.cpp,.csv,.ppt,.pptx,.doc,.docx"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFilePicked(f);
              e.target.value = "";
            }}
          />

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const f = e.dataTransfer.files?.[0];
              if (f) handleFilePicked(f);
            }}
            className={cn(
              "rounded-2xl border-2 border-dashed p-5 text-center transition-colors",
              isDragging
                ? "border-quack-amber bg-quack-dandelion/20"
                : fileName
                ? "border-emerald-300 bg-emerald-50/40"
                : "border-slate-300 bg-slate-50/60"
            )}
          >
            {fileName ? (
              <div className="flex flex-col items-center gap-2">
                <CheckCircle2 className="size-7 text-emerald-600" aria-hidden="true" />
                <p className="text-sm font-bold text-quack-gunmetal">{fileName}</p>
                <p className="text-xs text-slate-500">
                  Tipo: {fileType.toUpperCase()} • {sizeLabel}
                </p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-1 rounded-xl text-xs"
                >
                  Cambiar archivo
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <UploadCloud className="size-8 text-quack-caramel" aria-hidden="true" />
                <p className="text-sm font-semibold text-quack-gunmetal">
                  Arrastra tu PDF, código fuente o apuntes aquí
                </p>
                <p className="text-xs text-slate-500">
                  Soporta .pdf, .pptx, .py, .ts, .md, .txt
                </p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-1 rounded-xl text-xs bg-white"
                >
                  Seleccionar archivo del computador
                </Button>
              </div>
            )}
          </div>

          {/* Notas o contenido extraído editable */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="upload-notes" className="text-xs font-bold text-quack-gunmetal">
              Contenido / Apuntes clave (opcional o editable)
            </label>
            <textarea
              id="upload-notes"
              rows={3}
              value={rawNotes}
              onChange={(e) => setRawNotes(e.target.value)}
              placeholder="Pega aquí definiciones, teoremas o código de tu clase para que Quack formule mejores contrapreguntas..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-quack-gunmetal placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-quack-amber"
            />
          </div>

          {errorMsg && (
            <p
              role="alert"
              className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700"
            >
              {errorMsg}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="ghost"
              disabled={isProcessing}
              onClick={onClose}
              className="rounded-xl text-slate-600"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isProcessing}
              className="rounded-xl bg-quack-amber hover:bg-quack-sandy text-quack-gunmetal font-brand font-bold shadow-none gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Procesando material…
                </>
              ) : (
                <>
                  <Sparkles className="size-4" aria-hidden="true" />
                  Generar temas y ejercicios
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
