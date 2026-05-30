"use client";

import { notFound } from "next/navigation";
import { use, useState, useMemo } from "react";
import { trackList, TasEntry, Category, Environment, categoryFilters, gameSlugMap } from "@/lib/TrackList";
import { useRtaRecords, buildBestRtaByTrack } from "@/lib/RtaRecords";
import { useTasRecords } from "@/lib/TasRecords";
import { useProfile } from "@/lib/Profiles";
import HeaderOptions from "./HeaderOptions";
import RecordTable from "./RecordTable";
import TimeSaved from "./TimeSaved";
import Leaderboard from "./Leaderboard";
import RtaTable from "./RtaLeaderboard";

export default function GamePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {

  const { slug } = use(params);
  const game = gameSlugMap[slug];

  if (!game) {
    notFound();
  }
  
  const [selectedAuthor, setSelectedAuthor] = useState<string>("All Authors");
  const [selectedCategory, setSelectedCategory] = useState<Category>("Open");
  const [selectedEnvironment, setSelectedEnvironment] = useState<Environment>("All");
  const allowedCategories = categoryFilters[selectedCategory]

  const { data: profile, isLoading } = useProfile();
  const { data: rtaRecords = [] } = useRtaRecords();
  const { data: tasRecords = [] } = useTasRecords();
  const bestRtaByTrack = useMemo(() => {
    if (!rtaRecords.length) return new Map();
    return buildBestRtaByTrack(rtaRecords)
  }, [rtaRecords]);

  const {
    show_rta = true,
    show_time_saved = true,
    show_leaderboard = true,
    show_rta_leaderboard = true,
    highlight_recent = true,
  } = profile ?? {};

  const currentRecords = useMemo(() => {
    const bestTasByTrack = new Map<string, TasEntry>();

    Object.values(tasRecords)
      .filter((e) => e.game === game)
      .filter((e) => allowedCategories.has(e.category))
      .forEach((entry) => {
        const existing = bestTasByTrack.get(entry.track);

        if (
          !existing ||
          entry.time_ms < existing.time_ms ||
          (
            entry.time_ms === existing.time_ms &&
            new Date(entry.date).getTime() <
              new Date(existing.date).getTime()
          )
        ) {
          bestTasByTrack.set(entry.track, entry);
        }
      });

    return Object.entries(trackList)
      .filter(([, info]) => info.game === game)
      .map(([track, trackInfo]) => ({
        track,
        trackInfo,
        tas: bestTasByTrack.get(track) ?? null,
        rta: bestRtaByTrack.get(track) ?? null,
      }));
  }, [game, selectedCategory, bestRtaByTrack, tasRecords]);

  if (isLoading) {
    return <div className="text-white p-10">Loading...</div>;
  }

  return (
    <div className="bg-slate-950 pt-16 min-h-screen min-w-screen">
      <div className="flex justify-center py-3">
        <HeaderOptions
          game={game}
          currentRecords={currentRecords}
          selectedAuthor={selectedAuthor}
          selectedCategory={selectedCategory}
          selectedEnvironment={selectedEnvironment}
          onAuthorChange={setSelectedAuthor}
          onCategoryChange={setSelectedCategory}
          onEnvironmentChange={setSelectedEnvironment}
        />
      </div>

      <div className="lg:flex justify-center">
        <RecordTable 
          game={game}
          showRta={show_rta}
          highlightRecent={highlight_recent}
          currentRecords={currentRecords}
          selectedAuthor={selectedAuthor}
          selectedEnvironment={selectedEnvironment}
        />

        <div className="flex flex-col items-start gap-1">
          {show_time_saved && (<TimeSaved currentRecords={currentRecords} />)}

          <div className="flex flex-row items-start gap-1">
            {show_leaderboard && (<Leaderboard currentRecords={currentRecords} />)}
            {show_rta_leaderboard && (<RtaTable currentRecords={currentRecords} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
