import * as React from "react";
import { cn } from "@/lib/utils";
import type { ErrorBreakdownCounts } from "@/types";

export interface DualTrendPoint {
  label: string;
  milestone?: string;
  seriesA: number;
  seriesB: number;
}

export interface DualTrendChartProps {
  title: string;
  seriesALabel: string;
  seriesBLabel: string;
  seriesAColor?: string;
  seriesBColor?: string;
  seriesBStyle?: "solid" | "dashed";
  points: DualTrendPoint[];
  unitSuffix?: string;
}

/**
 * Gráfica SVG dual interactiva (accesible por teclado y puntero) sin dependencias externas pesadas.
 */
export const DualTrendChart: React.FC<DualTrendChartProps> = ({
  title,
  seriesALabel,
  seriesBLabel,
  seriesAColor = "#FFC800",
  seriesBColor = "#3B4151",
  seriesBStyle = "solid",
  points,
  unitSuffix = "%",
}) => {
  const [activeIdx, setActiveIdx] = React.useState<number>(Math.max(0, points.length - 1));

  React.useEffect(() => {
    setActiveIdx(Math.max(0, points.length - 1));
  }, [points.length]);

  const safePoints = points.length > 0 ? points : [{ label: "Sem 1", seriesA: 0, seriesB: 0 }];
  const width = 640;
  const height = 220;
  const padLeft = 40;
  const padRight = 40;
  const padTop = 24;
  const padBottom = 34;

  const innerW = width - padLeft - padRight;
  const innerH = height - padTop - padBottom;

  const getX = (idx: number) => {
    if (safePoints.length <= 1) return padLeft + innerW / 2;
    return padLeft + (idx / (safePoints.length - 1)) * innerW;
  };

  const getY = (val: number) => {
    const clamped = Math.max(0, Math.min(100, val));
    return padTop + innerH - (clamped / 100) * innerH;
  };

  const pathA = safePoints
    .map((pt, idx) => `${idx === 0 ? "M" : "L"}${getX(idx).toFixed(1)},${getY(pt.seriesA).toFixed(1)}`)
    .join(" ");

  const pathB = safePoints
    .map((pt, idx) => `${idx === 0 ? "M" : "L"}${getX(idx).toFixed(1)},${getY(pt.seriesB).toFixed(1)}`)
    .join(" ");

  const areaA = `${pathA} L${getX(safePoints.length - 1).toFixed(1)},${(padTop + innerH).toFixed(1)} L${getX(0).toFixed(1)},${(padTop + innerH).toFixed(1)} Z`;

  const currentPoint = safePoints[Math.min(activeIdx, safePoints.length - 1)];

  return (
    <div className="flex flex-col gap-3 w-full min-w-0">
      {/* Leyenda e Inspector */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs min-w-0">
        <div className="flex flex-wrap items-center gap-4">
          <span className="inline-flex items-center gap-2 font-semibold text-quack-gunmetal">
            <span
              className="inline-block h-2.5 w-5 rounded-full shrink-0"
              style={{ backgroundColor: seriesAColor }}
              aria-hidden="true"
            />
            {seriesALabel}
          </span>
          <span className="inline-flex items-center gap-2 font-semibold text-slate-600">
            <span
              className={cn(
                "inline-block h-0.5 w-5 shrink-0",
                seriesBStyle === "dashed" && "border-t-2 border-dashed"
              )}
              style={{
                backgroundColor: seriesBStyle === "solid" ? seriesBColor : "transparent",
                borderColor: seriesBColor,
              }}
              aria-hidden="true"
            />
            {seriesBLabel}
          </span>
        </div>

        <div className="inline-flex flex-wrap items-center gap-x-2.5 gap-y-1 max-w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-1 tabular-nums">
          <span className="font-bold text-quack-gunmetal">
            {currentPoint.label}
            {currentPoint.milestone ? ` (${currentPoint.milestone})` : ""}:
          </span>
          <span className="font-bold text-quack-caramel">
            {currentPoint.seriesA}
            {unitSuffix}
          </span>
          <span className="text-slate-400">vs</span>
          <span className="font-semibold text-slate-700">
            {currentPoint.seriesB}
            {unitSuffix}
          </span>
        </div>
      </div>

      {/* Lienzo SVG */}
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={`${title}. ${seriesALabel}: ${currentPoint.seriesA}${unitSuffix}; ${seriesBLabel}: ${currentPoint.seriesB}${unitSuffix}.`}
          className="w-full min-w-[420px] h-auto select-none"
        >
          <defs>
            <linearGradient id={`areaGrad-${seriesAColor.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={seriesAColor} stopOpacity="0.28" />
              <stop offset="100%" stopColor={seriesAColor} stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Cuadrícula horizontal */}
          {[0, 25, 50, 75, 100].map((tick) => {
            const y = getY(tick);
            return (
              <g key={tick}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeDasharray={tick === 0 ? undefined : "4 4"}
                  strokeWidth="1"
                />
                <text
                  x={padLeft - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  fontSize="10"
                  fill="#64748B"
                  className="tabular-nums"
                >
                  {tick}%
                </text>
              </g>
            );
          })}

          {/* Área suave bajo serie A */}
          <path d={areaA} fill={`url(#areaGrad-${seriesAColor.replace("#", "")})`} />

          {/* Línea Serie B */}
          <path
            d={pathB}
            fill="none"
            stroke={seriesBColor}
            strokeWidth="2.5"
            strokeDasharray={seriesBStyle === "dashed" ? "6 4" : undefined}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Línea Serie A */}
          <path
            d={pathA}
            fill="none"
            stroke={seriesAColor}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Marcadores interactivos por punto */}
          {safePoints.map((pt, idx) => {
            const x = getX(idx);
            const yA = getY(pt.seriesA);
            const yB = getY(pt.seriesB);
            const isSelected = idx === activeIdx;

            return (
              <g
                key={`${pt.label}-${idx}`}
                className="cursor-pointer"
                onMouseEnter={() => setActiveIdx(idx)}
                onClick={() => setActiveIdx(idx)}
              >
                {pt.milestone && (
                  <g>
                    <line
                      x1={x}
                      y1={padTop - 4}
                      x2={x}
                      y2={padTop + innerH}
                      stroke="#CBD5E1"
                      strokeDasharray="3 3"
                    />
                    <text
                      x={x}
                      y={12}
                      textAnchor="middle"
                      fontSize="9.5"
                      fontWeight="700"
                      fill="#D96B43"
                    >
                      {pt.milestone}
                    </text>
                  </g>
                )}

                {isSelected && (
                  <line
                    x1={x}
                    y1={padTop}
                    x2={x}
                    y2={padTop + innerH}
                    stroke="#94A3B8"
                    strokeWidth="1"
                  />
                )}

                <circle
                  cx={x}
                  cy={yB}
                  r={isSelected ? 5 : 3.5}
                  fill="#FFFFFF"
                  stroke={seriesBColor}
                  strokeWidth="2.2"
                />
                <circle
                  cx={x}
                  cy={yA}
                  r={isSelected ? 6 : 4}
                  fill={seriesAColor}
                  stroke="#3B4151"
                  strokeWidth="1.8"
                />

                {/* Área invisible de hit-target más cómoda */}
                <rect
                  x={x - 18}
                  y={padTop}
                  width={36}
                  height={innerH + 22}
                  fill="transparent"
                />

                <text
                  x={x}
                  y={height - 10}
                  textAnchor="middle"
                  fontSize="10.5"
                  fontWeight={isSelected ? "700" : "500"}
                  fill={isSelected ? "#3B4151" : "#64748B"}
                >
                  {pt.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export interface ErrorDonutBreakdownProps {
  counts: ErrorBreakdownCounts;
  title?: string;
}

interface DonutSliceMeta {
  key: keyof ErrorBreakdownCounts;
  label: string;
  description: string;
  color: string;
  badgeClass: string;
}

const SLICE_META: DonutSliceMeta[] = [
  {
    key: "correct",
    label: "Pasos Correctos",
    description: "Rigor conceptual y algebraico validado",
    color: "#10B981",
    badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
  {
    key: "conceptual",
    label: "Error Conceptual",
    description: "Fallo en principio físico/matemático (prioridad Feynman)",
    color: "#E11D48",
    badgeClass: "bg-rose-50 text-rose-800 border-rose-200",
  },
  {
    key: "algebraic",
    label: "Error Algebraico",
    description: "Signos, exponentes o simplificación",
    color: "#F59E0B",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
  },
  {
    key: "propagated",
    label: "Error Arrastrado",
    description: "Consistente con paso previo; obtuvo crédito parcial",
    color: "#0EA5E9",
    badgeClass: "bg-sky-50 text-sky-800 border-sky-200",
  },
];

export const ErrorDonutBreakdown: React.FC<ErrorDonutBreakdownProps> = ({
  counts,
  title = "Distribución de pasos auditados",
}) => {
  const total =
    counts.correct + counts.conceptual + counts.algebraic + counts.propagated;
  const safeTotal = Math.max(1, total);

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  let accumulatedOffset = 0;

  return (
    <div className="flex flex-col items-center gap-5 w-full min-w-0">
      <div className="relative size-32 sm:size-36 shrink-0">
        <svg
          viewBox="0 0 140 140"
          role="img"
          aria-label={`${title}: ${total} pasos registrados`}
          className="size-full -rotate-90"
        >
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="#F1F5F9"
            strokeWidth="18"
          />
          {SLICE_META.map((slice) => {
            const value = counts[slice.key];
            if (value <= 0) return null;
            const dashLength = (value / safeTotal) * circumference;
            const dashOffset = -accumulatedOffset;
            accumulatedOffset += dashLength;

            return (
              <circle
                key={slice.key}
                cx="70"
                cy="70"
                r={radius}
                fill="none"
                stroke={slice.color}
                strokeWidth="18"
                strokeDasharray={`${dashLength} ${circumference}`}
                strokeDashoffset={dashOffset}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-brand text-2xl font-bold text-quack-gunmetal tabular-nums">
            {total}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Pasos OCR
          </span>
        </div>
      </div>

      <div className="w-full min-w-0 flex flex-col divide-y divide-slate-100">
        {SLICE_META.map((slice) => {
          const val = counts[slice.key];
          const pct = Math.round((val / safeTotal) * 100);
          return (
            <div
              key={slice.key}
              className="flex items-start sm:items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0 w-full min-w-0 text-xs"
            >
              <div className="flex items-start gap-2.5 flex-1 min-w-0">
                <span
                  className="size-2.5 shrink-0 rounded-full mt-1"
                  style={{ backgroundColor: slice.color }}
                  aria-hidden="true"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-quack-gunmetal leading-snug">
                    {slice.label}
                  </p>
                  <p className="text-[11px] text-slate-500 leading-snug break-words">
                    {slice.description}
                  </p>
                </div>
              </div>
              <span
                className={cn(
                  "shrink-0 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-bold tabular-nums",
                  slice.badgeClass
                )}
              >
                {val} ({total > 0 ? pct : 0}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
