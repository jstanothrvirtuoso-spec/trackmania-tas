"use client";

import { useMemo } from "react";
import { GameBoard } from "../../lib/leaderboards";

interface HeaderOptionsProps {
  game: GameBoard;
  selectedAuthor: string;
  onAuthorChange: (author: string) => void;
}

export default function HeaderOptions({
  game,
  selectedAuthor,
  onAuthorChange,
}: HeaderOptionsProps) {
  const authorOptions = useMemo(() => {
    const authorCount = new Map<string, number>();
    game.entries.forEach((entry) => {
      entry.authors.forEach((author) => {
        authorCount.set(author, (authorCount.get(author) || 0) + 1);
      });
    });
    return Array.from(authorCount.entries())
      .sort((a, b) => b[1] - a[1]) // Sort by TAS count descending
      .map(([author, count]) => ({ author, count }));
  }, [game.entries]);

  return (
    <div className="mb-0 flex justify-end">
      <select
        value={selectedAuthor}
        onChange={(e) => onAuthorChange(e.target.value)}
        className="rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:border-slate-500 focus:outline-none"
      >
        <option value="">All Authors</option>
        {authorOptions.map(({ author, count }) => (
          <option key={author} value={author}>
            {author} ({count} TAS{count !== 1 ? "es" : ""})
          </option>
        ))}
      </select>
    </div>
  );
}
