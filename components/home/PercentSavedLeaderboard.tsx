"use client";

import { useMemo, useState } from "react";
import { TasEntry, RtaEntry, Category } from "@/utils/typing";
import { CATEGORIES, CATEGORY_FILTERS } from "@/utils/constants";
import { TRACKS } from "@/lib/TrackList";
import { DropSelect } from "@/components/DropSelect";
import { formatAuthors, formatTrack } from "../FormatLinks";

const TIER_COLOURS = [
  ["bg-emerald-700/30", "bg-emerald-700/40"],
  ["bg-orange-400/25", "bg-orange-400/30"],
  ["bg-purple-950/20", "bg-purple-950/35"],
] as const;

const TIERS: Record<Category, number[]> = {
  "Open": [50, 60, 70],
  "NOseboost": [10, 20, 30],
  "No Uber": [5, 10, 20],
  "WR Route": [2, 4, 5],
  "No Cut": [1, 2, 4],
  "Low Input": [0, 1, 2],
}

export default function PercentSavedLeaderboard( { tasRecords, bestRtaByTrack }: {
  tasRecords: TasEntry[], 
  bestRtaByTrack: Map<string, RtaEntry>
}) {

  const [category, setCategory] = useState<Category>("Open");

  const filteredTasRecords = useMemo(() => {
    if (category === "Open") return tasRecords;

    const allowed = CATEGORY_FILTERS[category];

    return tasRecords.filter((r) => allowed.has(r.category));
  }, [tasRecords, category]);

  const bestTasByTrack = useMemo(() => {
    const map = new Map<string, TasEntry>();

    for (const entry of filteredTasRecords) {
      const existing = map.get(entry.track);

      if (
        !existing ||
        entry.time_ms < existing.time_ms ||
        (entry.time_ms === existing.time_ms &&
          entry.date < existing.date)
      ) {
        map.set(entry.track, entry);
      }
    }

    return map;
  }, [filteredTasRecords]);

  const data = useMemo(() => {
    const result = [];

    for (const track of Object.keys(TRACKS)) {
      const tas = bestTasByTrack.get(track);
      const rta = bestRtaByTrack.get(track);

      if (!tas || !rta) continue;

      const pcSaved = ((rta.time_ms - tas.time_ms) / rta.time_ms) * 100;

      const [ tier1, tier2, tier3 ] = TIERS[category]

      if (pcSaved < tier1) continue;

      result.push({
        track,
        tas,
        rta,
        pcSaved,
        tier: pcSaved >= tier3 ? 0 : pcSaved >= tier2 ? 1 : 2,
      });
    }

    result.sort((a, b) => b.pcSaved - a.pcSaved || a.tas.date.localeCompare(b.tas.date));

    return result;
  }, [bestTasByTrack, bestRtaByTrack, category]);

  return (
    <div className="flex flex-col rounded-2xl max-w-135 backdrop-blur-md w-full">
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-[0_10px_40px_rgba(0,0,0,0.85)]">

        {/* Banner */}
        <div className="flex items-center justify-between gap-5 border-b border-slate-800 bg-gradient-to-r from-slate-950 to-slate-800 px-3 py-1.5">
          <h3 className="font-kiwi tracking-[0.15em] text-xs sm:text-sm font-bold uppercase text-sky-200">
            Savings Leaderboard
          </h3>

          <DropSelect
            initialValue={category}
            options={CATEGORIES.filter((c) => c !== "Low Input").map((category) => ({
              value: category,
              label: category,
            }))}
            onChange={(value) => setCategory(value as Category)}
          />
        </div>

        <table className="text-center text-xs sm:text-sm w-full">
          <thead className="text-slate-300 bg-slate-950/50">
            <tr>
              <th className="px-2 py-1.5 uppercase min-w-35">
                Track
              </th>
              <th className="px-2 py-1.5 uppercase whitespace-nowrap">
                %
              </th>
              <th className="px-2 py-1.5 uppercase w-full">
                Authors
              </th>
            </tr>
          </thead>

          <tbody>
            {data.length === 0 
              ? 
              Array.from({ length: 25 }).map((_, i) => (
                <tr key={i} className={`${i % 2 === 0 ? "bg-slate-500/20" : "bg-slate-500/10"}`}>
                  <td className="py-2 px-5"><div className="h-4 w-22 bg-slate-700 animate-pulse mx-auto rounded" /></td>
                  <td className="py-2 px-2"><div className="h-4 w-5 bg-slate-700 animate-pulse rounded" /></td>
                  <td className="py-2 px-5"><div className="h-4 w-70 bg-slate-700 animate-pulse mx-auto rounded" /></td>
                </tr> 
              )) 
              : 
              data.map((row, index) => {
                const nextTier = data[index + 1]?.tier ?? null;
                const showDivider = row.tier !== nextTier && nextTier !== null;
                const colourIndex = index % 2 == 0 ? 1 : 0
                const rowColour = TIER_COLOURS[row.tier]?.[colourIndex] ?? "bg-slate-500/10"
                
                return (
                  <tr
                    key={row.track}
                    className={`border-t border-slate-800 ${rowColour} hover:bg-blue-900/50`}
                    style={showDivider ? { borderBottom: `2px dashed grey` } : {}}
                  >
                    <td className="px-3 py-1 text-slate-100 lg:whitespace-nowrap">
                      {formatTrack(row.track)}
                    </td>
                    <td className="px-3 py-1 text-emerald-400 [text-shadow:0_2px_4px_rgba(0,0,0,0.6)]">
                      {row.pcSaved.toPrecision(3)}
                    </td>
                    <td className="px-3 py-1 text-slate-200">
                      {formatAuthors(row.tas.authors, 5)}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
