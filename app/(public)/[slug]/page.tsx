"use client";

import { use, useState, useMemo } from "react";
import { trackList, TasEntry, Category, Environment, categoryFilters, gameSlugMap } from "@/lib/TrackLists";
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

  const [selectedAuthor, setSelectedAuthor] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<Category>("Open");
  const [selectedEnvironment, setSelectedEnvironment] = useState<Environment>("All");
  
  const { data: profile, isLoading } = useProfile();
  const { data: rtaRecords = [] } = useRtaRecords();
  const { data: tasRecords = [] } = useTasRecords();
  const bestRtaByTrack = useMemo(() => {
    if (!rtaRecords.length) return new Map();
    return buildBestRtaByTrack(rtaRecords)
  }, [rtaRecords])

  const prefs = {
    show_rta: profile?.show_rta ?? true,
    show_time_saved: profile?.show_time_saved ?? true,
    show_leaderboard: profile?.show_leaderboard ?? true,
    show_rta_leaderboard: profile?.show_rta_leaderboard ?? true,
    highlight_recent: profile?.highlight_recent ?? true,
    show_visitor_counter: profile?.show_visitor_counter ?? true,
  };

  const currentRecords = useMemo(() => {
    const bestTasByTrack = new Map<string, TasEntry>();
    const allowedCategories = categoryFilters[selectedCategory]

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
  }, [game, selectedCategory, rtaRecords, tasRecords]);

  if (!game) {
    throw new Error("Game not found");
  }
  
  if (isLoading) {
    return <div className="text-white p-10">Loading...</div>;
  }

  return (
    <div className="bg-slate-950">
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

      <div className="lg:flex lg:items-start lg:gap-0 justify-center">
        <RecordTable 
          game={game}
          showRta={prefs.show_rta}
          highlightRecent={prefs.highlight_recent}
          currentRecords={currentRecords}
          selectedAuthor={selectedAuthor}
          selectedEnvironment={selectedEnvironment}
        />

        <div className="flex flex-col items-start gap-1">
          {prefs.show_time_saved && (<TimeSaved currentRecords={currentRecords} />)}

          <div className="flex flex-row items-start gap-1">
            {prefs.show_leaderboard && (<Leaderboard currentRecords={currentRecords} />)}
            {prefs.show_rta_leaderboard && (<RtaTable currentRecords={currentRecords} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
