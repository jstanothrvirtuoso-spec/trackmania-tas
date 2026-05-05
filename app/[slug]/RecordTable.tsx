"use client";

import { useState, useMemo } from "react";
import { GameBoard } from "../../lib/leaderboards";
import { tracksTMNF } from "../../lib/TrackLists";
import { useVisibleTables } from "../../lib/RtaContext";

type SortField = "track" | "time" | "vsRta" | "percentSaved" | "authors" | "date" | "rtaTime" | "rtaPlayer" | "rtaDate";
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

const CATEGORY_ORDER = ["White", "Green", "Blue", "Red", "Black"] as const;

type CategoryName = (typeof CATEGORY_ORDER)[number];

function getTrackDifficultyTint(track: string) {
  const trackInfo = tracksTMNF[track];
  if (!trackInfo.category) return "transparent";
  switch (trackInfo.category) {
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

function isTmnEswcBonusTrack(track: string) {
  return track.startsWith("Bonus ");
}

const getTmxLink = (track: string) => {
  const trackInfo = tracksTMNF[track];
  if (!trackInfo.id) return null;
  return `https://tmnf.exchange/trackshow/${trackInfo.id}`;
};

function formatPercentSaved(time: string, vsRta: string) {
  const timeSeconds = parseClockValue(time);
  const vsSeconds = parseClockValue(vsRta);
  const rtaSeconds = timeSeconds - vsSeconds;
  const percent = (-vsSeconds / rtaSeconds) * 100;

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

function renderRtaLinks(links: { video: string; replay: string }) {
  return (
    <div className="flex justify-center gap-2">
      <a
        href={links.video}
        target="_blank"
        rel="noreferrer"
        title="Watch video"
        className="text-sky-400 hover:text-sky-300 transition"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      </a>
      <a
        href={links.replay}
        target="_blank"
        rel="noreferrer"
        title="Download replay"
        className="text-emerald-400 hover:text-emerald-300 transition"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
        </svg>
      </a>
    </div>
  );
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

function renderLinks(links: { video: string; replay: string; inputs: string }) {
  return (
    <div className="flex justify-center gap-2">
      <a
        href={links.video}
        target="_blank"
        rel="noreferrer"
        title="Watch video"
        className="text-sky-400 hover:text-sky-300 transition"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      </a>
      <a
        href={links.replay}
        target="_blank"
        rel="noreferrer"
        title="Download replay"
        className="text-emerald-400 hover:text-emerald-300 transition"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
        </svg>
      </a>
      <a
        href={links.inputs}
        target="_blank"
        rel="noreferrer"
        title="Show inputs"
        className="text-violet-400 hover:text-violet-300 transition"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-8-6z" />
        </svg>
      </a>
      <a
        href={get3dGbxUrl(links.replay)}
        target="_blank"
        rel="noreferrer"
        title="Open 3D GBX tools"
        className="text-orange-400 hover:text-orange-300 transition"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42 9.3-9.29H14V3zM5 5h5V3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-5h-2v5H5V5z" />
        </svg>
      </a>
    </div>
  );
}

interface RecordTableProps {
  game: GameBoard;
  selectedAuthor: string;
}

export default function RecordTable({ game, selectedAuthor }: RecordTableProps) {
  const [sortField, setSortField] = useState<SortField>("track");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const { showRta } = useVisibleTables();

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const sortedEntries = useMemo(() => {
    const sorted = [...game.entries].sort((a, b) => {
      let aVal: string | number = "";
      let bVal: string | number = "";

      switch (sortField) {
        case "track": {
          if (game.slug === "tmn-eswc") {
            const aBonus = isTmnEswcBonusTrack(a.track) ? 1 : 0;
            const bBonus = isTmnEswcBonusTrack(b.track) ? 1 : 0;
            if (aBonus !== bBonus) {
              return sortOrder === "asc" ? aBonus - bBonus : bBonus - aBonus;
            }
          }

          aVal = a.track;
          bVal = b.track;
          break;
        }
        case "time":
          aVal = parseClockValue(a.time);
          bVal = parseClockValue(b.time);
          break;
        case "vsRta":
          aVal = parseClockValue(a.vsRta);
          bVal = parseClockValue(b.vsRta);
          break;
        case "authors":
          aVal = a.authors.join(", ");
          bVal = b.authors.join(", ");
          break;
        case "date":
          aVal = a.date;
          bVal = b.date;
          break;
        case "percentSaved": {
          const aTime = parseClockValue(a.time);
          const aVs = parseClockValue(a.vsRta);
          const aRta = aTime - aVs;

          const bTime = parseClockValue(b.time);
          const bVs = parseClockValue(b.vsRta);
          const bRta = bTime - bVs;

          aVal = aRta !== 0 ? (aVs / aRta) * 100 : 0;
          bVal = bRta !== 0 ? (bVs / bRta) * 100 : 0;
          break;
        }
        case "rtaDate":
          aVal = a.rtaWr?.date || "";
          bVal = b.rtaWr?.date || "";
          break;
        case "rtaPlayer":
          aVal = a.rtaWr?.player || "";
          bVal = b.rtaWr?.player || "";
          break;
        case "rtaTime":
          aVal = parseClockValue(a.rtaWr?.record || "");
          bVal = parseClockValue(b.rtaWr?.record || "");
          break;
      }

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
      }

      const comparison = String(aVal).localeCompare(String(bVal));
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [game.entries, sortField, sortOrder]);

  const filteredEntries = useMemo(() => {
    if (!selectedAuthor) return sortedEntries;
    return sortedEntries.filter((entry) => entry.authors.includes(selectedAuthor));
  }, [sortedEntries, selectedAuthor]);

  const SortIndicator = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortOrder === "asc" ? " ↑" : " ↓";
  };

  return (
    <div className="px-4 pb-4">
      <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950/90">
          <table className="table-auto w-full divide-y divide-slate-800 text-center text-sm">
            <thead className="bg-slate-900/90 text-slate-400">
            <tr>
              <th
                onClick={() => handleSort("track")}
                className="px-2 py-1.5 min-w-[100px] font-normal uppercase tracking-[0.18em] cursor-pointer hover:text-slate-300 transition"
              >
                Track
                <SortIndicator field="track" />
              </th>
              <th className="border-l border-slate-800"></th>
              <th
                onClick={() => handleSort("time")}
                className="px-2 py-1.5 font-normal uppercase tracking-[0.18em] cursor-pointer hover:text-slate-300 transition whitespace-nowrap"
              >
                Time
                <SortIndicator field="time" />
              </th>
              <th
                onClick={() => handleSort("vsRta")}
                className="px-2 py-1.5 font-normal uppercase tracking-[0.18em] cursor-pointer hover:text-slate-300 transition whitespace-nowrap"
              >
                Diff
                <SortIndicator field="vsRta" />
              </th>
              <th
                onClick={() => handleSort("percentSaved")}
                className="px-2 py-1.5 w-[60px] font-normal uppercase tracking-[0.18em] cursor-pointer hover:text-slate-300 transition whitespace-nowrap"
              >
                %
                <SortIndicator field="percentSaved" />
              </th>
              <th className="border-l border-slate-800"></th>
              <th
                onClick={() => handleSort("authors")}
                className="px-2 py-1.5 w-[320px] font-normal uppercase tracking-[0.18em] cursor-pointer hover:text-slate-300 transition"
              >
                Author(s)
                <SortIndicator field="authors" />
              </th>
              <th className="border-l border-slate-800"></th>
              <th
                onClick={() => handleSort("date")}
                className="px-2 py-1.5 font-normal uppercase tracking-[0.18em] cursor-pointer hover:text-slate-300 transition whitespace-nowrap"
              >
                Date
                <SortIndicator field="date" />
              </th>
              <th className="border-l border-slate-800"></th>
              <th className="px-2 py-1.5 font-normal uppercase tracking-[0.18em]">
                Links
              </th>

              {showRta && (
                    <>
                      <th className="pl-6 border-l border-slate-800">

                      </th>
                      <th 
                        onClick={() => handleSort("rtaTime")}
                        className="px-2 py-1.5 font-normal uppercase tracking-[0.18em] cursor-pointer hover:text-slate-300 transition whitespace-nowrap"
                      >
                        RTA
                        <SortIndicator field="rtaTime" />
                      </th>
                      <th 
                        onClick={() => handleSort("rtaPlayer")}
                        className="px-2 py-1.5 font-normal uppercase tracking-[0.18em] cursor-pointer hover:text-slate-300 transition whitespace-nowrap"
                      >
                        Player
                        <SortIndicator field="rtaPlayer" />
                      </th>
                      <th 
                        onClick={() => handleSort("rtaDate")}
                        className="px-2 py-1.5 font-normal uppercase tracking-[0.18em] cursor-pointer hover:text-slate-300 transition whitespace-nowrap"
                      >
                        Date
                        <SortIndicator field="rtaDate" />
                      </th>
                      <th className="px-2 py-1.5 w-[80px] font-normal uppercase tracking-[0.18em]">
                        Links
                      </th>
                    </>
                  )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filteredEntries.map((entry) => {
              const recent = isRecentEntry(entry.date);
              const tmxLink = getTmxLink(entry.track);
              const baseTint = game.slug === "tmnf" ? getTrackDifficultyTint(entry.track) : undefined;
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
                  key={entry.track}
                  className={`border-b border-slate-800 last:border-b-0 transition h-[32px] ${
                    recent ? "italic" : "hover:bg-slate-900/50"
                  }`}
                  style={rowStyle}
                >
                  <td className="px-2.5 py-1 text-slate-100 align-middle w-max whitespace-nowrap">
                    {tmxLink ? (
                      <a
                        href={tmxLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sky-400 hover:text-sky-300"
                      >
                        {entry.track}
                      </a>
                    ) : (
                      entry.track
                    )}
                  </td>
                  <td className="border-l border-slate-800"></td>
                  <td className="px-1.5 py-1 text-slate-100 text-center align-middle">{formatClockValue(entry.time)}</td>
                  <td className="px-1.5 py-1 text-slate-100 text-center italic font-bold align-middle">{formatClockValue(entry.vsRta)}</td>
                  <td className="px-1.5 py-1 text-slate-100 text-center align-middle">{formatPercentSaved(entry.time, entry.vsRta)}</td>
                  <td className="border-l border-slate-800"></td>
                  <td className="px-1.5 py-1 text-slate-100 break-words min-w-[320px] whitespace-normal text-center align-middle">{entry.authors.join(", ")}</td>
                  <td className="border-l border-slate-800"></td>
                  <td className="px-3 py-1 text-slate-100 whitespace-nowrap text-center align-middle">{entry.date}</td>
                  <td className="border-l border-slate-800"></td>
                  <td className="px-3 py-1 text-slate-100 text-center align-middle">{renderLinks(entry.links)}</td>
                  {showRta && (
                    <>
                      <td className="pl-6 border-l border-slate-800"></td>
                      <td className="px-1.5 py-1 text-slate-100 text-center align-middle">{entry.rtaWr ? formatClockValue(entry.rtaWr.record) : "-"}</td>
                      <td className="px-1.5 py-1 text-slate-100 text-center align-middle">{entry.rtaWr?.player}</td>
                      <td className="px-1.5 py-1 text-slate-100 text-center align-middle">{entry.rtaWr?.date}</td>
                      <td className="px-1.5 py-1 text-slate-100 text-center align-middle">
                        {entry.rtaWr ? renderRtaLinks(entry.rtaWr.links) : "-"}
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
