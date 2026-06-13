"use client";

import { useMemo } from "react";
import { CATEGORIES, ENVIRONMENT } from "@/utils/constants";
import { Game, Environment, Category, RecordRow } from "@/utils/typing";

type EnvironmentFilter = Environment | "All";
interface HeaderOptionsProps {
  game: Game,
  currentRecords: RecordRow[],
  selectedAuthor: string;
  selectedCategory: Category;
  selectedEnvironment: EnvironmentFilter;
  onAuthorChange: (author: string) => void;
  onCategoryChange: (category: Category) => void;
  onEnvironmentChange: (environment: EnvironmentFilter) => void;
}

export default function HeaderOptions({
  game,
  currentRecords,
  selectedAuthor,
  selectedCategory,
  selectedEnvironment,
  onAuthorChange,
  onCategoryChange,
  onEnvironmentChange
}: HeaderOptionsProps) {

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

  const environmentOptions: EnvironmentFilter[] = useMemo(() => {
    const set = new Set<Environment>();
    currentRecords.forEach((row) => {
      if (row.trackInfo?.environment) {
        set.add(row.trackInfo.environment);
      }
    });
    const ordered = ENVIRONMENT.filter((env) => set.has(env));
    return ordered.length > 1 ? ["All", ...ordered] : ordered;
  }, [currentRecords]);

  return (
    <div className="flex w-full flex-wrap justify-center items-center gap-3 px-4">

      {/* Categories */}
      {game === "TMNF" || true && (
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value as Category)}
          className="cursor-pointer rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:border-slate-500 focus:outline-none transition hover:bg-slate-700 hover:text-white"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      )}

      {/* Author */}
      <select
        value={selectedAuthor}
        onChange={(e) => onAuthorChange(e.target.value)}
        className="cursor-pointer rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:border-slate-500 focus:outline-none transition hover:bg-slate-700 hover:text-white"
      >
        <option value="">All Authors</option>
        {authorOptions.map(({ author, count }) => (
          <option key={author} value={author}>
            {author} ({count} TAS{count !== 1 ? "es" : ""})
          </option>
        ))}
      </select>

      {/* Environment */}
      {environmentOptions.length > 1 && (
        <select
          value={selectedEnvironment}
          onChange={(e) => onEnvironmentChange(e.target.value as EnvironmentFilter)}
          className="cursor-pointer rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:border-slate-500 focus:outline-none transition hover:bg-slate-700 hover:text-white"
        >
          {environmentOptions.map((env) => (
            <option key={env} value={env}>
              {env}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
