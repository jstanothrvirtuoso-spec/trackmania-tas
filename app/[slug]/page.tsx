"use client";

import { use, useState } from "react";
import { Category, Environment, gameSlugMap } from "../../lib/TrackLists";
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
  const [selectedEnvironment, setSelectedEnvironment] = useState<Environment>("All");

  if (!game) {
    throw new Error("Game not found");
  }

  return (
    <div>
      <div className="flex justify-center px-4 py-3">
        <HeaderOptions
          selectedAuthor={selectedAuthor}
          selectedCategory={selectedCategory}
          selectedEnvironment={selectedEnvironment}
          onAuthorChange={setSelectedAuthor}
          onCategoryChange={setSelectedCategory}
          onEnvironmentChange={setSelectedEnvironment}
        />
      </div>

      <div className="lg:flex lg:items-start lg:gap-0 justify-center">
        <RecordTable game={game} selectedAuthor={selectedAuthor} selectedCategory={selectedCategory} selectedEnvironment={selectedEnvironment} />
        <TimeSaved game={game} />
      </div>
    </div>
  );
}