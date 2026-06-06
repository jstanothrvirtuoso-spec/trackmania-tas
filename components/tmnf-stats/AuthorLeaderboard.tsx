
import { useState, useMemo, useEffect } from "react";
import { TasEntry } from "@/utils/typing";
import { generateGraphColours } from "@/utils/common";

type GraphType = "TASes" | "Contributions" | "TimeSaved"

function round(n: number) { return Math.round(n * 1000) / 1000 }

const START_DATE = new Date("2021-06-01").getTime();
const WIDTH = 700;
const HEIGHT = 370;
const PADDING_X = 35;
const PADDING_Y = 20;
const NUM_AUTHORS = 6;
const Y_STEP = 2;
const COLOURS = generateGraphColours(NUM_AUTHORS);

export default function AuthorLeaderboard( { filteredTasRecords, authors } : { 
  filteredTasRecords: TasEntry[],
  authors: string[],
} ) {

  const [visibleAuthors, setVisibleAuthors] = useState<Record<string, boolean>>(() => (
    Object.fromEntries(authors.map((a) => [a, true]))
  ));
  const [extraAuthor, setExtraAuthor] = useState<string>("");
  const [hoverAuthor, setHoverAuthor] = useState<string>("");
  const [graphType, setGraphType] = useState<GraphType>("TASes");
  const [nowDate] = useState(() => Date.now());

  const { series, authorMax } = useMemo(() => {
    const currentWR = new Map<string, TasEntry>();
    const authorPoints = new Map<string, number>();
    const authorMax = new Map<string, number>();

    const series: Record<string, { date: string; value: number }[]> =
      Object.fromEntries(authors.map(author => [author, []]));
    
    if (!authors?.length) return { series, authorMax };

    let lastDay: string | null = null;
    let dirty = false;

    function snapshot(date: string) {
      for (const a of authors) {
        series[a].push({
          date,
          value: authorPoints.get(a) ?? 0,
        });
      }
    }

    for (const tas of filteredTasRecords) {
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

      if (existing && existing.authors.length > 0) {
        const points = graphType === "TASes" ? 1 
          : graphType === "TimeSaved" ? existing.time_ms / existing.authors.length / 60000
          : 1 / existing.authors.length
        for (const a of existing.authors) {
          authorPoints.set(a, (authorPoints.get(a) ?? 0) - points);
        }
      }

      currentWR.set(tas.track, tas);
      
      const num_authors = tas.authors.length || 1
      const points = graphType === "TASes" ? 1 
        : graphType === "TimeSaved" ? tas.time_ms / num_authors / 60000
        : 1 / num_authors
      for (const a of tas.authors) {
        const currentPoints = (authorPoints.get(a) ?? 0) + points
        authorPoints.set(a, currentPoints);
        if (currentPoints > (authorMax.get(a) ?? 0)) {
          authorMax.set(a, currentPoints)
        }
      }

      dirty = true;
    }

    if (dirty && lastDay) {
      snapshot(lastDay);
    }

    return {
      series,
      authorMax,
    };
  }, [filteredTasRecords, authors, graphType]);

  const topAuthors = useMemo(() => {
    return [...authorMax.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, NUM_AUTHORS)
      .map(([author]) => author)
  }, [authorMax]);

  useEffect(() => {
    if (extraAuthor && topAuthors.includes(extraAuthor)) {
      setExtraAuthor("");
    }
  }, [topAuthors, extraAuthor]);

  const datePadding = Math.max((nowDate - START_DATE) * 0.03, 1000 * 60 * 60 * 24 * 30);
  const minDate = START_DATE - datePadding;
  const startYear = new Date(minDate).getFullYear();
  const endYear = new Date(nowDate).getFullYear();
  const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
  const y_step = graphType === "TimeSaved" ? 2 : 2

  const colour_map = useMemo(() => {
    return Object.fromEntries(
      topAuthors.map((a, i) => [a, COLOURS[i]])
    );
  }, [topAuthors]);

  const safeExtraAuthor = extraAuthor && topAuthors.includes(extraAuthor) ? "" : extraAuthor;
  const orderedAuthors = useMemo(() => {
    const base = [...topAuthors];

    if (safeExtraAuthor) {
      base.push(safeExtraAuthor);
    }

    return base.sort((a, b) => {
      if (a === hoverAuthor) return 1;
      if (b === hoverAuthor) return -1;
      return 0;
    });
  }, [topAuthors, safeExtraAuthor, hoverAuthor]);

  const extraAuthorOptions = useMemo(() => {
    return [...authorMax.entries()]
      .filter(([, max]) => max > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([author]) => author);
  }, [authorMax]);

  const maxTick = useMemo(() => {
    const activeAuthors = [...topAuthors, extraAuthor].filter(Boolean);
    const visible = activeAuthors.filter((a) => visibleAuthors[a]);

    if (visible.length === 0) return 10;

    let max = 8;
    for (const a of visible) {
      max = Math.max(max, authorMax.get(a) ?? 0);
    }
    return Math.ceil((max + 0.1) / Y_STEP) * Y_STEP;
  }, [topAuthors, extraAuthor, visibleAuthors, authorMax]);

  function xScale(date: string) {
    const t = new Date(date).getTime();
    return round(PADDING_X + ((t - minDate) / (nowDate - minDate || 1)) * (WIDTH - PADDING_X * 1.5));
  };

  function yScale(v: number) {
    return round(HEIGHT - PADDING_Y - (v / maxTick) * (HEIGHT - PADDING_Y * 2));
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 backdrop-blur-sm shadow-xl">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">
          WR History
        </h2>

        <select
          value={graphType}
          onChange={(e) => setGraphType(e.target.value as GraphType)}
          className="text-[13px] bg-slate-800 text-slate-300 border border-slate-700 rounded px-2 py-1 cursor-pointer"
        >
          <option value="TASes">TASes</option>
          <option value="Contributions">Contributions</option>
          <option value="TimeSaved">Time Saved</option>
        </select>
      </div>

      <svg width={WIDTH} height={HEIGHT}>

        {/* Axes */}
        <line x1={PADDING_X} y1={HEIGHT - PADDING_Y} x2={WIDTH - PADDING_X / 2} y2={HEIGHT - PADDING_Y} className="stroke-slate-600" />
        <line x1={PADDING_X} y1={PADDING_Y} x2={PADDING_X} y2={HEIGHT - PADDING_Y} className="stroke-slate-600" />

        {/* Y Ticks */}
        {Array.from(
          { length: Math.floor(maxTick / y_step) + 1 },
          (_, i) => i * y_step
        ).map((tick) => {
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

            if (d === "") {
              if (p.value === 0) continue;
              d += `M ${x} ${yScale(0)} V ${y}`;
            } else {
              if (p.value > 0) {
                d += ` H ${x}`
              };
              d += ` V ${y}`;
            }
          }

          return (
            <path
              key={author}
              d={d}
              fill="none"
              stroke={colour_map[author] ?? "#fff"}
              strokeWidth={ hoverAuthor === author ? 4 : extraAuthor === author ? 2 : 1.5 }
            />
          );
        })}

      </svg>
      
      {/* Legend */}
      <div className="mt-4 flex justify-center">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 justify-center max-w-[45%] text-[10px]">
          {topAuthors.map(author => {
            const colour = colour_map[author];
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

          <select
            value={extraAuthor}
            onMouseEnter={() => setHoverAuthor(extraAuthor)}
            onMouseLeave={() => setHoverAuthor("")}
            onChange={(e) => setExtraAuthor(e.target.value)}
            className="text-[10px] bg-slate-800 text-slate-300 border border-slate-700 rounded px-2 py-1 cursor-pointer"
          >
            <option value="">Add author...</option>

            {extraAuthorOptions
              .filter((a) => !topAuthors.includes(a))
              .map((author) => (
                <option key={author} value={author}>
                  {`${author} (Max: ${Math.round((authorMax.get(author) ?? 0) * 100) / 100})`}
                </option>
              ))}
          </select>

        </div>
      </div>
      
    </div>
  )
}
  