"use client";

import { useMemo, useState } from "react";
import { TasEntry, Category } from "@/utils/typing";
import { CATEGORIES, CATEGORY_FILTERS } from "@/utils/constants";
import { trackList } from "@/lib/TrackList";
import { useTasRecords } from "@/lib/TasRecords";
import { useRtaRecords, buildBestRtaByTrack } from "@/lib/RtaRecords";

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

export default function PercentSavedTmnf() {

  const { data: rtaRecords = [] } = useRtaRecords();
  const { data: tasRecords = [] } = useTasRecords();
  const [category, setCategory] = useState<Category>("Open");

  const bestRtaByTrack = useMemo(() => {
    if (!rtaRecords.length) return new Map();
    return buildBestRtaByTrack(rtaRecords)
  }, [rtaRecords])

  const filteredTasRecords = useMemo(() => {
    if (category === "Open") return tasRecords;

    const allowed = CATEGORY_FILTERS[category];

    return tasRecords.filter((r) => allowed.has(r.category));
  }, [tasRecords, category]);

  const bestTasByTrack = useMemo(() => {
    const map = new Map<string, TasEntry>();

    for (const entry of filteredTasRecords) {

      if (entry.game !== "TMNF") continue;
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

    for (const track of Object.keys(trackList)) {
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
  }, [bestTasByTrack, bestRtaByTrack]);

  if (data.length === 0) return null;

  return (
    <div className="flex flex-col">
      <div className="flex justify-end py-2">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
          className="rounded bg-slate-800 px-2 py-1 text-sm"
        >
          {CATEGORIES.filter((r) => (r != "Low Input")).map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden w-full rounded-2xl border border-slate-800 bg-slate-900/80 text-sm shadow-[0_10px_40px_rgba(0,0,0,0.85)]">
        <table className="table-fixed w-full text-center backdrop-blur-md rounded-2xl">

          <colgroup>
            <col className="w-40" />
            <col className="w-22" />
            <col />
          </colgroup>

          <thead className="text-slate-300 bg-slate-950/50">
            <tr>
              <th className="px-3 py-1.5 uppercase whitespace-nowrap">
                Track
              </th>
              <th className="px-3 py-1.5 uppercase whitespace-nowrap">
                % Saved
              </th>
              <th className="px-3 py-1.5 uppercase whitespace-nowrap">
                Authors
              </th>
            </tr>
          </thead>

          <tbody>
            {data.map((row, index) => {
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
                  <td className="px-3 py-1 text-slate-100 whitespace-nowrap">
                    {row.track}
                  </td>
                  <td className="px-3 py-1 text-emerald-400 [text-shadow:0_2px_4px_rgba(0,0,0,0.6)]">
                    {row.pcSaved.toPrecision(3)}
                  </td>
                  <td className="px-3 py-1 text-slate-200">
                    {row.tas.authors.join(", ")}
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
