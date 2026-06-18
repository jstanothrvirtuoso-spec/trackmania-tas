"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getTmxLink } from "@/utils/common";
import { CATEGORY_COLOURS, CATEGORY_FILTERS, GAME_LIST, GRAPH_CATEGORIES } from "@/utils/constants";
import { formatDate, formatPercentSaved, formatTime } from "@/utils/formatting"
import { Game, Category } from "@/utils/typing";
import { useTasRecords } from "@/lib/TasRecords";
import { RecordProgressionGraph } from "./ProgressionGraph";
import { useRtaRecords } from "@/lib/RtaRecords";
import { TRACKS, tracksByGame } from "@/lib/TrackList";
import { DropSelect } from "@/components/DropSelect";
import { VideoIcon, ReplayIcon, InputsIcon, GbxIcon } from "@/components/Icons";

export type GraphCategory = (typeof GRAPH_CATEGORIES)[number];
export type ProgressionGraphPoint = {
  id: number,
  date: string, 
  time: number, 
  category: GraphCategory
}

const BASELINE_DATE = new Date("2021-06-01").getTime();

export default function TracksPage({ initialGame, initialTrack }: { initialGame: Game, initialTrack: string }) {

  const router = useRouter();
  const [nowDate] = useState<number>(() => Date.now());
  const [currentRecord, setCurrentRecord] = useState<{ category: string, id: number } | null>(null);

  const { data: rtaRecords = [] } = useRtaRecords();
  const { data: tasRecords = [] } = useTasRecords();

  const [game, setGame] = useState<Game>(initialGame);
  const [track, setTrack] = useState<string>(initialTrack);
  const [imageOpen, setImageOpen] = useState(false);

  const { records, rta, minDate } = useMemo(() => {
    if (!track || !rtaRecords || !tasRecords) return { 
      records: [], 
      rta: { time_ms: 0, player: "", date: ""},
      minDate: BASELINE_DATE,
    };

    const tasRows = [...tasRecords].filter((t) => t.track === track);
    const rtaRows = [...rtaRecords]
      .filter(r => r.track === track)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const firstTasDate = Math.min(BASELINE_DATE, ...tasRows.map(row => new Date(row.date).getTime()));
    const datePadding = Math.max((nowDate - firstTasDate) * 0.03, 1000 * 60 * 60 * 24 * 30);
    const minDate = firstTasDate - datePadding;
    
    const cutoffIndex = rtaRows.findLastIndex(r => new Date(r.date).getTime() < minDate);
    const relevantRtaRows = rtaRows
      .slice(Math.max(0, cutoffIndex))
      .map(rta => ({
        ...rta,
        category: "RTA" as Category,
        authors: [rta.player],
        inputs: "",
      }));
    
    return { 
      records: [...tasRows, ...relevantRtaRows]
        .filter((t) => t.track === track)
        .sort((a, b) => a.time_ms - b.time_ms), 
      rta: rtaRows[rtaRows.length - 1] ?? null,
      minDate: minDate
    };
  }, [track, tasRecords, rtaRecords, nowDate]);

  const trackOptions = tracksByGame[game];
  const isStunt = track ? TRACKS[track].category === "Stunt" : false;
  const isTM2 = track ? TRACKS[track].game === "TM2" : false;
  const useMinutes = rta ? rta.time_ms >= 120000 : false;
  const tmxLink = getTmxLink(TRACKS[track].id, TRACKS[track].tmx ?? TRACKS[track].game);

  function updateTrack(track: string) {
    setTrack(track);
    updateURL(game, track);
  };

  function updateGame(game: Game) {
    const newTrack = tracksByGame[game][0];
    setGame(game);
    setTrack(newTrack);
    updateURL(game, newTrack);
  };

  function updateURL(gameId: string, trackId: string) {
    const params = new URLSearchParams({
      game: gameId,
      track: trackId,
    });

    router.replace(`/tracks?${params.toString()}`);
  };

  const progression = useMemo<Record<GraphCategory, ProgressionGraphPoint[]>>(() => {
    const sorted = [...records].sort((a, b) =>
        new Date(a.date).getTime() -
        new Date(b.date).getTime()
    );

    const buildPoints = (category: GraphCategory) => {
      const allowedCategories = CATEGORY_FILTERS[category];
      const points: ProgressionGraphPoint[] = [];
      
      if (isStunt) {
        let best = 0;
        sorted
          .filter((tas) => allowedCategories.has(tas.category))
          .forEach((tas) => {
            if (tas.time_ms > best) {
              best = tas.time_ms;
              points.push({
                id: tas.id,
                date: tas.date,
                time: tas.time_ms / 1000,
                category: tas.category as GraphCategory
              });
            }
          });
      } else {
        let best = Infinity;
        sorted
          .filter((tas) => allowedCategories.has(tas.category))
          .forEach((tas) => {
            if (tas.time_ms < best) {
              best = tas.time_ms;
              points.push({
                id: tas.id,
                date: tas.date,
                time: useMinutes ? tas.time_ms / 60000 : tas.time_ms / 1000,
                category: tas.category as GraphCategory
              });
            }
          });
      };

      const filterPoints = points.filter((tas) => tas.category === category);

      return filterPoints.length > 0 ? points : [];
    };

    return {
      "Open": buildPoints("Open"),
      "NOseboost": buildPoints("NOseboost"),
      "No Uber": buildPoints("No Uber"),
      "WR Route": buildPoints("WR Route"),
      "No Cut": buildPoints("No Cut"),
      "RTA": buildPoints("RTA"),
    };
  }, [records, useMinutes, isStunt]);

  return (
    <div className="flex pt-20 flex-col items-center justify-center px-4 py-8 text-slate-100">

      {/* Wallpaper */}
      <div
        className="fixed inset-0 -z-10 bg-center bg-no-repeat bg-cover pointer-events-none blur-xs scale-105"
        style={{ backgroundImage: "url('/wallpapers/stadium.webp')" }}
      />
      <div className="fixed inset-0 -z-10 bg-slate-950/70 pointer-events-none" />

      <div className="flex flex-row w-full max-w-7xl items-center justify-center">
        <div className="flex flex-col w-full items-center justify-center">

          {/* Options */}
          <div className="flex flex-col items-center gap-2 md:flex-row md:gap-4">
            <DropSelect
              initialValue={game}
              options={GAME_LIST.map((game) => ({
                value: game,
                label: game,
              }))}
              onChange={(value) => updateGame(value as Game)}
            />
            
            <DropSelect
              initialValue={track}
              options={trackOptions.map((track) => ({
                value: track,
                label: track,
              }))}
              onChange={(value) => updateTrack(value)}
            />
          </div>

          {/* Title/RTA */}
          <div className="mb-4 mt-6 text-center">
            <div className="flex flex-col items-center">
              <button className="text-4xl font-black tracking-tight text-white [text-shadow:2px_2px_4px_rgba(0,0,0,0.6)]"> 
                {tmxLink ? (
                  <a href={tmxLink} target="_blank" rel="noreferrer" className="hover:text-emerald-500 transition">
                    {track}
                  </a>
                ) : (
                  track
                )}
              </button>
              <div className="mt-2 h-1 w-34 rounded-full bg-emerald-400/70 shadow-xl" />
            </div>
            <div className="flex flex-col gap-1 items-center sm:flex-row sm:gap-4">
              {records.length > 0 && (
                <div className="mt-3 inline-flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-2 backdrop-blur-md shadow-xl">
                  <div className="text-left translate-y-[2px]">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-slate-300">
                      TAS Record
                    </div>

                    <div className="font-mono text-lg font-semibold text-emerald-400">
                      {formatTime(records[0].time_ms, isStunt, isTM2)}
                      <span className="text-xs text-blue-300">{` (-${rta ? formatPercentSaved(records[0].time_ms, rta.time_ms, 3) : ""}%)`}</span>
                    </div>
                  </div>

                  <div className="h-8 w-px bg-slate-700" />

                  <div className="text-left">
                    <div className="text-slate-200 italic text-sm sm:text-lg">
                      {records[0].authors.length > 2 ? `${records[0].authors[0]} + ${records[0].authors.length - 1} authors` : records[0].authors.join(', ')}
                    </div>

                    <div className="text-xs text-slate-400">
                      {formatDate(records[0].date)}
                    </div>
                  </div>
                </div>
              )}
              {rta && (
                <div className="mt-3 inline-flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-2 backdrop-blur-md shadow-xl">
                  <div className="text-left translate-y-[2px]">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-slate-300">
                      RTA Record
                    </div>

                    <div className="font-mono text-lg font-semibold text-emerald-400">
                      {formatTime(rta.time_ms, isStunt, isTM2)}
                    </div>
                  </div>

                  <div className="h-8 w-px bg-slate-700" />

                  <div className="text-left">
                    <div className="text-slate-200 italic text-sm sm:text-lg">
                      {rta.player}
                    </div>

                    <div className="text-xs text-slate-400">
                      {formatDate(rta.date)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Track image */}
        {track && (
          <div className="hidden lg:block shrink-0">
            <button
              onClick={() => setImageOpen(true)}
              className="relative overflow-hidden rounded-xl border border-slate-800 shadow-xl cursor-zoom-in"
            >
              <Image
                src={`https://tmnf.exchange/trackshow/${TRACKS[track].id}/image/1`}
                alt={track}
                width={320}
                height={240}
                loading="eager"
                className="h-44 w-66 object-cover"
              />

              <div className="absolute inset-0 bg-black/10 hover:bg-black/0 transition" />
            </button>
          </div>
        )}
      </div>

      {track && (
        <div className="w-full max-w-7xl flex-1 flex flex-col justify-center items-center gap-4 lg:flex-row lg:items-start">

          {/* Record table */}
          <div className="overflow-hidden rounded-xl border border-slate-800 shadow-xl w-full max-w-160">
            <table className="min-w-full table-auto bg-slate-800/90 text-xs sm:text-sm">
              <thead>
                <tr className="border-x border-slate-800 text-slate-300 bg-slate-900/40 ">
                  <th className="px-2 py-1.5 text-center whitespace-nowrap">Category</th>
                  <th className="px-2 py-1.5 text-center whitespace-nowrap">Record</th>
                  <th className="px-2 py-1.5 text-center whitespace-nowrap">Authors</th>
                  <th className="px-2 py-1.5 text-center whitespace-nowrap">Date</th>
                  <th className="px-2 py-1.5 whitespace-nowrap hidden sm:table-cell text-center">Links</th>
                </tr>
              </thead>

              <tbody>
                {records.map((tas, i) => {
                  
                  const colourIndex = i % 2 == 0 ? 2 : 1
                  const rowColour = CATEGORY_COLOURS[tas.category]?.[colourIndex] ?? "bg-slate-500/10"
                  
                  return (
                    <tr
                      key={`${tas.time_ms}-${tas.date}`}
                      onMouseEnter={() => setCurrentRecord({ category: tas.category, id: tas.id })}
                      onMouseLeave={() => setCurrentRecord(null)}
                      className={`border-x border-slate-800 transition-colors hover:bg-orange-500/60 ${rowColour}`}
                    >
                      <td className="px-2 py-1.5 text-center text-slate-300 whitespace-nowrap">
                        {tas.category}
                      </td>

                      <td className="px-2 py-1.5 text-center font-medium text-slate-200">
                        { formatTime(tas.time_ms, isStunt, isTM2) }
                      </td>

                      <td className="px-2 py-1.5 text-center text-slate-200 max-w-[420px]">
                        {tas.authors.join(", ")}
                      </td>

                      <td className="px-2 py-1.5 text-center text-slate-300 whitespace-nowrap">
                        { formatDate(tas.date) }
                      </td>
                      
                      <td className="px-2 py-1.5 text-center text-slate-300 whitespace-nowrap hidden sm:table-cell">
                        <div className="flex items-center justify-center gap-1">
                          <div className="w-5 h-5 flex items-center justify-center">
                            {tas.video && (<VideoIcon video_url={tas.video}/>)}
                          </div>

                          <div className="w-5 h-5 flex items-center justify-center">
                            {tas.replay && (<ReplayIcon replay_url={tas.replay}/>)}
                          </div>

                          <div className="w-5 h-5 flex items-center justify-center">
                            {tas.inputs && (<InputsIcon inputs_url={tas.inputs}/>)}
                          </div>

                          <div className="w-5 h-5 flex items-center justify-center">
                            {tas.replay && (<GbxIcon replay_url={tas.replay} track={tas.track}/>)}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Progression graph */}
          <div className="w-full max-w-180">
            <RecordProgressionGraph 
              progression={progression}
              useMinutes={useMinutes}
              isStunt={isStunt}
              currentRecord={currentRecord}
              minDate={minDate}
              maxDate={nowDate}
            />
          </div>

        </div>
      )}

      {imageOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md"
          onClick={() => setImageOpen(false)}
        >
          <div className="relative max-w-2xl w-full px-4">
            <div className="relative w-full">
              <Image
                src={`https://tmnf.exchange/trackshow/${TRACKS[track].id}/image/1`}
                alt={track}
                width={320}
                height={240}
                className="w-full h-auto rounded-xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
