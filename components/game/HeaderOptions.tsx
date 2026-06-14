"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

function CustomSelect<T extends string>({ initialValue, defaultOption, options, onChange,}: {
  initialValue: T;
  defaultOption: { value: T; label: string };
  options: { value: T; label: string }[];
  onChange?: (value: T) => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const measureRef = useRef<HTMLDivElement | null>(null);
  const allOptions = [defaultOption, ...options];

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(initialValue);
  const [buttonWidth, setButtonWidth] = useState<number | null>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (measureRef.current) {
      const width = Array.from(measureRef.current.children).reduce(
        (max, child) => Math.max(max, (child as HTMLElement).getBoundingClientRect().width),
        0,
      );
      setButtonWidth(Math.min(Math.ceil(width + 30), window.innerWidth - 32));
    }
  }, [allOptions]);

  return (
    <div
      ref={ref}
      className="relative inline-block text-left"
      style={buttonWidth ? { width: `${buttonWidth}px` } : { minWidth: 170 }}
    >
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative inline-flex w-full items-center justify-between rounded-md border border-slate-700 bg-slate-800 px-2 py-1.5 pr-10 text-left text-sm text-slate-100 shadow-sm transition hover:bg-slate-700"
        type="button"
      >
        <span className="truncate">
          {allOptions.find((option) => option.value === value)?.label ?? defaultOption.label}
        </span>
        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-5 w-5 items-center justify-center">
          <svg viewBox="0 0 20 20" className="h-4 w-4 fill-current text-slate-100">
            <path d="M10 14l5-5H5l5 5z" />
          </svg>
        </span>
      </button>

      <div ref={measureRef} className="pointer-events-none absolute left-0 top-0 opacity-0 whitespace-nowrap">
        {allOptions.map((option) => (
          <span key={option.value} className="inline-block px-2 py-1 text-xs font-sans">
            {option.label}
          </span>
        ))}
      </div>

      {open && (
        <div className="absolute left-0 z-20 mt-1 w-full max-h-56 overflow-y-auto rounded-xl border border-slate-700 bg-slate-900/95 p-1 shadow-2xl backdrop-blur-sm">
          {allOptions.map((option, index) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                setValue(option.value);
                onChange?.(option.value);
                setOpen(false);
              }}
              className={`w-full rounded-md px-2 py-1 text-left text-xs transition ${
                option.value === defaultOption.value ? "text-emerald-300 font-semibold italic" : "text-slate-100"
              } ${index % 2 === 0 ? "bg-slate-900" : "bg-slate-800"} hover:bg-emerald-700/80`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

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
      {game === "TMNF" && (
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value as Category)}
          style={{ lineHeight: 1.1 }}
          className="
            cursor-pointer rounded-md border border-slate-700 bg-slate-800 px-2 py-1.5 text-xs 
            leading-none text-slate-100 focus:border-slate-500 focus:outline-none transition 
            hover:bg-slate-700 hover:text-white sm:px-3 sm:text-sm
          "
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat} className="leading-tight">
              {cat}
            </option>
          ))}
        </select>
      )}

      {/* Author */}
      <select
        value={selectedAuthor}
        onChange={(e) => onAuthorChange(e.target.value)}
        style={{ lineHeight: 1.1 }}
        className="
          cursor-pointer rounded-md border border-slate-700 bg-slate-800 px-2 py-1.5 text-xs 
          leading-none text-slate-100 focus:border-slate-500 focus:outline-none transition 
          hover:bg-slate-700 hover:text-white sm:px-3 sm:text-sm
        "
      >
        <option value="" className="leading-tight">All Authors</option>
        {authorOptions.map(({ author, count }) => (
          <option key={author} value={author} className="leading-tight py-0" style={{ lineHeight: 1.1 }}>
            {author} ({count} TAS{count !== 1 ? "es" : ""})
          </option>
        ))}
      </select>

      {/* Environment */}
      {environmentOptions.length > 1 && (
        <select
          value={selectedEnvironment}
          onChange={(e) => onEnvironmentChange(e.target.value as EnvironmentFilter)}
          style={{ lineHeight: 1.1 }}
          className="
            cursor-pointer rounded-md border border-slate-700 bg-slate-800 px-2 py-1.5 text-xs 
            leading-none text-slate-100 focus:border-slate-500 focus:outline-none transition 
            hover:bg-slate-700 hover:text-white sm:px-3 sm:text-sm
          "
        >
          {environmentOptions.map((env) => (
            <option key={env} value={env} className="leading-tight py-0" style={{ lineHeight: 1.1 }}>
              {env}
            </option>
          ))}
        </select>
      )}

      {/* Dummy custom select example with scrolling */}
      <CustomSelect
        initialValue={selectedAuthor as string}
        defaultOption={{ value: "" as string, label: "All Authors" }}
        options={authorOptions.map(({ author, count }) => ({
          value: author,
          label: `${author} (${count} TAS${count !== 1 ? "es" : ""})`,
        }))}
        onChange={(value) => onAuthorChange(value)}
      />
    </div>
  );
}
