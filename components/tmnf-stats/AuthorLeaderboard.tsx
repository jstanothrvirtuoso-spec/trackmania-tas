
import { useState, useMemo } from "react";
import { TasEntry } from "@/utils/typing";
import { generateGraphColours } from "@/utils/common";

function round(n: number) { return Math.round(n * 1000) / 1000 }

const AUTHORS = ["Virtuoso", "charlie", "mufattmf", "igntuL", "threadd", "Thoman", "Bice", "CrizpyCheese", "BdcapTAS", "ezmTAS", "Lukalyc", "trabadia"] as const
const START_DATE = new Date("2021-06-01").getTime();
const WIDTH = 700;
const HEIGHT = 320;
const PADDING_X = 35;
const PADDING_Y = 20;
const Y_TICKS = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24] as const;
const INITIAL_VISIBLE = Object.fromEntries(AUTHORS.map(c => [c, true])) as Record<string, boolean>;

export default function AuthorLeaderboard( { tasRecords } : { tasRecords: TasEntry[] } ) {

  const [visibleAuthors, setVisibleAuthors] = useState(INITIAL_VISIBLE);
  const [hoverAuthor, setHoverAuthor] = useState("");
  const [nowDate] = useState(() => Date.now());

  const series = useMemo(() => {
    const currentWR = new Map<string, TasEntry>();
    const authorPoints = new Map<string, number>();

    const series: Record<string, { date: string; value: number }[]> =
      Object.fromEntries(AUTHORS.map(a => [a, []])) as any;

    let lastDay: string | null = null;
    let dirty = false;

    function snapshot(date: string) {
      for (const a of AUTHORS) {
        series[a].push({
          date,
          value: authorPoints.get(a) ?? 0,
        });
      }
    }

    for (const tas of tasRecords) {
      if (tas.game !== "TMNF") continue;
      if (new Date(tas.date).getTime() < START_DATE) continue;


      const day = tas.date.slice(0, 10);

      if (lastDay && day !== lastDay && dirty) {
        snapshot(lastDay);
        dirty = false;
      }

      lastDay = day;

      const existing = currentWR.get(tas.track);

      if (existing && existing.time_ms <= tas.time_ms) continue;

      if (existing) {
        for (const a of existing.authors) {
          authorPoints.set(a, (authorPoints.get(a) ?? 0) - 1);
        }
      }

      currentWR.set(tas.track, tas);

      for (const a of tas.authors) {
        authorPoints.set(a, (authorPoints.get(a) ?? 0) + 1);
      }

      dirty = true;
    }

    if (dirty && lastDay) {
      snapshot(lastDay);
    }

    return series;
  }, [tasRecords]);

  const colours = useMemo(() => generateGraphColours(AUTHORS.length), []);
  
  const COLOUR_MAP = Object.fromEntries(
    AUTHORS.map((a, i) => [a, colours[i]])
  );

  const datePadding = Math.max((nowDate - START_DATE) * 0.03, 1000 * 60 * 60 * 24 * 30);
  const minDate = START_DATE - datePadding;
  const startYear = new Date(minDate).getFullYear();
  const endYear = new Date(nowDate).getFullYear();
  const years = Array.from(
    { length: endYear - startYear + 1 },
    (_, i) => startYear + i
  );

  const orderedAuthors = [...AUTHORS].sort((a, b) => {
    if (a === hoverAuthor) return 1;
    if (b === hoverAuthor) return -1;
    return 0;
  });
  
  function xScale(date: string) {
    const t = new Date(date).getTime();
    return round(PADDING_X + ((t - minDate) / (nowDate - minDate || 1)) * (WIDTH - PADDING_X * 1.5));
  };

  function yScale(v: number) {
    return round(HEIGHT - PADDING_Y - ((v - Y_TICKS[0]) / (Y_TICKS[Y_TICKS.length - 1] - Y_TICKS[0] || 1)) * (HEIGHT - PADDING_Y * 2));
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 backdrop-blur-sm shadow-xl">
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">
        WR History
      </h2>

      <svg width={WIDTH} height={HEIGHT}>

        {/* Axes */}
        <line x1={PADDING_X} y1={HEIGHT - PADDING_Y} x2={WIDTH - PADDING_X / 2} y2={HEIGHT - PADDING_Y} className="stroke-slate-600" />
        <line x1={PADDING_X} y1={PADDING_Y} x2={PADDING_X} y2={HEIGHT - PADDING_Y} className="stroke-slate-600" />

        {/* Y Ticks */}
        {Y_TICKS.map(tick => {
          const y = yScale(tick);

          return (
            <g key={tick}>
              <line
                x1={PADDING_X}
                y1={y}
                x2={WIDTH - PADDING_X / 2}
                y2={y}
                className="stroke-slate-700/40"
              />

              <text
                x={PADDING_X - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-slate-400 text-[10px]"
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
                className="fill-slate-500 text-[10px]"
              >
                {year}
              </text>
            </g>
          );
        })}

        {/* Lines */}
        {orderedAuthors.map(author => {
          const points = series[author];
          if (!points?.length || !visibleAuthors[author]) return null;

          let d = "";

          for (let i = 0; i < points.length; i++) {
            const p = points[i];
            const x = xScale(p.date);
            const y = yScale(p.value);

            if (i === 0) {
              d += `M ${x} ${y}`;
            } else {
              d += ` H ${x} V ${y}`;
            }
          }

          return (
            <path
              key={author}
              d={d}
              fill="none"
              stroke={COLOUR_MAP[author]}
              strokeWidth={hoverAuthor === author ? 4 : 1.5}
            />
          );
        })}

      </svg>
      
      {/* Legend */}
      <div className="mt-4 flex justify-center">
        <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center max-w-[70%] text-[10px]">
          {AUTHORS.map((author) => {
            const colour = COLOUR_MAP[author];
            const active = visibleAuthors[author];

            return (
              <button
                key={author}
                onMouseEnter={() => setHoverAuthor(author)}
                onMouseLeave={() => setHoverAuthor("")}
                onClick={() => setVisibleAuthors((prev) => ({ ...prev, [author]: !prev[author] }))}
                className={`flex items-center gap-2 transition-opacity cursor-pointer hover:bg-slate-800 ${
                  active ? "opacity-100" : "opacity-90"
                }`}
              >
                <div
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: colour }}
                />

                <span
                  className={active ? "text-slate-300" : "text-slate-600"}
                >
                  {author}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      
    </div>
  )
}
  