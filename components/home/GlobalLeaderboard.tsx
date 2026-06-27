"use client";

import { useMemo, useState } from "react";
import { RtaEntry, SortOrder, TasEntry } from "@/utils/typing";
import { formatTime } from "@/utils/formatting";
import { BADGE_IMAGES, BADGE_RANKS, OVERRIDE } from "@/utils/constants";
import SortIndicator from "@/components/SortIndicator"
import { BadgeIcon } from "@/components/Icons";
import { formatAuthors } from "../FormatLinks";

type AuthorStat = {
  author: string;
  tases: number;
  contributions: number;
  totalSaved: number;
  badge: number;
};

type SortField = "badge" | "author" | "tases" | "contributions" | "totalSaved";

type LeaderboardProps = {
  data: AuthorStat[];
  isLoading: boolean;
  sortField: SortField;
  sortOrder: SortOrder;
  handleSort: (field: SortField) => void;
};

function getRankIndex(value: number, thresholds: readonly number[]) {
  let index = -1;

  for (let i = 0; i < thresholds.length; i++) {
    if (value >= thresholds[i]) {
      index = i;
    }
  }

  return index;
}

function Leaderboard({ data, isLoading, sortField, sortOrder, handleSort }: LeaderboardProps) {
  return (
    <table className="min-w-full table-fixed divide-y divide-slate-800 text-center text-xs backdrop-blur-md sm:text-sm">
      <thead className="bg-slate-900/90 text-slate-300">
        <tr>
          <th
            onClick={() => handleSort("badge")}
            className="cursor-pointer px-3 py-1.5 uppercase whitespace-nowrap"
          >
            <div className="flex items-center justify-center gap-1 hover:text-slate-200">
              Badge
              <SortIndicator active={sortField === "badge"} order={sortOrder} />
            </div>
          </th>

          <th
            onClick={() => handleSort("author")}
            className="cursor-pointer px-2 py-1.5 uppercase whitespace-nowrap"
          >
            <div className="flex items-center justify-center gap-1 hover:text-slate-200">
              Author
              <SortIndicator active={sortField === "author"} order={sortOrder} />
            </div>
          </th>

          <th
            onClick={() => handleSort("tases")}
            className="cursor-pointer px-2 py-1.5 whitespace-nowrap"
          >
            <div className="flex items-center justify-center gap-1 hover:text-slate-200">
              TASes
              <SortIndicator active={sortField === "tases"} order={sortOrder} />
            </div>
          </th>

          <th
            onClick={() => handleSort("contributions")}
            className="cursor-pointer px-2 py-1.5 uppercase whitespace-nowrap"
          >
            <div className="flex items-center justify-center gap-1 hover:text-slate-200">
              Cont.
              <SortIndicator active={sortField === "contributions"} order={sortOrder} />
            </div>
          </th>

          <th
            onClick={() => handleSort("totalSaved")}
            className="cursor-pointer px-3 py-1.5 uppercase whitespace-nowrap"
          >
            <div className="flex items-center justify-center gap-1 hover:text-slate-200">
              Saved
              <SortIndicator active={sortField === "totalSaved"} order={sortOrder} />
            </div>
          </th>
        </tr>
      </thead>

      <tbody className="divide-y divide-slate-800">
        {isLoading 
          ? 
          Array.from({ length: 25 }).map((_, i) => (
            <tr key={i} className={`${i % 2 === 0 ? "bg-slate-500/20" : "bg-slate-500/10"}`}>
              <td className="py-2"><div className="h-4 w-7 bg-slate-700 animate-pulse mx-auto rounded" /></td>
              <td className="py-2"><div className="h-4 w-25 bg-slate-700 animate-pulse rounded" /></td>
              <td className="py-2"><div className="h-4 w-12 bg-slate-700 animate-pulse mx-auto rounded" /></td>
              <td className="py-2"><div className="h-4 w-12 bg-slate-700 animate-pulse mx-auto rounded" /></td>
              <td className="py-2"><div className="h-4 w-15 bg-slate-700 animate-pulse mx-auto rounded" /></td>
            </tr> 
          )) 
          : 
          data.map((a, index) => {
            const rowColour = index % 2 === 0 ? "bg-slate-500/20" : "bg-slate-500/10";
            const badge = Math.min(BADGE_RANKS.TAS.length - 1, a.badge)

            return (
              <tr
                key={a.author}
                className={`${rowColour} hover:bg-emerald-900/50`}
              >
                <td className="px-2 text-center">
                  {badge >= 0 ? (
                    <div className="flex items-center justify-center">
                      <div className="flex justify-center h-6 w-10 relative">
                        <BadgeIcon badge_src={BADGE_IMAGES[badge]} />
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                </td>

                <td className="px-0 py-1.5 text-slate-100">
                  {formatAuthors([a.author])}
                </td>

                <td className="px-2 py-1.5 text-slate-100">
                  {a.tases}
                </td>

                <td className="px-2 py-1.5 text-slate-100">
                  {a.contributions.toFixed(2)}
                </td>

                <td className="px-3 py-1.5 text-slate-300">
                  {formatTime(a.totalSaved)}
                </td>
              </tr>
            );
          })
        }
      </tbody>
    </table>
  )
}

export default function GlobalLeaderboard( { tasRecords, bestRtaByTrack }: {
  tasRecords: TasEntry[], 
  bestRtaByTrack?: Map<string, RtaEntry>
}) {

  const [sortField, setSortField] = useState<SortField>("tases");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const authorStats = useMemo(() => {

    if (!bestRtaByTrack) return []

    const authorMap = new Map<string, AuthorStat>();
    const bestTasByTrack = new Map<string, TasEntry>();

    Object.values(tasRecords).forEach((entry) => {
      const existing = bestTasByTrack.get(entry.track);

      if (
        !existing ||
        entry.time_ms < existing.time_ms ||
        (entry.time_ms === existing.time_ms &&
          entry.date < existing.date)
      ) {
        bestTasByTrack.set(entry.track, entry);
      }
    });

    bestTasByTrack.forEach((entry) => {

      const rta = bestRtaByTrack.get(entry.track);
      const override = OVERRIDE[entry.track]?.[entry.time_ms];

      let savedMs = 0;
      if (override) {
        savedMs = override * 1000;
      } else if (rta) {
        savedMs = Math.max(0, rta.time_ms - entry.time_ms);
      }

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
            badge: 0,
          });
        }
      });
    });

    return Array.from(authorMap.values()).map(
      (author) => {
        const tasIndex = getRankIndex(author.tases, BADGE_RANKS.TAS);
        const contributionIndex = getRankIndex(author.contributions, BADGE_RANKS.Contributions);
        const savedIndex = getRankIndex(author.totalSaved / 1000, BADGE_RANKS.Saved);
        const average = (tasIndex + contributionIndex + savedIndex) / 3;

        return {
          ...author,
          badge: Math.round(average),
        };
      }
    );
  }, [tasRecords, bestRtaByTrack]);

  const sortedAuthorStats = useMemo(() => {
    return [...authorStats].sort((a, b) => {
      let aVal: string | number = "";
      let bVal: string | number = "";

      switch (sortField) {
        case "badge":
          aVal = `${a.badge}-${a.tases.toString().padStart(3, "0")}`;
          bVal = `${b.badge}-${b.tases.toString().padStart(3, "0")}`;
          break;
        case "author":
          aVal = a.author;
          bVal = b.author;
          break;
        case "tases":
          aVal = `${a.tases.toString().padStart(3, "0")}-${Math.round(a.contributions * 100).toString().padStart(4, "0")}`;
          bVal = `${b.tases.toString().padStart(3, "0")}-${Math.round(b.contributions * 100).toString().padStart(4, "0")}`;
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
      setSortOrder(
        sortOrder === "asc" ? "desc" : "asc"
      );
    } else {
      setSortField(field);
      setSortOrder(
        field === "author" ? "asc" : "desc"
      );
    }
  };

  const isLoading = sortedAuthorStats.length === 0 && (tasRecords.length === 0 || !bestRtaByTrack);
  const mobileAuthors = sortedAuthorStats.filter(a => a.tases >= 15);
  const desktopAuthors = sortedAuthorStats.filter(a => a.tases >= 3);

  return (
    <div className="relative mx-auto w-full max-w-5xl flex flex-col gap-3">

      {/* TABLE */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/90 shadow-[0_10px_40px_rgba(0,0,0,0.85)]">
        <div className="block lg:hidden">
          <Leaderboard 
            data={mobileAuthors}
            isLoading={isLoading}
            sortField={sortField}
            sortOrder={sortOrder}
            handleSort={handleSort}
          />
        </div>

        <div className="hidden lg:block">
          <Leaderboard 
            data={desktopAuthors}
            isLoading={isLoading}
            sortField={sortField}
            sortOrder={sortOrder}
            handleSort={handleSort}
          />
        </div>
      </div>
    </div>
  );
}
