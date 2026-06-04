"use client"

import { useMemo } from "react";
import { formatTime } from "@/utils/formatting";
import { Category, TasEntry } from "@/utils/typing";
import { CATEGORY_FILTERS } from "@/utils/constants";
import { useTasRecords } from "@/lib/TasRecords";
import { TmnfHistoryGraph } from "./TmnfHistoryGraph"
import { useRtaRecords, buildBestRtaByTrack } from "@/lib/RtaRecords";
import { trackList } from "@/lib/TrackList";
import PercentSavedTmnf from "./PercentSavedTmnf";

const CATEGORY_NAMES = ["No Cut", "WR Route", "No Uber", "NOseboost", "Open"] as const;
const CATEGORY_COLOURS = ["bg-white/10", "bg-green-500/10", "bg-blue-500/10", "bg-red-500/10", "bg-black/10"] as const;

function getVisibleBest(
  trackMap: Map<string, TasEntry> | undefined,
  category: keyof typeof CATEGORY_FILTERS
) {
  if (!trackMap) return null;

  const allowed = CATEGORY_FILTERS[category];

  let best: TasEntry | null = null;

  for (const [cat, entry] of trackMap.entries()) {
    if (!allowed.has(cat as Category)) continue;

    if (!best || entry.time_ms < best.time_ms) {
      best = entry;
    }
  }

  return best;
}

export default function TmnfHistory() {

  const { data: rtaRecords = [] } = useRtaRecords();
  const { data: tasRecords = [] } = useTasRecords();

  const bestRtaByTrack = useMemo(() => {
    if (!rtaRecords.length) return new Map();
    return buildBestRtaByTrack(rtaRecords);
  }, [rtaRecords]);

  const points = useMemo(() => {
    const tas = tasRecords
      .filter((e) => e.game === "TMNF" || e.game === "TMNF No Cut")
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const cutoff = new Date("2021-01-01").getTime();
    const bestTasByTrack = new Map<string, number>();
    let cumulativeSaved = 0;

    const result: { date: string; time_ms: number }[] = [];

    for (const entry of tas) {
      const rta = bestRtaByTrack.get(entry.track);
      if (!rta) continue;
      const rtaTime = rta.time_ms;
      const currentBest = bestTasByTrack.get(entry.track);

      if (currentBest === undefined || entry.time_ms < currentBest) {
        const prevBest = currentBest ?? rtaTime;
        const improvement = prevBest - entry.time_ms;

        if (improvement > 0) {
          cumulativeSaved += improvement;
          bestTasByTrack.set(entry.track, entry.time_ms);

          if (new Date(entry.date).getTime() < cutoff) continue;
          result.push({
            date: entry.date,
            time_ms: cumulativeSaved,
          });
        }
      }
    }

    return result;
  }, [tasRecords, bestRtaByTrack]);

  const bestByTrackAndCategory = useMemo(() => {
    const map: Map<string, Map<string, TasEntry>> = new Map();

    for (const entry of tasRecords as TasEntry[]) {
      if ((entry.game !== "TMNF" && entry.game !== "TMNF No Cut") || entry.category == "Low Input") continue;

      const trackName = trackList[entry.track].baseTrack ?? entry.track
      const trackMap = map.get(trackName) ?? new Map();
      const existing = trackMap.get(entry.category);

      if (!existing || entry.time_ms < existing.time_ms) {
        trackMap.set(entry.category, entry);
        map.set(trackName, trackMap);
      }
    }

    return map;
  }, [tasRecords]);

  const rows = useMemo(() => {
    return Object.entries(trackList)
      .filter(([, info]) => info.game === "TMNF")
      .map(([track]) => {
        const trackMap = bestByTrackAndCategory.get(track);
        const rta = bestRtaByTrack.get(track);
        let currentBestTime: number | null = null;
        let currentColourIndex = 0;

        const columns = CATEGORY_NAMES.map((cat, i) => {
          const best = getVisibleBest(trackMap, cat);
          if (!best) { 
            return {
              entry: null,
              colourIndex: currentColourIndex,
            };
          };
          const time = best.time_ms;
          if (currentBestTime === null || time < currentBestTime) { 
            currentBestTime = time; 
            currentColourIndex = i;
            return {
              entry: best,
              colourIndex: i,
            };
          };
          return {
            entry: null,
            colourIndex: currentColourIndex,
          };
        });

        return {
          track,
          columns,
          rta: rta?.time_ms ?? null,
        };
      });
  }, [bestByTrackAndCategory, bestRtaByTrack]);

  return (
    <div className="flex gap-4 justify-center pt-20">

      <div className="mx-1 overflow-auto rounded-xl border border-slate-800 bg-slate-900/20 text-center">
        <table className="w-full text-xs">
          <thead className="text-slate-200 px-3 py-2 bg-slate-900/90 border border-slate-800 font-mono rounded-tl-lg tracking-[0.02em] text-sm transition whitespace-nowrap">
            <tr className="">
              <th className="px-3 py-2 tracking-wide">
                Track
              </th>

              {CATEGORY_NAMES.toReversed()
                .map((c) => (
                  <th
                    key={c}
                    className="px-3 py-2"
                  >
                    {c}
                  </th>
                ))}

              <th className="px-3 py-2">
                RTA
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800/60">
            {rows.map((row) => (
              <tr
                key={row.track}
                className="hover:bg-emerald-800/40 transition-colors odd:bg-slate-800/10"
              >
                {/* track */}
                <td className="px-3 py-1.5 text-slate-300 bg-purple-800/5 whitespace-nowrap">
                  {row.track}
                </td>

                {/* TAS columns */}
                {row.columns.toReversed().map((c, i) => (
                  <td
                    key={i}
                    className={`px-3 py-1.5 tabular-nums ${CATEGORY_COLOURS[c.colourIndex]}`}
                  >
                    {c.entry ? (
                      <span className="text-slate-300">
                        { formatTime(c.entry.time_ms) }
                      </span>
                    ) : (
                      <span className="text-slate-600">-</span>
                    )}
                  </td>
                ))}

                {/* RTA */}
                <td className="px-3 py-1.5 tabular-nums">
                  {row.rta ? (
                    <span className="text-slate-300">
                      { formatTime(row.rta) }
                    </span>
                  ) : (
                    <span className="text-slate-600">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col items-start gap-2">
        <div className="w-auto">
            <TmnfHistoryGraph points={points} />
        </div>
        
        <div className="w-184">
            <PercentSavedTmnf />
        </div>
      </div>
    </div>
  );
}
