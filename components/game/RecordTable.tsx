"use client";

import { useState, useMemo } from "react";
import { GAME_SETS, CATEGORY_ORDER } from "@/utils/constants";
import { SortOrder, Game, RecordRow, Category } from "@/utils/typing";
import { formatTime, formatPercentSaved, formatDate } from "@/utils/formatting";
import SortIndicator from "@/components/SortIndicator";
import { EnvironmentIcon, GbxIcon, InputsIcon, ReplayIcon, VideoIcon } from "@/components/Icons";

type SortField = "track" | "time" | "diff" | "percentSaved" | "authors" | "date" | "category" | "rtaTime" | "rtaPlayer" | "rtaDate" | "inputs";

const DIFFICULTY_TINTS: Record<string, [string, string]> = {
  White: ["bg-white/10", "bg-white/15"],
  Green: ["bg-green-500/10", "bg-green-500/15"],
  Blue: ["bg-blue-500/10", "bg-blue-500/15"],
  Red: ["bg-red-500/10", "bg-red-500/15"],
  Black: ["bg-black/20", "bg-black/60"],
};

const HEADER_BASE = "px-2 py-1 bg-slate-900/90 tracking-[0.18em] uppercase transition whitespace-nowrap";
const HEADER_CLICKABLE = `${HEADER_BASE} border-y border-slate-800 font-normal cursor-pointer hover:text-slate-300`;
const HEADER_STATIC = `${HEADER_BASE} border border-slate-800 font-normal`;
const HEADER_ROW = "flex items-center justify-center gap-1";
const BODY_BASE = "text-slate-100 border-b border-slate-800 group-hover:bg-emerald-400/20 transition-colors";

