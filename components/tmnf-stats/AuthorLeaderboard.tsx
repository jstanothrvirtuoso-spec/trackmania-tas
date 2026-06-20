
import { useState, useMemo } from "react";
import { OVERRIDE } from "@/utils/constants";
import { RtaEntry, TasEntry } from "@/utils/typing";
import { generateGraphColours } from "@/utils/common";
import { TRACKS } from "@/lib/TrackList";
import { DropSelect } from "@/components/DropSelect";

type GraphType = "TASes" | "Contributions" | "TimeSaved"

function round(n: number) { return Math.round(n * 1000) / 1000 }

const START_DATE = new Date("2021-01-01").getTime();
const WIDTH = 720;
const HEIGHT = 405;
const PADDING_X = 35;
const PADDING_T = 10;
const PADDING_B = 35;
const NUM_AUTHORS = 6;
const COLOURS = generateGraphColours(NUM_AUTHORS);
const GRAPH_TYPES = {"TASes": "TASes", "Contributions": "Contributions", "TimeSaved": "Time Saved (sec)"}

export default function AuthorLeaderboard( { bestRtaByTrack, filteredTasRecords, authors } : { 
  bestRtaByTrack: Map<string, RtaEntry>,
  filteredTasRecords: TasEntry[],
  authors: string[],
} ) {

  const [visibleAuthors, setVisibleAuthors] = useState<Record<string, boolean>>(() => (
    Object.fromEntries(authors.map((a) => [a, true]))
  ));
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [extraAuthorRaw, setExtraAuthorRaw] = useState<string>("");
  const [hoverAuthor, setHoverAuthor] = useState<string>("");
  const [graphType, setGraphType] = useState<GraphType>("TASes");
  const [nowDate] = useState(() => Date.now());

  const { series, authorMax } = useMemo(() => {
    const currentWR = new Map<string, TasEntry>();
    const authorPoints = new Map<string, number>();
    const authorMax = new Map<string, number>();

    const series: Record<string, { date: string; value: number }[]> =
      Object.fromEntries(authors.map(author => [author, []]));
    
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
      if (tas.game !== "TMNF" && tas.game !== "TMNF No Cut") continue;
      if (new Date(tas.date).getTime() < START_DATE) continue;

      const day = tas.date.slice(0, 10);

      if (lastDay && day !== lastDay && dirty) {
        snapshot(lastDay);
        dirty = false;
      }

      lastDay = day;

      const track = TRACKS[tas.track].baseTrack ?? tas.track

      const existing = currentWR.get(track);
      const rta = bestRtaByTrack.get(tas.track)!;

      if (existing && existing.time_ms <= tas.time_ms) continue;
      if (graphType === "TimeSaved" && !rta) continue;

      if (existing && existing.authors.length > 0) {

        let pointsOff: number;
        if (graphType === "TASes") {
          pointsOff = 1;
        } else if (graphType === "TimeSaved") {
          pointsOff = (OVERRIDE[existing.track]?.[existing.time_ms] ?? Math.max(0, (rta.time_ms - existing.time_ms) / 1000)) / existing.authors.length;
        } else {
          pointsOff = 1 / existing.authors.length;
        }

        for (const a of existing.authors) {
          authorPoints.set(a, (authorPoints.get(a) ?? 0) - pointsOff);
        }
      }

      currentWR.set(track, tas);
      
      let pointsOn: number;
      if (graphType === "TASes") {
        pointsOn = 1;
      } else if (graphType === "TimeSaved") {
        pointsOn = (OVERRIDE[tas.track]?.[tas.time_ms] ?? Math.max(0, (rta.time_ms - tas.time_ms) / 1000)) / tas.authors.length;
      } else {
        pointsOn = 1 / tas.authors.length;
      }

      for (const a of tas.authors) {
        const currentPoints = (authorPoints.get(a) ?? 0) + pointsOn
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
  }, [filteredTasRecords, authors, bestRtaByTrack, graphType]);

  console.log(series["Kimura"])

  const topAuthors = useMemo(() => {
    return [...authorMax.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, NUM_AUTHORS)
      .map(([author]) => author)
  }, [authorMax]);

  const extraAuthor = useMemo(() => {
    if (!extraAuthorRaw) return "";
    return topAuthors.includes(extraAuthorRaw) ? "" : extraAuthorRaw;
  }, [extraAuthorRaw, topAuthors]);

  const startYear = new Date(START_DATE).getFullYear();
  const endYear = new Date(nowDate).getFullYear();
  const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
  const xDomainStart = selectedYear ? new Date(selectedYear, 0, 1).getTime() : START_DATE;
  const xDomainEnd = selectedYear ? new Date(selectedYear + 1, 0, 1).getTime() : nowDate;

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

  const { maxTick, yStep } = useMemo(() => {
    const activeAuthors = [...topAuthors, extraAuthor].filter(Boolean);
    const visible = activeAuthors.filter((a) => visibleAuthors[a]);

    if (visible.length === 0) return { maxTick: 10, yStep: 2 };

    let max = 2;
    for (const a of visible) {
      max = Math.max(max, authorMax.get(a) ?? 0);
    }

    const yStep = max > 100 ? 30 : max > 30 ? 10 : max > 10 ? 2 : 1;
    const maxTick = Math.ceil((max + 0.1) / yStep) * yStep

    return { maxTick, yStep };
  }, [topAuthors, extraAuthor, visibleAuthors, authorMax]);

  function xScale(date: string) {
    const t = new Date(date).getTime();
    return round(PADDING_X + ((t - xDomainStart) / (xDomainEnd - xDomainStart || 1)) * (WIDTH - PADDING_X * 1.5));
  }

  function yScale(v: number) {
    return round(HEIGHT - PADDING_B - (v / maxTick) * (HEIGHT - PADDING_B - PADDING_T));
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 w-full flex-1 shadow-[0_5px_20px_rgba(0,0,0,0.6)]">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">
          WR History
        </h2>

        <DropSelect
          initialValue={graphType}
          options={Object.entries(GRAPH_TYPES).map(([value, label]) => ({
            value: value,
            label: label,
          }))}
          onChange={(value) => setGraphType(value as GraphType)}
        />
      </div>

      <div className="w-full aspect-[16/9]">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-full">

          {/* Axes */}
          <line x1={PADDING_X} y1={HEIGHT - PADDING_B} x2={WIDTH - PADDING_X / 2} y2={HEIGHT - PADDING_B} className="stroke-slate-600" />
          <line x1={PADDING_X} y1={PADDING_T} x2={PADDING_X} y2={HEIGHT - PADDING_B} className="stroke-slate-600" />

          {/* Y Ticks */}
          {Array.from({ length: Math.floor(maxTick / yStep) + 1 }, (_, i) => i * yStep).map((tick) => {
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
                  className="fill-slate-400 text-[13px]"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* X Ticks */}
          {!selectedYear && years.map((year) => {
            const x = xScale(`${year}-01-01`);

            return (
              <g
                key={year}
                onClick={() => setSelectedYear(year)}
                className="cursor-pointer"
              >
                <line
                  x1={x}
                  y1={PADDING_T}
                  x2={x}
                  y2={HEIGHT - PADDING_B}
                  className="stroke-slate-800"
                />

                <text
                  x={x}
                  y={HEIGHT - PADDING_B + 16}
                  textAnchor="middle"
                  className="fill-emerald-500 text-[12px] hover:fill-emerald-300"
                >
                  {year}
                </text>
              </g>
            );
          })}
          {selectedYear && Array.from({ length: 12 }, (_, month) => {
            const date = new Date(selectedYear, month, 1);
            const x = xScale(date.toISOString());

            return (
              <g key={month}>
                <line
                  x1={x}
                  y1={PADDING_T}
                  x2={x}
                  y2={HEIGHT - PADDING_B}
                  className="stroke-slate-800"
                />

                <text
                  x={x}
                  y={HEIGHT - PADDING_B + 16}
                  textAnchor="middle"
                  className="fill-slate-500 text-[12px]"
                >
                  {date.toLocaleString("en-GB", { month: "short" })}
                </text>
              </g>
            );
          })}
          {selectedYear && (
            <text
              x={WIDTH / 2}
              y={HEIGHT}
              textAnchor="middle"
              className="fill-emerald-500 text-[14px] cursor-pointer hover:fill-emerald-300"
              onClick={() => setSelectedYear(null)}
            >
              {selectedYear}
            </text>
          )}

          {/* Lines */}
          {orderedAuthors.map(author => {
            if (!visibleAuthors[author]) return null;
            const points = selectedYear 
              ? series[author].filter(p => new Date(p.date).getFullYear() === selectedYear)
              : series[author];
            
            if (!points?.length) return null;

            let d = "";

            for (let i = 0; i < points.length; i++) {
              const p = points[i];
              const x = xScale(p.date);
              const y = yScale(p.value);

              if (d === "") {
                if (p.value === 0) continue;
                if (selectedYear && selectedYear !== 2021 && x !== PADDING_X && i === 0) {
                  d += `M ${PADDING_X} ${y}`;
                } else {
                  d += `M ${x} ${HEIGHT - PADDING_B} V ${y}`;
                }
              } else {
                d += ` H ${x} V ${y}`
              }
            }
            if (selectedYear === years[years.length - 1]) {
              d += ` H ${xScale(new Date(nowDate).toDateString())}`
            } else {
              d += ` H ${WIDTH - PADDING_X / 2}`
            }

            if (author === "Virtuoso") {
              console.log(d)
              console.log(points)
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
      </div>

      {/* Legend */}
      <div className="mt-2 flex justify-center">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 justify-center max-w-[80%] md:max-w-[50%]">
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
                  className="h-1 w-1 rounded-full sm:h-1.5 sm:w-1.5"
                  style={{ backgroundColor: colour }}
                />

                <span
                  className={`text-[8px] sm:text-[10px] ${active ? "text-slate-300" : "text-slate-600"}`}
                >
                  {author}
                </span>
              </button>
            );
          })}

          {/* <DropSelect
            initialValue={extraAuthor}
            options={extraAuthorOptions
              .filter((a) => !topAuthors.includes(a))
              .map((author) => ({
                value: author,
                label: `${author} (Max: ${Math.round((authorMax.get(author) ?? 0) * 100) / 100})`,
              }))
            }
            onChange={(value) => setExtraAuthorRaw(value)}
            defaultOption={{ value: "", label: "Add author..." }}
          /> */}
          <select
            value={extraAuthor}
            onMouseEnter={() => setHoverAuthor(extraAuthor)}
            onMouseLeave={() => setHoverAuthor("")}
            onChange={(e) => setExtraAuthorRaw(e.target.value)}
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
  