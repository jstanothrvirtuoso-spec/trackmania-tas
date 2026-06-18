"use client";

import Link from "next/link";
import { useMemo } from "react";
import { CATEGORIES } from "@/utils/constants";
import { TasEntry, Category } from "@/utils/typing";
import { useTasRecords } from "@/lib/TasRecords";
import { useRtaRecords, buildBestRtaByTrack } from "@/lib/RtaRecords";
import { TRACKS } from "@/lib/TrackList";
import { formatDate, formatTime, formatPercentSaved, timeAgo } from "@/utils/formatting";

const reversedCategories = [...CATEGORIES].reverse();

const LEGENDS = [
  ["TMO RaceC6", "fabi", "27-Aug-25"],
  ["D15-Endurance [Beta]", "fabi", "06-Sep-25"],
  ["TMS Undulate Line", "Kimura", "26-Apr-26"],
  ["TMO DemoStuntsRace1", "Kimura", "10-May-26"],
  ["TMS TrialTime", "fabi", "10-May-26"],
  ["TMO Survival16", "fabi", "16-May-26"],
  ["TMS ClimbTheHill","fabi", "17-May-26"]
];

const AUTHOR_COLOUR: Record<string, string> = {
  "fabi": "text-emerald-300 bg-emerald-500/10 border-emerald-500/20",
  "Kimura": "text-violet-300 bg-violet-500/10 border-violet-500/20",
} as const;

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

