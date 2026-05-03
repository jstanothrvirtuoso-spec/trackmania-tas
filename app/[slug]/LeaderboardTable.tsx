"use client";

import { useState, useMemo } from "react";
import { GameBoard } from "../../lib/leaderboards";

type SortField = "track" | "time" | "vsRta" | "percentSaved" | "authors" | "date";
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

function getTrackDifficultyTint(track: string) {
  const difficulty = track.charAt(0).toUpperCase();
  switch (difficulty) {
    case "A":
      return "rgba(248, 250, 252, 0.08)"; // white tint
    case "B":
      return "rgba(34, 197, 94, 0.08)"; // green tint
    case "C":
      return "rgba(59, 130, 246, 0.08)"; // blue tint
    case "D":
      return "rgba(239, 68, 68, 0.08)"; // red tint
    case "E":
      return "rgba(148, 163, 184, 0.10)"; // subtle dark/black tint
    default:
      return "transparent";
  }
}

function formatPercentSaved(time: string, vsRta: string) {
  const timeSeconds = parseClockValue(time);
  const vsSeconds = parseClockValue(vsRta);
  const rtaSeconds = timeSeconds - vsSeconds;
  const percent = (-vsSeconds / rtaSeconds) * 100;

   let str = Number(percent).toPrecision(3);

  // step 2: trim to max 4 characters (excluding minus sign)
  const isNegative = str.startsWith("-");
  if (isNegative) str = str.slice(1);

  if (str.length > 4) {
    str = str.slice(0, 4);

    // avoid trailing decimal point like "12."
    if (str.endsWith(".")) {
      str = str.slice(0, -1);
    }
  }

  return `${isNegative ? "-" : ""}${str}%`;
}

const TOOLS_LINK = "https://3d.gbx.tools";

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

function renderLinks(links: { video: string; replay: string; inputs: string }) {
  return (
    <div className="flex gap-3">
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
        title="Download inputs"
        className="text-violet-400 hover:text-violet-300 transition"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-8-6z" />
        </svg>
      </a>
      <a
        href={TOOLS_LINK}
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

export default function LeaderboardTable({ game }: { game: GameBoard }) {
  const [sortField, setSortField] = useState<SortField>("track");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

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
        case "track":
          aVal = a.track;
          bVal = b.track;
          break;
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
      }

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
      }

      const comparison = String(aVal).localeCompare(String(bVal));
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [game.entries, sortField, sortOrder]);

  const SortIndicator = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortOrder === "asc" ? " ↑" : " ↓";
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950/90">
        <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
          <thead className="bg-slate-900/90 text-slate-400">
            <tr>
              <th
                onClick={() => handleSort("track")}
                className="px-4 py-2 font-normal uppercase tracking-[0.18em] cursor-pointer hover:text-slate-300 transition"
              >
                Track
                <SortIndicator field="track" />
              </th>
              <th
                onClick={() => handleSort("time")}
                className="px-4 py-2 font-normal uppercase tracking-[0.18em] cursor-pointer hover:text-slate-300 transition"
              >
                Time
                <SortIndicator field="time" />
              </th>
              <th
                onClick={() => handleSort("vsRta")}
                className="px-4 py-2 font-normal uppercase tracking-[0.18em] cursor-pointer hover:text-slate-300 transition"
              >
                vs. RTA
                <SortIndicator field="vsRta" />
              </th>
              <th
                onClick={() => handleSort("percentSaved")}
                className="px-4 py-2 font-normal uppercase tracking-[0.18em] cursor-pointer hover:text-slate-300 transition"
              >
                % Saved
                <SortIndicator field="percentSaved" />
              </th>
              <th
                onClick={() => handleSort("authors")}
                className="px-4 py-2 font-normal uppercase tracking-[0.18em] cursor-pointer hover:text-slate-300 transition"
              >
                Author(s)
                <SortIndicator field="authors" />
              </th>
              <th
                onClick={() => handleSort("date")}
                className="px-4 py-2 font-normal uppercase tracking-[0.18em] cursor-pointer hover:text-slate-300 transition"
              >
                Date
                <SortIndicator field="date" />
              </th>
              <th className="px-4 py-2 font-normal uppercase tracking-[0.18em]">Links</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {sortedEntries.map((entry) => {
              const recent = isRecentEntry(entry.date);
              const baseTint = game.slug === "tmnf" ? getTrackDifficultyTint(entry.track) : undefined;
              const rowStyle = recent
                ? {
                    backgroundColor: "rgba(56, 189, 248, 0.20)",
                    color: "#e0f2fe",
                    boxShadow: "inset 0 0 0 1px rgba(56, 189, 248, 0.24)",
                  }
                : baseTint
                ? { backgroundColor: baseTint }
                : undefined;

              return (
                <tr
                  key={entry.track}
                  className={`border-b border-slate-800 last:border-b-0 transition ${
                    recent ? "italic" : "hover:bg-slate-900/50"
                  }`}
                  style={rowStyle}
                >
                  <td className="px-4 py-2 text-slate-100">{entry.track}</td>
                  <td className="px-4 py-2 text-slate-100">{formatClockValue(entry.time)}</td>
                  <td className="px-4 py-2 text-slate-300">{formatClockValue(entry.vsRta)}</td>
                  <td className="px-4 py-2 text-slate-300">{formatPercentSaved(entry.time, entry.vsRta)}</td>
                  <td className="px-4 py-2 text-slate-100">{entry.authors.join(", ")}</td>
                  <td className="px-4 py-2 text-slate-300">{entry.date}</td>
                  <td className="px-4 py-2">{renderLinks(entry.links)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
