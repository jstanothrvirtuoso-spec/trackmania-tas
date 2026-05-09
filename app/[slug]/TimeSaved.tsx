"use client";

import { useMemo } from "react";

import { RecordRow } from "../../lib/TrackLists";
import { TasRecords } from "../../lib/TasRecords";
import { RtaRecords } from "../../lib/RtaRecords";
import { useVisibleTables } from "../../lib/VisibleTablesContext";

type CategoryTotals = {
  category: string;
  tasMs: number;
  rtaMs: number;
};

function formatTime(timeMs: number, showSign: boolean = false): string {
  const sign = showSign ? timeMs > 0 ? "+" : "-" : "";
  const abs = Math.abs(timeMs);

  const minutes = Math.floor(abs / 60000);
  const seconds = Math.floor((abs % 60000) / 1000);
  const centiseconds = Math.floor((abs % 1000) / 10);

  return `${sign}${minutes}:${seconds
    .toString()
    .padStart(2, "0")}.${centiseconds
    .toString()
    .padStart(2, "0")}`;
}

function formatPercentSaved(diffMs: number, rtaMs: number) {
  if (rtaMs <= 0) return "-";
  return `${((diffMs / rtaMs) * 100).toFixed(2)}%`;
}

export default function TimeSaved({ currentRecords }: { currentRecords: RecordRow[] }) {
  const { showTimeSaved } = useVisibleTables();

  const categoryTotals = useMemo<CategoryTotals[]>(() => {
    return Object.values(
      currentRecords.reduce((acc, row) => {
        const category = row.trackInfo.category;

        if (!acc[category]) {
          acc[category] = {
            category,
            tasMs: 0,
            rtaMs: 0,
          };
        }

        if (row.tas && row.rta) {
          acc[category].tasMs += row.tas.timeMs;
        } else {
          acc[category].tasMs += row.rta?.timeMs || 0;
        }

        if (row.rta) {
          acc[category].rtaMs += row.rta.timeMs;
        }

        return acc;
      }, {} as Record<string, CategoryTotals>)
    );
  }, [currentRecords]);

  const total = categoryTotals.reduce<CategoryTotals>(
    (acc, curr) => ({
      category: "Total",
      tasMs: acc.tasMs + curr.tasMs,
      rtaMs: acc.rtaMs + curr.rtaMs,
    }),
    {
      category: "Total",
      tasMs: 0,
      rtaMs: 0,
    }
  );

  if (!showTimeSaved) return null;

  return (
    <aside className="px-4 pb-4">
      <div className="rounded-lg border border-slate-800 bg-slate-950/90 text-sm">
        <table className="table-fixed text-center divide-y text-sm">
          <thead className="bg-slate-900/90 text-slate-400">
            <tr>
              <th
                rowSpan={2}
                className="px-2 py-2 align-middle font-normal uppercase tracking-[0.18em] text-center"
              >
                  <div>Nadeo</div>
                  <div>Set</div>
              </th>

              <th className="border-l border-slate-800"></th>
              <th
                colSpan={2}
                className="px-2 py-2 border-b border-slate-800 align-middle font-normal uppercase tracking-[0.18em]"
              >
                Total Time
              </th>

              <th className="border-l border-slate-800"></th>
              <th
                colSpan={2}
                className="px-2 py-2 border-b border-slate-800 align-middle font-normal uppercase tracking-[0.18em]"
              >
                Time Saved
              </th>
            </tr>

            <tr>
              <th className="border-l border-slate-800"></th>
              <th className="px-2 py-1.5 font-normal uppercase tracking-[0.18em]">
                TAS
              </th>

              <th className="px-2 py-1.5 font-normal uppercase tracking-[0.18em]">
                RTA
              </th>

              <th className="border-l border-slate-800"></th>
              <th className="px-2 py-1.5 font-normal uppercase tracking-[0.18em]">
                Diff
              </th>

              <th className="px-2 py-1.5 font-normal uppercase tracking-[0.18em]">
                %
              </th>
            </tr>
          </thead>

          <tbody className="font-sans divide-y divide-slate-800">
            {categoryTotals.map((category) => {
              const hasRta = category.rtaMs > 0;
              const diffMs = category.rtaMs - category.tasMs;

              return (
                <tr
                  key={category.category}
                  className="
                    border-b border-slate-800 last:border-b-0
                    hover:bg-blue-900/20 transition-colors
                  "
                >
                  <td className="px-2 py-[4px] font-medium text-slate-200">
                    {category.category}
                  </td>

                  <td className="border-l border-slate-800"></td>
                  <td className="px-3 py-[4px]">
                    {formatTime(category.tasMs)}
                  </td>

                  <td className="px-3 py-[4px]">
                    {hasRta ? formatTime(category.rtaMs) : "-"}
                  </td>

                  <td className="border-l border-slate-800"></td>
                  <td className="px-3 py-[4px] italic">
                    {hasRta ? formatTime(category.tasMs - category.rtaMs, true) : "-"}
                  </td>

                  <td className="px-3 py-[4px]">
                    {hasRta
                      ? formatPercentSaved(diffMs, category.rtaMs)
                      : "-"}
                  </td>
                </tr>
              );
            })}

            <tr className="
              border-t-2 border-slate-600 font-semibold text-slate-100
              hover:bg-blue-900/20 transition-colors
            ">
              <td className="px-2 py-[4px]">Total</td>

              <td className="border-l border-slate-800"></td>
              <td className="px-2 py-[4px]">
                {formatTime(total.tasMs)}
              </td>

              <td className="px-2 py-[4px]">
                {total.rtaMs > 0
                  ? formatTime(total.rtaMs)
                  : "-"}
              </td>

              <td className="border-l border-slate-800"></td>
              <td className="px-2 py-[4px] italic">
                {total.rtaMs > 0
                  ? formatTime(total.tasMs - total.rtaMs, true)
                  : "-"}
              </td>

              <td className="px-2 py-[4px]">
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