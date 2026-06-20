
import Link from "next/link";
import { useMemo } from "react";
import { CATEGORY_FILTERS } from "@/utils/constants";
import { RtaEntry, TasEntry, Category } from "@/utils/typing";
import { formatTime } from "@/utils/formatting";
import { TRACKS } from "@/lib/TrackList";

const CATEGORY_NAMES = ["No Cut", "WR Route", "No Uber", "NOseboost", "Open"] as const;
const CATEGORY_COLOURS = ["bg-white/20", "bg-green-500/20", "bg-blue-500/20", "bg-red-500/20", "bg-black/20"] as const;

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

export default function CategoryTable( { bestRtaByTrack, tasRecords } : {
  bestRtaByTrack: Map<string, RtaEntry>, 
  tasRecords: TasEntry[] 
} ) {

  const bestByTrackAndCategory = useMemo(() => {
    const map: Map<string, Map<string, TasEntry>> = new Map();

    for (const entry of tasRecords as TasEntry[]) {
      if ((entry.game !== "TMNF" && entry.game !== "TMNF No Cut") || entry.category == "Low Input") continue;

      const trackName = TRACKS[entry.track].baseTrack ?? entry.track
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
    return Object.entries(TRACKS)
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
    <div className="mx-2 overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 text-center shadow-[0_5px_20px_rgba(0,0,0,0.6)]">
      <table className="w-full text-xs">
        <thead className="bg-slate-800/20 border border-slate-800 font-mono rounded-tl-lg tracking-[0.02em] transition whitespace-nowrap text-[8px] sm:text-sm">
          <tr>
            <th className="px-1 py-1.5 sm:px-3">
              Track
            </th>

            {CATEGORY_NAMES.toReversed()
              .map((category) => (
                <th
                  key={category}
                  className="px-1 py-1.5 sm:px-3"
                >
                  {category}
                </th>
              ))}

            <th className="px-1 py-1.5 sm:px-3">
              RTA
            </th>
          </tr>
          <tr>
            <th colSpan={7} className="border border-slate-400"/>
          </tr>

        </thead>

        <tbody className="divide-y divide-slate-800/30 text-[9px] sm:text-xs">
          {rows.map((row) => (
            <tr
              key={row.track}
              className="hover:bg-emerald-800/40 transition-colors odd:bg-slate-800/90"
            >
              {/* Track */}
              <td className="bg-purple-800/5 px-1 py-0.5 sm:px-2 sm:py-1.5">
                <Link
                  key={row.track}
                  href={`/tracks?track=${encodeURIComponent(row.track)}`}
                  className="text-slate-300 whitespace-nowrap hover:text-emerald-300 text-[8px] sm:text-xs"
                >
                  {row.track}
                </Link>
              </td>

              {/* TAS columns */}
              {row.columns.toReversed().map((c, i) => (
                <td
                  key={i}
                  className={`px-1.5 py-0.5 tabular-nums sm:px-2 sm:py-1.5 ${CATEGORY_COLOURS[c.colourIndex]}`}
                >
                  {c.entry ? (
                    <span className="text-slate-300">
                      { formatTime(c.entry.time_ms) }
                    </span>
                  ) : (
                    <span className="text-slate-600"></span>
                  )}
                </td>
              ))}

              {/* RTA */}
              <td className="px-1.5 py-0.5 tabular-nums sm:px-2 sm:py-1.5">
                {row.rta ? (
                  <span className="text-slate-300">
                    { formatTime(row.rta) }
                  </span>
                ) : (
                  <span className="text-slate-600"></span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}