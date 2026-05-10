"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { TasRecords } from "@/lib/TasRecords";
import { RtaRecords } from "@/lib/RtaRecords";
import { trackList, TasEntry, RtaEntry } from "@/lib/TrackLists";

type RecordRow = {
  track: string;
  trackInfo: (typeof trackList)[string];
  tas: TasEntry | null;
  rta: RtaEntry | null;
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

export default function AuthorsPage() {

  const searchParams = useSearchParams();
  const initialAuthor = searchParams.get("author") ?? "";
  const [selectedAuthor, setSelectedAuthor] = useState(initialAuthor);

  const authorOptions = useMemo(() => {
    const set = new Set<string>();

    TasRecords.forEach((tas) => {
      tas.authors.forEach((author) => set.add(author));
    });

    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, []);

  const rows = useMemo<RecordRow[]>(() => {
    if (!selectedAuthor) return [];

    const bestTasByTrack = new Map<string, TasEntry>();
    const bestRtaByTrack = new Map<string, RtaEntry>();

    TasRecords
      .filter((tas) => tas.authors.includes(selectedAuthor))
      .forEach((entry) => {
        const existing = bestTasByTrack.get(entry.track);

        if (
          !existing ||
          entry.timeMs < existing.timeMs ||
          (
            entry.timeMs === existing.timeMs &&
            new Date(entry.date).getTime() <
              new Date(existing.date).getTime()
          )
        ) {
          bestTasByTrack.set(entry.track, entry);
        }
      });

    RtaRecords.forEach((entry) => {
      const existing = bestRtaByTrack.get(entry.track);

      if (
        !existing ||
        entry.timeMs < existing.timeMs ||
        (
          entry.timeMs === existing.timeMs &&
          new Date(entry.date).getTime() <
            new Date(existing.date).getTime()
        )
      ) {
        bestRtaByTrack.set(entry.track, entry);
      }
    });

    return Array.from(bestTasByTrack.values())
      .map((tas) => ({
        track: tas.track,
        trackInfo: trackList[tas.track],
        tas,
        rta: bestRtaByTrack.get(tas.track) ?? null,
      }))
      .sort((a, b) => a.tas!.timeMs - b.tas!.timeMs);
  }, [selectedAuthor]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 text-slate-100">
      <h1 className="text-2xl font-bold mb-6">
        Author Stats
      </h1>

      <div className="mb-6">
        <select
          value={selectedAuthor}
          onChange={(e) => setSelectedAuthor(e.target.value)}
          className="rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:border-slate-500 focus:outline-none"
        >
          <option value="">Select author</option>

          {authorOptions.map((author) => (
            <option key={author} value={author}>
              {author}
            </option>
          ))}
        </select>
      </div>

      {selectedAuthor && (
        <div className="flex items-start gap-8">
          <div className="overflow-x-auto">
            <table className="border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-slate-300 uppercase tracking-[0.18em]">
                  <th className="px-3 py-2 text-left font-normal">
                    Track
                  </th>

                  <th className="px-3 py-2 text-left font-normal">
                    Game
                  </th>

                  <th className="px-3 py-2 text-left font-normal">
                    TAS
                  </th>

                  <th className="px-3 py-2 text-left font-normal">
                    RTA
                  </th>

                  <th className="px-3 py-2 text-left font-normal">
                    Time Saved
                  </th>
                </tr>
              </thead>

              <tbody>
                {rows.map((row, index) => {
                  const timeSaved =
                    row.tas && row.rta
                      ? row.rta.timeMs - row.tas.timeMs
                      : 0;

                  return (
                    <tr
                      key={row.track}
                      className={`
                        border-b border-slate-800
                        ${index % 2 === 0
                          ? "bg-violet-950/10"
                          : "bg-violet-950/20"}
                      `}
                    >
                      <td className="px-3 py-2">
                        {row.track}
                      </td>

                      <td className="px-3 py-2">
                        {row.tas ? row.tas.game : "-"}
                      </td>

                      <td className="px-3 py-2">
                        {row.tas ? row.tas.record : "-"}
                      </td>

                      <td className="px-3 py-2">
                        {row.rta?.record ?? "-"}
                      </td>

                      <td className="px-3 py-2 italic">
                        {timeSaved > 0
                          ? `-${(timeSaved / 1000).toFixed(2)}`
                          : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <AuthorYearChart rows={rows} />
        </div>
      )}
    </div>
  );
}