"use client";

import { useState, useMemo } from "react";
import { GAME_SETS, CATEGORY_ORDER } from "@/utils/constants";
import { SortOrder, Game, Environment, RecordRow, Category } from "@/utils/typing";
import { formatTime, formatPercentSaved, formatDate } from "@/utils/formatting"
import SortIndicator from "@/components/SortIndicator"
import { EnvironmentIcon, GbxIcon, InputsIcon, ReplayIcon, VideoIcon } from "@/components/Icons";

type SortField = "track" | "time" | "diff" | "percentSaved" | "authors" | "date" | "category" | "rtaTime" | "rtaPlayer" | "rtaDate";

function getTrackDifficultyTint(category: string, i: number) {
  switch (category) {
    case "White":
      return i % 2 === 0 ? "bg-white/10" : "bg-white/15";
    case "Green":
      return i % 2 === 0 ? "bg-green-500/10" : "bg-green-500/15";
    case "Blue":
      return i % 2 === 0 ? "bg-blue-500/10" : "bg-blue-500/15";
    case "Red":
      return i % 2 === 0 ? "bg-red-500/10" : "bg-red-500/15";
    case "Black":
      return i % 2 === 0 ? "bg-black/20" : "bg-black/60";
    default:
      return "";
  }
};

function isRecentEntry(dateStr: string, showRecent: boolean) {

  if (!showRecent) return false;

  const entryDate = new Date(dateStr);
  if (Number.isNaN(entryDate.getTime())) {
    return false;
  }

  const now = new Date();
  const diff = now.getTime() - entryDate.getTime();
  const oneMonth = 30 * 24 * 60 * 60 * 1000;
  return diff >= 0 && diff <= oneMonth;
};

function getTmxLink(id: number, game: Game) {
  if (id === 0) return "";
  if (game === "TMNF" || game === "TMNF No Cut") {
    return `https://tmnf.exchange/trackshow/${id}`;
  } else if (game === "TM2") {
    return `https://tm.mania.exchange/mapshow/${id}`;
  } else if (game === "ESWC") {
    return `https://nations.tm-exchange.com/trackshow/${id}`;
  } else {
    return `https://tmuf.exchange/trackshow/${id}`;
  }
};

interface RecordTableProps {
  game: Game;
  showRta: boolean;
  highlightRecent: boolean;
  currentRecords: RecordRow[];
  selectedAuthor: string;
  selectedEnvironment: Environment;
};

