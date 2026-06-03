
import { useState, useMemo } from "react";
import { Category, TasEntry } from "@/utils/typing";
import { CATEGORY_COLOURS, GRAPH_CATEGORIES } from "@/utils/constants";
import { GraphCategory, ProgressionGraphPoint } from "./page";

const WIDTH = 600;
const HEIGHT = 320;
const PADDING_X = 35;
const PADDING_Y = 20;

const INITIAL_VISIBLE = Object.fromEntries(
  GRAPH_CATEGORIES.map(c => [c, true])
) as Record<GraphCategory, boolean>;

function round(n: number) {
  return Math.round(n * 1000) / 1000
}

function generateYAxisTicks(min: number, max: number) {

  const range = max - min;
  const roughStep = range / 7;
  const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
  const normalized = roughStep / magnitude;
  let niceStep = 1;
  if (normalized < 1.5) {
    niceStep = 1;
  } else if (normalized < 3) {
    niceStep = 2;
  } else if (normalized < 7) {
    niceStep = 5;
  } else {
    niceStep = 10;
  }
  niceStep *= magnitude;

  const tickMin = Math.floor(min / niceStep) * niceStep;
  const tickMax = Math.ceil(max / niceStep) * niceStep;
  const ticks: number[] = [];

  for (let i = 0, t = tickMin; t <= tickMax + niceStep * 0.5; i++, t = tickMin + i * niceStep) {
    ticks.push(t);
  }

  return ticks.map((t) => Math.round(t * 1e6) / 1e6);
}

