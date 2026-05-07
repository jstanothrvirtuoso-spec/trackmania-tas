"use client";

import { useMemo } from "react";
import { TasRecords } from "../../lib/TasRecords";
import { categories, Category } from "../../lib/TrackLists";

interface HeaderOptionsProps {
  selectedAuthor: string;
  selectedCategory: Category;
  onAuthorChange: (author: string) => void;
  onCategoryChange: (category: Category) => void;
}

export default function HeaderOptions({
  selectedAuthor,
  selectedCategory,
  onAuthorChange,
  onCategoryChange,
}: HeaderOptionsProps) {

  const authorOptions = useMemo(() => {
    const authorCount = new Map<string, number>();
    const tasMeta = TasRecords
    tasMeta.forEach((entry) => {
      entry.authors.forEach((author) => {
        authorCount.set(author, (authorCount.get(author) || 0) + 1);
      });
    });
    return Array.from(authorCount.entries())
      .sort((a, b) => b[1] - a[1]) // Sort by TAS count descending
      .map(([author, count]) => ({ author, count }));
  }, [TasRecords]);

  return (
    <div className="mb-0 flex items-center justify-end gap-3">
      <select
        value={selectedCategory}
        onChange={(e) => onCategoryChange(e.target.value as Category)}
        className="rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:border-slate-500 focus:outline-none"
      >
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>
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
