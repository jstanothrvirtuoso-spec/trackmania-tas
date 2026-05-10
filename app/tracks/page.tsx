"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { gameLinks, trackList, RtaEntry } from "@/lib/TrackLists";
import { TasRecords } from "@/lib/TasRecords";
import { RtaRecords } from "@/lib/RtaRecords";

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

  for (
    let t = tickMin;
    t <= tickMax + niceStep * 0.5;
    t += niceStep
  ) {
    ticks.push(Number(t.toFixed(6)));
  }

  return ticks;
}

function RecordProgressionGraph({
  points,
  useMinutes
}: {
  points: { date: string; time: number }[];
  useMinutes: Boolean;
}) {
  const width = 420;
  const height = 220;
  const xPadding = 30;
  const yPadding = 20;

  if (points.length === 0) return null;

  const firstDate = new Date(points[0].date).getTime();
  const nowDate = Date.now();

  const datePadding =
    Math.max((nowDate - firstDate) * 0.03, 1000 * 60 * 60 * 24 * 30);

  const minDate = firstDate - datePadding;
  const maxDate = nowDate;

  const rawMinTime = Math.min(...points.map((p) => p.time));
  const rawMaxTime = Math.max(...points.map((p) => p.time));

  const startYear = new Date(minDate).getFullYear();
  const endYear = new Date(maxDate).getFullYear();

  const paddingSeconds =
    Math.max((rawMaxTime - rawMinTime) * 0.08, 0.05);

  const minTime = rawMinTime - paddingSeconds;
  const maxTime = rawMaxTime + paddingSeconds;
  const yTicks = generateYAxisTicks(minTime, maxTime);

  const xScale = (date: string) => {
    const t = new Date(date).getTime();

    return (
      xPadding +
      ((t - minDate) / (maxDate - minDate || 1)) *
        (width - xPadding * 2)
    );
  };

  const chartMin = yTicks[0];
  const chartMax = yTicks[yTicks.length - 1];

  const yScale = (time: number) =>
    height -
    yPadding -
    ((time - chartMin) / (chartMax - chartMin || 1)) *
      (height - yPadding * 2);

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
    <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">
        Record Progression ({useMinutes ? "min" : "sec"})
      </h2>

      <svg width={width} height={height}>
        {/* axes */}
        <line
          x1={xPadding}
          y1={height - yPadding}
          x2={width - xPadding}
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

        {/* graph */}
        <path
          d={path}
          fill="none"
          className="stroke-violet-400"
          strokeWidth="2"
        />

        {/* points */}
        {points.map((p) => {
          const x = xScale(p.date);
          const y = yScale(p.time);

          return (
            <circle
              key={`${p.date}-${p.time}`}
              cx={x}
              cy={y}
              r={3}
              className="fill-violet-300"
            />
          );
        })}

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
                x2={width - xPadding}
                y2={y}
                className="stroke-slate-800"
              />

              <text
                x={xPadding - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-slate-500 text-[10px]"
              >
                {tick.toFixed(1)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function TracksPage() {

  const router = useRouter();
  const searchParams = useSearchParams();
  const gameOptions = gameLinks.map((g) => g.name);

  const [game, setGame] = useState("TMNF");
  const [track, setTrack] = useState("A01-Race");

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

  const trackInfo = useMemo(() => {
    return track ? trackList[track] : null;
  }, [track]);

  const rta = useMemo(() => {
    return RtaRecords
      .filter((r) => r.track === track)
      .reduce((best, current) => {
        if (!best) return current;

        return current.timeMs < best.timeMs
          ? current
          : best;
      }, null as RtaEntry | null);
  }, [track]);
  const useMinutes = rta ? rta.timeMs >= 60000 : false;

  const tasRows = useMemo(() => {
    if (!track) return [];

    return TasRecords
      .filter((t) => t.track === track)
      .sort((a, b) => a.timeMs - b.timeMs);
  }, [track]);

  const progression = useMemo(() => {
    const sorted = [...tasRows].sort(
      (a, b) =>
        new Date(a.date).getTime() -
        new Date(b.date).getTime()
    );

    const points: {
      date: string;
      time: number;
    }[] = [];

    let best = Infinity;

    sorted.forEach((tas) => {
      if (tas.timeMs < best) {
        best = tas.timeMs;

        points.push({
          date: tas.date,
          time: useMinutes ?  tas.timeMs / 60000 : tas.timeMs / 1000,
        });
      }
    });

    return points;
  }, [tasRows]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 text-slate-100">
      <h1 className="text-xl font-bold mb-6">Track Stats</h1>

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
      </div>

      <div className="mb-4 mt-6">
        <h1 className="text-2xl font-bold text-white">
          {track}
        </h1>

        <div className="mt-1 text-slate-400">
          {rta && `RTA: ${rta.record} by ${rta.player}`}
        </div>
      </div>

      {track && (

        <div className="flex items-start gap-8">

          <div className="mt-4 overflow-x-auto">
            <table className="border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-slate-300">
                  <th className="px-3 py-2 text-left">Record</th>
                  <th className="px-3 py-2 text-left">Time Saved</th>
                  <th className="px-3 py-2 text-left">Authors</th>
                  <th className="px-3 py-2 text-left">Date</th>
                  <th className="px-3 py-2 text-left">Category</th>
                </tr>
              </thead>

              <tbody>
                {tasRows.map((tas) => {
                  const timeSaved = rta ? tas.timeMs - rta.timeMs : 0;

                  return (
                    <tr
                      key={`${tas.record}-${tas.date}`}
                      className="border-b border-slate-800"
                    >
                      <td className="px-3 py-2 font-medium text-slate-100">
                        {tas.record}
                      </td>

                      <td className="px-3 py-2 italic">
                        {timeSaved > 0
                          ? `+${(timeSaved / 1000).toFixed(2)}`
                          : `${(timeSaved / 1000).toFixed(2)}`}
                      </td>

                      <td className="px-3 py-2">
                        {tas.authors.join(", ")}
                      </td>

                      <td className="px-3 py-2 text-slate-400">
                        {tas.date}
                      </td>
                      
                      <td className="px-3 py-2 text-slate-400">
                        {tas.category}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <RecordProgressionGraph 
            points={progression}
            useMinutes={useMinutes}
          />

        </div>
      )}

    </div>
  );
}