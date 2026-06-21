"use client";

import { useMemo } from "react";
import { RecordRow } from "@/utils/typing";
import { formatTime, formatPercentSaved } from "@/utils/formatting";

type CategoryTotals = {
  category: string;
  tasMs: number;
  rtaMs: number;
};

export default function TimeSaved({ currentRecords } : { currentRecords: RecordRow[] }) {

  const { rows, total } = useMemo(() => {
    const acc: Record<string, CategoryTotals> = {};
    let totalTas = 0;
    let totalRta = 0;

    for (const row of currentRecords) {
      if (!row.rta) continue;

      const category = row.trackInfo.category;
      const tas = (row.tas && row.tas.time_ms < row.rta.time_ms) ? row.tas.time_ms : row.rta.time_ms;
      const rta = row.rta.time_ms;

      if (!acc[category]) {
        acc[category] = { category, tasMs: 0, rtaMs: 0 };
      }

      acc[category].tasMs += tas;
      acc[category].rtaMs += rta;

      if (category !== "Stunt") {
        totalTas += tas;
        totalRta += rta;
      }
    }

    return {
      rows: Object.values(acc),
      total: {
        category: "Total",
        tasMs: totalTas,
        rtaMs: totalRta,
      },
    };
  }, [currentRecords]);

  return (
    <div className="rounded-lg border border-slate-800 overflow-hidden">
      <table className="table-fixed text-center divide-y text-xs sm:text-sm">
        <thead className="bg-slate-900/90 text-slate-400">
          <tr>
            <th
              rowSpan={2}
              className="py-1 align-middle font-normal uppercase tracking-[0.18em] text-center px-2 sm:px-4"
            >
              <div>Nadeo</div>
              <div>Set</div>
            </th>

            <th
              colSpan={2}
              className="px-4 py-1 border-b border-l border-slate-800 align-middle font-normal uppercase tracking-[0.18em]"
            >
              Total Time
            </th>

            <th
              colSpan={2}
              className="px-4 py-1 border-b border-l border-slate-800 align-middle font-normal uppercase tracking-[0.18em]"
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

        <tbody className="font-sans divide-y divide-slate-800">
          {rows.map((category) => {
            const hasRta = category.rtaMs > 0;
            const isStunt = category.category === "Stunt";

            return (
              <tr
                key={category.category}
                className="border-b border-slate-800 last:border-b-0 hover:bg-blue-900/20 text-slate-300 transition-colors odd:bg-green-600/20 even:bg-green-800/20"
              >
                <td className="px-2 py-1 font-medium text-slate-200">
                  {category.category}
                </td>

                <td className="px-2 py-1 border-l border-slate-800">
                  {formatTime(category.tasMs, isStunt)}
                </td>

                <td className="px-2 py-1">
                  {hasRta ? formatTime(category.rtaMs, isStunt) : "-"}
                </td>

                <td
                  className="px-2 py-1 border-l border-slate-800 italic text-cyan-300 font-vga tracking-[0.04em]"
                >
                  {hasRta ? formatTime(category.tasMs - category.rtaMs, isStunt, false, true) : "-"}
                </td>

                <td className="px-3 py-1 font-bold">
                  {hasRta ? formatPercentSaved(category.tasMs, category.rtaMs, 4, isStunt) : "-"}
                </td>
              </tr>
            );
          })}

          <tr className="border-t-2 border-slate-600 font-semibold text-slate-200 hover:bg-blue-900/20 transition-colors bg-blue-700/20">
            <td className="px-2 py-1">Total</td>

            <td className="px-2 py-1 border-l border-slate-800 text-slate-300">
              {formatTime(total.tasMs)}
            </td>

            <td className="px-2 py-1 text-slate-300">
              {total.rtaMs > 0 ? formatTime(total.rtaMs) : "-"}
            </td>

            <td
              className="px-2 py-1 border-l border-slate-800 italic text-cyan-300 font-vga tracking-[0.04em]"
            >
              {total.rtaMs > 0 ? formatTime(total.tasMs - total.rtaMs, false, false, true) : "-"}
            </td>

            <td className="px-2 py-1 font-bold">
              {total.rtaMs > 0 ? formatPercentSaved(total.tasMs, total.rtaMs, 4) : "-"}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
