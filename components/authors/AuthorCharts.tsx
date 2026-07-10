"use client"

import { useMemo, useState } from "react";
import { RecordRow, Environment, Category } from "@/utils/typing";
import { ENVIRONMENT, CAMPAIGNS, CATEGORIES } from "@/utils/constants";
import { Campaign } from "@/utils/typing";

const RADIUS = 60;
const STROKE = 120;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const PALETTE = [
  "#077692",
  "#6d28d9",
  "#057451",
  "#945105",
  "#990f31",
  "#1f4eb4",
  "#7c7a0f",
  "#c50b59",
  "#4d7c0f",
  "#971d9b",
  "#1d9b2e",
] as const;

const GAME_COLOUR = Object.fromEntries(
  CAMPAIGNS.map((e, i) => [e, PALETTE[i]])
) as Record<Campaign, string>;

const ENVIRONMENT_COLOUR = Object.fromEntries(
  ENVIRONMENT.map((e, i) => [e, PALETTE[i]])
) as Record<Environment, string>;

const CATEGORY_COLOUR = Object.fromEntries(
  CATEGORIES.map((e, i) => [e, PALETTE[i]])
) as Record<Category, string>;

export function AuthorYearChart({ rows, selectedYear, onSelectYear }: {
  rows: RecordRow[]; 
  selectedYear: number | null; 
  onSelectYear: (year: number | null) => void 
}) {

  const yearlyCounts = useMemo(() => {
    const counts = new Map<number, number>();

    let minYear = Infinity;

    rows.forEach((row) => {
      if (!row.tas) return;

      const year = new Date(row.tas.date).getFullYear();
      minYear = Math.min(minYear, year);

      counts.set(year, (counts.get(year) || 0) + 1);
    });

    if (minYear === Infinity) return [];

    const result: [number, number][] = [];

    for (let year = minYear; year <= 2026; year++) {
      result.push([year, counts.get(year) || 0]);
    }

    return result;
  }, [rows]);

  const maxCount = Math.max(...yearlyCounts.map(([, c]) => c), 1);

  return (
    <div className="min-w-[300px] rounded-lg border border-slate-800 bg-gradient-to-br from-violet-500/10 via-slate-900/60 to-violet-500/10 p-3 shadow-[0_5px_20px_rgba(0,0,0,0.6)] backdrop-blur-sm">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">
        Year
      </h2>

      <div
        className="mx-auto h-50 w-fit gap-2.5"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${yearlyCounts.length}, minmax(0, 1fr))`,
        }}
      >
        {yearlyCounts.map(([year, count]) => {
          const height = (count / maxCount) * 150;
          const isSelected = selectedYear === year;

          return (
            <div
              key={year}
              className="flex flex-col items-center justify-end gap-1"
            >
              <div className="text-xs text-slate-400">
                {count}
              </div>

              <button
                type="button"
                disabled={count === 0}
                onClick={() => onSelectYear(isSelected ? null : year)}
                className={`w-full max-w-32 rounded-t transition-all focus:outline-none ${count > 0 ? "hover:bg-violet-300 cursor-pointer" : ""} ${isSelected ? "bg-violet-300 ring-2 ring-violet-400" : "bg-violet-400/70"}`}
                style={{
                  height: `${height}px`,
                  minHeight: "3px",
                }}
              />

              <div className="text-sm text-slate-400">
                {year}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function AuthorGameChart({ rows, selectedGame, onSelectGame }: {
  rows: RecordRow[];
  selectedGame: Campaign | null;
  onSelectGame: (game: Campaign | null) => void;
}) {

  const gameCounts = useMemo(() => {
    const counts = new Map<string, number>();

    rows.forEach((row) => {
      if (!row.tas) return;
      counts.set(row.tas.game, (counts.get(row.tas.game) || 0) + 1);
    });

    return CAMPAIGNS
      .map((game) => ({ type: game, count: counts.get(game) || 0 }))
      .filter((item) => item.count > 0);
  }, [rows]);

  return (
    <PieChart
      title="Game"
      counts={gameCounts}
      colours={GAME_COLOUR}
      gradient="from-amber-500/10 via-slate-900/60 to-amber-500/10"
      selected={selectedGame}
      onSelect={onSelectGame}
    />
  );
}

export function AuthorEnvironmentChart({ rows, selectedEnvironment, onSelectEnvironment }: {
  rows: RecordRow[]; 
  selectedEnvironment: Environment | null; 
  onSelectEnvironment: (environment: Environment | null) => void;
}) {

  const environmentCounts = useMemo(() => {
    const counts = new Map<string, number>();

    rows.forEach((row) => {
      const env = row.trackInfo.environment;
      if (!env) return;
      counts.set(env, (counts.get(env) || 0) + 1);
    });

    return ENVIRONMENT
      .map((env) => ({ type: env, count: counts.get(env) || 0 }))
      .filter((item) => item.count > 0);
  }, [rows]);

  return (
    <PieChart
      title="Environment"
      counts={environmentCounts}
      colours={ENVIRONMENT_COLOUR}
      gradient="from-red-500/10 via-slate-900/60 to-red-500/10"
      selected={selectedEnvironment}
      onSelect={onSelectEnvironment}
    />
  );
}

export function AuthorCategoryChart({ rows, selectedCategory, onSelectCategory }: {
  rows: RecordRow[]; 
  selectedCategory: Category | null; 
  onSelectCategory: (category: Category | null) => void;
}) {

  const categoryCounts = useMemo(() => {
    const counts = new Map<Category, number>();

    rows.forEach((row) => {
      const category = row.tas?.category;
      if (!category) return;
      counts.set(category, (counts.get(category) || 0) + 1);
    });

    return CATEGORIES
      .map((category) => ({ type: category, count: counts.get(category) || 0 }))
      .filter((item) => item.count > 0);
  }, [rows]);

  return (
    <PieChart
      title="Category"
      counts={categoryCounts}
      colours={CATEGORY_COLOUR}
      gradient="from-cyan-500/10 via-slate-900/60 to-cyan-500/10"
      selected={selectedCategory}
      onSelect={onSelectCategory}
    />
  );
}

function PieChart<T extends string>({ title, counts, colours, gradient, selected, onSelect }: {
  title: string;
  counts: { type: T; count: number }[];
  colours: Record<T, string>;
  gradient: string;
  selected: T | null;
  onSelect: (selected: T | null) => void;
}) {

  const [hovered, setHovered] = useState<T | null>(null);
  
  const total = counts.reduce((sum, item) => sum + item.count, 0);

  const slices = useMemo(() => {
    let offset = 0;

    return counts.map(({ type, count }) => {
      const percentage = count / total;
      const dash = percentage * CIRCUMFERENCE;
      const slice = { type, dash, offset, count };
      
      // eslint-disable-next-line react-hooks/immutability
      offset += dash;
      return slice;
    });
  }, [counts, total]);

  return (
    <div className={`min-w-[220px] rounded-lg border border-slate-800 bg-gradient-to-br ${gradient} p-3 shadow-[0_5px_20px_rgba(0,0,0,0.6)] backdrop-blur-sm`}>
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">
        {title}
      </h2>

      <div className="flex items-start justify-center pl-1 gap-3">
        <svg
          viewBox="0 0 250 250"
          className="h-50 w-50 -rotate-90"
        >
          {slices.map(({ type, dash, offset }) => {
            const isSelected = selected === type;

            return (
              <circle
                key={type}
                cx="125"
                cy="125"
                r={RADIUS}
                fill="none"
                stroke={colours[type]}
                strokeWidth={hovered === type ? STROKE + 8 : STROKE}
                strokeDasharray={`${dash} ${CIRCUMFERENCE - dash}`}
                strokeDashoffset={-offset}
                opacity={selected && !isSelected ? 0.35 : 1}
                className="cursor-pointer transition-all duration-350"
                onMouseEnter={() => setHovered(type)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => onSelect(isSelected ? null : type)}
              />
            );
          })}
        </svg>

        <div className="flex flex-col justify-start items-start gap-y-1">
          {counts.map(({ type, count }) => (
            <button
              key={type}
              type="button"
              onMouseEnter={() => setHovered(type)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onSelect(selected === type ? null : type)}
              className={`flex items-center gap-1 text-[11px] cursor-pointer ${hovered === type ? "text-slate-200" : "text-slate-400"}`}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: colours[type] }}
              />
              {type.length > 8 ? `${type.slice(0, 6)}.` : type} ({count})
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