function getAuthorDisplayParts(authors: string[]) {
  const len = authors.length;

  if (len === 0) return [];

  if (len === 1) return [{ type: "author", value: authors[0] }];

  if (len === 2) {
    return [
      { type: "author", value: authors[0] },
      { type: "text", value: " and " },
      { type: "author", value: authors[1] },
    ];
  }

  if (len <= 6) {
    const parts: { type: string; value: string }[] = [];

    authors.forEach((a, i) => {
      parts.push({ type: "author", value: a });

      if (i < len - 2) parts.push({ type: "text", value: ", " });
      else if (i === len - 2) parts.push({ type: "text", value: ", and " });
    });

    return parts;
  }

  return [
    { type: "author", value: authors[0] },
    { type: "text", value: ` + ${len - 1} Co-authors` },
  ];
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

    for (const [track, trackInfo] of Object.entries(TRACKS)) {
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

  const authorRecords = useMemo(() => {
    if (!authorOfTheDay) return [];

    return tasRecords
      .filter((record) => record.authors.includes(authorOfTheDay))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [tasRecords, authorOfTheDay]);

  const videoId1 = getYouTubeId(tasOfTheDay?.video);
  const videoId2 = undoneTasOfTheDay ? getYouTubeId(bestRtaByTrack.get(undoneTasOfTheDay)?.video) : null;
  const rta = tasOfTheDay?.track ? bestRtaByTrack.get(tasOfTheDay.track) : null

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-200px] top-[-200px] h-[500px] w-[500px] rounded-full bg-indigo-600/20 blur-[140px]" />
        <div className="absolute right-[-200px] top-[100px] h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[140px]" />
        <div className="absolute left-[200px] top-[500px] h-[500px] w-[500px] rounded-full bg-red-600/10 blur-[140px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pb-5 pt-20">

        {/* HERO */}
        <section className="overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
          <div className="relative p-8 md:p-10">

            <div className="text-xs font-medium uppercase tracking-[0.35em] text-indigo-400">
              Daily Showcase
            </div>

            <h1
              className="mt-3 text-5xl text-white md:text-6xl"
              style={{ fontFamily: "OktaNeue" }}
            >
              TAS Highlights
            </h1>

            <p className="mt-6 max-w-2xl text-slate-400">
              A rotating showcase of standout TASes, unfinished tracks and
              notable creators from the TAS Nadeo community.
              These highlights will be rotated at UTC+0 time (London - UK).
            </p>

            <div className="mt-8 flex flex-wrap gap-3">

              <div className="rounded-full border border-slate-700 bg-slate-900/70 px-4 py-2 text-sm text-slate-300">
                {topTasVideos.length} Featured TASes
              </div>

              <div className="rounded-full border border-slate-700 bg-slate-900/70 px-4 py-2 text-sm text-slate-300">
                {undoneTracks.length} Untouched Tracks
              </div>

              <div className="rounded-full border border-slate-700 bg-slate-900/70 px-4 py-2 text-sm text-slate-300">
                {topAuthors.length} Top TASers
              </div>

            </div>
          </div>
        </section>

        {/* MAIN GRID */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_1fr] items-start">

          {/* LEFT */}
          <div className="space-y-6">

            {/* TAS OF THE DAY */}
            <section className="rounded-3xl border border-indigo-500/15 bg-gradient-to-br from-indigo-500/10 via-slate-900/80 to-slate-900/80 p-6 backdrop-blur-md">

              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-indigo-400" />

                <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-indigo-300">
                  TAS OF THE DAY
                </span>
              </div>

              <h2 className="mt-4 text-3xl font-semibold text-white w-fit">
                <Link
                  key={tasOfTheDay?.track}
                  href={`/tracks?track=${encodeURIComponent(tasOfTheDay?.track)}`}
                  className="hover:text-indigo-200 transition"
                >
                  {tasOfTheDay?.track}
                </Link>
              </h2>

              <div className="mt-3 h-px bg-gradient-to-r from-indigo-500/30 via-slate-700 to-transparent" />

              <div className="mt-2 flex w-full items-center gap-3 text-sm">
                <div className="font-mono text-2xl font-semibold text-indigo-400 mr-15 whitespace-nowrap">
                  {formatTime(tasOfTheDay?.time_ms, false, tasOfTheDay?.game === "TM2")}
                  <span className="text-xs text-blue-300">{` (-${rta ? formatPercentSaved(tasOfTheDay?.time_ms, rta.time_ms, 3) : ""}% RTA)`}</span>
                </div>

                <div className="flex gap-5 justify-end w-full px-2">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.15em] text-slate-500">
                      Date
                    </div>

                    <div className="mt-1 text-sm text-slate-200">
                      {formatDate(tasOfTheDay?.date ?? "")}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] uppercase tracking-[0.15em] text-slate-500">
                      Reign
                    </div>

                    <div className="mt-1 text-sm text-slate-200">
                      {timeAgo(tasOfTheDay?.date)}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.15em] text-slate-500">
                      Category
                    </div>

                    <div className="mt-1 text-sm text-slate-200">
                      {tasOfTheDay?.category}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.15em] text-slate-500">
                      Game
                    </div>

                    <div className="mt-1 text-sm text-slate-200">
                      {tasOfTheDay?.game}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-2 font-medium text-slate-200">
                {getAuthorDisplayParts(tasOfTheDay?.authors ?? [""]).map((part, i) => {
                  if (part.type === "author") {
                    return (
                      <Link
                        key={`${part.value}-${i}`}
                        href={`/authors?author=${encodeURIComponent(part.value)}`}
                        className="whitespace-nowrap text-slate-200 transition hover:text-indigo-300"
                      >
                        {part.value}
                      </Link>
                    );
                  }

                  return (
                    <span key={`text-${i}`} className="whitespace-nowrap text-slate-400">
                      {part.value}
                    </span>
                  );
                })}
              </div>
              
              {videoId1 && (
                <div className="mt-6 rounded-2xl shadow-[0_0_25px_rgba(75,0,130,0.35)]">
                  <div className="aspect-video overflow-hidden rounded-2xl border border-indigo-500/50">
                    <iframe
                      className="h-full w-full"
                      src={`https://www.youtube.com/embed/${videoId1}`}
                      title="TAS of the Day"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}

            </section>

            {/* TASER */}
            <section className="rounded-3xl border border-emerald-500/15 bg-gradient-to-br from-emerald-500/10 via-slate-900/80 to-slate-900/80 p-6 backdrop-blur-md">

              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-emerald-400">
                  TASer of the Day
                </span>
              </div>

              <h2 className="mt-4 text-3xl font-semibold text-white w-fit">
                <Link
                  key={authorOfTheDay}
                  href={`/authors?author=${encodeURIComponent(authorOfTheDay)}`}
                  className="hover:text-emerald-300 transition"
                >
                  {authorOfTheDay}
                </Link>
              </h2>

              <div className="mt-3 h-px bg-gradient-to-r from-emerald-500/30 via-slate-700 to-transparent" />

              <div className="mt-5 space-y-2">
                {authorRecords.map((record) => (
                  <Link
                    key={record.id}
                    href={`/tracks?track=${encodeURIComponent(record.track)}`}
                    className="
                      group
                      block
                      rounded-xl
                      border
                      border-slate-800
                      bg-slate-900/60
                      p-3
                      transition-all
                      hover:border-emerald-500/30
                      hover:bg-emerald-500/5
                    "
                  >
                    <div className="flex items-start justify-between gap-4">

                      <div className="min-w-0">

                        <div className="truncate text-sm font-medium text-slate-100 transition-colors group-hover:text-white">
                          {record.track}
                        </div>

                        <div className="mt-1 flex items-center gap-2">

                          <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[11px] text-slate-300">
                            {record.category}
                          </span>

                          <span className="text-[11px] text-slate-500">
                            {formatDate(record.date)}
                          </span>

                        </div>

                      </div>

                      <div className="text-slate-600 transition group-hover:text-emerald-400">
                        →
                      </div>

                    </div>
                  </Link>
                ))}
              </div>
            </section>

          </div>

          {/* RIGHT */}
          <div className="space-y-6">

            {/* UNDONE */}
            <section className="rounded-3xl border border-amber-500/15 bg-gradient-to-br from-amber-500/10 via-slate-900/80 to-slate-900/80 p-6 backdrop-blur-md">

              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-amber-500" />
                <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-amber-300">
                  Undone TAS of the Day
                </span>
              </div>

              <h2 className="mt-4 text-3xl font-semibold text-white w-fit">
                <Link
                  key={undoneTasOfTheDay}
                  href={`/tracks?track=${encodeURIComponent(undoneTasOfTheDay)}`}
                  className="hover:text-amber-200 transition"
                >
                  {undoneTasOfTheDay}
                </Link>
              </h2>

              <div className="mt-3 h-px bg-gradient-to-r from-amber-500/30 via-slate-700 to-transparent" />

              <p className="mt-2 text-[12px] text-slate-400 italic">
                No TAS currently exists on this track. Submit a TAS on this track by the 
                end of the day to be immortilised as a Legend of Undone TASes!
              </p>

              {videoId2 && (
                <div className="mt-6 rounded-xl shadow-[0_0_15px_rgba(255,191,0,0.25)]">
                  <div className="aspect-video overflow-hidden rounded-xl border border-amber-500/50">
                    <iframe
                      className="h-full w-full"
                      src={`https://www.youtube.com/embed/${videoId2}`}
                      title="Undone TAS"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}
            </section>

            {/* LEGENDS */}
            <section className="rounded-3xl border border-sky-500/15 bg-gradient-to-br from-sky-500/10 via-slate-900/80 to-slate-900/80 p-6 backdrop-blur-md">
            
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-sky-500" />
                <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-sky-300">
                  Legends of Undone TASes
                </span>
              </div>

              <div className="mt-6 overflow-hidden rounded-2xl border border-sky-500/20 bg-slate-950/40">

                <div className="grid grid-cols-[1fr_140px_100px] bg-gradient-to-r from-sky-500/15 via-cyan-500/10 to-transparent px-4 py-3">
                  <div className="text-[11px] font-medium uppercase tracking-[0.25em] text-sky-300">
                    Track
                  </div>

                  <div className="text-[11px] font-medium uppercase tracking-[0.25em] text-sky-300">
                    Author
                  </div>

                  <div className="text-[11px] font-medium uppercase tracking-[0.25em] text-sky-300">
                    Date
                  </div>
                </div>

                {LEGENDS.map(([track, author, date]) => (
                  <div
                    key={track}
                    className="group relative grid grid-cols-[1fr_140px_100px] items-center border-t border-slate-800/70 px-4 py-3 transition-all hover:bg-sky-500/10"
                  >
                    <div className="absolute left-0 top-0 h-full w-[2px] bg-gradient-to-b from-sky-400 via-cyan-400 to-blue-500 opacity-0 transition-opacity group-hover:opacity-100" />

                    <div className="flex items-center gap-3 min-w-0">
                      <div className=" h-2 w-2 shrink-0 rounded-full bg-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.8)]"/>
                      <Link
                        key={track}
                        href={`/tracks?track=${encodeURIComponent(track)}`}
                        className="hover:text-sky-500 transition text-sm"
                      >
                        {track}
                      </Link>
                    </div>

                    <div>
                      
                      <Link
                        key={author}
                        href={`/authors?author=${encodeURIComponent(author)}`}
                        className={`rounded-full border border-sky-500/20 px-2.5 py-1 text-xs font-medium text-sky-300 hover:text-sky-500 ${AUTHOR_COLOUR[author] ?? "bg-sky-500/10"}`}
                      >
                        {author}
                      </Link>
                    </div>

                    <div className="font-mono text-xs text-slate-400">
                      {formatDate(date)}
                    </div>
                  </div>
                ))}

              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