function classNames(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function getTrackDifficultyTint(category: string, index: number) {
  const tint = DIFFICULTY_TINTS[category];
  return tint ? tint[index % 2] : "";
}

function isRecentEntry(dateStr: string, showRecent: boolean) {

  if (!showRecent) return false;

  const entryDate = new Date(dateStr);
  if (Number.isNaN(entryDate.getTime())) return false;

  const diff = Date.now() - entryDate.getTime();
  const oneMonth = 30 * 24 * 60 * 60 * 1000;
  return diff >= 0 && diff <= oneMonth;
}

function getTmxLink(id: number, game: Game) {
  if (id === 0) return "";

  if (game === "TMNF" || game === "TMNF No Cut") {
    return `https://tmnf.exchange/trackshow/${id}`;
  }

  if (game === "TM2") {
    return `https://tm.mania.exchange/mapshow/${id}`;
  }

  if (game === "ESWC") {
    return `https://nations.tm-exchange.com/trackshow/${id}`;
  }

  return `https://tmuf.exchange/trackshow/${id}`;
}

function getSortValue(row: RecordRow, field: SortField, categoryIndexes: Map<string, number>): string | number {
  switch (field) {
    case "track": {
      const categoryIndex = categoryIndexes.get(row.trackInfo.category) ?.toString().padStart(2, "0");
      const order = row.trackInfo.order ? row.trackInfo.order.toString().padStart(2, "0") : row.track;
      return `${categoryIndex}-${order}`;
    }
    case "time":
      return row.tas?.time_ms ?? Infinity;
    case "inputs":
      return row.tas?.num_inputs ?? Infinity;
    case "diff":
      return row.tas && row.rta ? row.tas.time_ms - row.rta.time_ms : Infinity;
    case "percentSaved":
      return row.tas && row.rta ? (row.tas.time_ms - row.rta.time_ms) / row.rta.time_ms : Infinity;
    case "authors":
      return row.tas?.authors.join(", ") ?? "";
    case "date":
      return row.tas?.date ?? "";
    case "category":
      return CATEGORY_ORDER[row.tas?.category as Category] ?? "";
    case "rtaDate":
      return row.rta?.date ?? "";
    case "rtaPlayer":
      return row.rta?.player ?? "";
    case "rtaTime":
      return row.rta?.time_ms ?? Infinity;
  }
}

interface RecordTableProps {
  game: Game;
  showRta: boolean;
  showRecent: boolean;
  currentRecords: RecordRow[];
  selectedCategory: string;
}

export default function RecordTable({ game, showRta, showRecent, currentRecords, selectedCategory }: RecordTableProps) {

  const [sortField, setSortField] = useState<SortField>("track");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const isTM2 = game === "TM2";
  const lowInputCategory = selectedCategory === "Low Input";

  const categoryIndexes = useMemo(() => (
    new Map(GAME_SETS[game].map((category, index) => [category, index]))
  ), [game]);

  const sortedRows = useMemo(() => {
    return [...currentRecords].sort((a, b) => {
      const aVal = getSortValue(a, sortField, categoryIndexes);
      const bVal = getSortValue(b, sortField, categoryIndexes);

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
      }
      
      const result = String(aVal).localeCompare(String(bVal));
      return sortOrder === "asc" ? result : -result;
    });
  }, [currentRecords, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortField(field);
    setSortOrder("asc");
  };

  const renderSortHeader = (field: SortField, label: string, className = "", colSpan?: number) => (
    <th colSpan={colSpan} onClick={() => handleSort(field)} className={classNames(HEADER_CLICKABLE, className)}>
      <div className={HEADER_ROW}>
        <span>{label}</span>
        <SortIndicator active={sortField === field} order={sortOrder} />
      </div>
    </th>
  );

  return (
    <table className="overflow-x-auto table-auto w-full text-center border-separate border-spacing-0 text-xs lg:text-sm">
      <thead className="text-slate-400">
        <tr>
          {showRecent && <th className="pl-5" />}
          {renderSortHeader("track", "Track", "border border-slate-800 rounded-tl-lg", 2)}

          {lowInputCategory ? (
            <>
              {renderSortHeader("inputs", "Inputs")}
              {renderSortHeader("time", "Time")}
            </>
          ) : (
            <>
              {renderSortHeader("time", "Time")}
              {renderSortHeader("diff", "Diff")}
              {renderSortHeader("percentSaved", "%", "w-[60px]")}
            </>
          )}

          {renderSortHeader("authors", "Authors", "border border-slate-800")}
          {renderSortHeader("date", "Date")}
          {renderSortHeader("category", "Cat.")}
          <th className={classNames(HEADER_STATIC, "rounded-tr-lg")}>{"Links"}</th>

          {showRta && (
            <>
              <th className="pl-3" />
              {renderSortHeader("rtaTime", "RTA", "border border-slate-800 rounded-tl-lg")}
              {renderSortHeader("rtaPlayer", "Player")}
              {renderSortHeader("rtaDate", "Date")}
              <th className={classNames(HEADER_STATIC, "w-[80px] rounded-tr-lg")}>{"Links"}</th>
            </>
          )}
        </tr>
        <tr>
          {showRecent && <th />}
          <th colSpan={lowInputCategory ? 8 : 9} className="border-b border-slate-400" />
          <th />
          <th colSpan={4} className="border-b border-slate-400" />
        </tr>
      </thead>

      <tbody className="font-sans divide-y divide-slate-800 text-center align-middle">
        {sortedRows.map((row, index) => {
          const entry = row.tas;
          const recent = entry ? isRecentEntry(entry.date, showRecent) : false;
          const rtaRecent = row.rta ? isRecentEntry(row.rta.date, showRecent) : false;
          const tmxLink = getTmxLink(row.trackInfo.id, row.trackInfo.tmx ?? row.trackInfo.game);
          const difficultyClass = getTrackDifficultyTint(row.trackInfo.category, index);
          const bgColour = recent ? "italic bg-sky-400/30 text-sky-100" : difficultyClass;
          const rtaColour = rtaRecent ? "italic bg-sky-400/30 text-sky-100" : difficultyClass;
          const isStunt = row.trackInfo.category === "Stunt";
          const isLastRow = index === sortedRows.length - 1;
          const rowCommon = (extra?: string, extra2?: string) => classNames(BODY_BASE, extra, extra2, bgColour);

          return (
            <tr key={row.track} className="group h-[30px] transition-colors">
              {showRecent && (
                <td className="px-1 text-center">
                  <span className="animate-test text-red-500">NEW</span>
                </td>
              )}
              <td className={rowCommon(classNames("px-1", "border-l", isLastRow ? "rounded-bl-lg" : ""))}>
                <EnvironmentIcon environment={row.trackInfo.environment} />
              </td>
              <td className={rowCommon("pr-2 py-1 w-max whitespace-nowrap")}> 
                {tmxLink ? (
                  <a href={tmxLink} target="_blank" rel="noreferrer" className="hover:text-emerald-500 transition">
                    {row.track}
                  </a>
                ) : (
                  row.track
                )}
              </td>

              {lowInputCategory ? (
                <>
                  <td className={rowCommon("px-1.5 border-l")}>{entry?.num_inputs ?? "-"}</td>
                  <td className={rowCommon("px-3 py-1")}>{entry ? formatTime(entry.time_ms, isStunt, isTM2) : "-"}</td>
                </>
              ) : (
                <>
                  <td className={rowCommon("px-1.5 border-l")}>{entry ? formatTime(entry.time_ms, isStunt, isTM2) : "-"}</td>
                  <td
                    className={classNames(BODY_BASE, "px-1.5 py-1 border-slate-800 italic", bgColour,
                      entry && row.rta && ((entry.time_ms - row.rta.time_ms > 0 && !isStunt) || (entry.time_ms - row.rta.time_ms < 0 && isStunt)) ? "text-red-300" : "text-slate-100"
                    )}
                    style={{
                      fontFamily: "DOSVGA, monospace",
                      letterSpacing: "0.05em",
                      textShadow: `0 0 4px #000000, 0 0 10px #000000, 0 0 18px hsla(0, 0%, 100%, 0.59), 1px 1px 0 hsl(0, 0%, 100%, 0.59)`,
                    }}
                  >
                    {entry && row.rta ? formatTime(entry.time_ms - row.rta.time_ms, isStunt, isTM2, true) : "-"}
                  </td>
                  <td className={rowCommon("px-1.5")}>{entry && row.rta ? formatPercentSaved(entry.time_ms, row.rta.time_ms, 3, isStunt) : "-"}</td>
                </>
              )}

              <td className={rowCommon("px-1.5 border-l break-words max-w-[320px] whitespace-normal")}>{entry ? entry.authors.join(", ") : "-"}</td>
              <td className={rowCommon("px-3 border-l whitespace-nowrap")}>{entry ? formatDate(entry.date) : "-"}</td>
              <td className={rowCommon("px-3 whitespace-nowrap")}>{entry ? entry.category : "-"}</td>
              <td className={rowCommon(classNames("px-2 border-x", isLastRow ? "rounded-br-lg" : ""))}>
                {entry ? (
                  <div className="flex items-center justify-center gap-1">
                    <div className="w-5 h-5 flex items-center justify-center">{entry.video && <VideoIcon video_url={entry.video} />}</div>
                    <div className="w-5 h-5 flex items-center justify-center">{entry.replay && <ReplayIcon replay_url={entry.replay} />}</div>
                    <div className="w-5 h-5 flex items-center justify-center">{entry.inputs && <InputsIcon inputs_url={entry.inputs} />}</div>
                    <div className="w-5 h-5 flex items-center justify-center">{entry.replay && <GbxIcon replay_url={entry.replay} track={entry.track} />}</div>
                  </div>
                ) : (
                  "-"
                )}
              </td>

              {showRta && (
                <>
                  <td className="pl-3" />
                  <td className={rowCommon(classNames("px-2 border-l", isLastRow ? "rounded-bl-lg" : ""), rtaColour)}>{row.rta ? formatTime(row.rta.time_ms, isStunt, isTM2) : "-"}</td>
                  <td className={rowCommon("px-2 border-l whitespace-nowrap", rtaColour)}>{row.rta?.player ?? "-"}</td>
                  <td className={rowCommon("px-2 border-l whitespace-nowrap", rtaColour)}>{row.rta ? formatDate(row.rta.date) : "-"}</td>
                  <td className={rowCommon(classNames("px-2 border-x", isLastRow ? "rounded-br-lg" : ""), rtaColour)}>
                    {row.rta ? (
                      <div className="flex items-center justify-center gap-1">
                        <div className="w-5 h-5 flex items-center justify-center">{row.rta.video && <VideoIcon video_url={row.rta.video} />}</div>
                        <div className="w-5 h-5 flex items-center justify-center">{row.rta.replay && <ReplayIcon replay_url={row.rta.replay} />}</div>
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>
                </>
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