export function RecordProgressionGraph({ progression, useMinutes, isStunt, currentTas }: {
  progression: Record<GraphCategory, ProgressionGraphPoint[]>;
  useMinutes: boolean;
  isStunt: boolean;
  currentTas: TasEntry | null;
}) {

  const [forceZeroY, setForceZeroY] = useState(false);
  const [visibleCategories, setVisibleCategories] = useState(INITIAL_VISIBLE);

  const allPoints = Object.values(progression).flat();
  const visiblePoints = GRAPH_CATEGORIES
    .filter(category => visibleCategories[category])
    .flatMap(category => progression[category] ?? []);

  const { firstDate, rawMinTime, rawMaxTime } = useMemo(() => {
    let firstDate = Infinity;
    let rawMinTime = Infinity;
    let rawMaxTime = -Infinity;

    for (const p of visiblePoints) {
      const date = new Date(p.date).getTime();
      const time = p.time;

      if (date < firstDate) firstDate = date;
      if (time < rawMinTime) rawMinTime = time;
      if (time > rawMaxTime) rawMaxTime = time;
    }

    return { firstDate, rawMinTime, rawMaxTime };
  }, [visiblePoints]);
  
  const [nowDate] = useState<number>(() => Date.now());

  if (allPoints.length === 0) return null;

  const datePadding = Math.max((nowDate - firstDate) * 0.03, 1000 * 60 * 60 * 24 * 30);
  const minDate = firstDate - datePadding;
  const maxDate = nowDate;

  const startYear = new Date(minDate).getFullYear();
  const endYear = new Date(maxDate).getFullYear();
  const paddingSeconds = Math.max((rawMaxTime - rawMinTime) * 0.08, Math.max(0.001 * rawMinTime, 0.025));
  const minTime = forceZeroY ? 0 : Math.max(0, rawMinTime - paddingSeconds);
  const maxTime = rawMaxTime + paddingSeconds;
  const yTicks = generateYAxisTicks(minTime, maxTime);
  const yTickDecimals = maxTime - minTime <= 0.5 ? 2 : maxTime - minTime <= 5 ? 1 : 0

  const xScale = (date: string) => {
    const t = new Date(date).getTime();
    return round(PADDING_X + ((t - minDate) / (maxDate - minDate || 1)) * (WIDTH - PADDING_X * 1.5));
  };
  const yScale = (time: number) => {
    return round(HEIGHT - PADDING_Y - ((time - yTicks[0]) / (yTicks[yTicks.length - 1] - yTicks[0] || 1)) * (HEIGHT - PADDING_Y * 2));
  };

  const hovered = currentTas ? (() => {
    const category = currentTas.category as GraphCategory;
    const points = progression[category] ?? [];
    const index = points.findIndex((p) => p.id === currentTas.id);
    return index !== -1 ? { category, index, points } : null;
  })() : null;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 backdrop-blur-sm shadow-xl">
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">
        Record Progression ({isStunt ? "pts" : useMinutes ? "min" : "sec"})
      </h2>

      <svg width={WIDTH} height={HEIGHT}>
        {/* Axes */}
        <line
          x1={PADDING_X}
          y1={HEIGHT - PADDING_Y}
          x2={WIDTH - PADDING_X / 2}
          y2={HEIGHT - PADDING_Y}
          className="stroke-slate-600"
        />

        <line
          x1={PADDING_X}
          y1={PADDING_Y}
          x2={PADDING_X}
          y2={HEIGHT - PADDING_Y}
          className="stroke-slate-600"
        />

        {/* Year labels */}
        {Array.from( { length: endYear - startYear + 1 }, (_, i) => startYear + i).map((year) => {
          const x = xScale(`${year}-01-01`);

          // Skip labels outside plotting region
          if (x < PADDING_X || x > WIDTH - PADDING_X / 2) {
            return null;
          }

          return (
            <text
              key={year}
              x={x}
              y={HEIGHT - PADDING_Y + 16}
              textAnchor="middle"
              className="fill-slate-400 text-[10px]"
            >
              {year}
            </text>
          );
        })}

        {/* Time labels */}
        {yTicks.map((tick) => {
          const y = yScale(tick);

          return (
            <g key={tick}>
              <line
                x1={PADDING_X}
                y1={y}
                x2={WIDTH - PADDING_X / 2}
                y2={y}
                className="stroke-slate-700/50"
              />

              <text
                x={PADDING_X - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-slate-400 text-[10px]"
              >
                {tick.toFixed(yTickDecimals)}
              </text>

              <text
                x={PADDING_X - 8}
                y={y + 4}
                textAnchor="end"
                className={
                  tick === yTicks[0]
                    ? "fill-emerald-400 text-[10px] cursor-pointer hover:fill-slate-200"
                    : "fill-slate-400 text-[10px]"
                }
                onClick={ tick === yTicks[0] ? () => setForceZeroY(v => !v) : undefined}
              >
                {tick.toFixed(yTickDecimals)}
              </text>
            </g>
          );
        })}

        {/* Graph */}
        {GRAPH_CATEGORIES.map((category) => {
          const points = progression[category];
          if (points.length === 0 || !visibleCategories[category]) return null;
          
          let path = "";
          points.forEach((point, i) => {
            const x = xScale(point.date);
            const y = yScale(point.time);

            if (i === 0) {
              path += `M ${x} ${y}`;
            } else {
              path += ` H ${x} V ${y}`;
            }
          });

          const lastPoint = points[points.length - 1];
          if (lastPoint) { path += ` H ${xScale(new Date().toISOString())}` }
          
          return (
            <path
              key={category}
              d={path}
              fill="none"
              stroke={CATEGORY_COLOURS[category][0]}
              strokeWidth="2"
            />
          );
        })}

        {/* Points */}
        {GRAPH_CATEGORIES.flatMap((category) => {
          if (!visibleCategories[category]) return [];

          return progression[category].map((p) => {
            const x = xScale(p.date);
            const y = yScale(p.time);

            return (
              <circle
                key={`${category}-${p.date}-${p.time}`}
                cx={x}
                cy={y}
                r={3}
                fill={CATEGORY_COLOURS[category][0]}
              />
            );
          });
        })}

        {/* Hover highlight overlay */}
        {hovered && (() => {
          const { index, points } = hovered;
          const p1 = points[index];
          const p2 = points[index + 1];
          const x1 = xScale(p1.date);
          const x2 = index < points.length - 1 ? xScale(p2.date) : xScale(new Date().toISOString());
          const y = yScale(p1.time);

          return (
            <g key={`hover-${hovered.category}-${index}`}>
              <line
                x1={x1}
                y1={y}
                x2={x2}
                y2={y}
                stroke="#f16717"
                strokeWidth={3}
              />
              <circle
                cx={x1}
                cy={y}
                r={5}
                fill="#f16717"
              />
              <circle
                cx={x2}
                cy={y}
                r={5}
                fill="#f16717"
              />
            </g>
          );
        })()}

      </svg>

      {/* legend */}
      <div className="mt-4 flex flex-wrap justify-center gap-4 text-[10px]">
        {GRAPH_CATEGORIES.map((category) => {
          const points = progression[category];
          if (points.length === 0) return null;
          const colour = CATEGORY_COLOURS[category];
          const active = visibleCategories[category];

          return (
            <button
              key={category}
              onClick={() => setVisibleCategories((prev) => ({ ...prev, [category]: !prev[category] }))}
              className={`flex items-center gap-2 transition-opacity cursor-pointer hover:bg-slate-800 ${
                active ? "opacity-100" : "opacity-90"
              }`}
            >
              <div
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: colour[0] }}
              />

              <span
                className={active ? "text-slate-300" : "text-slate-600"}
              >
                {category}
              </span>
            </button>
          );
        })}
      </div>

    </div>
  );
}
