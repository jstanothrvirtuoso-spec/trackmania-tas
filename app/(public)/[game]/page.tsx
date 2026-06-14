"use client";

import { notFound } from "next/navigation";
import { use, useState, useMemo } from "react";
import { CATEGORY_FILTERS, GAME_SLUGS } from "@/utils/constants";
import { Environment, Category, TasEntry } from "@/utils/typing";
import { trackList } from "@/lib/TrackList";
import { useRtaRecords, buildBestRtaByTrack } from "@/lib/RtaRecords";
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
  
  const [selectedAuthor, setSelectedAuthor] = useState<string>("All Authors");
  const [selectedCategory, setSelectedCategory] = useState<Category>("Open");
  const [selectedEnvironment, setSelectedEnvironment] = useState<Environment | "All Envs">("All Envs");
  const allowedCategories = CATEGORY_FILTERS[selectedCategory]

  const { data: profilePrivate, isLoading } = useProfilePrivate();
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
    show_recent = true,
  } = profilePrivate ?? {};

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
  }, [gameName, bestRtaByTrack, tasRecords, allowedCategories, selectedCategory]);

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
      const matchesAuthor = !selectedAuthorCheck || selectedAuthorCheck === "All Authors" || row.tas?.authors.includes(selectedAuthorCheck)
      const matchesEnvironment = selectedEnvironment === "All Envs" || row.trackInfo.environment === selectedEnvironment
      return matchesEnvironment && matchesAuthor;
    })
  }, [currentRecords, selectedAuthorCheck, selectedEnvironment]);

  if (isLoading) {
    return <div className="text-white p-10">Loading...</div>;
  }

 return (
  <div className="relative pt-20 min-h-screen overflow-hidden">

    {/* Blurred wallpaper layer */}
    <div
      className="absolute inset-0 bg-cover bg-center scale-110 blur-md"
      style={{ backgroundImage: "url('/wallpapers/gamewp.webp')" }}
    />

    {/* Dark overlay */}
    <div className="absolute inset-0 bg-black/85" />

    {/* Content */}
    <div className="relative z-10">

      <HeaderOptions
        game={gameName}
        currentRecords={currentRecords}
        selectedAuthor={selectedAuthorCheck}
        selectedCategory={selectedCategory}
        selectedEnvironment={selectedEnvironment}
        onAuthorChange={setSelectedAuthor}
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

        <div className="items-start gap-4 flex flex-col">
          {show_time_saved && (<TimeSaved currentRecords={filteredRows} />)}

          <div className="items-start gap-4 flex flex-col xl:flex-row">
            {show_leaderboard && (<Leaderboard currentRecords={filteredRows} />)}
            {show_rta_leaderboard && (<RtaTable currentRecords={filteredRows} />)}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
