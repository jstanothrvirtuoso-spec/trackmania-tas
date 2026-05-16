"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { gameLinks, trackList, categoryFilters, Category } from "@/lib/TrackLists";
import { useTasRecords } from "@/lib/TasRecords";
import { useRtaRecords, buildBestRtaByTrack } from "@/lib/RtaRecords";
import { formatDate, formatTime } from "@/utils/formatting"

type GraphCategory = "Open" | "NOseboost" | "No Uber" | "WR Route" | "No Cut" | "RTA"

const categoryColours: Record<string, [string, string, string]> = {
  "Open": ["#c271f8", "bg-[#c271f8]/20", "bg-[#c271f8]/25"],
  "NOseboost": ["#60a5fa", "bg-[#60a5fa]/20", "bg-[#60a5fa]/25"],
  "No Uber": ["#34d399", "bg-[#34d399]/10", "bg-[#34d399]/15"],
  "WR Route": ["#ffc637", "bg-[#ffc637]/10", "bg-[#ffc637]/15"],
  "No Cut": ["#4d59ff", "bg-[#4d59ff]/10", "bg-[#4d59ff]/15"],
  "RTA": ["#fa5252", "bg-[#fa5252]/10", "bg-[#fa5252]/15"],
} as const;

const round = (n: number) => Math.round(n * 1000) / 1000;