export default function RecordTable({ game, showRta, highlightRecent, currentRecords, selectedAuthor, selectedEnvironment }: RecordTableProps) {

  const [sortField, setSortField] = useState<SortField>("track");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const isTM2 = game === "TM2"

  const categoryIndexes = useMemo(
    () => new Map(GAME_SETS[game].map((c, i) => [c, i])),
    [game]
  );

  const sortedRows = useMemo(() => {
    const sorted = [...currentRecords].sort((a, b) => {
      let aVal: string | number = "";
      let bVal: string | number = "";

      const aHasEntry = Boolean(a.tas);
      const bHasEntry = Boolean(b.tas);
      const aHasRta = Boolean(a.rta);
      const bHasRta = Boolean(b.rta);

      switch (sortField) {
        case "track": {
          const aCategoryIndex = categoryIndexes.get(a.trackInfo.category);
          const bCategoryIndex = categoryIndexes.get(b.trackInfo.category);
          const aOrder = a.trackInfo.order ? a.trackInfo.order.toString().padStart(2, "0") : a.track;
          const bOrder = b.trackInfo.order ? b.trackInfo.order.toString().padStart(2, "0") : b.track;
          aVal = `${aCategoryIndex}-${aOrder}`;
          bVal = `${bCategoryIndex}-${bOrder}`;
          break;
        }
        case "time":
          if (aHasEntry !== bHasEntry) return aHasEntry ? -1 : 1;
          aVal = a.tas ? a.tas.time_ms : 0;
          bVal = b.tas ? b.tas.time_ms : 0;
          break;
        case "diff":
          if (aHasEntry !== bHasEntry) return aHasEntry ? -1 : 1;
          aVal = a.tas && a.rta ? a.tas.time_ms - a.rta.time_ms : 0;
          bVal = b.tas && b.rta ? b.tas.time_ms - b.rta.time_ms : 0;
          break;
        case "percentSaved":
          if (aHasEntry !== bHasEntry) return aHasEntry ? -1 : 1;
          aVal = a.tas && a.rta ? (a.tas.time_ms - a.rta.time_ms) / a.rta.time_ms : 0;
          bVal = b.tas && b.rta ? (b.tas.time_ms - b.rta.time_ms) / b.rta.time_ms : 0;
          break;
        case "authors":
          if (aHasEntry !== bHasEntry) return aHasEntry ? -1 : 1;
          aVal = a.tas ? a.tas.authors.join(", ") : "";
          bVal = b.tas ? b.tas.authors.join(", ") : "";
          break;
        case "date":
          if (aHasEntry !== bHasEntry) return aHasEntry ? -1 : 1;
          aVal = a.tas?.date ?? "";
          bVal = b.tas?.date ?? "";
          break;
        case "category":
          if (aHasEntry !== bHasEntry) return aHasEntry ? -1 : 1;
          aVal = CATEGORY_ORDER[a.tas?.category as Category] ?? "";
          bVal = CATEGORY_ORDER[b.tas?.category as Category] ?? "";
          break;
        case "rtaDate":
          if (aHasRta !== bHasRta) return aHasRta ? -1 : 1;
          aVal = a.rta?.date || "";
          bVal = b.rta?.date || "";
          break;
        case "rtaPlayer":
          if (aHasRta !== bHasRta) return aHasRta ? -1 : 1;
          aVal = a.rta?.player || "";
          bVal = b.rta?.player || "";
          break;
        case "rtaTime":
          if (aHasRta !== bHasRta) return aHasRta ? -1 : 1;
          aVal = a.rta?.time_ms || 0;
          bVal = b.rta?.time_ms || 0;
          break;
      }

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
      }

      const comparison = String(aVal).localeCompare(String(bVal));
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [currentRecords, sortField, sortOrder, categoryIndexes]);

  const filteredRows = useMemo(() => {
    return sortedRows.filter((row) => {
      const matchesAuthor = !selectedAuthor || selectedAuthor === "All Authors" || row.tas?.authors.includes(selectedAuthor)
      const matchesEnvironment = selectedEnvironment === "All" || row.trackInfo.environment === selectedEnvironment
      return matchesEnvironment && matchesAuthor;
    })
  }, [sortedRows, selectedAuthor, selectedEnvironment]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  return (
    <div className="pb-4">
      <div className="overflow-x-auto">
        <table className="table-auto w-full text-center text-sm border-separate border-spacing-0">
          <thead className="text-slate-400">
            <tr>
              <th className="pl-5"></th>
              <th
                colSpan={2}
                onClick={() => handleSort("track")}
                className="px-2 py-1 bg-slate-900/90 border border-slate-800 font-normal uppercase rounded-tl-lg tracking-[0.18em] cursor-pointer hover:text-slate-300 transition whitespace-nowrap"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Track</span>
                  <SortIndicator active={sortField === "track"} order={sortOrder} />
                </div>
              </th>
              <th
                onClick={() => handleSort("time")}
                className="px-2 py-1 bg-slate-900/90 border-y border-slate-800 font-normal uppercase tracking-[0.18em] cursor-pointer hover:text-slate-300 transition whitespace-nowrap"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Time</span>
                  <SortIndicator active={sortField === "time"} order={sortOrder} />
                </div>
              </th>
              <th
                onClick={() => handleSort("diff")}
                className="px-2 py-1 bg-slate-900/90 border-y border-slate-800 font-normal uppercase tracking-[0.18em] cursor-pointer hover:text-slate-300 transition whitespace-nowrap"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Diff</span>
                  <SortIndicator active={sortField === "diff"} order={sortOrder} />
                </div>
              </th>
              <th
                onClick={() => handleSort("percentSaved")}
                className="px-2 py-1 bg-slate-900/90 border-y border-slate-800 w-[60px] font-normal uppercase tracking-[0.18em] cursor-pointer hover:text-slate-300 transition whitespace-nowrap"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>%</span>
                  <SortIndicator active={sortField === "percentSaved"} order={sortOrder} />
                </div>
              </th>
              <th
                onClick={() => handleSort("authors")}
                className="px-2 py-1 bg-slate-900/90 border border-slate-800 w-[320px] font-normal uppercase tracking-[0.18em] cursor-pointer hover:text-slate-300 transition"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Authors</span>
                  <SortIndicator active={sortField === "authors"} order={sortOrder} />
                </div>
              </th>
              <th
                onClick={() => handleSort("date")}
                className="px-2 py-1 bg-slate-900/90 border-y border-slate-800 font-normal uppercase tracking-[0.18em] cursor-pointer hover:text-slate-300 transition whitespace-nowrap"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Date</span>
                  <SortIndicator active={sortField === "date"} order={sortOrder} />
                </div>
              </th>
              <th
                onClick={() => handleSort("category")}
                className="px-2 py-1 bg-slate-900/90 border-y border-slate-800 font-normal uppercase tracking-[0.18em] cursor-pointer hover:text-slate-300 transition whitespace-nowrap"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Cat.</span>
                  <SortIndicator active={sortField === "category"} order={sortOrder} />
                </div>
              </th>
              <th className="px-2 py-1 bg-slate-900/90 border border-slate-800 font-normal uppercase rounded-tr-lg tracking-[0.18em]">
                Links
              </th>

              {showRta && (
                <>
                  <th className="pl-5"></th>
                  <th 
                    onClick={() => handleSort("rtaTime")}
                    className="px-2 py-1 bg-slate-900/90 border border-slate-800 font-normal uppercase rounded-tl-lg tracking-[0.18em] cursor-pointer hover:text-slate-300 transition whitespace-nowrap"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>RTA</span>
                      <SortIndicator active={sortField === "rtaTime"} order={sortOrder} />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort("rtaPlayer")}
                    className="px-2 py-1 bg-slate-900/90 border border-slate-800 font-normal uppercase tracking-[0.18em] cursor-pointer hover:text-slate-300 transition whitespace-nowrap"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Player</span>
                      <SortIndicator active={sortField === "rtaPlayer"} order={sortOrder} />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort("rtaDate")}
                    className="px-2 py-1 bg-slate-900/90 border border-slate-800 font-normal uppercase tracking-[0.18em] cursor-pointer hover:text-slate-300 transition whitespace-nowrap"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Date</span>
                      <SortIndicator active={sortField === "rtaDate"} order={sortOrder} />
                    </div>
                  </th>
                  <th className="px-2 py-1 bg-slate-900/90 border border-slate-800 w-[80px] font-normal uppercase rounded-tr-lg tracking-[0.18em]">
                    Links
                  </th>
                </>
              )}
            </tr>
            <tr>
              <th className=""></th>
              <th className="border-b border-slate-400"></th>
              <th className="border-b border-slate-400"></th>
              <th className="border-b border-slate-400"></th>
              <th className="border-b border-slate-400"></th>
              <th className="border-b border-slate-400"></th>
              <th className="border-b border-slate-400"></th>
              <th className="border-b border-slate-400"></th>
              <th className="border-b border-slate-400"></th>
              <th className="border-b border-slate-400"></th>
              <th></th>
              <th className="border-b border-slate-400"></th>
              <th className="border-b border-slate-400"></th>
              <th className="border-b border-slate-400"></th>
              <th className="border-b border-slate-400"></th>
            </tr>
          </thead>
          <tbody className="font-sans divide-y divide-slate-800">
            {filteredRows.map((row, i) => {
              const entry = row.tas;
              const recent = entry ? isRecentEntry(entry.date, highlightRecent) : false;
              const rtaRecent = row.rta ? isRecentEntry(row.rta.date, highlightRecent) : false;
              const tmxLink = getTmxLink(row.trackInfo.id, row.trackInfo.game);
              const colour = getTrackDifficultyTint(row.trackInfo.category, i)
              const bgColour = `${recent ? "italic bg-sky-400/30 text-sky-100" : colour}`
              const rtaColour = `${rtaRecent ? "italic bg-sky-400/30 text-sky-100" : colour}`
              const isStunt = row.trackInfo.category === "Stunt"

              return (
                <tr
                  key={row.track}
                  className="group h-[30px] transition-colors"
                >
                  <td className="px-1 text-center">
                    {recent ? (
                      <span className="animate-test text-red-500">
                        NEW
                      </span>
                      ) : null}
                  </td>
                  <td
                    className={`px-1 py-[0px] border-b border-l border-slate-800 text-slate-100 text-center align-middle group-hover:bg-emerald-400/20 transition-colors ${bgColour} ${
                      i === filteredRows.length - 1 ? "rounded-bl-lg" : ""
                    }`}
                  >
                    {<EnvironmentIcon environment={row.trackInfo.environment}/>}
                  </td>
                  <td className={ `pr-2 py-1 text-slate-100 border-b border-slate-800 align-middle w-max whitespace-nowrap group-hover:bg-emerald-400/20 transition-colors ${bgColour}` }>
                    {tmxLink ? (
                      <a
                        href={tmxLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sky-400 hover:text-sky-300"
                      >
                        {row.track}
                      </a>
                    ) : (
                      row.track
                    )}
                  </td>
                  <td className={ `px-1.5 py-1 text-slate-100 border-b border-l border-slate-800 text-center align-middle group-hover:bg-emerald-400/20 transition-colors ${bgColour}` }>
                    {entry ? formatTime(entry.time_ms, isStunt, isTM2) : "-"}
                  </td>
                  <td
                    className={`px-1.5 py-1 border-b border-slate-800 text-center italic align-middle group-hover:bg-emerald-400/20 transition-colors ${bgColour} ${
                      entry &&
                      row.rta &&
                      ((entry.time_ms - row.rta.time_ms > 0 && !isStunt) ||
                        (entry.time_ms - row.rta.time_ms < 0 && isStunt))
                        ? "text-red-300"
                        : "text-slate-100"
                    }`}
                    style={{
                      fontFamily: "DOSVGA, monospace",
                      letterSpacing: "0.05em",

                      // 💡 glow stack (like your vga-text)
                      textShadow: `
                        0 0 4px #000000,
                        0 0 10px #000000,
                        0 0 18px hsla(0, 0%, 100%, 0.59),
                        1px 1px 0 hsl(0, 0%, 100%)
                      `,
                    }}
                  >
                    {entry && row.rta
                      ? formatTime(entry.time_ms - row.rta.time_ms, isStunt, isTM2, true)
                      : "-"}
                  </td>
                  <td className={ `px-1.5 py-1 text-slate-100 border-b border-slate-800 text-center align-middle group-hover:bg-emerald-400/20 transition-colors ${bgColour}` }>
                    {entry && row.rta
                      ? formatPercentSaved(entry.time_ms, row.rta.time_ms, 3, isStunt)
                      : "-"}
                  </td>
                  <td className={ `px-1.5 py-1 text-slate-100 border-b border-l border-slate-800 break-words min-w-[320px] whitespace-normal text-center align-middle group-hover:bg-emerald-400/20 transition-colors ${bgColour}` }>
                    {entry ? entry.authors.join(", ") : "-"}
                  </td>
                  <td className={ `px-3 py-1 text-slate-100 border-b border-l border-slate-800 whitespace-nowrap text-center align-middle group-hover:bg-emerald-400/20 transition-colors ${bgColour}` }>
                    {entry ? formatDate(entry.date) : "-"}
                  </td>
                  <td className={ `px-3 py-1 text-slate-100 border-b border-slate-800 whitespace-nowrap text-center align-middle group-hover:bg-emerald-400/20 transition-colors ${bgColour}` }>
                    {entry ? entry.category : "-"}
                  </td>
                  
                  <td className={ `px-2 py-1 text-slate-100 border-b border-x border-slate-800 text-center align-middle group-hover:bg-emerald-400/20 transition-colors ${bgColour} ${
                        i === filteredRows.length - 1 ? "rounded-br-lg" : ""
                      }`}>
                    {entry ? 
                      <div className="flex items-center justify-center gap-1">
                        <div className="w-5 h-5 flex items-center justify-center">
                          {entry.video && (<VideoIcon video_url={entry.video}/>)}
                        </div>

                        <div className="w-5 h-5 flex items-center justify-center">
                          {entry.replay && (<ReplayIcon replay_url={entry.replay}/>)}
                        </div>

                        <div className="w-5 h-5 flex items-center justify-center">
                          {entry.inputs && (<InputsIcon inputs_url={entry.inputs}/>)}
                        </div>

                        <div className="w-5 h-5 flex items-center justify-center">
                          {entry.replay && (<GbxIcon replay_url={entry.replay}/>)}
                        </div>
                      </div>
                    : "-"}
                  </td>
                  {showRta && (
                    <>
                      <td className="pl-5"></td>
                      <td className={ `px-2 py-1 text-slate-100 border-b border-l border-slate-800 text-center align-middle group-hover:bg-emerald-400/20 transition-colors ${rtaColour} ${
                            i === filteredRows.length - 1 ? "rounded-bl-lg" : ""
                          }`}>
                        {row.rta ? formatTime(row.rta.time_ms, isStunt, isTM2) : "-"}
                      </td>
                      <td className={ `px-2 py-1 text-slate-100 border-b border-l border-slate-800 text-center align-middle whitespace-nowrap group-hover:bg-emerald-400/20 transition-colors ${rtaColour}` }>
                        {row.rta?.player ?? "-"}
                      </td>
                      <td className={ `px-2 py-1 text-slate-100 border-b border-l border-slate-800 text-center align-middle whitespace-nowrap group-hover:bg-emerald-400/20 transition-colors ${rtaColour}` }>
                        {row.rta ? formatDate(row.rta.date) : "-"}
                      </td>
                      <td className={ `px-2 py-1 text-slate-100 border-b border-x border-slate-800 text-center align-middle group-hover:bg-emerald-400/20 transition-colors ${rtaColour} ${
                            i === filteredRows.length - 1 ? "rounded-br-lg" : ""
                          }`}>
                        {row.rta ?
                          <div className="flex items-center justify-center gap-1">
                            <div className="w-5 h-5 flex items-center justify-center">
                              {row.rta.video && (<VideoIcon video_url={row.rta.video}/>)}
                            </div>

                            <div className="w-5 h-5 flex items-center justify-center">
                              {row.rta.replay && (<ReplayIcon replay_url={row.rta.replay}/>)}
                            </div>
                          </div> 
                        : "-"}
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}
