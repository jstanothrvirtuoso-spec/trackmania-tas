"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { TasEntry, RecordRow } from "@/utils/typing";
import { CATEGORY_FILTERS, KEY_AUTHORS } from "@/utils/constants";
import { useProfilePublic } from "@/lib/Profiles";
import { useAuthors } from "@/lib/Authors";
import { useTasRecords } from "@/lib/TasRecords";
import { buildBestRtaByTrack, useRtaRecords } from "@/lib/RtaRecords";
import { trackList } from "@/lib/TrackList";
import { formatDate, formatTime } from "@/utils/formatting";
import { AuthorYearChart, AuthorEnvironmentChart, AuthorGameChart } from "@/components/authors/AuthorCharts";
import ProfileCard from "@/components/profile/ProfileCard";

export default function AuthorsPage({ initialAuthor }: { initialAuthor?: string }) {

  const router = useRouter();
  const [hideBeaten, setHideBeaten] = useState(false);

  const { data: authors = [] } = useAuthors();
  const { data: rtaRecords = [] } = useRtaRecords();
  const { data: tasRecords = [] } = useTasRecords();
  const bestRtaByTrack = useMemo(() => {
    if (!rtaRecords.length) return new Map();
    return buildBestRtaByTrack(rtaRecords)
  }, [rtaRecords]);

  const [selectedAuthor, setSelectedAuthor] = useState<string>(() => (
    initialAuthor ?? KEY_AUTHORS[Math.floor(Math.random() * KEY_AUTHORS.length)]
  ));

  const authorOptions = useMemo(() => {
    const authorCount: Record<string, number> = {};

    tasRecords.forEach((tas) => {
      tas.authors.forEach((author) => {
        authorCount[author] = (authorCount[author] ?? 0) + 1;
      });
    });

    return Object.entries(authorCount)
      .sort((a, b) => b[1] - a[1])
      .map(([author, count]) => ({
        author,
        count,
      }));
  }, [tasRecords]);

  const selectedProfileId = useMemo(() => {
    return authors.find((a) => a.author === selectedAuthor)?.profile_id ?? null;
  }, [authors, selectedAuthor]);

  const { data: profilePublic } = useProfilePublic(selectedProfileId ?? "");

  const rows = useMemo<RecordRow[]>(() => {
    if (!selectedAuthor) return [];
    if (!tasRecords) return [];

    const bestTasByTrackCategory = new Map<string, TasEntry>();

    tasRecords.forEach((entry) => {
      Object.entries(CATEGORY_FILTERS).forEach(
        ([displayCategory, allowedCategories]) => {
          
          if (!allowedCategories.has(entry.category as never)) {
            return;
          }

          const key = `${entry.track}|${displayCategory}`;
          const existing = bestTasByTrackCategory.get(key);

          if (!existing || entry.time_ms < existing.time_ms ||
            (entry.time_ms === existing.time_ms && entry.date < existing.date)
          ) {
            bestTasByTrackCategory.set(key, entry);
          }
        }
      );
    });

    // ALL TASes by selected author
    const selectedAuthorTasRecords = tasRecords.filter((tas) =>
      tas.authors.includes(selectedAuthor)
    );

    return selectedAuthorTasRecords
      .map((tas) => {
        const key = `${tas.track}|${tas.category}`;
        const currentBest = bestTasByTrackCategory.get(key);

        return {
          track: tas.track,
          trackInfo: trackList[tas.track],
          tas,
          rta: bestRtaByTrack.get(tas.track) ?? null,
          isCurrentBestTas: currentBest === tas,
        };
      })
      .sort((a, b) =>
        String(b.tas!.date).localeCompare(String(a.tas!.date))
      );
  }, [selectedAuthor, tasRecords, bestRtaByTrack]);

  const visibleRows = hideBeaten ? rows.filter((r) => r.isCurrentBestTas) : rows;

  function updateAuthor(author: string) {
    setSelectedAuthor(author)
    router.replace(`/authors?${new URLSearchParams({author: author})}`);
  };

  return (
    <div className="mx-auto flex w-full flex-col items-center overflow-x-auto px-4 pt-20 pb-8 text-slate-100">
      
      {/* Options */}
      <div className="mb-3 flex flex-row gap-2 px-4">
        <select
          value={selectedAuthor}
          onChange={(e) => updateAuthor(e.target.value)}
          className="rounded-md border border-slate-700 bg-slate-800 pl-2 pr-6 py-2 text-sm text-slate-100 focus:border-slate-500 focus:outline-none cursor-pointer"
        >
          {authorOptions.map(({ author, count }) => (
            <option
              key={author}
              value={author}
              className={author === selectedAuthor ? "italic text-red-400" : ""}
            >
              {author} ({count})
            </option>
          ))}
        </select>

        <button
          onClick={() => setHideBeaten((v) => !v)}
          className={`
            rounded-md px-4 py-1.5 text-sm font-semibold transition-all duration-150 border cursor-pointer
            ${hideBeaten ? "border-slate-600 bg-emerald-300/15 text-emerald-300 hover:bg-emerald-500/25"
                : "border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700"}`}
        >
          {hideBeaten ? "WRs only" : "All TASes"}
        </button>
      </div>

      {selectedAuthor && (
        <div className="flex flex-col items-center gap-4 lg:flex-row lg:items-start">

          {/* Profile card */}
          {profilePublic && (
            <ProfileCard 
              profile={profilePublic}
            />
          )}

          {/* TAS table */}
          <div className="overflow-x-auto">
            <table className="border-separate border border-slate-800 rounded-lg overflow-hidden text-center text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-slate-300 uppercase tracking-[0.18em]">
                  <th className="px-3 py-1.5 font-normal">
                    Date
                  </th>

                  <th className="px-3 py-1.5 font-normal">
                    Track
                  </th>

                  <th className="px-3 py-1.5 font-normal hidden sm:table-cell">
                    Game
                  </th>

                  <th className="px-3 py-1.5 font-normal">
                    Cat.
                  </th>

                  <th className="px-3 py-1.5 font-normal">
                    TAS
                  </th>

                  <th className="px-3 py-1.5 font-normal hidden sm:table-cell">
                    RTA
                  </th>

                  <th className="px-3 py-1.5 font-normal hidden sm:table-cell">
                    Saved
                  </th>
                </tr>
              </thead>

              <tbody>
                {visibleRows.map((row, index) => {
                  if (!row.tas) return null;
                  const isStunt = row.trackInfo.category === "Stunt"
                  const tasGame = row.tas.game === "TMNF" && row.tas.category === "No Cut" ? "TMNF No Cut" : row.tas.game
                  const opacity = row.isCurrentBestTas ? "opacity-100" : "opacity-50"

                  return (
                    <tr
                      key={ index }
                      className={`border-b border-slate-800 ${index % 2 === 0 ? "bg-violet-950/10" : "bg-violet-950/20"} ${opacity}`}
                    >
                      <td className="px-3 py-1.5 whitespace-nowrap">
                        { formatDate(row.tas.date) }
                      </td>

                      <td className="px-3 py-1.5">
                        {row.track}
                      </td>

                      <td className="px-3 py-1.5 hidden sm:table-cell">
                        {tasGame}
                      </td>

                      <td className="px-3 py-1.5">
                        { row.tas.category}
                      </td>

                      <td className="px-3 py-1.5">
                        { formatTime(row.tas.time_ms, isStunt)}
                      </td>

                      <td className="px-3 py-1.5 hidden sm:table-cell">
                        { row.rta ? formatTime(row.rta.time_ms, isStunt) : "-" }
                      </td>

                      <td className="px-3 py-1.5 italic hidden sm:table-cell">
                        { row.rta ? formatTime(row.tas.time_ms - row.rta.time_ms, isStunt, false, true) : "-" }
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Stats charts */}
          <div className="flex flex-col items-center gap-4 lg:items-start">
            <AuthorYearChart rows={visibleRows} />
            <AuthorGameChart rows={visibleRows} />
            <AuthorEnvironmentChart rows={visibleRows} />
          </div>
        </div>
      )}
    </div>
  );
}
