"use client";

import { useMemo } from "react";
import { CATEGORIES } from "@/utils/constants";
import { TasEntry, Category } from "@/utils/typing";
import { useTasRecords } from "@/lib/TasRecords";
import { useBestRtaRecords } from "@/lib/RtaRecords";
import { TRACKS } from "@/lib/TrackList";
import { TasCard } from "@/components/highlight/TasCard";
import { AuthorCard } from "@/components/highlight/AuthorCard";
import { UndoneCard } from "@/components/highlight/UndoneCard";
import { LegendsCard } from "@/components/highlight/LegendsCard";
import { getYouTubeId } from "@/utils/common";
import { Unnoseboosters } from "@/components/highlight/Unnoseboosters";

const reversedCategories = [...CATEGORIES].reverse();

export default function HighlightPage() {

  const { data: tasRecords = [] } = useTasRecords();
  const { data: bestRtaByTrack } = useBestRtaRecords();

  const { undoneTracks, topTasVideos, topAuthors } = useMemo(() => {

    const bestByTrackAndCategory = new Map<string, Map<Category, TasEntry>>();
    const authorCounts = new Map<string, number>();
    const undoneTracks: string[] = [];
    const topTasList: TasEntry[] = [];

    for (const entry of tasRecords) {
      const track = entry.category === "No Cut" ? TRACKS[entry.track].noCutTrack ?? entry.track : entry.track;
      const trackMap = bestByTrackAndCategory.get(track) ?? new Map();
      const existing = trackMap.get(entry.category);

      if (!existing || entry.time_ms < existing.time_ms) {
        trackMap.set(entry.category, entry);
        bestByTrackAndCategory.set(track, trackMap);
      }
    }

    for (const [track, trackInfo] of Object.entries(TRACKS)) {
      const categoryMap = bestByTrackAndCategory.get(track);

      if (!categoryMap) {
        if (trackInfo.game != "TM2" && bestRtaByTrack?.get(track)?.video) {
          undoneTracks.push(track);
        }
        continue;
      }

      let bestTimeSoFar = Infinity;
      for (const category of reversedCategories) {
        const tas = categoryMap.get(category as Category);
        if (!tas) continue;

        if (tas.time_ms < bestTimeSoFar) {
          topTasList.push(tas);
          bestTimeSoFar = tas.time_ms;

          for (const author of tas.authors) {
            authorCounts.set(author, (authorCounts.get(author) ?? 0) + 1);
          }
        }
      }
    }

    const topTasVideos = topTasList.filter((tas) => tas.video && getYouTubeId(tas.video))
    const topAuthors = Array.from(authorCounts.entries())
      .filter(([, count]) => count >= 5)
      .map(([author]) => author);

    return { undoneTracks, topTasVideos, topAuthors };
  }, [tasRecords, bestRtaByTrack]);

  const { tasOfTheDay, undoneTasOfTheDay, authorOfTheDay } = useMemo(() => {
    function dailyIndex(length: number) {
      if (length === 0) return -1;
      const today = new Date();
      const seed = (today.getUTCMonth() + 1) * 100 + today.getUTCDate()
      return (Math.floor(Math.abs(Math.sin(seed) * 125114136345))) % length;
    }

    return {
      tasOfTheDay: topTasVideos[dailyIndex(topTasVideos.length)] ?? null,
      undoneTasOfTheDay: undoneTracks[dailyIndex(undoneTracks.length)] ?? null,
      authorOfTheDay: topAuthors[dailyIndex(topAuthors.length)] ?? null,
    };
  }, [topTasVideos, undoneTracks, topAuthors]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-200px] top-[-200px] h-[500px] w-[500px] rounded-full bg-indigo-600/20 blur-[140px]" />
        <div className="absolute right-[-200px] top-[100px] h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[140px]" />
        <div className="absolute left-[200px] top-[500px] h-[300px] w-[300px] rounded-full bg-red-600/10 blur-[140px]" />
        <div className="absolute right-[-300px] top-[1100px] h-[500px] w-[500px] rounded-full bg-red-600/10 blur-[140px]" />
        <div className="absolute right-[400px] top-[700px] h-[500px] w-[500px] rounded-full bg-indigo-600/10 blur-[140px]" />
        <div className="absolute left-[-300px] top-[1300px] h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[140px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pb-5 pt-20">

        {/* HERO */}
        <section className="overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
          <div className="relative p-6 md:p-10">

            <div className="text-xs font-medium uppercase tracking-[0.35em] text-indigo-400">
              Daily Showcase
            </div>

            <h1
              className="mt-3 text-4xl text-white sm:text-6xl font-okta"
            >
              TAS Highlights
            </h1>

            <p className="mt-3 sm:mt-6 max-w-2xl text-slate-400 text-xs sm:text-base">
              A rotating showcase of standout TASes, unfinished tracks and
              notable creators from the TAS Nadeo community.
              These highlights will be rotated at UTC+0 time (London - UK).
            </p>

            <div className="mt-4 sm:mt-8 flex-wrap gap-3 hidden sm:flex sm:text-sm">

              <div className="rounded-full border border-slate-700 bg-slate-900/70 px-4 py-2 text-slate-300">
                {topTasVideos.length} Featured TASes
              </div>

              <div className="rounded-full border border-slate-700 bg-slate-900/70 px-4 py-2 text-slate-300">
                {undoneTracks.length} Untouched Tracks
              </div>

              <div className="rounded-full border border-slate-700 bg-slate-900/70 px-4 py-2 text-slate-300">
                {topAuthors.length} Top TASers
              </div>

            </div>
          </div>
        </section>

        {/* MAIN GRID */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.8fr_minmax(0,1fr)] items-start">

          {/* LEFT */}
          <div className="space-y-6 min-w-0">

            {/* TAS OF THE DAY */}
            {tasOfTheDay && bestRtaByTrack && (
              <TasCard 
                tasOfTheDay={tasOfTheDay}
                bestRtaByTrack={bestRtaByTrack}
              />
            )}
            
            {/* TASER */}
            {authorOfTheDay && tasRecords && bestRtaByTrack && (
              <AuthorCard
                authorOfTheDay={authorOfTheDay}
                tasRecords={tasRecords}
                bestRtaByTrack={bestRtaByTrack}
              />
            )}

          </div>

          {/* RIGHT */}
          <div className="space-y-6 min-w-0">

            {/* UNDONE */}
            {tasOfTheDay && undoneTasOfTheDay && bestRtaByTrack && (
              <UndoneCard
                undoneTasOfTheDay={undoneTasOfTheDay}
                bestRtaByTrack={bestRtaByTrack}
              />
            )}

            {/* LEGENDS OF UNDONE */}
            {tasOfTheDay && (
              <LegendsCard />
            )}

            {/* LEGENDS OF UNNOSEBOOST */}
            {tasOfTheDay && (
              <Unnoseboosters />
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
