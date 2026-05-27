
import { useState } from "react";
import { GraphCategory, graphCategories } from "@/lib/TrackList";

const round = (n: number) => Math.round(n * 1000) / 1000;

export const categoryColours: Record<string, [string, string, string]> = {
  "Open": ["#c271f8", "bg-[#c271f8]/20", "bg-[#c271f8]/25"],
  "NOseboost": ["#60a5fa", "bg-[#60a5fa]/20", "bg-[#60a5fa]/25"],
  "No Uber": ["#34d399", "bg-[#34d399]/10", "bg-[#34d399]/15"],
  "WR Route": ["#ffc637", "bg-[#ffc637]/10", "bg-[#ffc637]/15"],
  "No Cut": ["#4d59ff", "bg-[#4d59ff]/10", "bg-[#4d59ff]/15"],
  "RTA": ["#fa5252", "bg-[#fa5252]/10", "bg-[#fa5252]/15"],
} as const;

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

export function RecordProgressionGraph({ progression, useMinutes, isStunt }: {
  progression: Record<GraphCategory, { date: string; time: number }[]>;
  useMinutes: boolean;
  isStunt: boolean;
}) {

  const [visibleCategories, setVisibleCategories] = useState<Record<GraphCategory, boolean>>(
    Object.fromEntries(graphCategories.map(c => [c, true])) as Record<GraphCategory, boolean>
  );

  const allPoints = Object.values(progression).flat();

  if (allPoints.length === 0) return null;

  const width = 600;
  const height = 320;
  const xPadding = 35;
  const yPadding = 20;

  const visiblePoints = graphCategories
    .filter(category => visibleCategories[category])
    .flatMap(category => progression[category] ?? []);
  const firstDate = Math.min(
    ...visiblePoints.map((p) =>
      new Date(p.date).getTime()
    )
  );
  const nowDate = Date.now();
  const datePadding = Math.max((nowDate - firstDate) * 0.03, 1000 * 60 * 60 * 24 * 30);
  const minDate = firstDate - datePadding;
  const maxDate = nowDate;

  const rawMinTime = Math.min(...visiblePoints.map((p) => p.time));
  const rawMaxTime = Math.max(...visiblePoints.map((p) => p.time));
  const startYear = new Date(minDate).getFullYear();
  const endYear = new Date(maxDate).getFullYear();
  const paddingSeconds = Math.max((rawMaxTime - rawMinTime) * 0.08, Math.max(0.001 * rawMinTime, 0.025));
  const minTime = Math.max(0, rawMinTime - paddingSeconds);
  const maxTime = rawMaxTime + paddingSeconds;
  const yTicks = generateYAxisTicks(minTime, maxTime);
  const yTickDecimals = maxTime - minTime <= 0.5 ? 2 : maxTime - minTime <= 0.5 ? 2 : maxTime - minTime <= 5 ? 1 : 0

  const xScale = (date: string) => {
    const t = new Date(date).getTime();
    return round(xPadding + ((t - minDate) / (maxDate - minDate || 1)) * (width - xPadding * 1.5));
  };
  const yScale = (time: number) => {
    return round(height - yPadding - ((time - yTicks[0]) / (yTicks[yTicks.length - 1] - yTicks[0] || 1)) * (height - yPadding * 2));
  };

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">
        Record Progression ({isStunt ? "pts" : useMinutes ? "min" : "sec"})
      </h2>

      <svg width={width} height={height}>
        {/* Axes */}
        <line
          x1={xPadding}
          y1={height - yPadding}
          x2={width - xPadding / 2}
          y2={height - yPadding}
          className="stroke-slate-600"
        />

        <line
          x1={xPadding}
          y1={yPadding}
          x2={xPadding}
          y2={height - yPadding}
          className="stroke-slate-600"
        />

        {/* Year labels */}
        {Array.from(
          { length: endYear - startYear + 1 },
          (_, i) => startYear + i
        ).map((year) => {
          const x = xScale(`${year}-01-01`);

          // Skip labels outside plotting region
          if (x < xPadding || x > width - xPadding / 2) {
            return null;
          }

          return (
            <text
              key={year}
              x={x}
              y={height - yPadding + 16}
              textAnchor="middle"
              className="fill-slate-500 text-[10px]"
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
                x1={xPadding}
                y1={y}
                x2={width - xPadding / 2}
                y2={y}
                className="stroke-slate-800"
              />

              <text
                x={xPadding - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-slate-500 text-[10px]"
              >
                {tick.toFixed(yTickDecimals)}
              </text>
            </g>
          );
        })}

        {/* Graph */}
        {graphCategories.map((category) => {
          const points = progression[category];
          if (points.length === 0 || !visibleCategories[category]) return null;

          let path = "";

          points.forEach((point, i) => {
            const x = xScale(point.date);
            const y = yScale(point.time);

            if (i === 0) {
              path += `M ${x} ${y}`;
            } else {
              path += ` H ${x}`;
              path += ` V ${y}`;
            }
          });

          const lastPoint = points[points.length - 1];

          if (lastPoint) {
            path += ` H ${xScale(new Date().toISOString())}`;
          }

          return (
            <path
              key={category}
              d={path}
              fill="none"
              stroke={categoryColours[category as keyof typeof categoryColours][0]}
              strokeWidth="2"
            />
          );
        })}

        {/* Points */}
        {graphCategories.flatMap((category) => {
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
                fill={categoryColours[category as keyof typeof categoryColours][0]}
              />
            );
          });
        })}

      </svg>

      {/* legend */}
      <div className="mt-4 flex flex-wrap justify-center gap-4 text-[10px]">
        {graphCategories.map((category) => {
          const points = progression[category];
          if (points.length === 0) return null;
          const colour = categoryColours[category];
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
