
import { Category, RecordRow, SortOrder } from "@/utils/typing";
import { EnvironmentIcon } from "../Icons";
import { formatTrack } from "../FormatLinks";
import { formatDate, formatGame, formatTime } from "@/utils/formatting";
import { CATEGORY_ORDER } from "@/utils/constants";
import { useMemo, useState } from "react";
import SortIndicator from "../SortIndicator";

type SortField = "track" | "time" | "diff" | "game" | "date" | "category";

function getSortValue(row: RecordRow, field: SortField): string | number {
  switch (field) {
    case "track": 
      return row.tas?.track ?? "";
    case "time":
      return row.tas?.time_ms ?? Infinity;
    case "diff":
      return row.tas && row.rta ? row.tas.time_ms - row.rta.time_ms : Infinity;
    case "game":
      return row.tas?.game ?? "";
    case "date":
      return row.tas?.date ?? "";
    case "category":
      return CATEGORY_ORDER[row.tas?.category as Category] ?? "";
  }
}

export function AuthorTasTable({ rows }: { rows: RecordRow[] }) {

  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => {
      const aVal = getSortValue(a, sortField);
      const bVal = getSortValue(b, sortField);

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
      }
      
      const result = String(aVal).localeCompare(String(bVal));
      return sortOrder === "asc" ? result : -result;
    });
  }, [rows, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortField(field);
    setSortOrder("asc");
  };

  return (
    <div className="overflow-x-auto shadow-[0_5px_20px_rgba(0,0,0,0.6)] px-2">
      <table className="border-separate border border-slate-800 bg-slate-900/70 rounded-lg overflow-hidden text-center text-slate-300 text-xs sm:text-sm">
        <thead>
          <tr className="text-slate-400 border-b border-slate-700 uppercase tracking-[0.18em]">
            <th
              onClick={() => handleSort("track")}
              className="px-2 py-1.5 font-normal hover:text-slate-300 transition cursor-pointer"
            >
              <div className="flex items-center justify-center gap-1">
                <span>Track</span>
                <SortIndicator active={sortField === "track"} order={sortOrder} />
              </div>
            </th>

            <th
              onClick={() => handleSort("time")}
              className="px-2 py-1.5 font-normal hover:text-slate-300 transition cursor-pointer"
            >
              <div className="flex items-center justify-center gap-1">
                <span>TAS</span>
                <SortIndicator active={sortField === "time"} order={sortOrder} />
              </div>
            </th>

            <th
              onClick={() => handleSort("diff")}
              className="px-2 py-1.5 font-normal hover:text-slate-300 transition hidden sm:table-cell cursor-pointer"
            >
              <div className="flex items-center justify-center gap-1">
                <span>Diff.</span>
                <SortIndicator active={sortField === "diff"} order={sortOrder} />
              </div>
            </th>

            <th
              onClick={() => handleSort("game")}
              className="px-2 py-1.5 font-normal hover:text-slate-300 transition hidden sm:table-cell cursor-pointer"
            >
              <div className="flex items-center justify-center gap-1">
                <span>Game</span>
                <SortIndicator active={sortField === "game"} order={sortOrder} />
              </div>
            </th>

            <th
              onClick={() => handleSort("date")}
              className="px-2 py-1.5 font-normal hover:text-slate-300 transition cursor-pointer"
            >
              <div className="flex items-center justify-center gap-1">
                <span>Date</span>
                <SortIndicator active={sortField === "date"} order={sortOrder} />
              </div>
            </th>

            <th
              onClick={() => handleSort("category")}
              className="px-2 py-1.5 font-normal hover:text-slate-300 transition cursor-pointer"
            >
              <div className="flex items-center justify-center gap-1">
                <span>Cat.</span>
                <SortIndicator active={sortField === "category"} order={sortOrder} />
              </div>
            </th>
          </tr>
        </thead>

        <tbody>
          {sortedRows.map((row, index) => {
            if (!row.tas) return null;
            const isStunt = row.trackInfo.gameSet === "Stunt"
            const tasGame = row.tas.category === "No Cut" && row.trackInfo.noCutTrack ? "TMNF No Cut" : formatGame(row.tas.game)
            const opacity = row.isCurrentBestTas ? "opacity-100" : "opacity-40"

            return (
              <tr
                key={ index }
                className={`border-b border-slate-800 ${index % 2 === 0 ? "bg-violet-950/20" : "bg-violet-950/40"} ${opacity}`}
              >
                <td className="px-2 max-w-50">
                  <span className="flex flex-row gap-2 items-center">
                    <div className="hidden sm:flex">
                      <EnvironmentIcon environment={row.trackInfo.environment} />
                    </div>
                    <div className="flex justify-center w-full">
                      {formatTrack(row.track)}
                    </div>
                  </span>
                </td>

                <td className="px-3 py-1.5">
                  { formatTime(row.tas.time_ms, isStunt, row.tas.game === "TM2")}
                </td>

                <td className="px-2 py-1.5 italic hidden sm:table-cell">
                  { row.rta ? formatTime(row.tas.time_ms - row.rta.time_ms, isStunt, row.tas.game === "TM2", true) : "-" }
                </td>

                <td className="px-2 py-1.5 hidden sm:table-cell">
                  {tasGame}
                </td>

                <td className="px-2 py-1.5 whitespace-nowrap">
                  { formatDate(row.tas.date) }
                </td>

                <td className="px-2 py-1.5">
                  { row.tas.category}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
