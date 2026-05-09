"use client";

import { useState, useMemo } from "react";
import { categories, Category, Game, trackList, gameSets, Environment } from "../../lib/TrackLists";
import { TasRecords, TasEntry } from "../../lib/TasRecords";
import { RtaRecords, RtaEntry } from "../../lib/RtaRecords";
import { useVisibleTables } from "../../lib/VisibleTablesContext";

type SortField = "track" | "time" | "diff" | "percentSaved" | "authors" | "date" | "rtaTime" | "rtaPlayer" | "rtaDate";
type SortOrder = "asc" | "desc";

function parseClockValue(value: string): number {
  const trimmed = value.trim();
  const negative = trimmed.startsWith("-");
  const positiveValue = negative ? trimmed.slice(1) : trimmed;
  const parts = positiveValue.split(":");

  let seconds = 0;
  if (parts.length === 1) {
    seconds = parseFloat(parts[0]) || 0;
  } else {
    const minutes = parseInt(parts[0], 10) || 0;
    seconds = minutes * 60 + (parseFloat(parts[1]) || 0);
  }

  return negative ? -seconds : seconds;
}

function formatClockValue(value: string): string {
  const seconds = parseClockValue(value);
  const sign = seconds < 0 ? "-" : "";
  const absSeconds = Math.abs(seconds);

  if (absSeconds < 60) {
    return `${sign}${absSeconds.toFixed(2)}`;
  }

  const minutes = Math.floor(absSeconds / 60);
  const remainder = (absSeconds % 60).toFixed(2).padStart(5, "0");
  return `${sign}${minutes}:${remainder}`;
}

function formatTimeDifference(diffMs: number): string {
  const sign = diffMs > 0 ? "+" : "-";
  const abs = Math.abs(diffMs);

  const minutes = Math.floor(abs / 60000);
  const seconds = Math.floor((abs % 60000) / 1000);
  const centiseconds = Math.floor((abs % 1000) / 10);

  if (minutes > 0) {
    return `${sign}${minutes}:${seconds
      .toString()
      .padStart(2, "0")}.${centiseconds
      .toString()
      .padStart(2, "0")}`;
  }

  return `${sign}${seconds}.${centiseconds
    .toString()
    .padStart(2, "0")}`;
}

function getTrackDifficultyTint(category?: string) {
  if (!category) return "transparent";
  switch (category) {
    case "White":
      return "rgba(255, 255, 255, 0.08)"; // white tint
    case "Green":
      return "rgba(34, 197, 94, 0.05)"; // green tint
    case "Blue":
      return "rgba(59, 130, 246, 0.05)"; // blue tint
    case "Red":
      return "rgba(252, 0, 0, 0.05)"; // red tint
    case "Black":
      return "rgba(0, 0, 0, 0.48)"; // subtle dark/black tint
    default:
      return "transparent";
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

function formatPercentSaved(timeMs: number, rtaMs: number) {
  const percent = ((timeMs - rtaMs) / rtaMs) * 100;

  let str = Number(percent).toPrecision(3);

  const isNegative = str.startsWith("-");
  if (isNegative) str = str.slice(1);

  if (str.length > 4) {
    str = str.slice(0, 4);

    if (str.endsWith(".")) {
      str = str.slice(0, -1);
    }
  }

  return `${isNegative ? "-" : ""}${str}`;
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
            <img src="/links/3dgbx.webp" alt="3dGbx" className="w-4 h-4" />
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

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: '2-digit'
  }).replace(/ /g, '-')       
}

function isRecentEntry(dateStr: string) {
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
    return `https://tm2.exchange/trackshow/${trackInfo.id}`;
  } else if (trackInfo.game === "ESWC") {
    return `https://nations.tm-exchange.com/trackshow/${trackInfo.id}`;
  } else {
    return `https://tmuf.exchange/trackshow/${trackInfo.id}`;
  }
};

interface RecordTableProps {
  game: Game;
  selectedAuthor: string;
  selectedCategory: Category;
  selectedEnvironment: Environment;
}

