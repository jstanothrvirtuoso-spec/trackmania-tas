"use client";

import { useMemo } from "react";
import { useTasRecords } from "@/lib/TasRecords";
import { trackList, TasEntry, Category, categories } from "@/lib/TrackList";

export default function HighlightPage() {

  const { data: tasRecords = [] } = useTasRecords();

  const { undoneTracks, topTasList } = useMemo(() => {

    const bestByTrackAndCategory = new Map<string, Map<Category, TasEntry>>();
    const undoneTracks: string[] = [];
    const topTasList: TasEntry[] = [];

    for (const entry of tasRecords as TasEntry[]) {
      const trackName = entry.game === "TMNF No Cut" ? entry.track.split(" No Cut")[0] : entry.track
      const trackMap = bestByTrackAndCategory.get(trackName) ?? new Map();
      const existing = trackMap.get(entry.category);

      if (!existing || entry.time_ms < existing.time_ms) {
        trackMap.set(entry.category, entry);
        bestByTrackAndCategory.set(trackName, trackMap);
      }
    }

    for (const [track, trackInfo] of Object.entries(trackList)) {
      if (trackInfo.game === "TMNF No Cut") continue;

      const categoryMap = bestByTrackAndCategory.get(track);

      if (!categoryMap) {
        if (trackInfo.game != "TM2") {
          undoneTracks.push(track);
        }
        continue;
      }

      let bestTimeSoFar = Infinity;
      const revCats = Array.from(categories).reverse();

      for (const category of revCats) {
        const tas = categoryMap.get(category as Category);
        if (!tas) continue;

        if (tas.time_ms < bestTimeSoFar) {
          topTasList.push(tas);
          bestTimeSoFar = tas.time_ms;
        }
      }
    }

    return { undoneTracks, topTasList };
  }, [tasRecords]);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pt-20">
      <div className="rounded-2xl border border-slate-800 bg-slate-950/90 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.85)]">
        
        <h1
          className="text-3xl text-white"
          style={{ fontFamily: "OktaNeue" }}
        >
          Highlight
        </h1>

        <p className="mt-4 text-slate-300">
          TODO : TAS of the day / Undone TAS of the day / TASer of the day / Reset time (timezone) / Legend of Undone TASes
        </p>

        {/* EXAMPLE CARDS */}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          
          <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
            <h2 className="text-xl text-white">
              test page
            </h2>

            <p className="mt-2 text-slate-400">
              test page
            </p>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
            <h2 className="text-xl text-white">
              test box
            </h2>

            <p className="mt-2 text-slate-400">
              test box
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}