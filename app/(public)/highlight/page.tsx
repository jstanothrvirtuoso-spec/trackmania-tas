"use client";

import { useMemo } from "react";
import { CATEGORIES } from "@/utils/constants";
import { TasEntry, Category } from "@/utils/typing";
import { useTasRecords } from "@/lib/TasRecords";
import { useRtaRecords, buildBestRtaByTrack } from "@/lib/RtaRecords";
import { trackList } from "@/lib/TrackList";

const reversedCategories = [...CATEGORIES].reverse();

function getYouTubeId(input?: string | null): string | null {
  if (!input) return null;

  try {
    const url = new URL(input);

    // youtu.be/<id>
    if (url.hostname === "youtu.be") {
      return url.pathname.slice(1).split("/")[0] || null;
    }

    // youtube.com/watch?v=<id>
    const v = url.searchParams.get("v");
    if (v) return v;

    // youtube.com/embed/<id>
    // youtube.com/shorts/<id>
    // youtube.com/live/<id>
    const match = url.pathname.match(
      /^\/(embed|shorts|live)\/([^/?]+)/,
    );

    if (match) {
      return match[2];
    }

    return null;
  } catch {
    return null;
  }
}

export default function HighlightPage() {

  const { data: tasRecords = [] } = useTasRecords();
  const { data: rtaRecords = [] } = useRtaRecords();

  const bestRtaByTrack = useMemo(() => {
    if (!rtaRecords.length) return new Map();
    return buildBestRtaByTrack(rtaRecords)
  }, [rtaRecords]);

  const { undoneTracks, topTasVideos, topAuthors } = useMemo(() => {

    const bestByTrackAndCategory = new Map<string, Map<Category, TasEntry>>();
    const authorCounts = new Map<string, number>();
    const undoneTracks: string[] = [];
    const topTasList: TasEntry[] = [];

    for (const entry of tasRecords) {
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
      for (const category of reversedCategories) {
        const tas = categoryMap.get(category as Category);
        if (!tas) continue;

        if (tas.time_ms < bestTimeSoFar) {
          topTasList.push(tas);
          bestTimeSoFar = tas.time_ms;

          for (const author of tas.authors) {
            authorCounts.set(author, (authorCounts.get(author) ?? 0) + 1);
          }
        }
      }
    }

    const topTasVideos = topTasList.filter((tas) => tas.video)
    const topAuthors = Array.from(authorCounts.entries())
      .filter(([, count]) => count >= 5)
      .map(([author]) => author);

    return { undoneTracks, topTasVideos, topAuthors };
  }, [tasRecords]);

  const { tasOfTheDay, undoneTasOfTheDay, authorOfTheDay } = useMemo(() => {
    function dailyIndex(length: number) {
      if (length === 0) return -1;
      const today = new Date();
      const seed = (today.getUTCMonth() + 1) * 100 + today.getUTCDate()
      return (Math.floor(Math.abs(Math.sin(seed) * 125114136345))) % length;
    }

    return {
      tasOfTheDay: topTasVideos[dailyIndex(topTasVideos.length)] ?? null,
      undoneTasOfTheDay: undoneTracks[dailyIndex(undoneTracks.length)] ?? null,
      authorOfTheDay: topAuthors[dailyIndex(topAuthors.length)] ?? null,
    };
  }, [topTasVideos, undoneTracks, topAuthors]);

  const videoId1 = getYouTubeId(tasOfTheDay?.video);
  const videoId2 = undoneTasOfTheDay ? getYouTubeId(bestRtaByTrack.get(undoneTasOfTheDay)?.video) : null;

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

            {videoId1 && (
              <div className="mt-4 aspect-video w-full overflow-hidden rounded-lg border border-slate-700">
                <iframe
                  className="h-full w-full"
                  src={`https://www.youtube.com/embed/${videoId1}`}
                  title="TAS of the Day"
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

            {undoneTasOfTheDay && (
              <div className="mt-4 aspect-video w-full overflow-hidden rounded-lg border border-slate-700">
                <iframe
                  className="h-full w-full"
                  src={`https://www.youtube.com/embed/${videoId2}`}
                  title="Undone TAS of the Day"
                  allowFullScreen
                />
              </div>
            )}
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