export default function RecordTable({ game, selectedAuthor, selectedCategory, selectedEnvironment }: RecordTableProps) {
  const [sortField, setSortField] = useState<SortField>("track");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const { showRta } = useVisibleTables();

  const allowedCategories = useMemo(() => {
    const targetCategory = game === "TMNF No Cut" ? "No Cut" : selectedCategory;
    const index = categories.indexOf(targetCategory);
    return new Set(categories.slice(index));
  }, [selectedCategory]);

  const rows = useMemo(() => {
    const bestTasByTrack = new Map<string, TasEntry>();
    const bestRtaByTrack = new Map<string, RtaEntry>();
    const targetGame = game === "TMNF No Cut" ? "TMNF" : game;

    Object.values(TasRecords)
      .filter((e) => e.game === targetGame)
      .filter((e) => allowedCategories.has(e.category))
      .forEach((entry) => {
        const existing = bestTasByTrack.get(entry.track);

        if (
          !existing ||
          entry.timeMs < existing.timeMs ||
          (
            entry.timeMs === existing.timeMs &&
            new Date(entry.date).getTime() <
              new Date(existing.date).getTime()
          )
        ) {
          bestTasByTrack.set(entry.track, entry);
        }
      });

    Object.values(RtaRecords)
      .filter((e) => e.game === game)
      .forEach((entry) => {
        const existing = bestRtaByTrack.get(entry.track);

        if (
          !existing ||
          entry.timeMs < existing.timeMs ||
          (
            entry.timeMs === existing.timeMs &&
            new Date(entry.date).getTime() <
              new Date(existing.date).getTime()
          )
        ) {
          bestRtaByTrack.set(entry.track, entry);
        }
      });

    return Object.entries(trackList)
      .filter(([, info]) => info.game === game)
      .map(([track, trackInfo]) => ({
        track,
        trackInfo,
        tas: bestTasByTrack.get(trackInfo.track || track) ?? null,
        rta: bestRtaByTrack.get(trackInfo.track || track) ?? null,
      }));
  }, [game, selectedCategory]);

  const sortedRows = useMemo(() => {
    const sorted = [...rows].sort((a, b) => {
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
          aVal = parseClockValue(a.rta?.record || "");
          bVal = parseClockValue(b.rta?.record || "");
          break;
      }

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
      }

      const comparison = String(aVal).localeCompare(String(bVal));
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [rows, sortField, sortOrder]);

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
      <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950/90">
          <table className="table-auto w-full divide-y divide-slate-500 text-center text-sm">
            <thead className="bg-slate-900/90 text-slate-400">
            <tr>
              <th
                colSpan={2}
                onClick={() => handleSort("track")}
                className="px-2 py-1.5 font-normal uppercase tracking-[0.18em] cursor-pointer hover:text-slate-300 transition whitespace-nowrap"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Track</span>
                  <SortIndicator field="track" />
                </div>
              </th>
              <th className="border-l border-slate-800"></th>
              <th
                onClick={() => handleSort("time")}
                className="px-2 py-1.5 font-normal uppercase tracking-[0.18em] cursor-pointer hover:text-slate-300 transition whitespace-nowrap"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Time</span>
                  <SortIndicator field="time" />
                </div>
              </th>
              <th
                onClick={() => handleSort("diff")}
                className="px-2 py-1.5 font-normal uppercase tracking-[0.18em] cursor-pointer hover:text-slate-300 transition whitespace-nowrap"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Diff</span>
                  <SortIndicator field="diff" />
                </div>
              </th>
              <th
                onClick={() => handleSort("percentSaved")}
                className="px-2 py-1.5 w-[60px] font-normal uppercase tracking-[0.18em] cursor-pointer hover:text-slate-300 transition whitespace-nowrap"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>%</span>
                  <SortIndicator field="percentSaved" />
                </div>
              </th>
              <th className="border-l border-slate-800"></th>
              <th
                onClick={() => handleSort("authors")}
                className="px-2 py-1.5 w-[320px] font-normal uppercase tracking-[0.18em] cursor-pointer hover:text-slate-300 transition"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Authors</span>
                  <SortIndicator field="authors" />
                </div>
              </th>
              <th className="border-l border-slate-800"></th>
              <th
                onClick={() => handleSort("date")}
                className="px-2 py-1.5 font-normal uppercase tracking-[0.18em] cursor-pointer hover:text-slate-300 transition whitespace-nowrap"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Date</span>
                  <SortIndicator field="date" />
                </div>
              </th>
              <th className="px-2 py-1.5 font-normal uppercase tracking-[0.18em]">
                Cat.
              </th>
              <th className="border-l border-slate-800"></th>
              <th className="px-2 py-1.5 font-normal uppercase tracking-[0.18em]">
                Links
              </th>

              {showRta && (
                    <>
                      <th className="pl-6 border-l border-slate-800">

                      </th>
                      <th className="border-l border-slate-800"></th>
                      <th 
                        onClick={() => handleSort("rtaTime")}
                        className="px-2 py-1.5 font-normal uppercase tracking-[0.18em] cursor-pointer hover:text-slate-300 transition whitespace-nowrap"
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span>RTA</span>
                          <SortIndicator field="rtaTime" />
                        </div>
                      </th>
                      <th className="border-l border-slate-800"></th>
                      <th 
                        onClick={() => handleSort("rtaPlayer")}
                        className="px-2 py-1.5 font-normal uppercase tracking-[0.18em] cursor-pointer hover:text-slate-300 transition whitespace-nowrap"
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span>Player</span>
                          <SortIndicator field="rtaPlayer" />
                        </div>
                      </th>
                      <th className="border-l border-slate-800"></th>
                      <th 
                        onClick={() => handleSort("rtaDate")}
                        className="px-2 py-1.5 font-normal uppercase tracking-[0.18em] cursor-pointer hover:text-slate-300 transition whitespace-nowrap"
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span>Date</span>
                          <SortIndicator field="rtaDate" />
                        </div>
                      </th>
                      <th className="border-l border-slate-800"></th>
                      <th className="px-2 py-1.5 w-[80px] font-normal uppercase tracking-[0.18em]">
                        Links
                      </th>
                    </>
                  )}
            </tr>
          </thead>
          <tbody className="font-sans divide-y divide-slate-800">
            {filteredRows.map((row) => {
              const entry = row.tas;
              const recent = entry ? isRecentEntry(entry.date) : false;
              const tmxLink = getTmxLink(row.trackInfo);
              const baseTint = getTrackDifficultyTint(row.trackInfo.category);
              const rowStyle = recent
                ? {
                    backgroundColor: "rgba(56, 191, 248, 0.29)",
                    color: "#e0f2fe",
                    boxShadow: "inset 0 0 0 1px rgba(56, 189, 248, 0.24)",
                  }
                : baseTint
                ? { backgroundColor: baseTint }
                : undefined;

              return (
                <tr
                  key={row.track}
                  className={`border-b border-slate-800 last:border-b-0 transition h-[30px] ${
                    recent ? "italic" : "hover:bg-slate-900/50"
                  }`}
                  style={rowStyle}
                >
                  <td className="px-1.5 py-1 text-slate-100 text-center align-middle">
                    { getEnvironmentSymbol(row.trackInfo.environment) }
                  </td>
                  <td className="px-2.5 py-1 text-slate-100 align-middle w-max whitespace-nowrap">
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
                  <td className="border-l border-slate-800"></td>
                  <td className="px-1.5 py-1 text-slate-100 text-center align-middle">
                    {entry ? formatClockValue(entry.record) : "-"}
                  </td>
                  <td
                    className={`px-1.5 py-1 text-center italic font-bold align-middle ${
                      entry && row.rta && entry.timeMs - row.rta.timeMs > 0
                        ? "text-red-300"
                        : "text-slate-100"
                    }`}
                  >
                    {entry && row.rta
                      ? formatTimeDifference(entry.timeMs - row.rta.timeMs)
                      : "-"}
                  </td>
                  <td className="px-1.5 py-1 text-slate-100 text-center align-middle">
                    {entry && row.rta
                      ? formatPercentSaved(entry.timeMs, row.rta.timeMs)
                      : "-"}
                  </td>
                  <td className="border-l border-slate-800"></td>
                  <td className="px-1.5 py-1 text-slate-100 break-words min-w-[320px] whitespace-normal text-center align-middle">
                    {entry ? entry.authors.join(", ") : "-"}
                  </td>
                  <td className="border-l border-slate-800"></td>
                  <td className="px-3 py-1 text-slate-100 whitespace-nowrap text-center align-middle">
                    {entry ? formatDate(entry.date) : "-"}
                  </td>
                  <td className="px-3 py-1 text-slate-100 whitespace-nowrap text-center align-middle">
                    {entry ? entry.category : "-"}
                  </td>
                  <td className="border-l border-slate-800"></td>
                  <td className="px-2 py-1 text-slate-100 text-center align-middle">
                    {entry ? renderLinks({ video: entry.video, replay: entry.replay, inputs: entry.inputs }) : "-"}
                  </td>
                  {showRta && (
                    <>
                      <td className="pl-6 border-l border-slate-800"></td>
                      <td className="border-l border-slate-800"></td>
                      <td className="px-2 py-1 text-slate-100 text-center align-middle">
                        {row.rta ? formatClockValue(row.rta.record) : "-"}
                      </td>
                      <td className="border-l border-slate-800"></td>
                      <td className="px-2 py-1 text-slate-100 text-center align-middle">
                        {row.rta?.player ?? "-"}
                      </td>
                      <td className="border-l border-slate-800"></td>
                      <td className="px-2 py-1 text-slate-100 text-center align-middle">
                        {row.rta ? formatDate(row.rta.date) : "-"}
                      </td>
                      <td className="border-l border-slate-800"></td>
                      <td className="px-2 py-1 text-slate-100 text-center align-middle">
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
