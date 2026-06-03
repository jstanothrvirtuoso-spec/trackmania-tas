"use client";

import { notFound } from "next/navigation";
import { use, useState, useMemo } from "react";
import { CATEGORY_FILTERS, GAME_SLUGS } from "@/utils/constants";
import { Environment, Category, TasEntry } from "@/utils/typing";
import { trackList } from "@/lib/TrackList";
import { useRtaRecords, buildBestRtaByTrack } from "@/lib/RtaRecords";
import { useTasRecords } from "@/lib/TasRecords";
import { useProfile } from "@/lib/Profiles";
import HeaderOptions from "@/components/game/HeaderOptions";
import RecordTable from "@/components/game/RecordTable";
import TimeSaved from "@/components/game/TimeSaved";
import Leaderboard from "@/components/game/Leaderboard";
import RtaTable from "@/components/game/RtaLeaderboard";

export default function GamePage({ params }: { params: Promise<{ game: string }> }) {

  const { game } = use(params);
  const gameName = GAME_SLUGS[game];

  if (!gameName) {
    notFound();
  }
  
  const [selectedAuthor, setSelectedAuthor] = useState<string>("All Authors");
  const [selectedCategory, setSelectedCategory] = useState<Category>("Open");
  const [selectedEnvironment, setSelectedEnvironment] = useState<Environment>("All");
  const allowedCategories = CATEGORY_FILTERS[selectedCategory]

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

    for (const entry of Object.values(tasRecords)) {
      if (!allowedCategories.has(entry.category)) continue;

      const baseTrack = trackList[entry.track].baseTrack ?? entry.track
      const tasGame = trackList[baseTrack].game

      if (tasGame !== gameName) continue;

      const existing = bestTasByTrack.get(baseTrack);

      if (
        !existing || entry.time_ms < existing.time_ms ||
        (entry.time_ms === existing.time_ms && entry.date < existing.date)
      ) {
        bestTasByTrack.set(baseTrack, entry);
      }
    }

    return Object.entries(trackList)
      .filter(([, info]) => info.game === gameName)
      .map(([track, trackInfo]) => ({
        track: (trackInfo.noCutTrack && selectedCategory === "No Cut") ? trackInfo.noCutTrack : track,
        trackInfo: (trackInfo.noCutTrack && selectedCategory === "No Cut") ? trackList[trackInfo.noCutTrack] : trackInfo,
        tas: bestTasByTrack.get(track) ?? null,
        rta: bestRtaByTrack.get((trackInfo.noCutTrack && selectedCategory === "No Cut") ? trackInfo.noCutTrack : track) ?? null,
      }));
  }, [gameName, bestRtaByTrack, tasRecords, allowedCategories]);

  if (isLoading) {
    return <div className="text-white p-10">Loading...</div>;
  }

  return (
    <div className="bg-slate-950 pt-16 min-h-screen min-w-screen">
      <div className="flex justify-center py-3">
        <HeaderOptions
          game={gameName}
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
          game={gameName}
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
