"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTasRecords } from "@/lib/TasRecords";
import { Author } from "@/lib/Authors";
import { buildBestRtaByTrack, useRtaRecords } from "@/lib/RtaRecords";
import { trackList, TasEntry, RtaEntry, gameList, environment, categoryFilters } from "@/lib/TrackList";
import { formatDate, formatTime } from "@/utils/formatting"

type RecordRow = {
  track: string;
  trackInfo: (typeof trackList)[string];
  tas: TasEntry | null;
  rta: RtaEntry | null;
  isCurrentBestTas?: boolean
};

function AuthorYearChart({ rows }: { rows: RecordRow[] }) {

  const yearlyCounts = useMemo(() => {
    const counts = new Map<number, number>();

    let minYear = Infinity;

    rows.forEach((row) => {
      if (!row.tas) return;

      const year = new Date(row.tas.date).getFullYear();
      minYear = Math.min(minYear, year);

      counts.set(year, (counts.get(year) || 0) + 1);
    });

    if (minYear === Infinity) return [];

    const result: [number, number][] = [];

    for (let year = minYear; year <= 2026; year++) {
      result.push([year, counts.get(year) || 0]);
    }

    return result;
  }, [rows]);

  const maxCount = Math.max(...yearlyCounts.map(([, c]) => c), 1);

  return (
    <div className="min-w-[220px] rounded-lg border border-slate-800 bg-slate-900/50 p-4">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">
        TASes per Year
      </h2>

      <div className="flex items-end gap-2 h-40">
        {yearlyCounts.map(([year, count]) => {
          const height = (count / maxCount) * 120;

          return (
            <div
              key={year}
              className="flex flex-col items-center gap-1"
            >
              <div className="text-xs text-slate-400">
                {count}
              </div>

              <div
                className="w-10 rounded-t bg-violet-400/70 hover:bg-violet-300 transition"
                style={{
                  height: `${height}px`,
                  minHeight: "3px",
                }}
                title={`${year}: ${count}`}
              />

              <div className="text-xs text-slate-500">
                {year}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AuthorGameChart({ rows }: { rows: RecordRow[] }) {

  const gameCounts = useMemo(() => {
    const counts = new Map<string, number>();

    rows.forEach((row) => {
      if (!row.tas) return;

      const game = row.tas.game;

      counts.set(game, (counts.get(game) || 0) + 1);
    });

    return gameList
      .map((game) => [
        game,
        counts.get(game) || 0,
      ] as const)
      .filter(([, count]) => count > 0);;
  }, [rows]);

  const maxCount = Math.max(
    ...gameCounts.map(([, c]) => c),
    1
  );

  return (
    <div className="min-w-[220px] rounded-lg border border-slate-800 bg-slate-900/50 p-4">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">
        TASes per Game
      </h2>

      <div className="flex items-end gap-2 h-40">
        {gameCounts.map(([game, count]) => {
          const height = (count / maxCount) * 120;

          return (
            <div
              key={game}
              className="flex flex-col items-center gap-1"
            >
              <div className="text-xs text-slate-400">
                {count}
              </div>

              <div
                className="w-10 rounded-t bg-cyan-400/70 hover:bg-cyan-300 transition"
                style={{
                  height: `${height}px`,
                  minHeight: "3px",
                }}
                title={`${game}: ${count}`}
              />

              <div className="text-xs text-slate-500">
                {game}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AuthorEnvironmentChart({ rows }: { rows: RecordRow[];}) {

  const environmentCounts = useMemo(() => {
    const counts = new Map<string, number>();

    rows.forEach((row) => {
      const env = row.trackInfo.environment;

      if (!env || env === "All") return;

      counts.set(env, (counts.get(env) || 0) + 1);
    });

    return environment
      .filter((env) => env !== "All")
      .map((env) => [
        env,
        counts.get(env) || 0,
      ] as const)
      .filter(([, count]) => count > 0);
  }, [rows]);

  const maxCount = Math.max(
    ...environmentCounts.map(([, c]) => c),
    1
  );

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">
        TASes per Environment
      </h2>

      <div className="flex h-40 items-end gap-2">
        {environmentCounts.map(([env, count]) => {
          const height = (count / maxCount) * 120;

          return (
            <div
              key={env}
              className="flex flex-col items-center gap-1"
            >
              <div className="text-xs text-slate-400">
                {count}
              </div>

              <div
                className="w-10 rounded-t bg-emerald-400/70 transition hover:bg-emerald-300"
                style={{
                  height: `${height}px`,
                  minHeight: "3px",
                }}
                title={`${env}: ${count}`}
              />

              <div className="text-xs text-slate-500">
                {env}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AuthorsPage() {

  const searchParams = useSearchParams();
  const [selectedAuthor, setSelectedAuthor] = useState<Author>("All Authors");
  const [hideBeaten, setHideBeaten] = useState(false);

  const { data: rtaRecords = [] } = useRtaRecords();
  const { data: tasRecords = [] } = useTasRecords();
  const bestRtaByTrack = useMemo(() => {
    if (!rtaRecords.length) return new Map();
    return buildBestRtaByTrack(rtaRecords)
  }, [rtaRecords])

  const authorOptions = useMemo(() => {
    const authorCount: Partial<Record<Author, number>> = {};

    tasRecords.forEach((tas) => {
      tas.authors.forEach((author) => {
        authorCount[author] = (authorCount[author] ?? 0) + 1;
      });
    });

     return Object.entries(authorCount)
      .sort((a, b) => b[1] - a[1])
      .map(([author, count]) => ({
        author,
        count,
      }));
  }, [tasRecords]);

  useEffect(() => {
    const authorFromUrl = searchParams.get("author");

    if (authorFromUrl) {
      setSelectedAuthor(authorFromUrl as Author);
      return;
    }

    if (authorOptions.length) {
      const random =
        authorOptions[
          Math.floor(Math.random() * authorOptions.length)
        ];

      setSelectedAuthor(random.author as Author);
    }
  }, [searchParams, authorOptions]);

  const rows = useMemo<RecordRow[]>(() => {
    if (!selectedAuthor) return [];

    const bestTasByTrackCategory = new Map<string, TasEntry>();

    tasRecords.forEach((entry) => {
      Object.entries(categoryFilters).forEach(
        ([displayCategory, allowedCategories]) => {
          
          if (!allowedCategories.has(entry.category as never)) {
            return;
          }

          const key = `${entry.track}|${displayCategory}`;
          const existing = bestTasByTrackCategory.get(key);

          if (
            !existing ||
            entry.time_ms < existing.time_ms ||
            (
              entry.time_ms === existing.time_ms &&
              new Date(entry.date).getTime() <
                new Date(existing.date).getTime()
            )
          ) {
            bestTasByTrackCategory.set(key, entry);
          }
        }
      );
    });

    // ALL TASes by selected author
    const selectedAuthorTasRecords = tasRecords.filter((tas) =>
      tas.authors.includes(selectedAuthor)
    );

    return selectedAuthorTasRecords
      .map((tas) => {
        const key = `${tas.track}|${tas.category}`;
        const currentBest = bestTasByTrackCategory.get(key);

        return {
          track: tas.track,
          trackInfo: trackList[tas.track],
          tas,
          rta: bestRtaByTrack.get(tas.track) ?? null,
          isCurrentBestTas: currentBest === tas,
        };
      })
      .sort((a, b) =>
        String(b.tas!.date).localeCompare(String(a.tas!.date))
      );
  }, [selectedAuthor]);

  const visibleRows = hideBeaten ? rows.filter((r) => r.isCurrentBestTas) : rows;

  return (
    <div className="mx-auto flex w-full flex-col items-center overflow-x-auto px-4 pt-20 pb-8 text-slate-100">
      
      <div className="mb-3 flex flex-row gap-2 px-4">
        <select
          value={selectedAuthor}
          onChange={(e) => setSelectedAuthor(e.target.value as Author)}
          className="rounded-md border border-slate-700 bg-slate-800 pl-2 pr-6 py-2 text-sm text-slate-100 focus:border-slate-500 focus:outline-none cursor-pointer"
        >
          {authorOptions.map(({ author, count }) => (
            <option
              key={author}
              value={author}
              className={author === selectedAuthor ? "italic text-red-400" : ""}
            >
              {author} ({count})
            </option>
          ))}
        </select>

        <button
          onClick={() => setHideBeaten((v) => !v)}
          className={`
            rounded-md px-4 py-1.5 text-sm font-semibold transition-all duration-150 border cursor-pointer
            ${hideBeaten ? "border-slate-600 bg-emerald-300/15 text-emerald-300 hover:bg-emerald-500/25"
                : "border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700"}`}
        >
          {hideBeaten ? "WRs only" : "All TASes"}
        </button>
      </div>

      {selectedAuthor && (
        <div className="flex items-start gap-4">
          <div className="overflow-x-auto">
            <table className="border-separate border border-slate-800 rounded-lg overflow-hidden text-center text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-slate-300 uppercase tracking-[0.18em]">
                  <th className="px-3 py-2 font-normal">
                    Date
                  </th>

                  <th className="px-3 py-2 font-normal">
                    Track
                  </th>

                  <th className="px-3 py-2 font-normal">
                    Game
                  </th>

                  <th className="px-3 py-2 font-normal">
                    Cat.
                  </th>

                  <th className="px-3 py-2 font-normal">
                    TAS
                  </th>

                  <th className="px-3 py-2 font-normal">
                    RTA
                  </th>

                  <th className="px-3 py-2 font-normal">
                    Saved
                  </th>
                </tr>
              </thead>

              <tbody>
                {visibleRows.map((row, index) => {
                  const isStunt = row.trackInfo.category === "Stunt"
                  const tasGame = row.tas!.game === "TMNF" && row.tas!.category === "No Cut" ? "TMNF No Cut" : row.tas!.game

                  return (
                    <tr
                      key={ index }
                      className={`
                        border-b border-slate-800
                        ${index % 2 === 0
                          ? "bg-violet-950/10"
                          : "bg-violet-950/20"}
                      `}
                    >
                      <td className="px-3 py-2">
                        { row.tas ? formatDate(row.tas.date) : "-" }
                      </td>

                      <td className="px-3 py-2">
                        {row.track}
                      </td>

                      <td className="px-3 py-2">
                        {tasGame}
                      </td>

                      <td className="px-3 py-2">
                        {row.tas!.category}
                      </td>

                      <td className="px-3 py-2">
                        { row.tas ? formatTime(row.tas.time_ms, isStunt) : "-"}
                      </td>

                      <td className="px-3 py-2">
                        { row.rta ? formatTime(row.rta.time_ms, isStunt) : "-" }
                      </td>

                      <td className="px-3 py-2 italic">
                        { row.rta && row.tas ? formatTime(row.tas.time_ms - row.rta.time_ms, isStunt, false, true) : "-" }
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col items-start gap-4">
            <div className="flex flex-row gap-4">
              <AuthorYearChart rows={visibleRows} />
              <AuthorGameChart rows={visibleRows} />
            </div>

            <AuthorEnvironmentChart rows={visibleRows} />
          </div>
        </div>
      )}
    </div>
  );
}
