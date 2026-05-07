"use client";

import { TasEntry, TasRecords } from "@/lib/TasRecords";
import { RtaRecords } from "@/lib/RtaRecords";
import { useMemo, useState } from "react";

type AuthorStat = {
  author: string;
  tases: number;
  contributions: number;
  totalSaved: number;
};

type SortField = "author" | "tases" | "contributions" | "totalSaved";
type SortOrder = "asc" | "desc";

function formatSeconds(seconds: number): string {
  const absSeconds = Math.abs(seconds);
  if (absSeconds < 60) {
    return absSeconds.toFixed(2);
  }

  const minutes = Math.floor(absSeconds / 60);
  const remainder = (absSeconds % 60).toFixed(2).padStart(5, "0");
  return `${minutes}:${remainder}`;
}

export default function Home() {
  const [sortField, setSortField] = useState<SortField>("tases");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const authorStats = useMemo(() => {
  const authorMap = new Map<string, AuthorStat>();

  const bestTasByTrack = new Map<string, TasEntry>();

  Object.values(TasRecords).forEach((entry) => {
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

  bestTasByTrack.forEach((entry) => {
    const rta = RtaRecords
      .filter(
        (r) =>
          r.game === entry.game &&
          r.track === entry.track
      )
      .sort((a, b) => a.timeMs - b.timeMs)[0];

    const savedMs = rta
      ? Math.max(0, rta.timeMs - entry.timeMs)
      : 0;

    const contributionPerAuthor =
      1 / entry.authors.length;

    const savedPerAuthor =
      savedMs / entry.authors.length;

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
}, []);

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

      const comparison = String(aVal).localeCompare(String(bVal));
      return sortOrder === "asc" ? comparison : -comparison;
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
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-10 rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-xl shadow-slate-950/30 backdrop-blur-md">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">TrackMania TAS</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Combined Leaderboard
            </h1>
          </div>
          <div className="rounded-3xl bg-slate-800/80 px-4 py-3 text-sm text-slate-300 ring-1 ring-slate-700">
            {authorStats.length} authors
          </div>
        </div>
        <p className="mt-6 max-w-2xl text-slate-400 sm:text-base">
          Tracks all TAS contributions across every leaderboard. Each author earns one TAS per entry they appear on. Total time saved and contributions are fractional shares based on the number of authors per TAS.
        </p>
      </header>

      <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-950/90">
        <table className="min-w-full divide-y divide-slate-800 text-center text-sm">
          <thead className="bg-slate-900/90 text-slate-400">
            <tr>
              <th
                onClick={() => handleSort("author")}
                className="px-2 py-2 font-normal uppercase tracking-[0.18em] cursor-pointer hover:text-slate-300 transition"
              >
                Author
                <SortIndicator field="author" />
              </th>
              <th
                onClick={() => handleSort("tases")}
                className="px-2 py-2 font-normal uppercase tracking-[0.18em] cursor-pointer hover:text-slate-300 transition"
              >
                TASes
                <SortIndicator field="tases" />
              </th>
              <th
                onClick={() => handleSort("contributions")}
                className="px-2 py-2 font-normal uppercase tracking-[0.18em] cursor-pointer hover:text-slate-300 transition"
              >
                Contributions
                <SortIndicator field="contributions" />
              </th>
              <th
                onClick={() => handleSort("totalSaved")}
                className="px-2 py-2 font-normal uppercase tracking-[0.18em] cursor-pointer hover:text-slate-300 transition"
              >
                Time Saved
                <SortIndicator field="totalSaved" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {sortedAuthorStats.map((author) => (
              <tr key={author.author} className="border-b border-slate-800 last:border-b-0 hover:bg-slate-900/50 transition">
                <td className="px-2 py-2 text-slate-100">{author.author}</td>
                <td className="px-2 py-2 text-slate-100">{author.tases}</td>
                <td className="px-2 py-2 text-slate-100">{author.contributions.toFixed(2)}</td>
                <td className="px-2 py-2 text-slate-300">{formatSeconds(author.totalSaved / 1000)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
