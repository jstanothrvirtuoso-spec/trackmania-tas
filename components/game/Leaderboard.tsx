"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { OVERRIDE } from "@/utils/constants";
import { SortOrder, RecordRow } from "@/utils/typing";
import SortIndicator from "@/components/SortIndicator"

type SortField = "author" | "tases" | "contributions" | "timeSaved";
type LeaderboardRows = {
  author: string;
  tasCount: number;
  contributions: number;
  timeSavedMs: number;
};

export default function TimeSaved({ currentRecords }: { currentRecords: RecordRow[] }) {
  
  const [sortField, setSortField] = useState<SortField>("tases");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const leaderboardRows = useMemo<LeaderboardRows[]>(() => {
    return Object.values(
      currentRecords.reduce((acc, row) => {
        if (!row.tas) return acc;

        const authors = row.tas.authors;
        const contribution = 1 / authors.length;
        const override = OVERRIDE[row.track]?.[row.tas.time_ms];

        let timeSaved = 0;
        if (override) {
          timeSaved = override * 1000;
        } else if (row.rta && row.rta.time_ms > row.tas.time_ms && row.trackInfo.category !== "Stunt") {
          timeSaved = row.rta.time_ms - row.tas.time_ms;
        }

        const splitTimeSaved = timeSaved * contribution;

        authors.forEach((author) => {
          if (!acc[author]) {
            acc[author] = {
              author,
              tasCount: 0,
              contributions: 0,
              timeSavedMs: 0,
            };
          }

          acc[author].tasCount += 1;
          acc[author].contributions += contribution;
          acc[author].timeSavedMs += splitTimeSaved;
        });

        return acc;
      }, {} as Record<string, LeaderboardRows>)
    );
  }, [currentRecords]);
  
  const sortedRows = useMemo(() => {
    const sorted = [...leaderboardRows].sort((a, b) => {
      let aVal: string | number = "";
      let bVal: string | number = "";

      switch (sortField) {
        case "author": 
          aVal = a.author;
          bVal = b.author;
          break;
        case "tases":
          if (a.tasCount !== b.tasCount) {
            return sortOrder === "asc"
              ? a.tasCount - b.tasCount
              : b.tasCount - a.tasCount;
          }
          return sortOrder === "asc"
            ? a.timeSavedMs - b.timeSavedMs
            : b.timeSavedMs - a.timeSavedMs;
        case "contributions":
          if ((a.contributions).toPrecision(3) !== (b.contributions).toPrecision(3)) {
            aVal = a.contributions;
            bVal = b.contributions;
          } else {
            aVal = a.timeSavedMs;
            bVal = b.timeSavedMs;
          }
          break;
        case "timeSaved":
          aVal = a.timeSavedMs;
          bVal = b.timeSavedMs;
          break;
      }

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
      }

      const comparison = String(aVal).localeCompare(String(bVal));
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [sortField, sortOrder, leaderboardRows]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  return (
    <div className="rounded-lg border border-slate-800 overflow-hidden text-xs sm:text-sm">
      <table className="table-fixed text-center divide-y">
        <thead className="bg-slate-900/90 text-slate-400">
          <tr>
            <th
              onClick={() => handleSort("author")}
              className="px-2 py-1 font-normal uppercase tracking-[0.18em] cursor-pointer hover:text-slate-300 transition whitespace-nowrap"
            >
              <div className="flex items-center justify-center gap-1">
                <span>Author</span>
                <SortIndicator active={sortField === "author"} order={sortOrder} />
              </div>
            </th>

            <th
              onClick={() => handleSort("tases")}
              className="px-2 py-1 border-l border-slate-800 font-normal tracking-[0.18em] cursor-pointer hover:text-slate-300 transition whitespace-nowrap"
            >
              <div className="flex items-center uppercase justify-center gap-1">
                <span>TAS</span>
                <SortIndicator active={sortField === "tases"} order={sortOrder} />
              </div>
            </th>

            <th
              onClick={() => handleSort("contributions")}
              className="px-2 py-1 border-l border-slate-800 font-normal uppercase tracking-[0.18em] cursor-pointer hover:text-slate-300 transition whitespace-nowrap"
            >
              <div className="flex items-center justify-center gap-1">
                <span>Cont.</span>
                <SortIndicator active={sortField === "contributions"} order={sortOrder} />
              </div>
            </th>

            <th
              onClick={() => handleSort("timeSaved")}
              className="px-2 py-1 border-l border-slate-800 font-normal uppercase tracking-[0.18em] cursor-pointer hover:text-slate-300 transition whitespace-nowrap"
            >
              <div className="flex items-center justify-center gap-1">
                <span>Saved</span>
                <SortIndicator active={sortField === "timeSaved"} order={sortOrder} />
              </div>
            </th>
          </tr>
        </thead>

        <tbody className="font-sans divide-y divide-slate-800">
          {sortedRows.map((row) => {
            return (
              <tr
                key={`${row.author}-${row.timeSavedMs}`}
                className="border-b border-slate-800 last:border-b-0 text-slate-300
                  hover:bg-blue-900/20 transition-colors odd:bg-violet-600/20 even:bg-violet-800/10"
              >
                <td className="px-2 py-1 font-medium text-slate-200">
                  <Link
                    href={`/authors?author=${encodeURIComponent(row.author)}`}
                    className="hover:text-emerald-500 whitespace-nowrap transition"
                  >
                    {row.author}
                  </Link>
                </td>

                <td className="px-3 py-1 border-l border-slate-800">
                  {row.tasCount}
                </td>

                <td className="px-3 py-1 border-l border-slate-800">
                  {row.contributions.toFixed(2)}
                </td>

                <td className="px-3 py-1 border-l border-slate-800">
                  {(row.timeSavedMs / 1000).toFixed(2)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