function generateYAxisTicks(min: number, max: number) {
  const range = max - min;

  // target ~7 ticks
  const roughStep = range / 7;

  // round to sensible step sizes
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

function RecordProgressionGraph({
  progression,
  useMinutes,
  visibleCategories
}: {
  progression: Record<GraphCategory, { date: string; time: number }[]>;
  useMinutes: boolean;
  visibleCategories: Record<string, boolean>;
}) {
  const allPoints = Object.values(progression).flat();

  if (allPoints.length === 0) return null;

  const width = 600;
  const height = 320;
  const xPadding = 35;
  const yPadding = 20;

  const visiblePoints = Object.entries(progression)
    .filter(([category]) => visibleCategories[category])
    .flatMap(([, points]) => points);
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
  const paddingSeconds = Math.max((rawMaxTime - rawMinTime) * 0.08, 0.025);
  const minTime = rawMinTime - paddingSeconds;
  const maxTime = rawMaxTime + paddingSeconds;
  const yTicks = generateYAxisTicks(minTime, maxTime);
  const yTickDecimals = maxTime - minTime <= 0.5 ? 2 : maxTime - minTime <= 0.5 ? 2 : maxTime - minTime <= 5 ? 1 : 0

  const xScale = (date: string) => {
    const t = new Date(date).getTime();
    return round(xPadding + ((t - minDate) / (maxDate - minDate || 1)) * (width - xPadding * 1.5));
  };

  const chartMin = yTicks[0];
  const chartMax = yTicks[yTicks.length - 1];

  const yScale = (time: number) => round(height - yPadding - ((time - chartMin) / (chartMax - chartMin || 1)) * (height - yPadding * 2));

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">
        Record Progression ({useMinutes ? "min" : "sec"})
      </h2>

      <svg width={width} height={height}>
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

        {/* year labels */}
        {Array.from(
          { length: endYear - startYear + 1 },
          (_, i) => startYear + i
        ).map((year) => {
          const x = xScale(`${year}-01-01`);

          // skip labels outside plotting region
          if (x < xPadding || x > width - xPadding) {
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

        {/* time labels */}
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

        {/* graph */}
        {Object.entries(progression).map(([category, points]) => {
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

        {/* points */}
        {Object.entries(progression).flatMap(([category, points]) => {
          if (!visibleCategories[category]) return [];

          return points.map((p) => {
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
        {Object.entries(categoryColours).map(([category, colour]) => {
          const active = visibleCategories[category];

          return (
            <div
              key={category}
              className={`flex items-center gap-2 transition-opacity ${
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
            </div>
          );
        })}
      </div>

    </div>
  );
}

export default function TracksPage() {

  const router = useRouter();
  const searchParams = useSearchParams();
  const gameOptions = gameLinks.map((g) => g.name);

  const { data: rtaRecords = [] } = useRtaRecords();
  const { data: tasRecords = [] } = useTasRecords();
  const bestRtaByTrack = useMemo(() => {
    if (!rtaRecords.length) return new Map();
    return buildBestRtaByTrack(rtaRecords)
  }, [rtaRecords])

  const [game, setGame] = useState("TMNF");
  const [track, setTrack] = useState("A01-Race");
  const [isGraphDropdownOpen, setIsGraphDropdownOpen] = useState(false);
  const graphDropdownRef = useRef<HTMLDivElement>(null);
  const [visibleCategories, setVisibleCategories] = useState({
    "Open": true,
    "NOseboost": true,
    "No Uber": true,
    "WR Route": true,
    "No Cut": true,
    "RTA": true,
  });

  // Default from URL or fallback
  useEffect(() => {
    const g = searchParams.get("game");
    const t = searchParams.get("track");

    if (g) setGame(g);
    if (t) setTrack(t);
  }, [searchParams]);

  const trackOptions = useMemo(() => {
    return Object.entries(trackList)
      .filter(([, t]) => t.game === game)
      .map(([name]) => name);
  }, [game]);

  useEffect(() => {
    // ensure default exists when switching game
    if (!trackOptions.includes(track)) {
      setTrack(trackOptions[0] ?? "");
    }
  }, [game, trackOptions]);

  const updateURL = (g: string, t: string) => {
    router.replace(`/tracks?game=${encodeURIComponent(g)}&track=${encodeURIComponent(t)}`);
  };

  const rta = bestRtaByTrack.get(track)
  const isStunt = track ? trackList[track].category === "Stunt" : false
  const isTM2 = track ? trackList[track].game === "TM2" : false
  const useMinutes = rta ? rta.time_ms >= 120000 : false;

  const tasRows = useMemo(() => {
    if (!track) return [];

    return tasRecords
      .filter((t) => t.track === track)
      .sort((a, b) => a.time_ms - b.time_ms);
  }, [track]);

  const progression = useMemo(() => {
    const sorted = [...tasRows].sort(
      (a, b) =>
        new Date(a.date).getTime() -
        new Date(b.date).getTime()
    );

    const buildPoints = (category: Category) => {
      const allowedCategories = categoryFilters[category]
      const points: {
        date: string;
        time: number;
      }[] = [];

      let best = Infinity;

      sorted
        .filter((tas) => allowedCategories.has(tas.category))
        .forEach((tas) => {
          if (tas.time_ms < best) {
            best = tas.time_ms;

            points.push({
              date: tas.date,
              time: useMinutes
                ? tas.time_ms / 60000
                : tas.time_ms / 1000,
            });
          }
        });

      return points;
    };

    return {
      "Open": buildPoints("Open"),
      "NOseboost": buildPoints("NOseboost"),
      "No Uber": buildPoints("No Uber"),
      "WR Route": buildPoints("WR Route"),
      "No Cut": buildPoints("No Cut"),
      "RTA": rta? [{ date: rta.date, time: useMinutes ? rta.time_ms / 60000 : rta.time_ms / 1000 }]: [],
    };
  }, [tasRows, useMinutes]);

  return (
    <div className="mx-auto flex w-full flex-col items-center overflow-x-auto px-4 py-8 text-slate-100">
      <div className="flex flex-row items-start gap-4">
        <select
          value={game}
          onChange={(e) => {
            const newGame = e.target.value;
            setGame(newGame);
            setTrack("");
            updateURL(newGame, "");
          }}
          className="w-40 rounded-md bg-slate-800 px-3 py-2"
        >
          {gameOptions.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>

        <select
          value={track}
          onChange={(e) => {
            const newTrack = e.target.value;
            setTrack(newTrack);
            updateURL(game, newTrack);
          }}
          className="min-w-60 rounded-md bg-slate-800 px-3 py-2"
        >
          {trackOptions.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <div className="relative" ref={graphDropdownRef}>
          <button
            onClick={() => setIsGraphDropdownOpen(!isGraphDropdownOpen)}
            className="rounded-md bg-slate-800 px-2 py-[5px] transition hover:bg-slate-700"
          >
            <span className="flex items-center gap-5">
              Graph Categories
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </span>
          </button>

          {isGraphDropdownOpen && (
            <div className="absolute top-full mt-1 z-50 rounded-md border border-slate-700 bg-slate-800 shadow-lg">
              <div className="p-2">
                {Object.entries(visibleCategories).map(
                  ([category, checked]) => (
                    <label
                      key={category}
                      className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm text-slate-100 hover:bg-slate-700"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) =>
                          setVisibleCategories((prev) => ({
                            ...prev,
                            [category]: e.target.checked,
                          }))
                        }
                      />

                      {category}
                    </label>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mb-4 mt-6">
        <h1 className="text-2xl font-bold text-white">
          {track}
        </h1>

        <div className="mt-1 text-slate-400">
          {rta && `RTA: ${formatTime(rta.time_ms, false)} by ${rta.player} (${formatDate(rta.date)})`}
        </div>
      </div>

      {track && (

        <div className="flex items-start gap-5">

          <div className="overflow-x-auto">
            <table className="border-collapsed text-sm rounded-lg">
              <thead>
                <tr className="border-x border-slate-800 text-slate-300 bg-slate-900/90 ">
                  <th className="px-3 py-2 text-center whitespace-nowrap">Record</th>
                  <th className="px-3 py-2 text-center whitespace-nowrap">Time Saved</th>
                  <th className="px-3 py-2 text-center whitespace-nowrap">Authors</th>
                  <th className="px-3 py-2 text-center whitespace-nowrap">Date</th>
                  <th className="px-3 py-2 text-center whitespace-nowrap">Category</th>
                </tr>
              </thead>

              <tbody>
                {tasRows.map((tas, i) => {
                  
                  const colourIndex = i % 2 == 0 ? 2 : 1
                  const rowColour = categoryColours[tas.category]?.[colourIndex] ?? "bg-slate-500/10"
                  
                  return (
                    <tr
                      key={`${tas.time_ms}-${tas.date}`}
                      className={`border-x border-slate-800 transition-colors hover:bg-emerald-400/20 ${rowColour}`}
                    >
                      <td className="px-3 py-1.5 text-center font-medium text-slate-200">
                        { formatTime(tas.time_ms, isStunt, isTM2) }
                      </td>

                      <td className="px-3 py-1.5 text-center italic font-bold text-slate-200">
                        { rta ? formatTime(tas.time_ms - rta.time_ms, isStunt, isTM2, true) : "-" }
                      </td>

                      <td className="px-3 py-1.5 text-center text-slate-200 max-w-[420px]">
                        {tas.authors.join(", ")}
                      </td>

                      <td className="px-3 py-1.5 text-center text-slate-300 whitespace-nowrap">
                        { formatDate(tas.date) }
                      </td>
                      
                      <td className="px-3 py-1.5 text-center text-slate-300 whitespace-nowrap">
                        {tas.category}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <RecordProgressionGraph 
            progression={progression}
            useMinutes={useMinutes}
            visibleCategories={visibleCategories}
          />

        </div>
      )}

    </div>
  );
}