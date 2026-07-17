
import { useState, useMemo } from "react";
import { CATEGORY_COLOURS, CATEGORY_FILTERS, GRAPH_CATEGORIES } from "@/utils/constants";
import { Game, TasEntry } from "@/utils/typing";

type GraphCategory = (typeof GRAPH_CATEGORIES)[number];
type ProgressionGraphPoint = {
  id: number,
  date: string, 
  time: number, 
  category: GraphCategory
};

const WIDTH = 720;
const HEIGHT = 405;
const PADDING_X = 40;
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
  if (max > 100) {
    niceStep = Math.max(0.1, niceStep)
  }

  const tickMin = Math.floor(min / niceStep) * niceStep;
  const tickMax = Math.ceil(max / niceStep) * niceStep;
  const ticks: number[] = [];

  for (let i = 0, t = tickMin; t <= tickMax + niceStep * 0.5; i++, t = tickMin + i * niceStep) {
    ticks.push(t);
  }

  return { step: niceStep, yTicks: ticks.map((t) => Math.round(t * 1e6) / 1e6) };
}

export function RecordProgressionGraph({ records, game, graphUnits, currentRecord, minDate, maxDate }: {
  records: TasEntry[];
  game: Game;
  graphUnits: string;
  currentRecord: { category: string, id: number } | null;
  minDate: number;
  maxDate: number;
}) {

  const [forceZeroY, setForceZeroY] = useState(false);
  const [forceZeroX, setForceZeroX] = useState(false);
  const [visibleCategories, setVisibleCategories] = useState(INITIAL_VISIBLE);

  const progression = useMemo<Record<GraphCategory, ProgressionGraphPoint[]>>(() => {

    const sorted = [...records].sort((a, b) => {
      const dateDiff = new Date(a.date).getTime() - new Date(b.date).getTime();
      if (dateDiff !== 0) return dateDiff;
      return b.time_ms - a.time_ms;
    });

    const buildPoints = (category: GraphCategory) => {
      const allowedCategories = forceZeroX && category === "RTA" ? new Set(["RTA", "RTA-old"]) : CATEGORY_FILTERS[category];
      const points: ProgressionGraphPoint[] = [];
      
      let best = Infinity;
      sorted
        .filter((tas) => allowedCategories.has(tas.category))
        .forEach((tas) => {
          if (tas.time_ms < best) {
            best = tas.time_ms;
            points.push({
              id: tas.id,
              date: tas.date,
              time: graphUnits === "min" ? tas.time_ms / 60000 : Math.abs(tas.time_ms) / 1000,
              category: tas.category as GraphCategory
            });
          }
        });
      
      const categoryTest = forceZeroX && category === "RTA" ? new Set(["RTA", "RTA-old"]) : new Set([category]);
      const filterPoints = points.filter((tas) => categoryTest.has(tas.category));

      return filterPoints.length > 0 ? points : [];
    };

    return {
      "Open": buildPoints("Open"),
      "NOseboost": buildPoints("NOseboost"),
      "No Uber": buildPoints("No Uber"),
      "WR Route": buildPoints("WR Route"),
      "No Cut": buildPoints("No Cut"),
      "RTA": buildPoints("RTA"),
    };
  }, [records, graphUnits, forceZeroX]);

  const { rawMinTime, rawMaxTime } = useMemo(() => {

    const visiblePoints = GRAPH_CATEGORIES
      .filter(category => visibleCategories[category])
      .flatMap(category => progression[category] ?? []);

    const times = visiblePoints
      .filter(p => new Date(p.date).getTime() > new Date("2008-04-30").getTime())
      .map(p => p.time);
    return {
      rawMinTime: Math.min(...times),
      rawMaxTime: Math.max(...times),
    };
  }, [visibleCategories, progression]);

  const firstYear = forceZeroX ? new Date("2008-01-01").getTime() : minDate;
  const startYear = new Date(firstYear).getFullYear();
  const endYear = new Date(maxDate).getFullYear();
  const paddingSeconds = Math.max((rawMaxTime - rawMinTime) * 0.08, Math.max(0.001 * rawMinTime, 0.025));
  const minTime = forceZeroY ? 0 : Math.max(0, rawMinTime - paddingSeconds);
  const maxTime = rawMaxTime + paddingSeconds;
  const { step, yTicks } = generateYAxisTicks(minTime, maxTime);
  const yTickDecimals = step < 0.1 ? 2 : step < 1 ? 1 : 0;
  const xStep = forceZeroX ? 2 : 1;

  function xScale(date: string) {
    const t = new Date(date).getTime();
    return round(PADDING_X + ((t - firstYear) / (maxDate - firstYear || 1)) * (WIDTH - PADDING_X * 1.5));
  };

  function yScale(time: number) {
    return round(HEIGHT - PADDING_Y - ((time - yTicks[0]) / (yTicks[yTicks.length - 1] - yTicks[0] || 1)) * (HEIGHT - PADDING_Y * 2));
  };

  const hovered = currentRecord ? (() => {
    const category = currentRecord.category as GraphCategory;
    const points = progression[category] ?? [];
    const index = points.findIndex((p) => p.id === currentRecord.id);
    return index !== -1 && visibleCategories[category] ? { category, index, points } : null;
  })() : null;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 w-full flex-1 backdrop-blur-sm shadow-[0_5px_20px_rgba(0,0,0,0.6)]">
      <h2 className="mb-1 uppercase tracking-[0.18em] text-slate-300 text-xs lg:text-sm lg:font-semibold">
        Record Progression ({graphUnits})
      </h2>

      <div className="w-full aspect-[16/9]">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-full">
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
          {Array.from( { length: endYear - startYear + 1 }, (_, i) => startYear + i * xStep).map((year) => {
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
                className="fill-slate-400 text-[12px]"
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
                  className={
                    tick === yTicks[0]
                      ? "fill-emerald-400 text-[13px] cursor-pointer hover:fill-slate-200"
                      : "fill-slate-400 text-[13px]"
                  }
                  onClick={ tick === yTicks[0] ? () => setForceZeroY(v => !v) : undefined}
                >
                  {tick.toFixed(yTickDecimals)}
                </text>
              </g>
            );
          })}

          {game === "TMNF" && (
            <text
              x={PADDING_X + 6}
              y={HEIGHT - PADDING_Y - 8}
              textAnchor="start"
              className="fill-emerald-400 text-[15px] cursor-pointer hover:fill-slate-200"
              onClick={() => setForceZeroX(v => !v)}
            >
              {forceZeroX ? "→" : "←"}
            </text>
          )}

          {/* Graph */}
          {GRAPH_CATEGORIES.map((category) => {
            const points = progression[category];
            if (points.length === 0 || !visibleCategories[category]) return null;
            
            let path = "";
            points.forEach((point, i) => {
              const x = xScale(point.date);
              const y = yScale(point.time);

              if (i === 0) {
                path += `M ${Math.max(PADDING_X, x)} ${Math.max(PADDING_Y, y)}`;
              } else {
                path += ` H ${Math.max(PADDING_X, x)} V ${Math.max(PADDING_Y, y) }`;
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

              if (y < PADDING_Y) return;
              if (x < PADDING_X) return;

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
            const x1 = Math.max(PADDING_X, xScale(p1.date));
            const x2 = index < points.length - 1 ? xScale(p2.date) : xScale(new Date().toISOString());
            const y = yScale(p1.time);

            if (x2 < PADDING_X) return;

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
                {x1 > PADDING_X && (
                  <circle
                    cx={x1}
                    cy={y}
                    r={5}
                    fill="#f16717"
                  />
                )}
                {x2 < WIDTH - PADDING_X && (
                  <circle
                    cx={x2}
                    cy={y}
                    r={5}
                    fill="#f16717"
                  />
                )}
              </g>
            );
          })()}

        </svg>
      </div>

      {/* Legend */}
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
