"use client";

import { useState, useMemo } from "react";
import { Game, gameSets, Environment, RecordRow } from "../../lib/TrackLists";
import { useVisibleTables } from "../../lib/VisibleTablesContext";

type SortField = "track" | "time" | "diff" | "percentSaved" | "authors" | "date" | "rtaTime" | "rtaPlayer" | "rtaDate";
type SortOrder = "asc" | "desc";

function formatTime(timeMs: number, isStunt: boolean, isTM2: boolean, showSign: boolean = false): string {

  if (isStunt) {
    const sign = showSign && timeMs !== 0 ? timeMs > 0 ? "+" : "-" : "";
    return `${sign}${timeMs / 1000}`
  }

  const sign = showSign ? timeMs > 0 ? "+" : "-" : "";
  const abs = Math.abs(timeMs);
  const minutes = Math.floor(abs / 60000);
  const seconds = Math.floor((abs % 60000) / 1000);
  const decimals = isTM2 ? 3 : 2
  const split = isTM2 ? Math.round(abs) % 1000 : Math.round(abs / 10) % 100;

  if (minutes > 0) {
    return `${sign}${minutes}:${seconds
      .toString()
      .padStart(2, "0")}.${split
      .toString()
      .padStart(decimals, "0")}`;
  }

  return `${sign}${seconds}.${split
    .toString()
    .padStart(decimals, "0")}`;
}

function formatPercentSaved(timeMs: number, rtaMs: number, isStunt: boolean) {

  const percent = ((timeMs - rtaMs) / rtaMs) * (isStunt ? -100 : 100);
  let str = Number(percent).toPrecision(3);

  const isNegative = str.startsWith("-");
  if (isNegative) str = str.slice(1);

  if (str.length > 4) {
    str = str.slice(0, 4);

    if (str.endsWith(".")) {
      str = str.slice(0, -1);
    }
  }

  if (isStunt) {
    return `${percent <= 0 ? "" : "-"}${str}`;
  } else {
    return `${percent <= 0 ? "" : "+"}${str}`;
  }
  
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: '2-digit'
  }).replace(/ /g, '-')       
}

function getTrackDifficultyTint(category: string, i: number) {
  switch (category) {
    case "White":
      return i % 2 === 0 ? "bg-white/10" : "bg-white/15";
    case "Green":
      return i % 2 === 0 ? "bg-green-500/10" : "bg-green-500/15";
    case "Blue":
      return  i % 2 === 0 ? "bg-blue-500/10" : "bg-blue-500/15";
    case "Red":
      return  i % 2 === 0 ? "bg-red-500/10" : "bg-red-500/15";
    case "Black":
      return i % 2 === 0 ? "bg-black/20" : "bg-black/60";
    default:
      return "";
  }
}

function getEnvironmentSymbol(env: string) {
  const key = env.toLowerCase().replace(/\s+/g, "-")

  return (
    <div className="w-6 h-5 flex items-center justify-center">
      <img
        src={`/environments/${key}.webp`}
        alt={env}
        className="w-5 h-5"
      />
    </div>
  )
}

