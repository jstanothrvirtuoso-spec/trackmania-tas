"use client";

import { use, useState } from "react";
import { leaderboards } from "../../lib/leaderboards";
import HeaderOptions from "./HeaderOptions";
import RecordTable from "./RecordTable";
import TimeSaved from "./TimeSaved";

export default function GamePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const game = leaderboards.find((g) => g.slug === slug);
  const [selectedAuthor, setSelectedAuthor] = useState<string>("");

  if (!game) {
    throw new Error("Game not found");
  }

  return (
    <div>
      <div className="flex justify-center px-4 py-3">
        <HeaderOptions
          game={game}
          selectedAuthor={selectedAuthor}
          onAuthorChange={setSelectedAuthor}
        />
      </div>
      <div className="lg:flex lg:items-start lg:gap-0 justify-center">
        <RecordTable game={game} selectedAuthor={selectedAuthor} />
        <TimeSaved game={game} />
      </div>
    </div>
  );
}