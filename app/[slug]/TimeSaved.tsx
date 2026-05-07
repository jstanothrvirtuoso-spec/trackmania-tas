"use client";

import { useMemo } from "react";

import { gameSets, Game } from "../../lib/TrackLists";
import { trackList } from "../../lib/TrackLists";
import { TasRecords } from "../../lib/TasRecords";
import { RtaRecords } from "../../lib/RtaRecords";
import { useVisibleTables } from "../../lib/VisibleTablesContext";

export function formatClock(timeMs: number): string {
  const minutes = Math.floor(timeMs / 60000);
  const seconds = Math.floor((timeMs % 60000) / 1000);
  const centiseconds = Math.floor((timeMs % 1000) / 10);

  if (minutes > 0) {
    return `${minutes}:${seconds
      .toString()
      .padStart(2, "0")}.${centiseconds
      .toString()
      .padStart(2, "0")}`;
  }

  return `${seconds}.${centiseconds
    .toString()
    .padStart(2, "0")}`;
}

export function formatTimeDifference(diffMs: number): string {
  const sign = diffMs > 0 ? "+" : "-";
  const abs = Math.abs(diffMs);

  const minutes = Math.floor(abs / 60000);
  const seconds = Math.floor((abs % 60000) / 1000);
  const centiseconds = Math.floor((abs % 1000) / 10);

  if (minutes > 0) {
    return `${sign}${minutes}:${seconds
      .toString()
      .padStart(2, "0")}.${centiseconds
      .toString()
      .padStart(2, "0")}`;
  }

  return `${sign}${seconds}.${centiseconds
    .toString()
    .padStart(2, "0")}`;
}

type CategoryTotals = {
  category: string;
  tasMs: number;
  rtaMs: number;
  count: number;
};

function formatPercentSaved(diffMs: number, rtaMs: number) {
  if (rtaMs <= 0) return "-";
  return `${((diffMs / rtaMs) * 100).toFixed(2)}%`;
}

export default function TimeSaved({ game }: { game: Game }) {
  const { showTimeSaved } = useVisibleTables();

  const categoryTotals = useMemo(() => {
    const bestTasByTrack = new Map<string, number>();
    const bestRtaByTrack = new Map<string, number>();

    Object.values(TasRecords)
      .filter((e) => e.game === game)
      .forEach((entry) => {
        const existing = bestTasByTrack.get(entry.track);

        if (existing === undefined || entry.timeMs < existing) {
          bestTasByTrack.set(entry.track, entry.timeMs);
        }
      });

    Object.values(RtaRecords)
      .filter((e) => e.game === game)
      .forEach((entry) => {
        const existing = bestRtaByTrack.get(entry.track);

        if (existing === undefined || entry.timeMs < existing) {
          bestRtaByTrack.set(entry.track, entry.timeMs);
        }
      });

    return gameSets[game]
      .map((category): CategoryTotals => {
        const tracks = Object.entries(trackList).filter(
          ([, info]) =>
            info.game === game &&
            info.category === category
        );

        let tasMs = 0;
        let rtaMs = 0;

        for (const [track] of tracks) {
          tasMs += bestTasByTrack.get(track) ?? 0;
          rtaMs += bestRtaByTrack.get(track) ?? 0;
        }

        return {
          category,
          tasMs,
          rtaMs,
          count: tracks.length,
        };
      })
      .filter((c) => c.count > 0);
  }, [game]);

  const total = categoryTotals.reduce<CategoryTotals>(
    (acc, curr) => ({
      category: "Total",
      tasMs: acc.tasMs + curr.tasMs,
      rtaMs: acc.rtaMs + curr.rtaMs,
      count: acc.count + curr.count,
    }),
    {
      category: "Total",
      tasMs: 0,
      rtaMs: 0,
      count: 0,
    }
  );

  if (!showTimeSaved) return null;

  return (
    <aside className="px-4 pb-4">
      <div className="rounded-lg border border-slate-800 bg-slate-950/90 text-sm">
        <table className="table-fixed text-center text-sm">
          <thead className="bg-slate-900/90 text-slate-400">
            <tr>
              <th
                rowSpan={2}
                className="px-2 py-2 align-middle font-normal uppercase tracking-[0.18em] text-center w-24"
              >
                Nadeo Set
              </th>

              <th
                colSpan={2}
                className="px-2 py-2 align-middle font-normal uppercase tracking-[0.18em]"
              >
                Total Time
              </th>

              <th
                colSpan={2}
                className="px-2 py-2 align-middle font-normal uppercase tracking-[0.18em]"
              >
                Time Saved
              </th>
            </tr>

            <tr>
              <th className="px-2 py-1.5 font-normal uppercase tracking-[0.18em]">
                TAS
              </th>

              <th className="px-2 py-1.5 font-normal uppercase tracking-[0.18em]">
                RTA
              </th>

              <th className="px-2 py-1.5 font-normal uppercase tracking-[0.18em]">
                Diff
              </th>

              <th className="px-2 py-1.5 font-normal uppercase tracking-[0.18em]">
                %
              </th>
            </tr>
          </thead>

          <tbody>
            {categoryTotals.map((category) => {
              const hasRta = category.rtaMs > 0;
              const diffMs = category.rtaMs - category.tasMs;

              return (
                <tr
                  key={category.category}
                  className="border-b border-slate-800 last:border-b-0"
                >
                  <td className="px-2 py-2 font-medium text-slate-200">
                    {category.category}
                  </td>

                  <td className="px-3 py-2">
                    {formatClock(category.tasMs)}
                  </td>

                  <td className="px-3 py-2">
                    {hasRta ? formatClock(category.rtaMs) : "-"}
                  </td>

                  <td className="px-3 py-2">
                    {hasRta ? formatTimeDifference(diffMs) : "-"}
                  </td>

                  <td className="px-3 py-2">
                    {hasRta
                      ? formatPercentSaved(diffMs, category.rtaMs)
                      : "-"}
                  </td>
                </tr>
              );
            })}

            <tr className="border-t border-slate-800 font-semibold text-slate-100">
              <td className="px-2 py-2">Total</td>

              <td className="px-2 py-2">
                {formatClock(total.tasMs)}
              </td>

              <td className="px-2 py-2">
                {total.rtaMs > 0
                  ? formatClock(total.rtaMs)
                  : "-"}
              </td>

              <td className="px-2 py-2">
                {total.rtaMs > 0
                  ? formatTimeDifference(total.rtaMs - total.tasMs)
                  : "-"}
              </td>

              <td className="px-2 py-2">
                {total.rtaMs > 0
                  ? formatPercentSaved(
                      total.rtaMs - total.tasMs,
                      total.rtaMs
                    )
                  : "-"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </aside>
  );
}