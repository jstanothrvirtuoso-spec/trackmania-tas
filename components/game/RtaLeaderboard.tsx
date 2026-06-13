"use client";

import { useMemo, useState } from "react";
import { SortOrder } from "@/utils/typing";
import { RecordRow } from "@/utils/typing";
import SortIndicator from "@/components/SortIndicator"

type SortField = "player" | "wrs";
type RtaLeaderboardRow = {
  player: string;
  wrCount: number;
};

export default function RtaTable({
  currentRecords,
}: {
  currentRecords: RecordRow[];
}) {
  const [sortField, setSortField] = useState<SortField>("wrs");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const leaderboardRows = useMemo<RtaLeaderboardRow[]>(() => {
    return Object.values(
      currentRecords.reduce((acc, row) => {
        if (!row.rta) return acc;

        const player = row.rta.player;

        const rowData = acc[player] ??= {
          player,
          wrCount: 0,
        };

        rowData.wrCount++;

        return acc;
      }, {} as Record<string, RtaLeaderboardRow>)
    );
  }, [currentRecords]);

  const sortedRows = useMemo(() => {
    return [...leaderboardRows].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "player":
          comparison = a.player.localeCompare(b.player);
          break;

        case "wrs":
          comparison = a.wrCount - b.wrCount;
          if (comparison === 0) {
            comparison = b.player.localeCompare(a.player);
          }
          break;
      }

      return sortOrder === "asc"
        ? comparison
        : -comparison;
    });
  }, [leaderboardRows, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev =>
        prev === "asc" ? "desc" : "asc"
      );
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  return (
    <aside className="pl-4 pb-4">
      <div className="rounded-lg border border-slate-800 text-sm overflow-hidden">
        <table className="table-fixed text-center divide-y text-sm">
          <thead className="bg-slate-900/90 text-slate-400">
            <tr>
              <th
                onClick={() => handleSort("player")}
                className="px-2 py-1 font-normal uppercase tracking-[0.18em] cursor-pointer hover:text-slate-300 transition whitespace-nowrap"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Player</span>
                  <SortIndicator active={sortField === "player"} order={sortOrder} />
                </div>
              </th>

              <th
                onClick={() => handleSort("wrs")}
                className="px-2 py-1 border-l border-slate-800 font-normal uppercase tracking-[0.18em] cursor-pointer hover:text-slate-300 transition whitespace-nowrap"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>WRs</span>
                  <SortIndicator active={sortField === "wrs"} order={sortOrder} />
                </div>
              </th>
            </tr>
          </thead>

          <tbody className="font-sans divide-y divide-slate-800">
            {sortedRows.map((row) => (
              <tr
                key={row.player}
                className="
                  border-b border-slate-800 last:border-b-0
                  hover:bg-blue-900/20 transition-colors
                  odd:bg-cyan-600/10
                  even:bg-cyan-900/10
                "
              >
                <td className="px-2 py-[4px] font-medium text-slate-200 whitespace-nowrap">
                  {row.player}
                </td>

                <td className="px-3 py-[4px] border-l border-slate-800">
                  {row.wrCount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </aside>
  );
}