"use client";

import { use, useState, useMemo } from "react";
import { Category, Environment, categories, gameSlugMap } from "../../lib/TrackLists";
import { TasRecords } from "../../lib/TasRecords";
import { RtaRecords } from "../../lib/RtaRecords";
import { trackList, TasEntry, RtaEntry } from "../../lib/TrackLists";
import HeaderOptions from "./HeaderOptions";
import RecordTable from "./RecordTable";
import TimeSaved from "./TimeSaved";
import Leaderboard from "./Leaderboard";

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

  const allowedCategories = useMemo(() => {
    const targetCategory = game === "TMNF No Cut" ? "No Cut" : selectedCategory;
    const index = categories.indexOf(targetCategory);
    return new Set(categories.slice(index));
  }, [selectedCategory]);

  const currentRecords = useMemo(() => {
    const bestTasByTrack = new Map<string, TasEntry>();
    const bestRtaByTrack = new Map<string, RtaEntry>();
    const targetGame = game === "TMNF No Cut" ? "TMNF" : game;

    Object.values(TasRecords)
      .filter((e) => e.game === targetGame)
      .filter((e) => allowedCategories.has(e.category))
      .forEach((entry) => {
        const existing = bestTasByTrack.get(entry.track);

        if (
          !existing ||
          entry.timeMs < existing.timeMs ||
          (
            entry.timeMs === existing.timeMs &&
            new Date(entry.date).getTime() <
              new Date(existing.date).getTime()
          )
        ) {
          bestTasByTrack.set(entry.track, entry);
        }
      });

    Object.values(RtaRecords)
      .filter((e) => e.game === game)
      .forEach((entry) => {
        const existing = bestRtaByTrack.get(entry.track);

        if (
          !existing ||
          entry.timeMs < existing.timeMs ||
          (
            entry.timeMs === existing.timeMs &&
            new Date(entry.date).getTime() <
              new Date(existing.date).getTime()
          )
        ) {
          bestRtaByTrack.set(entry.track, entry);
        }
      });

    return Object.entries(trackList)
      .filter(([, info]) => info.game === game)
      .map(([track, trackInfo]) => ({
        track,
        trackInfo,
        tas: bestTasByTrack.get(trackInfo.track || track) ?? null,
        rta: bestRtaByTrack.get(trackInfo.track || track) ?? null,
      }));
  }, [game, selectedCategory]);

  if (!game) {
    throw new Error("Game not found");
  }

  return (
    <div>
      <div className="flex justify-center px-4 py-3">
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

        <div className="flex flex-col items-start gap-2">
          <TimeSaved currentRecords={currentRecords} />
          <Leaderboard currentRecords={currentRecords} />
        </div>
      </div>
    </div>
  );
}
