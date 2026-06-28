"use client";

import { useMemo } from "react";
import { DropSelect } from "@/components/DropSelect";
import { Game, Environment, Category, RecordRow } from "@/utils/typing";
import { getEnvironmentOptions } from "@/lib/TrackList";

type EnvironmentFilter = Environment | "All Envs";

const CATEGORY_OPTIONS: Partial<Record<Game, Category[]>> = {
  "TMNF": ["Open", "NOseboost", "No Uber", "WR Route", "No Cut", "Low Input"],
  "TMUF": ["Open", "No Cut"],
};

interface HeaderOptionsProps {
  game: Game,
  currentRecords: RecordRow[],
  selectedAuthor: string;
  selectedCategory: Category;
  selectedEnvironment: EnvironmentFilter;
  onAuthorChange: (author: string) => void;
  onCategoryChange: (category: Category) => void;
  onEnvironmentChange: (environment: EnvironmentFilter) => void;
};

export default function HeaderOptions({
  game,
  currentRecords,
  selectedAuthor,
  selectedCategory,
  selectedEnvironment,
  onAuthorChange,
  onCategoryChange,
  onEnvironmentChange,
}: HeaderOptionsProps) {

  const categoryOptions = CATEGORY_OPTIONS[game]
  const environmentOptions = getEnvironmentOptions(game)

  const authorOptions = useMemo(() => {
    const authorCount = new Map<string, number>();

    for (const row of currentRecords) {
      const authors = row.tas?.authors;
      if (!authors) continue;

      for (const author of authors) {
        authorCount.set(author, (authorCount.get(author) ?? 0) + 1);
      }
    }

    return [...authorCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([author, count]) => ({ author, count }));
  }, [currentRecords]);

  return (
    <div className="flex w-full flex-wrap justify-center items-center gap-3 px-4">

      {/* Categories */}
      {categoryOptions && (
        <DropSelect
          initialValue={selectedCategory as Category}
          options={categoryOptions.map((category) => ({
            value: category,
            label: category,
          }))}
          onChange={(value) => onCategoryChange(value as Category)}
        />
      )}

      {/* Author */}
      <DropSelect
        initialValue={selectedAuthor as string}
        defaultOption={{ value: "" as string, label: "All Authors" }}
        options={authorOptions.map(({ author, count }) => ({
          value: author,
          label: `${author} (${count} TAS${count !== 1 ? "es" : ""})`,
        }))}
        onChange={(value) => onAuthorChange(value)}
      />

      {/* Environment */}
      {environmentOptions.length > 1 && (
        <DropSelect
          initialValue={selectedEnvironment}
          options={environmentOptions.map((environment) => ({
            value: environment,
            label: environment,
          }))}
          onChange={(value) => onEnvironmentChange(value as EnvironmentFilter)}
          defaultOption={{ value: "All Envs", label: "All Envs" }}
        />
      )}

    </div>
  );
}
