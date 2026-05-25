"use client";

import { useMemo } from "react";
import { Author } from "@/lib/AuthorList";
import { useTasRecords } from "@/lib/TasRecords";
import { trackList, TasEntry, Category, categories } from "@/lib/TrackList";

export default function HighlightPage() {

  const { data: tasRecords = [] } = useTasRecords();

  const { undoneTracks, topTasList, topAuthors } = useMemo(() => {

    const bestByTrackAndCategory = new Map<string, Map<Category, TasEntry>>();
    const authorCounts = new Map<Author, number>();
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

          for (const author of tas.authors) {
            authorCounts.set(author, (authorCounts.get(author) ?? 0) + 1
          );
          }
        }
      }
    }

    const topAuthors = Array.from(authorCounts.entries())
      .filter(([_, count]) => count >= 5)
      .map(([author]) => author);

    return { undoneTracks, topTasList, topAuthors };
  }, [tasRecords]);

  const { tasOfTheDay, undoneTasOfTheDay, authorOfTheDay } = useMemo(() => {
    function dailyIndex(length: number) {
      if (length === 0) return -1;
      const today = new Date();
      const seed = (today.getUTCMonth() + 1) * 100 + today.getUTCDate()
      return (Math.round(Math.abs(Math.sin(seed) * 125114136345))) % length + 1;
    }

    return {
      tasOfTheDay: topTasList[dailyIndex(topTasList.length)] ?? null,
      undoneTasOfTheDay: undoneTracks[dailyIndex(undoneTracks.length)] ?? null,
      authorOfTheDay: topAuthors[dailyIndex(topAuthors.length)] ?? null,
    };
  }, [topTasList, undoneTracks]);

  const getYouTubeId = (url: string) => url?.match(/[?&]v=([^&]+)/)?.[1];
  const videoId = getYouTubeId(tasOfTheDay?.video);

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
              TAS of the Day
            </h2>

            <p className="mt-2 text-slate-400">
              {tasOfTheDay?.track} by {tasOfTheDay?.authors.join(', ')}
            </p>

            {tasOfTheDay?.video && (
              <div className="mt-4 aspect-video w-full overflow-hidden rounded-lg border border-slate-700">
                <iframe
                  className="h-full w-full"
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title="TAS of the Day"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
            <h2 className="text-xl text-white">
              Undone TAS of the Day
            </h2>

            <p className="mt-2 text-slate-400">
              {undoneTasOfTheDay ?? ""}
            </p>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
            <h2 className="text-xl text-white">
              TASer of the Day
            </h2>

            <p className="mt-2 text-slate-400">
              {authorOfTheDay ?? ""}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}