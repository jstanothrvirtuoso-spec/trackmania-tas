"use client";

import { use, useState } from "react";
import { Category, gameSlugMap } from "../../lib/TrackLists";
import HeaderOptions from "./HeaderOptions";
import RecordTable from "./RecordTable";
import TimeSaved from "./TimeSaved";

export default function GamePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  const game = gameSlugMap[slug];

  const [selectedAuthor, setSelectedAuthor] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<Category>("Open");

  if (!game) {
    throw new Error("Game not found");
  }

  return (
    <div>
      <div className="flex justify-center px-4 py-3">
        <HeaderOptions
          selectedAuthor={selectedAuthor}
          selectedCategory={selectedCategory}
          onAuthorChange={setSelectedAuthor}
          onCategoryChange={setSelectedCategory}
        />
      </div>

      <div className="lg:flex lg:items-start lg:gap-0 justify-center">
        <RecordTable game={game} selectedAuthor={selectedAuthor} selectedCategory={selectedCategory} />
        <TimeSaved game={game} />
      </div>
    </div>
  );
}