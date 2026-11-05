import { CheckCircle2, AlertTriangle, XCircle, CornerDownRight, type LucideIcon } from "lucide-react";
import type { StepStatus } from "@/types/exam";

interface StatusMeta {
  label: string;
  Icon: LucideIcon;
  /** Clases para chip (fondo + texto + borde). */
  chip: string;
  /** Color del icono sobre papel. */
  ink: string;
}

/** Estados de auditoría: siempre icono + texto (nunca sólo color). */
export const statusMeta: Record<StepStatus, StatusMeta> = {
  CORRECT: {
    label: "Correcto",
    Icon: CheckCircle2,
    chip: "bg-emerald-50 text-emerald-800 border-emerald-300",
    ink: "text-emerald-600",
  },
  ALGEBRAIC_ERROR: {
    label: "Error algebraico",
    Icon: AlertTriangle,
    chip: "bg-amber-50 text-amber-900 border-amber-400",
    ink: "text-amber-600",
  },
  CONCEPTUAL_ERROR: {
    label: "Error conceptual",
    Icon: XCircle,
    chip: "bg-red-50 text-red-800 border-red-300",
    ink: "text-red-600",
  },
  PROPAGATED_ERROR: {
    label: "Error arrastrado",
    Icon: CornerDownRight,
    chip: "bg-slate-100 text-slate-700 border-slate-300",
    ink: "text-slate-500",
  },
};
