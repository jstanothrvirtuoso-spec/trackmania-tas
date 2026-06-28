
import { useState, useMemo } from "react";
import { RtaEntry, TasEntry } from "@/utils/typing";
import { TRACKS } from "@/lib/TrackList";

type TrackSets = "Overall" | "White" | "Green" | "Blue" | "Red" | "Black"

const START_DATE = new Date("2021-01-01").getTime();
const WIDTH = 720;
const HEIGHT = 405;
const PADDING_X = 35;
const PADDING_Y = 20;
const TRACK_SET_COLOURS: Record<TrackSets, string> = {
  Overall: "#5a0da3",
  White: "#dbdbdb",
  Green: "#21b858",
  Blue: "#185fd1",
  Red: "#b92020",
  Black: "#59575a",
};

export default function TotalTimeSaved( { bestRtaByTrack, filteredTasRecords } : {
  bestRtaByTrack: Map<string, RtaEntry>, 
  filteredTasRecords: TasEntry[] 
} ) {
  
  const [maxDate] = useState<number>(() => Date.now());
  const [visibleSets, setVisibleSets] = useState<Record<string, boolean>>(() => {
    return { "Overall": true, "White": true, "Green": true, "Blue": true, "Red": true, "Black": true }
  });

  const points = useMemo(() => {

    const tmnfRecords = filteredTasRecords.filter((e) => e.game === "TMNF" || e.game === "TMNF No Cut")
    const cutoff = new Date("2021-01-01").getTime();
    const bestTasByTrack = new Map<string, number>();

    const cumulativeSaved = {
      "White": 0,
      "Green": 0,
      "Blue": 0,
      "Red": 0,
      "Black": 0,
      "Overall": 0,
    } satisfies Record<TrackSets, number>;

    const trackSet = {
      "White": [] as { date: string; time_ms: number }[],
      "Green": [] as { date: string; time_ms: number }[],
      "Blue": [] as { date: string; time_ms: number }[],
      "Red": [] as { date: string; time_ms: number }[],
      "Black": [] as { date: string; time_ms: number }[],
      "Overall": [] as { date: string; time_ms: number }[],
    };

    for (const tas of tmnfRecords) {
      const track = TRACKS[tas.track].baseTrack ?? tas.track
      const rta = bestRtaByTrack.get(track)!;
      const currentBest = bestTasByTrack.get(track) ?? rta.time_ms;

      if (tas.time_ms < currentBest) {

        const improvement = currentBest - tas.time_ms;
        const category = TRACKS[track].gameSet as TrackSets;

        cumulativeSaved[category] += improvement;
        cumulativeSaved["Overall"] += improvement;
        bestTasByTrack.set(track, tas.time_ms);

        if (new Date(tas.date).getTime() < cutoff) continue;
        trackSet["Overall"].push({
          date: tas.date,
          time_ms: cumulativeSaved["Overall"],
        });

        trackSet[category].push({
          date: tas.date,
          time_ms: cumulativeSaved[category],
        })
      }
    }
    
    return trackSet;
  }, [filteredTasRecords, bestRtaByTrack]);

  const startYear = new Date(START_DATE).getFullYear();
  const endYear = new Date(maxDate).getFullYear();
  const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
  
  const { maxTick, yStep } = useMemo(() => {
    let max = 0.01;
    for (const set of Object.keys(points) as TrackSets[]) {
      if (!visibleSets[set]) continue;

      const data = points[set];
      max = Math.max(max, (data[data.length - 1]?.time_ms ?? 0) / 60000);
    }

    const yStep = max > 30 ? 10 : max > 10 ? 2 : max > 2 ? 1 : max > 0.5 ? 0.5 : 0.02;
    const maxTick = Math.ceil((max + 0.001) / yStep) * yStep

    return { maxTick, yStep };
  }, [visibleSets, points]);

  const xScale = (date: string) => {
    const t = new Date(date).getTime();
    return (PADDING_X + ((t - START_DATE) / (maxDate - START_DATE || 1)) * (WIDTH - PADDING_X * 1.5));
  };

  const yScale = (v: number) => {
    return (HEIGHT - PADDING_Y - (v / maxTick) * (HEIGHT - PADDING_Y * 2));
  };

  const paths = (Object.keys(points) as TrackSets[]).map((set) => {
    
    let path = `M ${PADDING_X} ${HEIGHT - PADDING_Y}`;
    points[set].forEach((p) => {
      const x = xScale(p.date);
      const y = yScale(p.time_ms / 60000);
      path += ` H ${x} V ${y}`;
    });
    path += `H ${PADDING_X + (WIDTH - PADDING_X * 1.5)}`

    return {
      set,
      path,
      colour: TRACK_SET_COLOURS[set],
    };
  });

  return (
    <div className="rounded-xl border border-slate-800 w-full flex-1 shadow-[0_5px_20px_rgba(0,0,0,0.6)] bg-slate-950/80">
      <div className="w-full p-4 rounded-xl bg-gradient-to-r from-emerald-950/60 via-slate-950/40 to-slate-950/40">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">
          Cumulative Time Saved (Mins)
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

            {/* Y Ticks */}
            {Array.from(
              { length: Math.floor(maxTick / yStep) + 1 },
              (_, i) => i * yStep
            ).map((tick) => {
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
                    className="fill-slate-400 text-[13px]"
                  >
                    {tick}
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
                    className="fill-slate-400 text-[12px]"
                  >
                    {year}
                  </text>
                </g>
              );
            })}

            {/* Line */}
            {paths.map(({ set, path, colour }) => {
              if (!visibleSets[set]) return null;
              return (
                <path
                  key={set}
                  d={path}
                  fill="none"
                  stroke={colour}
                  strokeWidth={set === "Overall" ? 3 : 2}
                />
              )
            })}
          </svg>
        </div>
        
        {/* Legend */}
        <div className="mt-4 flex justify-center">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 justify-center max-w-[90%]">
            {paths.map(({ set, colour }) => {
              const active = visibleSets[set];

              return (
                <button
                  key={set}
                  onClick={() => setVisibleSets((prev) => ({ ...prev, [set]: !prev[set] }))}
                  className={`flex items-center gap-2 transition-opacity cursor-pointer hover:bg-slate-800 ${
                    active ? "opacity-100" : "opacity-90"
                  }`}
                >
                  <div
                    className="h-1 w-1 rounded-full sm:h-1.5 sm:w-1.5"
                    style={{ backgroundColor: colour }}
                  />

                  <span
                    className={`text-[8px] sm:text-[10px] ${active ? "text-slate-300" : "text-slate-600"}`}
                  >
                    {set}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
