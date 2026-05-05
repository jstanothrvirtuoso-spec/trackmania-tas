"use client";

import { GameBoard } from "../../lib/leaderboards";
import { tracksTMNF } from "../../lib/TrackLists";
import { useVisibleTables } from "../../lib/RtaContext";

const CATEGORY_ORDER = ["White", "Green", "Blue", "Red", "Black"] as const;

type CategoryName = (typeof CATEGORY_ORDER)[number];

type CategoryTotals = {
  category: CategoryName | "Total";
  tasSeconds: number;
  rtaSeconds: number;
  count: number;
};

function formatClockSeconds(seconds: number) {
  const sign = seconds < 0 ? "-" : "";
  const absSeconds = Math.abs(seconds);
  const minutes = Math.floor(absSeconds / 60);
  const remainder = (absSeconds % 60).toFixed(2).padStart(5, "0");
  return minutes > 0 ? `${sign}${minutes}:${remainder}` : `${sign}${absSeconds.toFixed(2)}`;
}

function formatPercentSavedSummary(diffSeconds: number, rtaSeconds: number) {
  if (rtaSeconds <= 0) return "-";
  const percent = (diffSeconds / rtaSeconds) * 100;
  return `${percent.toFixed(2)}%`;
}

export default function TimeSaved({ game }: { game: GameBoard }) {
  const { showTimeSaved } = useVisibleTables();

  if (!showTimeSaved) return null;
  const categoryTotals = CATEGORY_ORDER.map((category) => {
    const tracks = Object.entries(tracksTMNF).filter(([_, info]) => info.category === category);
    const tasSeconds = tracks.reduce((sum, [track, _]) => {
      const entry = game.entries.find(e => e.track === track);
      return sum + (entry ? parseClockValue(entry.time) : 0);
    }, 0);
    const rtaSeconds = tracks.reduce((sum, [track, _]) => {
      const entry = game.entries.find(e => e.track === track);
      return sum + (entry?.rtaWr ? parseClockValue(entry.rtaWr.record) : 0);
    }, 0);
    const count = tracks.length;
    return { category, tasSeconds, rtaSeconds, count };
  }).filter((categoryData) => categoryData.count > 0);

  const totalCategory: CategoryTotals = categoryTotals.reduce(
    (total, current) => ({
      category: "Total",
      tasSeconds: total.tasSeconds + current.tasSeconds,
      rtaSeconds: total.rtaSeconds + current.rtaSeconds,
      count: total.count + current.count,
    }),
    { category: "Total", tasSeconds: 0, rtaSeconds: 0, count: 0 }
  );

  function parseClockValue(value: string): number {
    const trimmed = value.trim();
    const negative = trimmed.startsWith("-");
    const positiveValue = negative ? trimmed.slice(1) : trimmed;
    const parts = positiveValue.split(":");

    let seconds = 0;
    if (parts.length === 1) {
      seconds = parseFloat(parts[0]) || 0;
    } else {
      const minutes = parseInt(parts[0], 10) || 0;
      seconds = minutes * 60 + (parseFloat(parts[1]) || 0);
    }

    return negative ? -seconds : seconds;
  }

  return (
    <aside className="px-4 pb-4">
      <div className="rounded-lg border border-slate-800 bg-slate-950/90 text-sm">
        {categoryTotals.length > 0 ? (
            <table className="table-fixed text-center text-sm">
              <thead className="bg-slate-900/90 text-slate-400">
                <tr>
                  <th rowSpan={2} className="px-2 py-2 align-middle font-normal uppercase tracking-[0.18em] text-center w-24">
                    Nadeo Set
                  </th>
                  <th colSpan={2} className="px-2 py-2 align-middle font-normal uppercase tracking-[0.18em] text-center">
                    Total Time
                  </th>
                  <th colSpan={2} className="px-2 py-2 align-middle font-normal uppercase tracking-[0.18em] text-center">
                    Time Saved
                  </th>
                </tr>
                <tr>
                  <th className="px-2 py-1.5 align-middle font-normal uppercase tracking-[0.18em] w-12">
                    TAS
                  </th>
                  <th className="px-2 py-1.5 align-middle font-normal uppercase tracking-[0.18em] w-12">
                    RTA
                  </th>
                  <th className="px-2 py-1.5 align-middle font-normal uppercase tracking-[0.18em] w-12">
                    Diff
                  </th>
                  <th className="px-2 py-1.5 align-middle font-normal uppercase tracking-[0.18em] w-10">
                    %
                  </th>
                </tr>
              </thead>
              <tbody>
                {categoryTotals.map((category) => {
                  const hasRta = category.rtaSeconds > 0;
                  const diffSeconds = hasRta ? category.rtaSeconds - category.tasSeconds : 0;
                  return (
                    <tr key={category.category} className="border-b border-slate-800 last:border-b-0">
                      <td className="px-2 py-2 text-center align-middle font-medium text-slate-200">{category.category}</td>
                      <td className="px-3 py-2 text-center align-middle">{formatClockSeconds(category.tasSeconds)}</td>
                      <td className="px-3 py-2 text-center align-middle">{hasRta ? formatClockSeconds(category.rtaSeconds) : "-"}</td>
                      <td className="px-3 py-2 text-center align-middle">{hasRta ? formatClockSeconds(diffSeconds) : "-"}</td>
                      <td className="px-3 py-2 text-center align-middle">{hasRta ? formatPercentSavedSummary(diffSeconds, category.rtaSeconds) : "-"}</td>
                    </tr>
                  );
                })}
                <tr className="border-t border-slate-800 font-semibold text-slate-100">
                  <td className="px-2 py-2 text-center align-middle">Total</td>
                  <td className="px-2 py-2 text-center align-middle">{formatClockSeconds(totalCategory.tasSeconds)}</td>
                  <td className="px-2 py-2 text-center align-middle">{totalCategory.rtaSeconds > 0 ? formatClockSeconds(totalCategory.rtaSeconds) : "-"}</td>
                  <td className="px-2 py-2 text-center align-middle">{totalCategory.rtaSeconds > 0 ? formatClockSeconds(totalCategory.rtaSeconds - totalCategory.tasSeconds) : "-"}</td>
                  <td className="px-2 py-2 text-center align-middle">{totalCategory.rtaSeconds > 0 ? formatPercentSavedSummary(totalCategory.rtaSeconds - totalCategory.tasSeconds, totalCategory.rtaSeconds) : "-"}</td>
                </tr>
              </tbody>
            </table>
          ) : (
            <div className="p-4 text-slate-400">Time saved summary is not available for this game.</div>
          )}
      </div>
    </aside>
  );
}