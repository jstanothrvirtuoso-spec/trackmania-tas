
import { useState, useMemo } from "react";
import { RtaEntry, TasEntry } from "@/utils/typing";

const WIDTH = 700;
const HEIGHT = 420;
const PADDING_X = 35;
const PADDING_Y = 20;
const Y_TICKS = [0, 600000, 1200000, 1800000, 2400000, 3000000, 3600000, 4200000] as const;

export default function TmnfHistoryGraph( { bestRtaByTrack, tasRecords } : {
  bestRtaByTrack: Map<string, RtaEntry>, 
  tasRecords: TasEntry[] 
} ) {
  
  const points = useMemo(() => {
    const tas = tasRecords
      .filter((e) => e.game === "TMNF" || e.game === "TMNF No Cut")
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const cutoff = new Date("2021-01-01").getTime();
    const bestTasByTrack = new Map<string, number>();
    let cumulativeSaved = 0;

    const result: { date: string; time_ms: number }[] = [];

    for (const entry of tas) {
      const rta = bestRtaByTrack.get(entry.track);
      if (!rta) continue;
      const rtaTime = rta.time_ms;
      const currentBest = bestTasByTrack.get(entry.track);

      if (currentBest === undefined || entry.time_ms < currentBest) {
        const prevBest = currentBest ?? rtaTime;
        const improvement = prevBest - entry.time_ms;

        if (improvement > 0) {
          cumulativeSaved += improvement;
          bestTasByTrack.set(entry.track, entry.time_ms);

          if (new Date(entry.date).getTime() < cutoff) continue;
          result.push({
            date: entry.date,
            time_ms: cumulativeSaved,
          });
        }
      }
    }

    return result;
  }, [tasRecords, bestRtaByTrack]);
  
  const [maxDate] = useState<number>(() => Date.now());

  if (!points.length) return null;
  
  const firstDate = new Date(points[2].date).getTime();
  const lastDate = new Date(points[points.length - 1].date).getTime();
  const datePadding = Math.max((lastDate - firstDate) * 0.05, 1000 * 60 * 60 * 24 * 30);
  const minDate = firstDate - datePadding;
  const startYear = new Date(minDate).getFullYear();
  const endYear = new Date(maxDate).getFullYear();

  const years = Array.from(
    { length: endYear - startYear + 1 },
    (_, i) => startYear + i
  );
  
  const xScale = (date: string) => {
    const t = new Date(date).getTime();
    return (PADDING_X + ((t - minDate) / (maxDate - minDate || 1)) * (WIDTH - PADDING_X * 1.5));
  };

  const yScale = (v: number) => {
    const chartMin = Y_TICKS[0];
    const chartMax = Y_TICKS[Y_TICKS.length - 1];
    return (HEIGHT - PADDING_Y - ((v - chartMin) / (chartMax - chartMin || 1)) * (HEIGHT - PADDING_Y * 2));
  };

  let path = "";
  points.forEach((p, i) => {
    const x = xScale(p.date);
    const y = yScale(p.time_ms);

    if (i === 0) path += `M ${x} ${y}`;
    else path += ` L ${x} ${y}`;
  });

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">
        Cumulative Time Saved (Mins)
      </h2>

      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-[420px]">
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

        {/* Y Ticks */}
        {Y_TICKS.map((tick) => {
          const y = yScale(tick);

          return (
            <g key={tick}>
              <line
                x1={PADDING_X}
                y1={y}
                x2={WIDTH - PADDING_X / 2}
                y2={y}
                className="stroke-slate-800"
              />

              <text
                x={PADDING_X - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-slate-500 text-[10px]"
              >
                {Math.round(tick / 60000)}
              </text>
            </g>
          );
        })}
        
        {/* X Ticks */}
        {years.map((year) => {
          const x = xScale(`${year}-01-01`);

          if (x < PADDING_X || x > WIDTH - PADDING_X) return null;

          return (
            <g key={year}>
              <line
                x1={x}
                y1={PADDING_Y}
                x2={x}
                y2={HEIGHT - PADDING_Y}
                className="stroke-slate-800"
              />

              <text
                x={x}
                y={HEIGHT - PADDING_Y + 16}
                textAnchor="middle"
                className="fill-slate-500 text-[10px]"
              >
                {year}
              </text>
            </g>
          );
        })}

        {/* Line */}
        <path
          d={path}
          fill="none"
          stroke="#34d399"
          strokeWidth="2"
        />

        {/* Points */}
        {points.map((p) => (
          <circle
            key={`${p.date}-${p.time_ms}`}
            cx={xScale(p.date)}
            cy={yScale(p.time_ms)}
            r={3}
            fill="#34d399"
          />
        ))}
      </svg>
    </div>
  );
}
