"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useTasRecords } from "@/lib/TasRecords";
import { useRtaRecords, buildBestRtaByTrack } from "@/lib/RtaRecords";
import { TasEntry, trackList } from "@/lib/TrackList";
import { formatTime } from "@/utils/formatting";

type AuthorStat = {
  author: string;
  tases: number;
  contributions: number;
  totalSaved: number;
  badge: number;
};

type SortField =
  | "badge"
  | "author"
  | "tases"
  | "contributions"
  | "totalSaved";

type SortOrder = "asc" | "desc";

const badgeRanks = {
  TAS: [2, 5, 10, 20, 40, 60, 80, 100],
  Contributions: [1.5, 2.5, 5, 10, 20, 40, 70, 100],
  Saved: [5, 15, 30, 60, 90, 120, 240, 360],
  Badge: [
    "novice.png",
    "apprentice.png",
    "adept.png",
    "expert.png",
    "elite.png",
    "master.png",
    "legend.png",
    "mythic.png",
  ],
} as const;

function getRankIndex(
  value: number,
  thresholds: readonly number[]
) {
  let index = 0;

  for (let i = 0; i < thresholds.length; i++) {
    if (value >= thresholds[i]) {
      index = i;
    }
  }

  return index;
}

export default function GlobalLeaderboard() {
  const [sortField, setSortField] =
    useState<SortField>("tases");

  const [sortOrder, setSortOrder] =
    useState<SortOrder>("desc");

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
          new Date(entry.date).getTime() <
            new Date(existing.date).getTime())
      ) {
        bestTasByTrack.set(entry.track, entry);
      }
    });

    bestTasByTrack.forEach((entry) => {
      const rta = bestRtaByTrack.get(entry.track);

      const override =
        trackList[entry.track].overrideTimeSaved;

      const savedMs = override
        ? override * 1000
        : rta
        ? Math.max(0, rta.time_ms - entry.time_ms)
        : 0;

      const contributionPerAuthor =
        1 / entry.authors.length;

      const savedPerAuthor =
        savedMs / entry.authors.length;

      entry.authors.forEach((author) => {
        const current = authorMap.get(author);

        if (current) {
          current.tases += 1;
          current.contributions +=
            contributionPerAuthor;
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
        const tasIndex = getRankIndex(
          author.tases,
          badgeRanks.TAS
        );

        const contributionIndex = getRankIndex(
          author.contributions,
          badgeRanks.Contributions
        );

        const savedIndex = getRankIndex(
          author.totalSaved / 1000,
          badgeRanks.Saved
        );

        const average =
          (tasIndex +
            contributionIndex +
            savedIndex) /
          3;

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
          aVal = `${a.badge}-${a.tases
            .toString()
            .padStart(3, "0")}`;

          bVal = `${b.badge}-${b.tases
            .toString()
            .padStart(3, "0")}`;

          break;

        case "author":
          aVal = a.author;
          bVal = b.author;
          break;

        case "tases":
          aVal = `${a.tases
            .toString()
            .padStart(3, "0")}-${Math.round(
            a.contributions * 100
          )
            .toString()
            .padStart(4, "0")}`;

          bVal = `${b.tases
            .toString()
            .padStart(3, "0")}-${Math.round(
            b.contributions * 100
          )
            .toString()
            .padStart(4, "0")}`;

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

      if (
        typeof aVal === "number" &&
        typeof bVal === "number"
      ) {
        return sortOrder === "asc"
          ? aVal - bVal
          : bVal - aVal;
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

  const SortIndicator = ({
    field,
  }: {
    field: SortField;
  }) => {
    if (sortField !== field) return null;

    return sortOrder === "asc" ? " ↑" : " ↓";
  };

  return (
    <div className="relative mx-auto w-full max-w-5xl flex flex-col gap-3">

      {/* TABLE */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/90 shadow-[0_10px_40px_rgba(0,0,0,0.85)]">
        <table className="min-w-full divide-y divide-slate-800 text-center text-sm backdrop-blur-md">
          <thead className="bg-slate-900/90 text-slate-300">
            <tr>
              <th
                onClick={() => handleSort("badge")}
                className="cursor-pointer px-3 py-1.5 uppercase whitespace-nowrap"
              >
                Badge
                <SortIndicator field="badge" />
              </th>

              <th
                onClick={() => handleSort("author")}
                className="cursor-pointer px-2 py-1.5 uppercase whitespace-nowrap"
              >
                Author
                <SortIndicator field="author" />
              </th>

              <th
                onClick={() => handleSort("tases")}
                className="cursor-pointer px-3 py-1.5 whitespace-nowrap"
              >
                TASes
                <SortIndicator field="tases" />
              </th>

              <th
                onClick={() => handleSort("contributions")}
                className="cursor-pointer px-3 py-1.5 uppercase whitespace-nowrap"
              >
                Cont.
                <SortIndicator field="contributions" />
              </th>

              <th
                onClick={() => handleSort("totalSaved")}
                className="cursor-pointer px-4 py-1.5 uppercase whitespace-nowrap"
              >
                Saved
                <SortIndicator field="totalSaved" />
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800">
            {sortedAuthorStats.map((a, index) => {
              const rowColour =
                index % 2 === 0
                  ? "bg-slate-500/20"
                  : "bg-slate-500/10";

              return (
                <tr
                  key={a.author}
                  className={`${rowColour} hover:bg-emerald-900/50`}
                >
                  <td className="px-2 text-center">
                    {a.badge > 0 ? (
                      <div className="flex items-center justify-center">
                        <img
                          src={`medals/${badgeRanks.Badge[a.badge]}`}
                          alt={`${a.badge}`}
                          className="h-6 w-auto"
                        />
                      </div>
                    ) : (
                      ""
                    )}
                  </td>

                  <td className="px-1 py-1.5 text-slate-100">
                    <Link
                      href={`/authors?author=${encodeURIComponent(
                        a.author
                      )}`}
                      className="hover:text-white underline-offset-2 hover:underline"
                    >
                      {a.author}
                    </Link>
                  </td>

                  <td className="px-2 py-1.5 text-slate-100">
                    {a.tases}
                  </td>

                  <td className="px-2 py-1.5 text-slate-100">
                    {a.contributions.toFixed(2)}
                  </td>

                  <td className="px-2 py-1.5 text-slate-300">
                    {formatTime(
                      a.totalSaved,
                      false,
                      false,
                      false
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}