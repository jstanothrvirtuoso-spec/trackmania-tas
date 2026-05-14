"use client";

import { useMemo, useState } from "react";
import { useTasRecords } from "@/lib/TasRecords";
import { useRtaRecords, buildBestRtaByTrack } from "@/lib/RtaRecords";
import { TasEntry, trackList } from "@/lib/TrackLists";
import { formatTime } from "@/utils/formatting";

type AuthorStat = {
  author: string;
  tases: number;
  contributions: number;
  totalSaved: number;
};

type SortField = "author" | "tases" | "contributions" | "totalSaved";
type SortOrder = "asc" | "desc";

export default function GlobalLeaderboard() {
  const [sortField, setSortField] = useState<SortField>("tases");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const { data: rtaRecords = [] } = useRtaRecords();
  const { data: tasRecords = [] } = useTasRecords();

  const bestRtaByTrack = useMemo(() => {
    if (!rtaRecords.length) return new Map();
    return buildBestRtaByTrack(rtaRecords);
  }, [rtaRecords]);

  const authorStats = useMemo(() => {
    const authorMap = new Map<string, AuthorStat>();
    const bestTasByTrack = new Map<string, TasEntry>();

    Object.values(tasRecords).forEach((entry) => {
      const existing = bestTasByTrack.get(entry.track);

      if (
        !existing ||
        entry.time_ms < existing.time_ms ||
        (entry.time_ms === existing.time_ms &&
          new Date(entry.date).getTime() < new Date(existing.date).getTime())
      ) {
        bestTasByTrack.set(entry.track, entry);
      }
    });

    bestTasByTrack.forEach((entry) => {
      const rta = bestRtaByTrack.get(entry.track);
      const savedMs =
        trackList[entry.track].overrideTimeSaved ?? rta
          ? Math.max(0, rta.time_ms - entry.time_ms)
          : 0;

      const contributionPerAuthor = 1 / entry.authors.length;
      const savedPerAuthor = savedMs / entry.authors.length;

      entry.authors.forEach((author) => {
        const current = authorMap.get(author);

        if (current) {
          current.tases += 1;
          current.contributions += contributionPerAuthor;
          current.totalSaved += savedPerAuthor;
        } else {
          authorMap.set(author, {
            author,
            tases: 1,
            contributions: contributionPerAuthor,
            totalSaved: savedPerAuthor,
          });
        }
      });
    });

    return Array.from(authorMap.values());
  }, [tasRecords, bestRtaByTrack]);

  const sortedAuthorStats = useMemo(() => {
    return [...authorStats].sort((a, b) => {
      let aVal: string | number = "";
      let bVal: string | number = "";

      switch (sortField) {
        case "author":
          aVal = a.author;
          bVal = b.author;
          break;
        case "tases":
          aVal = a.tases;
          bVal = b.tases;
          break;
        case "contributions":
          aVal = a.contributions;
          bVal = b.contributions;
          break;
        case "totalSaved":
          aVal = a.totalSaved;
          bVal = b.totalSaved;
          break;
      }

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
      }

      return sortOrder === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [authorStats, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder(field === "author" ? "asc" : "desc");
    }
  };

  const SortIndicator = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortOrder === "asc" ? " ↑" : " ↓";
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-3 sm:px-6 lg:px-8">
      <header className="mb-3 rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-xl shadow-slate-950/30 backdrop-blur-md">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Combined Leaderboard
          </h1>

          <div className="rounded-3xl bg-slate-800/80 px-4 py-3 text-sm text-slate-300 ring-1 ring-slate-700">
            {authorStats.length} authors
          </div>
        </div>

        <p className="mt-6 max-w-2xl text-slate-400 sm:text-base">
          Tracks all TAS contributions across every leaderboard.
        </p>
      </header>

      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/90">
        <table className="min-w-full divide-y divide-slate-800 text-center text-sm">
          <thead className="bg-slate-900/90 text-slate-400">
            <tr>
              <th onClick={() => handleSort("author")} className="cursor-pointer px-2 py-2 uppercase whitespace-nowrap">
                Author <SortIndicator field="author" />
              </th>
              <th onClick={() => handleSort("tases")} className="cursor-pointer px-2 py-2 uppercase whitespace-nowrap">
                TASes <SortIndicator field="tases" />
              </th>
              <th onClick={() => handleSort("contributions")} className="cursor-pointer px-2 py-2 uppercase whitespace-nowrap">
                Contributions <SortIndicator field="contributions" />
              </th>
              <th onClick={() => handleSort("totalSaved")} className="cursor-pointer px-2 py-2 uppercase whitespace-nowrap">
                Time Saved <SortIndicator field="totalSaved" />
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800">
            {sortedAuthorStats.map((a) => (
              <tr key={a.author} className="hover:bg-slate-900/50">
                <td className="px-2 py-2 text-slate-100">{a.author}</td>
                <td className="px-2 py-2 text-slate-100">{a.tases}</td>
                <td className="px-2 py-2 text-slate-100">{a.contributions.toFixed(2)}</td>
                <td className="px-2 py-2 text-slate-300">
                  {formatTime(a.totalSaved, false, false, false)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}