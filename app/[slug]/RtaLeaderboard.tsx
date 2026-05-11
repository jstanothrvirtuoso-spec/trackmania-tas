"use client";

import Link from "next/link";
import { RecordRow } from "@/lib/TrackLists";
import { useMemo, useState } from "react";

type SortField = "player" | "wrs";
type SortOrder = "asc" | "desc";

type RtaLeaderboardRow = {
  player: string;
  wrCount: number;
};

export default function RtaTable({
  currentRecords,
}: {
  currentRecords: RecordRow[];
}) {
  const [sortField, setSortField] =
    useState<SortField>("wrs");

  const [sortOrder, setSortOrder] =
    useState<SortOrder>("desc");

  const leaderboardRows = useMemo<RtaLeaderboardRow[]>(() => {
    return Object.values(
      currentRecords.reduce((acc, row) => {
        if (!row.rta) return acc;

        const player = row.rta.player;

        if (!acc[player]) {
          acc[player] = {
            player,
            wrCount: 0,
          };
        }

        acc[player].wrCount += 1;

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

          // tie-break alphabetically
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
      setSortOrder(
        sortOrder === "asc" ? "desc" : "asc"
      );
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const SortIndicator = ({
    field,
  }: {
    field: SortField;
  }) => {
    if (sortField !== field) return null;

    return (
      <span className="inline-flex items-center justify-center w-4 h-4 -ml-1.5">
        {sortOrder === "asc" ? (
          <svg
            viewBox="0 0 20 20"
            className="w-4 h-4 fill-current"
          >
            <path d="M10 6l-5 5h10l-5-5z" />
          </svg>
        ) : (
          <svg
            viewBox="0 0 20 20"
            className="w-4 h-4 fill-current"
          >
            <path d="M10 14l5-5H5l5 5z" />
          </svg>
        )}
      </span>
    );
  };

  return (
    <aside className="pl-4 pb-4">
      <div className="rounded-lg border border-slate-800 text-sm">
        <table className="table-fixed text-center divide-y text-sm">
          <thead className="bg-slate-900/90 text-slate-400">
            <tr>
              <th
                onClick={() => handleSort("player")}
                className="px-2 py-1 font-normal uppercase tracking-[0.18em] cursor-pointer hover:text-slate-300 transition whitespace-nowrap"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Player</span>
                  <SortIndicator field="player" />
                </div>
              </th>

              <th
                onClick={() => handleSort("wrs")}
                className="px-2 py-1 border-l border-slate-800 font-normal uppercase tracking-[0.18em] cursor-pointer hover:text-slate-300 transition whitespace-nowrap"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>WRs</span>
                  <SortIndicator field="wrs" />
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
                  <Link
                    href={`/players?player=${encodeURIComponent(
                      row.player
                    )}`}
                    className="hover:text-white underline-offset-2 hover:underline"
                  >
                    {row.player}
                  </Link>
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