function renderLinks(links: { video: string; replay: string; inputs: string }) {
  return (
    <div className="flex items-center justify-center gap-1">
      <div className="w-5 h-5 flex items-center justify-center">
        {links.video && (
          <a
            href={links.video}
            target="_blank"
            rel="noreferrer"
            title="Watch video"
            className="hover:opacity-80 transition"
          >
            { links.video.includes("discord.") 
              ? <img src="/links/discord.webp" alt="Replay" className="w-4 h-4" />
              : links.video.includes("streamable.com")
                ? <img src="/links/streamable.webp" alt="Replay" className="w-4.5" />
                : <img src="/links/youtube.webp" alt="Replay" className="w-4 h-4" />
            }
          </a>
        )}
      </div>

      <div className="w-5 h-5 flex items-center justify-center">
        {links.replay && (
          <a
            href={links.replay}
            target="_blank"
            rel="noreferrer"
            title="Download replay"
            className="hover:opacity-80 transition"
          >
            { links.replay.includes("discord.") 
              ? <img src="/links/discord.webp" alt="Replay" className="w-auto h-4" />
              : <img src="/links/replay.webp" alt="Replay" className="w-3.5 h-3.5" />
            }
          </a>
        )}
      </div>

      <div className="w-5 h-5 flex items-center justify-center">
        {links.inputs && (
          <a
            href={links.inputs}
            target="_blank"
            rel="noreferrer"
            title="Show inputs"
            className="hover:opacity-80 transition"
          >
            <img src="/links/pastebin.webp" alt="Inputs" className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      <div className="w-5 h-5 flex items-center justify-center">
        {links.replay && (
          <a
            href={get3dGbxUrl(links.replay)}
            target="_blank"
            rel="noreferrer"
            title="Open 3D GBX tools"
            className="hover:opacity-80 transition"
          >
            <img src="/links/3dgbx.webp" alt="3dGbx" className="w-4.5" />
          </a>
        )}
      </div>
    </div>
  )
}

function renderRtaLinks(links: { video: string; replay: string }) {
  return (
    <div className="flex items-center justify-center gap-1">
      <div className="w-5 h-5 flex items-center justify-center">
        {links.video && (
          <a
            href={links.video}
            target="_blank"
            rel="noreferrer"
            title="Watch video"
            className="hover:opacity-80 transition"
          >
            <img src="/links/youtube.webp" alt="YouTube" className="w-4 h-4" />
          </a>
        )}
      </div>

      <div className="w-5 h-5 flex items-center justify-center">
        {links.replay && (
          <a
            href={links.replay}
            target="_blank"
            rel="noreferrer"
            title="Download replay"
            className="hover:opacity-80 transition"
          >
            <img src="/links/replay.webp" alt="Replay" className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}

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
}

function get3dGbxUrl(url?: string) {
  const id = url ? new URL(url).searchParams.get("id") : null;
  return id
    ? `https://3d.gbx.tools/view/replay?gd=${id}`
    : "https://3d.gbx.tools";
}

const getTmxLink = (trackInfo: { id: number; game: Game }) => {
  if (trackInfo.game === "TMNF" || trackInfo.game === "TMNF No Cut") {
    return `https://tmnf.exchange/trackshow/${trackInfo.id}`;
  } else if (trackInfo.game === "TM2") {
    return `https://tm.mania.exchange/mapshow/${trackInfo.id}`;
  } else if (trackInfo.game === "ESWC") {
    return `https://nations.tm-exchange.com/trackshow/${trackInfo.id}`;
  } else {
    return `https://tmuf.exchange/trackshow/${trackInfo.id}`;
  }
};

interface RecordTableProps {
  game: Game;
  currentRecords: RecordRow[];
  selectedAuthor: string;
  selectedEnvironment: Environment;
}

export default function RecordTable({ game, currentRecords, selectedAuthor, selectedEnvironment }: RecordTableProps) {
  const [sortField, setSortField] = useState<SortField>("track");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const { showRta, showRecent } = useVisibleTables();

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
          const gameSet = gameSets[game] as readonly string[];
          const aCategoryIndex = gameSet.indexOf(a.trackInfo.category).toString().padStart(2, "0");
          const bCategoryIndex = gameSet.indexOf(b.trackInfo.category).toString().padStart(2, "0");
          const aOrder = a.trackInfo.order ? a.trackInfo.order.toString().padStart(2, "0") : a.track;
          const bOrder = b.trackInfo.order ? b.trackInfo.order.toString().padStart(2, "0") : b.track;
          aVal = `${aCategoryIndex}-${aOrder}`;
          bVal = `${bCategoryIndex}-${bOrder}`;
          break;
        }
        case "time":
          if (aHasEntry !== bHasEntry) return aHasEntry ? -1 : 1;
          aVal = a.tas ? a.tas.timeMs : 0;
          bVal = b.tas ? b.tas.timeMs : 0;
          break;
        case "diff":
          if (aHasEntry !== bHasEntry) return aHasEntry ? -1 : 1;
          aVal = a.tas && a.rta ? a.tas.timeMs - a.rta.timeMs : 0;
          bVal = b.tas && b.rta ? b.tas.timeMs - b.rta.timeMs : 0;
          break;
        case "percentSaved":
          if (aHasEntry !== bHasEntry) return aHasEntry ? -1 : 1;
          aVal = a.tas && a.rta ? (a.tas.timeMs - a.rta.timeMs) / a.rta.timeMs : 0;
          bVal = b.tas && b.rta ? (b.tas.timeMs - b.rta.timeMs) / b.rta.timeMs : 0;
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
          aVal = a.rta?.timeMs || 0;
          bVal = b.rta?.timeMs || 0;
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

  const filteredRows = useMemo(() => {
    return sortedRows.filter((row) => {
      const matchesAuthor =
        !selectedAuthor ||
        row.tas?.authors.includes(selectedAuthor)

      const matchesEnvironment =
        selectedEnvironment === "All" ||
        row.trackInfo.environment === selectedEnvironment

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
    <div className="px-4 pb-4">
      <div className="overflow-x-auto">
        <table className="table-auto w-full text-center text-sm border-separate border-spacing-0">
          <thead className="text-slate-400">
            <tr>
              <th
                colSpan={2}
                onClick={() => handleSort("track")}
                className="px-2 py-1.5 bg-slate-900/90 border border-slate-800 font-normal uppercase rounded-tl-lg tracking-[0.18em] cursor-pointer hover:text-slate-300 transition whitespace-nowrap"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Track</span>
                  <SortIndicator field="track" />
                </div>
              </th>
              <th
                onClick={() => handleSort("time")}
                className="px-2 py-1.5 bg-slate-900/90 border-y border-slate-800 font-normal uppercase tracking-[0.18em] cursor-pointer hover:text-slate-300 transition whitespace-nowrap"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Time</span>
                  <SortIndicator field="time" />
                </div>
              </th>
              <th
                onClick={() => handleSort("diff")}
                className="px-2 py-1.5 bg-slate-900/90 border-y border-slate-800 font-normal uppercase tracking-[0.18em] cursor-pointer hover:text-slate-300 transition whitespace-nowrap"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Diff</span>
                  <SortIndicator field="diff" />
                </div>
              </th>
              <th
                onClick={() => handleSort("percentSaved")}
                className="px-2 py-1.5 bg-slate-900/90 border-y border-slate-800 w-[60px] font-normal uppercase tracking-[0.18em] cursor-pointer hover:text-slate-300 transition whitespace-nowrap"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>%</span>
                  <SortIndicator field="percentSaved" />
                </div>
              </th>
              <th
                onClick={() => handleSort("authors")}
                className="px-2 py-1.5 bg-slate-900/90 border border-slate-800 w-[320px] font-normal uppercase tracking-[0.18em] cursor-pointer hover:text-slate-300 transition"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Authors</span>
                  <SortIndicator field="authors" />
                </div>
              </th>
              <th
                onClick={() => handleSort("date")}
                className="px-2 py-1.5 bg-slate-900/90 border-y border-slate-800 font-normal uppercase tracking-[0.18em] cursor-pointer hover:text-slate-300 transition whitespace-nowrap"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Date</span>
                  <SortIndicator field="date" />
                </div>
              </th>
              <th className="px-2 py-1.5 bg-slate-900/90 border-y border-slate-800 font-normal uppercase tracking-[0.18em]">
                Cat.
              </th>
              <th className="px-2 py-1.5 bg-slate-900/90 border border-slate-800 font-normal uppercase rounded-tr-lg tracking-[0.18em]">
                Links
              </th>

              {showRta && (
                <>
                  <th className="pl-6 bg-transparent"></th>
                  <th 
                    onClick={() => handleSort("rtaTime")}
                    className="px-2 py-1.5 bg-slate-900/90 border border-slate-800 font-normal uppercase rounded-tl-lg tracking-[0.18em] cursor-pointer hover:text-slate-300 transition whitespace-nowrap"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>RTA</span>
                      <SortIndicator field="rtaTime" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort("rtaPlayer")}
                    className="px-2 py-1.5 bg-slate-900/90 border border-slate-800 font-normal uppercase tracking-[0.18em] cursor-pointer hover:text-slate-300 transition whitespace-nowrap"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Player</span>
                      <SortIndicator field="rtaPlayer" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort("rtaDate")}
                    className="px-2 py-1.5 bg-slate-900/90 border border-slate-800 font-normal uppercase tracking-[0.18em] cursor-pointer hover:text-slate-300 transition whitespace-nowrap"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Date</span>
                      <SortIndicator field="rtaDate" />
                    </div>
                  </th>
                  <th className="px-2 py-1.5 bg-slate-900/90 border border-slate-800 w-[80px] font-normal uppercase rounded-tr-lg tracking-[0.18em]">
                    Links
                  </th>
                </>
              )}
            </tr>
            <tr>
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
              const recent = entry ? isRecentEntry(entry.date, showRecent) : false;
              const rtaRecent = row.rta ? isRecentEntry(row.rta.date, showRecent) : false;
              const tmxLink = getTmxLink(row.trackInfo);
              const colour = getTrackDifficultyTint(row.trackInfo.category, i)
              const bgColour = `${recent ? "italic bg-sky-400/30 text-sky-100" : colour}`
              const rtaColour = `${rtaRecent ? "italic bg-sky-400/30 text-sky-100" : colour}`
              const isStunt = row.trackInfo.category === "Stunt"
              const isTM2 = game === "TM2"

              return (
                <tr
                  key={row.track}
                  className="h-[30px] transition-colors hover:bg-emerald-400/20"
                  // style={ recent ? { boxShadow: "inset 0 0 0 1px rgba(56, 189, 248, 0.24)" } : undefined }
                >
                  <td
                    className={`pl-1.5 pr-1 py-1 border-b border-l border-slate-800 text-slate-100 text-center align-middle ${bgColour} ${
                      i === filteredRows.length - 1 ? "rounded-bl-lg" : ""
                    }`}
                  >
                    {getEnvironmentSymbol(row.trackInfo.environment)}
                  </td>
                  <td className={ `pr-2 py-1 text-slate-100 border-b border-slate-800 align-middle w-max whitespace-nowrap ${bgColour}` }>
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
                  <td className={ `px-1.5 py-1 text-slate-100 border-b border-l border-slate-800 text-center align-middle ${bgColour}` }>
                    {entry ? formatTime(entry.timeMs, isStunt, isTM2) : "-"}
                  </td>
                  <td
                    className={ `px-1.5 py-1 border-b border-slate-800 text-center italic font-bold align-middle ${bgColour} ${
                      entry && row.rta && ((entry.timeMs - row.rta.timeMs > 0 && !isStunt) || (entry.timeMs - row.rta.timeMs < 0 && isStunt))
                        ? "text-red-300"
                        : "text-slate-100"
                    }`}
                  >
                    {entry && row.rta
                      ? formatTime(entry.timeMs - row.rta.timeMs, isStunt, isTM2, true)
                      : "-"}
                  </td>
                  <td className={ `px-1.5 py-1 text-slate-100 border-b border-slate-800 text-center align-middle ${bgColour}` }>
                    {entry && row.rta
                      ? formatPercentSaved(entry.timeMs, row.rta.timeMs, isStunt)
                      : "-"}
                  </td>
                  <td className={ `px-1.5 py-1 text-slate-100 border-b border-l border-slate-800 break-words min-w-[320px] whitespace-normal text-center align-middle ${bgColour}` }>
                    {entry ? entry.authors.join(", ") : "-"}
                  </td>
                  <td className={ `px-3 py-1 text-slate-100 border-b border-l border-slate-800 whitespace-nowrap text-center align-middle ${bgColour}` }>
                    {entry ? formatDate(entry.date) : "-"}
                  </td>
                  <td className={ `px-3 py-1 text-slate-100 border-b border-slate-800 whitespace-nowrap text-center align-middle ${bgColour}` }>
                    {entry ? entry.category : "-"}
                  </td>
                  
                  <td className={ `px-2 py-1 text-slate-100 border-b border-x border-slate-800 text-center align-middle ${bgColour} ${
                        i === filteredRows.length - 1 ? "rounded-br-lg" : ""
                      }`}>
                    {entry ? renderLinks({ video: entry.video, replay: entry.replay, inputs: entry.inputs }) : "-"}
                  </td>
                  {showRta && (
                    <>
                      <td className="pl-6"></td>
                      <td className={ `px-2 py-1 text-slate-100 border-b border-l border-slate-800 text-center align-middle ${rtaColour} ${
                            i === filteredRows.length - 1 ? "rounded-bl-lg" : ""
                          }`}>
                        {row.rta ? formatTime(row.rta.timeMs, isStunt, isTM2) : "-"}
                      </td>
                      <td className={ `px-2 py-1 text-slate-100 border-b border-l border-slate-800 text-center align-middle ${rtaColour}` }>
                        {row.rta?.player ?? "-"}
                      </td>
                      <td className={ `px-2 py-1 text-slate-100 border-b border-l border-slate-800 text-center align-middle whitespace-nowrap ${rtaColour}` }>
                        {row.rta ? formatDate(row.rta.date) : "-"}
                      </td>
                      <td className={ `px-2 py-1 text-slate-100 border-b border-x border-slate-800 text-center align-middle ${rtaColour} ${
                            i === filteredRows.length - 1 ? "rounded-br-lg" : ""
                          }`}>
                        {row.rta ? renderRtaLinks({ video: row.rta.video, replay: row.rta.replay }) : "-"}
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
