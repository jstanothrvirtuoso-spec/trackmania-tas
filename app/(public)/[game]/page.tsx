"use client";

import { notFound } from "next/navigation";
import { use, useState, useMemo } from "react";
import { CATEGORIES, CATEGORY_FILTERS, GAME_SLUGS } from "@/utils/constants";
import { Environment, Category, TasEntry, GameSet } from "@/utils/typing";
import { TRACKS, tracksByGame } from "@/lib/TrackList";
import { useBestRtaRecords } from "@/lib/RtaRecords";
import { useTasRecords } from "@/lib/TasRecords";
import { useProfilePrivate } from "@/lib/Profiles";
import HeaderOptions from "@/components/game/HeaderOptions";
import RecordTable from "@/components/game/RecordTable";
import TimeSaved from "@/components/game/TimeSaved";
import Leaderboard from "@/components/game/Leaderboard";
import RtaTable from "@/components/game/RtaLeaderboard";

export default function GamePage({ params }: { params: Promise<{ game: string }> }) {

  const { game } = use(params);
  const gameName = GAME_SLUGS[game];
  if (!gameName) { notFound() }

  const trackList = tracksByGame[gameName];
  const [selectedAuthor, setSelectedAuthor] = useState<string>("All Authors");
  const [selectedGameSet, setSelectedGameSet] = useState<GameSet | "All Sets">("All Sets");
  const [selectedCategory, setSelectedCategory] = useState<Category>("Open");
  const [selectedEnvironment, setSelectedEnvironment] = useState<Environment | "All Envs">("All Envs");
 
  const { data: profilePrivate, isLoading } = useProfilePrivate();
  const { data: bestRtaByTrack } = useBestRtaRecords();
  const { data: tasRecords = [] } = useTasRecords();

  const {
    show_rta = true,
    show_time_saved = true,
    show_leaderboard = true,
    show_rta_leaderboard = true,
    show_recent = true,
  } = profilePrivate ?? {};

  const gameCategories = useMemo(() => {
    const categories = new Set(
      tasRecords
        .filter(tas => tas.game === gameName)
        .map(tas => tas.category)
    );
    return CATEGORIES.filter((category) => categories.has(category));
  }, [tasRecords, gameName])

  const currentRecords = useMemo(() => {

    if (!bestRtaByTrack) return []
    
    const bestTasByTrack = new Map<string, TasEntry>();
    const allowedCategories = CATEGORY_FILTERS[selectedCategory];

    for (const entry of Object.values(tasRecords)) {
      if (!allowedCategories.has(entry.category)) continue;

      const baseTrack = TRACKS[entry.track].baseTrack ?? entry.track
      const tasGame = TRACKS[baseTrack].game

      if (tasGame !== gameName) continue;

      const existing = bestTasByTrack.get(baseTrack);

      if (!existing || entry.time_ms < existing.time_ms || (entry.time_ms === existing.time_ms && entry.date < existing.date)) {
        bestTasByTrack.set(baseTrack, entry);
      }
    }

    return trackList.map((track) => ({
      track: (TRACKS[track].noCutTrack && selectedCategory === "No Cut") ? TRACKS[track].noCutTrack : track,
      trackInfo: (TRACKS[track].noCutTrack && selectedCategory === "No Cut") ? TRACKS[TRACKS[track].noCutTrack] : TRACKS[track],
      tas: bestTasByTrack.get(track) ?? null,
      rta: bestRtaByTrack.get((TRACKS[track].noCutTrack && selectedCategory === "No Cut") ? TRACKS[track].noCutTrack : track) ?? null,
    }));
  }, [gameName, bestRtaByTrack, tasRecords, selectedCategory, trackList]);

  const selectedAuthorCheck = useMemo(() => {
    if (!selectedAuthor) return "";

    const authors = new Set<string>();
    for (const row of currentRecords) {
      const a = row.tas?.authors;
      if (!a) continue;
      for (const author of a) authors.add(author);
    }
    
    return authors.has(selectedAuthor) ? selectedAuthor : "All Authors";
  }, [selectedAuthor, currentRecords]);

  const filteredRows = useMemo(() => {
    return currentRecords.filter((row) => {
      const matchesAuthor = !selectedAuthorCheck || selectedAuthorCheck === "All Authors" || row.tas?.authors.includes(selectedAuthorCheck);
      const matchesEnvironment = selectedEnvironment === "All Envs" || row.trackInfo.environment === selectedEnvironment;
      const matchesGameSet = !selectedGameSet || selectedGameSet === "All Sets" || row.trackInfo.gameSet === selectedGameSet;
      return matchesEnvironment && matchesAuthor && matchesGameSet;
    })
  }, [currentRecords, selectedAuthorCheck, selectedEnvironment, selectedGameSet]);

  if (isLoading) {
    return <div className="text-white p-10">Loading...</div>;
  }

  return (
    <div className="relative pt-20 min-h-screen overflow-hidden bg-slate-950">
      <div className="relative z-10">

        <HeaderOptions
          game={gameName}
          currentRecords={currentRecords}
          gameCategories={gameCategories}
          selectedAuthor={selectedAuthorCheck}
          selectedGameSet={selectedGameSet}
          selectedCategory={selectedCategory}
          selectedEnvironment={selectedEnvironment}
          onAuthorChange={setSelectedAuthor}
          onGameSetChange={setSelectedGameSet}
          onCategoryChange={setSelectedCategory}
          onEnvironmentChange={setSelectedEnvironment}
        />

        <div className="p-3 gap-4 justify-center flex flex-col xl:flex-row">
          
          <div className="overflow-x-auto">
            <RecordTable 
              game={gameName}
              showRta={show_rta}
              showRecent={show_recent}
              currentRecords={filteredRows}
              selectedCategory={selectedCategory}
          />
          </div>

          <div className="items-center justify-center gap-4 flex flex-wrap sm:items-start xl:flex-col xl:justify-start">
            {show_time_saved && (<TimeSaved currentRecords={filteredRows} />)}

            <div className="items-center gap-4 flex flex-col sm:flex-row sm:items-start">
              {show_leaderboard && (<Leaderboard currentRecords={filteredRows} />)}
              {show_rta_leaderboard && (<RtaTable currentRecords={filteredRows} />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
