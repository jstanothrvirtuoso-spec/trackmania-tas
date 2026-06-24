"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { TasEntry, RecordRow, Game, Environment } from "@/utils/typing";
import { CATEGORY_FILTERS } from "@/utils/constants";
import { useProfilePublic } from "@/lib/Profiles";
import { useAuthors } from "@/lib/Authors";
import { useTasRecords } from "@/lib/TasRecords";
import { buildBestRtaByTrack, useRtaRecords } from "@/lib/RtaRecords";
import { TRACKS } from "@/lib/TrackList";
import { DropSelect } from "@/components/DropSelect";
import { AuthorYearChart, AuthorEnvironmentChart, AuthorGameChart } from "@/components/authors/AuthorCharts";
import ProfileCard from "@/components/profile/ProfileCard";
import { AuthorTasTable } from "@/components/authors/AuthorTasTable";

export default function AuthorsPage({ initialAuthor }: { initialAuthor: string }) {

  const router = useRouter();
  const [hideBeaten, setHideBeaten] = useState(false);

  const { data: authors = [] } = useAuthors();
  const { data: rtaRecords = [] } = useRtaRecords();
  const { data: tasRecords = [] } = useTasRecords();
  const bestRtaByTrack = useMemo(() => {
    if (!rtaRecords.length) return new Map();
    return buildBestRtaByTrack(rtaRecords)
  }, [rtaRecords]);

  const [selectedAuthor, setSelectedAuthor] = useState<string>(initialAuthor);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [selectedEnvironment, setSelectedEnvironment] = useState<Environment | null>(null);

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
          trackInfo: TRACKS[tas.track],
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

  const filteredRows = useMemo(() => {
    if (!selectedYear && !selectedGame && !selectedEnvironment) return visibleRows;
    return visibleRows
      .filter((row) => row.tas && (!selectedYear || new Date(row.tas.date).getFullYear() === selectedYear))
      .filter((row) => row.tas && (!selectedGame || row.tas.game === selectedGame))
      .filter((row) => row.tas && (!selectedEnvironment || row.trackInfo.environment === selectedEnvironment));
  }, [selectedYear, selectedGame, selectedEnvironment, visibleRows]);

  function updateAuthor(author: string) {
    setSelectedAuthor(author)
    setSelectedYear(null);
    router.replace(`/authors?${new URLSearchParams({author: author})}`);
  };

  function updateYear(year: number | null) {
    setSelectedYear(year);
  }

  function updateGame(game: Game | null) {
    setSelectedGame(game);
  }

  function updateEnvironment(environment: Environment | null) {
    setSelectedEnvironment(environment);
  }

  return (
    <div className="mx-auto flex w-full flex-col items-center overflow-x-auto pt-20 pb-8 text-slate-100 px-3 sm:px-6">

      {/* Background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[#070A12]" />

        {/* Scanlines */}
        <div className="absolute inset-0 opacity-[0.38] [background-image:repeating-linear-gradient(to_bottom,transparent,transparent_3px,rgba(255,255,255,0.14)_4px)]"/>
        <div className="absolute inset-0 opacity-[0.10] [background-image:repeating-linear-gradient(135deg,rgba(236,72,153,0.25),rgba(236,72,153,0.25)_1px,transparent_1px,transparent_18px)]"/>

        {/* Shapes */}
        <div className="absolute top-[12%] left-[18%] h-[20%] w-[15%] -rotate-[8deg] border border-fuchsia-400/15 bg-fuchsia-500/5" />
        <div className="absolute top-[54%] right-[12%] h-[14%] w-[17%] rotate-[16deg] border border-emerald-400/15 bg-emerald-500/5" />
        <div className="absolute top-[24%] right-[32%] h-[9%] w-[7%] -rotate-[18deg] border border-emerald-400/20 bg-emerald-500/5" />
        <div className="absolute bottom-[42%] left-[7%] h-[12%] w-[7%] rotate-[12deg] border border-fuchsia-400/15 bg-fuchsia-500/5" />
        <div className="absolute bottom-[44%] left-[38%] h-[22%] w-[17%] -rotate-[4deg] border border-sky-400/15 bg-sky-500/5" />
        <div className="absolute top-[8%] right-[8%] h-[33%] w-[25%] rotate-[14deg] border border-cyan-400/10 bg-cyan-500/5" />
        <div className="absolute bottom-[8%] right-[30%] h-[25%] w-[22%] -rotate-[10deg] border border-cyan-400/10 bg-cyan-500/5" />
        <div className="absolute top-[-5%] left-[-5%] h-[40%] w-[24%] rotate-12 border border-cyan-400/20 bg-cyan-500/10" />
        <div className="absolute top-[35%] right-[-2%] h-[60%] w-[23%] -rotate-6 border border-fuchsia-400/20 bg-fuchsia-500/5" />
        <div className="absolute bottom-[-2%] left-[9%] h-[44%] w-[32%] rotate-3 border border-emerald-400/20 bg-emerald-500/5" />

        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.1)_40%,rgba(0,0,0,1)_100%)]" />
      </div>

      {/* Options */}
      <div className="mb-3 flex flex-wrap sm:flex-row items-center gap-2">
        
        <DropSelect
          initialValue={selectedAuthor}
          options={authorOptions.length > 0 ? authorOptions.map(({ author, count }) => ({
            value: author,
            label: `${author} (${count})`,
          })) : [{value: "Loading", label: "Loading authors..."}]}
          onChange={(value) => updateAuthor(value)}
        />

        <button
          onClick={() => setHideBeaten((v) => !v)}
          className={`
            rounded-md px-4 py-1.5 text-xs sm:text-sm font-semibold transition-all duration-150 border cursor-pointer whitespace-nowrap
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
          <AuthorTasTable
            rows={filteredRows}
          />

          {/* Stats charts */}
          <div className="flex flex-col items-center gap-4 lg:items-start">
            <AuthorYearChart
              rows={visibleRows}
              selectedYear={selectedYear}
              onSelectYear={updateYear}
            />
            <AuthorGameChart
              rows={visibleRows}
              selectedGame={selectedGame}
              onSelectGame={updateGame}
            />
            <AuthorEnvironmentChart
              rows={visibleRows}
              selectedEnvironment={selectedEnvironment}
              onSelectEnvironment={updateEnvironment}
            />
          </div>
        </div>
      )}
    </div>
  );
}
