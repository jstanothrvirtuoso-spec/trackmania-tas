"use client";

import { use, useState, useMemo } from "react";
import { useVisibleTables } from "@/lib/VisibleTablesContext";
import { Category, Environment, categoryFilters, gameSlugMap } from "../../lib/TrackLists";
import { useTasRecords } from "../../lib/TasRecords";
import { useRtaRecords, buildBestRtaByTrack } from "../../lib/RtaRecords";
import { trackList, TasEntry } from "../../lib/TrackLists";
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
  const { showTimeSaved, showLeaderboard, showRtaLeaderboard } = useVisibleTables();

  const [selectedAuthor, setSelectedAuthor] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<Category>("Open");
  const [selectedEnvironment, setSelectedEnvironment] = useState<Environment>("All");
  
  const { data: rtaRecords = [] } = useRtaRecords();
  const { data: tasRecords = [] } = useTasRecords();
  const bestRtaByTrack = useMemo(() => {
    if (!rtaRecords.length) return new Map();
    return buildBestRtaByTrack(rtaRecords)
  }, [rtaRecords])

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
  }, [game, selectedCategory, rtaRecords]);

  if (!game) {
    throw new Error("Game not found");
  }

  return (
    <div>
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
          currentRecords={currentRecords}
          selectedAuthor={selectedAuthor}
          selectedEnvironment={selectedEnvironment}
        />

        <div className="flex flex-col items-start gap-1">
          {showTimeSaved && (<TimeSaved currentRecords={currentRecords} />)}

          <div className="flex flex-row items-start gap-1">
            {showLeaderboard && (<Leaderboard currentRecords={currentRecords} />)}
            {showRtaLeaderboard && (<RtaTable currentRecords={currentRecords} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
