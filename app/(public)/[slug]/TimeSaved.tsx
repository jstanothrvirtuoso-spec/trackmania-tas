"use client";

import { useMemo } from "react";
import { RecordRow } from "@/lib/TrackList";
import { formatTime, formatPercentSaved } from "@/utils/formatting";

type CategoryTotals = {
  category: string;
  tasMs: number;
  rtaMs: number;
};

export default function TimeSaved({ currentRecords }: { currentRecords: RecordRow[] }) {

  const categoryTotals = useMemo<CategoryTotals[]>(() => {
    return Object.values(
      currentRecords.reduce((acc, row) => {
        if (!row.rta) return acc;
        const category = row.trackInfo.category;

        if (!acc[category]) {
          acc[category] = {
            category,
            tasMs: 0,
            rtaMs: 0,
          };
        }
        
        acc[category].tasMs += row.tas ? row.tas.time_ms : row.rta.time_ms;
        acc[category].rtaMs += row.rta.time_ms;

        return acc;
      }, {} as Record<string, CategoryTotals>)
    );
  }, [currentRecords]);
  
  const total = categoryTotals
    .filter(category => category.category !== "Stunt")
    .reduce<CategoryTotals>(
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

  return (
    <aside className="pl-5 pb-4">
      <div className="rounded-lg border border-slate-800 text-sm">
        <table className="table-fixed text-center divide-y text-sm">
          <thead className="bg-slate-900/90 text-slate-400">
            <tr>
              <th
                rowSpan={2}
                className="px-4 py-1 align-middle font-normal uppercase tracking-[0.18em] text-center"
              >
                  <div>Nadeo</div>
                  <div>Set</div>
              </th>

              <th
                colSpan={2}
                className="px-8 py-1 border-b border-l border-slate-800 align-middle font-normal uppercase tracking-[0.18em]"
              >
                Total Time
              </th>

              <th
                colSpan={2}
                className="px-8 py-1 border-b border-l border-slate-800 align-middle font-normal uppercase tracking-[0.18em]"
              >
                Time Saved
              </th>
            </tr>

            <tr>
              <th className="px-2 py-1 border-l border-slate-800 font-normal uppercase tracking-[0.18em]">
                TAS
              </th>

              <th className="px-2 py-1 font-normal uppercase tracking-[0.18em]">
                RTA
              </th>

              <th className="px-2 py-1 border-l border-slate-800 font-normal uppercase tracking-[0.18em]">
                Diff
              </th>

              <th className="px-2 py-1 font-normal uppercase tracking-[0.18em]">
                %
              </th>
            </tr>
          </thead>

          <tbody className="font-sans divide-y divide-slate-800 bg-green-800/20">
            {categoryTotals.map((category) => {
              const hasRta = category.rtaMs > 0;
              const isStunt = category.category === "Stunt";

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

                  <td className="px-3 py-[4px] border-l border-slate-800 text-slate-300">
                    {formatTime(category.tasMs, isStunt)}
                  </td>

                  <td className="px-3 py-[4px] text-slate-300">
                    {hasRta ? formatTime(category.rtaMs, isStunt) : "-"}
                  </td>

                  <td className="px-3 py-[4px] border-l border-slate-800 italic">
                    {hasRta ? formatTime(category.tasMs - category.rtaMs, isStunt, false, true) : "-"}
                  </td>

                  <td className="px-3 py-[4px] font-bold">
                    {hasRta
                      ? formatPercentSaved(category.tasMs, category.rtaMs, 4, isStunt)
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

              <td className="px-2 py-[4px] border-l border-slate-800 text-slate-300">
                {formatTime(total.tasMs)}
              </td>

              <td className="px-2 py-[4px] text-slate-300">
                {total.rtaMs > 0 ? formatTime(total.rtaMs) : "-"}
              </td>

              <td className="px-2 py-[4px] border-l border-slate-800 italic">
                {total.rtaMs > 0 ? formatTime(total.tasMs - total.rtaMs, false, false, true) : "-"}
              </td>

              <td className="px-2 py-[4px]">
                {total.rtaMs > 0 ? formatPercentSaved(total.tasMs, total.rtaMs, 4) : "-"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </aside>
  );
}