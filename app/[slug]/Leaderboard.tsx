"use client";

import Link from "next/link";
import { RecordRow } from "@/lib/TrackLists";
import { useMemo, useState } from "react";
import { trackList } from "../../lib/TrackLists"

type SortField = "author" | "tases" | "contributions" | "timeSaved";
type SortOrder = "asc" | "desc";
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

        let timeSaved = 0;
        const override = trackList[row.track]?.overrideTimeSaved;
        if (override != null) {
          timeSaved = override * 1000;
        } else if (row.rta && row.rta.timeMs > row.tas.timeMs && row.trackInfo.category !== "Stunt") {
          timeSaved = row.rta.timeMs - row.tas.timeMs;
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
  }, [currentRecords, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const SortIndicator = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;

    return (
      <span className="inline-flex items-center justify-center w-4 h-4 -ml-1.5">
        {sortOrder === "asc" ? (
          <svg viewBox="0 0 20 20" className="w-4 h-4 fill-current">
            <path d="M10 6l-5 5h10l-5-5z" />
          </svg>
        ) : (
          <svg viewBox="0 0 20 20" className="w-4 h-4 fill-current">
            <path d="M10 14l5-5H5l5 5z" />
          </svg>
        )}
      </span>
    );
  };

  return (
    <aside className="pl-5 pb-4">
      <div className="rounded-lg border border-slate-800 text-sm">
        <table className="table-fixed text-center divide-y text-sm">
          <thead className="bg-slate-900/90 text-slate-400">
            <tr>

              <th
                onClick={() => handleSort("author")}
                className="px-2 py-1 font-normal uppercase tracking-[0.18em] cursor-pointer hover:text-slate-300 transition whitespace-nowrap"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Author</span>
                  <SortIndicator field="author" />
                </div>
              </th>

              <th
                onClick={() => handleSort("tases")}
                className="px-2 py-1 border-l border-slate-800 font-normal tracking-[0.18em] cursor-pointer hover:text-slate-300 transition whitespace-nowrap"
              >
                <div className="flex items-center uppercase justify-center gap-1">
                  <span>TAS</span>
                  <SortIndicator field="tases" />
                </div>
              </th>

              <th
                onClick={() => handleSort("contributions")}
                className="px-2 py-1 border-l border-slate-800 font-normal uppercase tracking-[0.18em] cursor-pointer hover:text-slate-300 transition whitespace-nowrap"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Cont.</span>
                  <SortIndicator field="contributions" />
                </div>
              </th>

              <th
                onClick={() => handleSort("timeSaved")}
                className="px-2 py-1 border-l border-slate-800 font-normal uppercase tracking-[0.18em] cursor-pointer hover:text-slate-300 transition whitespace-nowrap"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Saved</span>
                  <SortIndicator field="timeSaved" />
                </div>
              </th>
            </tr>
          </thead>

          <tbody className="font-sans divide-y divide-slate-800">
            {sortedRows.map((row) => {
              return (
                <tr
                  key={row.author}
                  className="
                    border-b border-slate-800 last:border-b-0
                    hover:bg-blue-900/20 transition-colors
                    odd:bg-violet-600/10
                    even:bg-violet-900/7
                  "
                >
                  <td className="px-2 py-[4px] font-medium text-slate-200">
                    <Link
                      href={`/authors?author=${encodeURIComponent(row.author)}`}
                      className="hover:text-white underline-offset-2 hover:underline"
                    >
                      {row.author}
                    </Link>
                  </td>

                  <td className="px-3 py-[4px] border-l border-slate-800">
                    {row.tasCount}
                  </td>

                  <td className="px-3 py-[4px] border-l border-slate-800">
                    {row.contributions.toFixed(2)}
                  </td>

                  <td className="px-3 py-[4px] border-l border-slate-800">
                    {(row.timeSavedMs / 1000).toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </aside>
  );
    
}

