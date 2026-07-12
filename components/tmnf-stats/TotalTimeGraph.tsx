
import { useState, useMemo } from "react";
import { Category, RtaEntry, TasEntry } from "@/utils/typing";
import { TRACKS } from "@/lib/TrackList";

type TrackSets = "Overall" | "White" | "Green" | "Blue" | "Red" | "Black" | "RTA";

const START_DATE = new Date("2021-01-01").getTime();
const TAS_START_DATE = new Date("2021-06-01").getTime();
const WIDTH = 720;
const HEIGHT = 405;
const PADDING_X = 45;
const PADDING_Y = 20;
const TRACK_SET_COLOURS: Record<TrackSets, string> = {
  Overall: "#5a0da3",
  White: "#dbdbdb",
  Green: "#21b858",
  Blue: "#185fd1",
  Red: "#b92020",
  Black: "#59575a",
  RTA: "#b92020",
};

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

  return { yStep: niceStep, yTicks: ticks.map((t) => Math.round(t * 1e6) / 1e6) };
}

export default function TotalTimeGraph( { rtaRecords, records, category } : {
  rtaRecords: RtaEntry[], 
  records: TasEntry[] ,
  category: Category,
} ) {
  
  const [maxDate] = useState<number>(() => Date.now());
  const [visibleSets, setVisibleSets] = useState<Record<string, boolean>>(
    { "Overall": true, "White": true, "Green": true, "Blue": true, "Red": true, "Black": true, "RTA": true }
  );

  const points = useMemo(() => {

    const bestRtaByTrack = new Map<string, number>();
    let bestTasByTrack = new Map<string, number>();

    const totalTime = {
      "White": 0,
      "Green": 0,
      "Blue": 0,
      "Red": 0,
      "Black": 0,
      "Overall": 0,
      "RTA": 0,
    } satisfies Record<TrackSets, number>;
    
    const points: Record<TrackSets, { date: string, time_ms: number }[]> = {
      "White": [],
      "Green": [],
      "Blue": [],
      "Red": [],
      "Black": [],
      "Overall": [],
      "RTA": [],
    };

    for (const record of rtaRecords) {

      if (category === "No Cut") {
        if (record.game === "TMNF" && TRACKS[record.track].noCutTrack) continue;
      } else if (record.game !== "TMNF") continue;

      const previous = bestRtaByTrack.get(record.track);

      if (!previous) {
        totalTime["RTA"] += record.time_ms;
        bestRtaByTrack.set(record.track, record.time_ms);
      } else if (record.time_ms < previous) {
        totalTime["RTA"] -= previous - record.time_ms;
        bestRtaByTrack.set(record.track, record.time_ms);
      } else {
        continue;
      }

      const date = new Date(record.date);
      if (date.getTime() >= START_DATE) {

        if (points["RTA"].length === 32) {
          for (const [track, time] of bestRtaByTrack) {
            const set = TRACKS[track].gameSet as TrackSets;
            totalTime[set] += time;
            totalTime["Overall"] += time;
          };
          bestTasByTrack = bestRtaByTrack;
        };

        points["RTA"].push({
          date: record.date,
          time_ms: totalTime["RTA"],
        });
      }
    };

    for (const tas of records) {

      const track = category === "No Cut" ? TRACKS[tas.track].noCutTrack ?? tas.track : tas.track;
      const gameSet = TRACKS[track].gameSet as TrackSets;
      const previous = bestTasByTrack.get(track)!;

      if (tas.time_ms < previous) {
        totalTime[gameSet] -= previous - tas.time_ms;
        totalTime["Overall"] -= previous - tas.time_ms;
        bestTasByTrack.set(tas.track, tas.time_ms);
      } else {
        continue;
      }

      const date = new Date(tas.date);
      if (date.getTime() >= TAS_START_DATE) {
        points[gameSet].push({
          date: tas.date,
          time_ms: totalTime[gameSet],
        });
        points["Overall"].push({
          date: tas.date,
          time_ms: totalTime["Overall"],
        });
      }
    };
    
    return points;
  }, [records, rtaRecords, category]);

  const startYear = new Date(START_DATE).getFullYear();
  const endYear = new Date(maxDate).getFullYear();
  const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
  
  const { rawMinTime, rawMaxTime } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;

    for (const [set, values] of Object.entries(points)) {
      if (!visibleSets[set]) continue;

      for (const point of values) {
        min = Math.min(min, point.time_ms);
        max = Math.max(max, point.time_ms);
      }
    }

    const rawMinTime = min / 60000;
    const rawMaxTime = max / 60000;

    return {rawMinTime, rawMaxTime};
  }, [points, visibleSets]);

  const paddingY = Math.max((rawMaxTime - rawMinTime) * 0.08, Math.max(0.001 * rawMinTime, 0.025));
  const minTime = Math.max(0, rawMinTime - paddingY);
  const maxTime = rawMaxTime + paddingY;
  const { yStep, yTicks } = generateYAxisTicks(minTime, maxTime);
  const yTickDecimals = yStep < 0.1 ? 2 : yStep < 1 ? 1 : 0;

  function xScale(date: string) {
    const t = new Date(date).getTime();
    return (PADDING_X + ((t - START_DATE) / (maxDate - START_DATE || 1)) * (WIDTH - PADDING_X * 1.5));
  };

  function yScale(time: number) {
    return round(HEIGHT - PADDING_Y - ((time - yTicks[0]) / (yTicks[yTicks.length - 1] - yTicks[0] || 1)) * (HEIGHT - PADDING_Y * 2));
  };

  const paths = (Object.keys(points) as TrackSets[]).map((set) => {
    
    let path = set === "RTA" 
      ? `M ${PADDING_X} ${points[set].length > 0 ? yScale(points[set][0].time_ms / 60000) : HEIGHT - PADDING_Y}`
      : `M ${points[set].length > 0 ? xScale(points[set][0].date) : PADDING_X} ${points[set].length > 0 ? yScale(points[set][0].time_ms / 60000) : HEIGHT - PADDING_Y}`;
    
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
    <div className="rounded-xl border border-slate-800 w-full flex-1 shadow-[0_5px_20px_rgba(0,0,0,0.6)] bg-slate-950/90">
      <div className="w-full p-4 rounded-xl">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">
          Total Time (Mins)
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
            {yTicks.map((tick) => {
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
                    {tick.toFixed(yTickDecimals)}
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
