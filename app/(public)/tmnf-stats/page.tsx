"use client"

import { useMemo } from "react";
import { TasEntry, categoryFilters, trackList } from "@/lib/TrackList";
import { useTasRecords } from "@/lib/TasRecords";
import { useRtaRecords, buildBestRtaByTrack } from "@/lib/RtaRecords";
import { formatTime } from "@/utils/formatting";

type Point = {
  date: string;
  time_ms: number;
};
const categories = [
  ["No Cut", "WR Route", "No Uber", "NOseboost", "Open"],
  ["bg-white/10", "bg-green-500/10", "bg-blue-500/10", "bg-red-500/10", "bg-black/10"]
] as const;

function TmnfHistoryGraph({
  points,
}: {
  points: Point[];
}) {
  if (!points.length) return null;

  const width = 700;
  const height = 420;
  const xPadding = 35;
  const yPadding = 20;

  const sorted = [...points].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const firstDate = new Date(sorted[2].date).getTime();
  const lastDate = new Date(sorted[sorted.length - 1].date).getTime();
  const datePadding = Math.max((lastDate - firstDate) * 0.05, 1000 * 60 * 60 * 24 * 30);
  const minDate = firstDate - datePadding;
  const maxDate = Date.now();
  const yTicks = [0, 600000, 1200000, 1800000, 2400000, 3000000, 3600000, 4200000];
  const startYear = new Date(minDate).getFullYear();
  const endYear = new Date(maxDate).getFullYear();

  const years = Array.from(
    { length: endYear - startYear + 1 },
    (_, i) => startYear + i
  );
  
  const xScale = (date: string) => {
    const t = new Date(date).getTime();
    return (
      xPadding +
      ((t - minDate) / (maxDate - minDate || 1)) * (width - xPadding * 1.5)
    );
  };

  const yScale = (v: number) => {
    const chartMin = yTicks[0];
    const chartMax = yTicks[yTicks.length - 1];

    return (
      height -
      yPadding -
      ((v - chartMin) / (chartMax - chartMin || 1)) * (height - yPadding * 2)
    );
  };

  let path = "";

  sorted.forEach((p, i) => {
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

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[420px]">
        {/* axes */}
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

        {/* y ticks */}
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
                {Math.round(tick / 60000)}
              </text>
            </g>
          );
        })}
        
        {/* x ticks */}
        {years.map((year) => {
          const x = xScale(`${year}-01-01`);

          if (x < xPadding || x > width - xPadding) return null;

          return (
            <g key={year}>
              <line
                x1={x}
                y1={yPadding}
                x2={x}
                y2={height - yPadding}
                className="stroke-slate-800"
              />

              <text
                x={x}
                y={height - yPadding + 16}
                textAnchor="middle"
                className="fill-slate-500 text-[10px]"
              >
                {year}
              </text>
            </g>
          );
        })}

        {/* line */}
        <path
          d={path}
          fill="none"
          stroke="#34d399"
          strokeWidth="2"
        />

        {/* points */}
        {sorted.map((p) => (
          <circle
            key={p.time_ms}
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

function getVisibleBest(
  trackMap: Map<string, TasEntry> | undefined,
  category: keyof typeof categoryFilters
) {
  if (!trackMap) return null;

  const allowed = categoryFilters[category];

  let best: TasEntry | null = null;

  for (const [cat, entry] of trackMap.entries()) {
    if (!allowed.has(cat)) continue;

    if (!best || entry.time_ms < best.time_ms) {
      best = entry;
    }
  }

  return best;
}

export default function TmnfHistory() {

  const { data: rtaRecords = [] } = useRtaRecords();
  const { data: tasRecords = [] } = useTasRecords();

  const bestRtaByTrack = useMemo(() => {
    if (!rtaRecords.length) return new Map();
    return buildBestRtaByTrack(rtaRecords);
  }, [rtaRecords]);

  const points = useMemo(() => {
    const tas = Object.values(tasRecords)
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

  const bestByTrackAndCategory = useMemo(() => {
    const map: Map<string, Map<string, TasEntry>> = new Map();

    for (const entry of tasRecords as TasEntry[]) {
      if ((entry.game !== "TMNF" && entry.game !== "TMNF No Cut") || entry.category == "Low Input") continue;

      const trackName = entry.game === "TMNF" ? entry.track : entry.track.split(" No")[0]
      const trackMap = map.get(trackName) ?? new Map();
      const existing = trackMap.get(entry.category);

      if (!existing || entry.time_ms < existing.time_ms) {
        trackMap.set(entry.category, entry);
        map.set(trackName, trackMap);
      }
    }

    return map;
  }, [tasRecords]);

  const rows = useMemo(() => {
    return Object.entries(trackList)
      .filter(([, info]) => info.game === "TMNF")
      .map(([track]) => {
        const trackMap = bestByTrackAndCategory.get(track);
        const rta = bestRtaByTrack.get(track);
        let currentBestTime: number | null = null;
        let currentColourIndex = 0;

        const columns = categories[0].map((cat, i) => {
          const best = getVisibleBest(trackMap, cat as any);
          if (!best) { 
            return {
              entry: null,
              colourIndex: currentColourIndex,
            };
          };
          const time = best.time_ms;
          if (currentBestTime === null || time < currentBestTime) { 
            currentBestTime = time; 
            currentColourIndex = i;
            return {
              entry: best,
              colourIndex: i,
            };
          };
          return {
            entry: null,
            colourIndex: currentColourIndex,
          };
        });

        return {
          track,
          columns,
          rta: rta?.time_ms ?? null,
        };
      });
  }, [bestByTrackAndCategory, bestRtaByTrack]);

  return (
    <div className="flex gap-4 justify-center pt-16">

      <div className="my-5 mx-3 overflow-auto rounded-xl border border-slate-800 bg-slate-900/20 text-center">
        <table className="w-full text-xs">
          <thead className="text-slate-200 px-3 py-2 bg-slate-900/90 border border-slate-800 font-mono rounded-tl-lg tracking-[0.02em] text-sm cursor-pointer hover:text-slate-300 transition whitespace-nowrap">
            <tr className="">
              <th className="px-3 py-2 tracking-wide">
                Track
              </th>

              {categories[0].toReversed()
                .map((c) => (
                  <th
                    key={c}
                    className="px-3 py-2"
                  >
                    {c}
                  </th>
                ))}

              <th className="px-3 py-2">
                RTA
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800/60">
            {rows.map((row) => (
              <tr
                key={row.track}
                className="hover:bg-emerald-800/40 transition-colors odd:bg-slate-800/10"
              >
                {/* track */}
                <td className="px-3 py-1.5 text-slate-300 bg-purple-800/5 whitespace-nowrap">
                  {row.track}
                </td>

                {/* TAS columns */}
                {row.columns.toReversed().map((c, i) => (
                  <td
                    key={i}
                    className={`px-3 py-1.5 tabular-nums ${
                      categories[1][c.colourIndex]
                    }`}
                  >
                    {c.entry ? (
                      <span className="text-slate-300">
                        { formatTime(c.entry.time_ms, false) }
                      </span>
                    ) : (
                      <span className="text-slate-600">-</span>
                    )}
                  </td>
                ))}

                {/* RTA */}
                <td className="px-3 py-1.5 tabular-nums">
                  {row.rta ? (
                    <span className="text-slate-300">
                      { formatTime(row.rta, false) }
                    </span>
                  ) : (
                    <span className="text-slate-600">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center my-5">
        <div className="w-auto">
            <TmnfHistoryGraph points={points} />
        </div>
      </div>
    </div>
  );
}
