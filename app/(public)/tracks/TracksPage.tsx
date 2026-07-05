"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getTmxLink } from "@/utils/common";
import { GAME_LIST } from "@/utils/constants";
import { formatGame } from "@/utils/formatting"
import { Game, Category, TasEntry } from "@/utils/typing";
import { useTasRecords } from "@/lib/TasRecords";
import { RecordProgressionGraph } from "@/components/tracks/ProgressionGraph";
import { useTrackRtaRecords } from "@/lib/RtaRecords";
import { TRACKS, tracksByGame } from "@/lib/TrackList";
import { DropSelect } from "@/components/DropSelect";
import { TrackRecordTable } from "@/components/tracks/TrackRecordTable";
import { TracksTitles } from "@/components/tracks/TracksTitles";
import { TrackSelector } from "@/components/tracks/TrackSelector";

export type CurrentRecord = {
  category: Category,
  id: number,
};

const BASELINE_DATE = new Date("2021-06-01").getTime();

export default function TracksPage({ initialGame, initialTrack }: { initialGame: Game, initialTrack: string }) {

  const [nowDate] = useState<number>(() => Date.now());
  const [currentRecord, setCurrentRecord] = useState<CurrentRecord | null>(null);
  const [game, setGame] = useState<Game>(initialGame);
  const [track, setTrack] = useState<string>(initialTrack);
  const [imageOpen, setImageOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const router = useRouter();
  const { data: trackRtaRecords } = useTrackRtaRecords(track ?? "");
  const { data: tasRecords = [] } = useTasRecords();

  const { records, tas, rta, minDate } = useMemo(() => {
    if (!track || !trackRtaRecords || !tasRecords) return { 
      records: [], 
      tas: null,
      rta: null,
      minDate: BASELINE_DATE,
    };

    const tasRows = [...tasRecords].filter((t) => t.track === track);
    const firstTasDate = Math.min(BASELINE_DATE, ...tasRows.map(row => new Date(row.date).getTime()));
    const datePadding = Math.max((nowDate - firstTasDate) * 0.03, 1000 * 60 * 60 * 24 * 30);
    const minDate = firstTasDate - datePadding;
    
    const cutoffIndex = trackRtaRecords.findLastIndex(r => new Date(r.date).getTime() < minDate);
    const relevantRtaRows: TasEntry[] = trackRtaRecords
      .slice(Math.max(0, cutoffIndex))
      .map(rta => ({
        id: rta.id,
        game: rta.game,
        track: rta.track,
        category: "RTA" as Category,
        time_ms: rta.time_ms,
        num_inputs: 0,
        authors: [rta.player],
        date: rta.date,
        video: rta.video,
        replay_path: rta.replay,
        created_at: "",
      }));

    const tas = tasRows.length === 0 ? null
      : tasRows.reduce((best, row) => { if (row.time_ms < best.time_ms) return row;
        if (row.time_ms === best.time_ms && new Date(row.date).getTime() < new Date(best.date).getTime()) { return row }
        return best;
      });
    
    return { 
      records: [...tasRows, ...relevantRtaRows]
        .filter((t) => t.track === track)
        .sort((a, b) => a.time_ms - b.time_ms),
      tas: tas,
      rta: trackRtaRecords[trackRtaRecords.length - 1] ?? null,
      minDate: minDate
    };
  }, [track, tasRecords, trackRtaRecords, nowDate]);

  const trackOptions = tracksByGame[game];
  const isStunt = track ? TRACKS[track].gameSet === "Stunt" : false;
  const useMinutes = rta ? rta.time_ms >= 120000 : false;
  const graphUnits = isStunt ? "pts" : useMinutes ? "min" : "sec";
  const isTM2 = track ? TRACKS[track].game === "TM2" : false;
  const tmxGame = TRACKS[track].tmx ?? TRACKS[track].game;
  const tmxLink = getTmxLink(TRACKS[track].id, tmxGame);

  function updateTrack(track: string) {
    const game = TRACKS[track].game
    setGame(game)
    setTrack(track);
    updateURL(game, track);
    setImageLoaded(false);
  };

  function updateGame(game: Game) {
    const newTrack = tracksByGame[game][0];
    setGame(game);
    setTrack(newTrack);
    updateURL(game, newTrack);
    setImageLoaded(false);
  };

  function updateURL(gameId: string, trackId: string) {
    const params = new URLSearchParams({
      game: gameId,
      track: trackId,
    });

    router.replace(`/tracks?${params.toString()}`);
  };

  return (
    <div className="flex pt-20 flex-col items-center justify-center text-slate-100 pb-3 px-3 sm:pb-5 sm:px-5">

      {/* Wallpaper */}
      <div
        className="fixed inset-0 -z-10 bg-center bg-no-repeat bg-cover pointer-events-none blur-xs scale-105"
        style={{ backgroundImage: "url('/wallpapers/stadium.webp')" }}
      />
      <div className="fixed inset-0 -z-10 bg-slate-950/70 pointer-events-none" />

      <div className="flex flex-row w-full max-w-7xl items-start justify-center">
        <div className="flex flex-col w-full items-center justify-center">
  
          {/* Options */}
          <div className="z-20 hidden md:block">
            <TrackSelector
              selectedGame={game}
              selectedTrack={track}
              updateTrack={(value) => updateTrack(value)}
            />
          </div>

          <div className="flex flex-col items-center gap-2 md:hidden">
            <DropSelect
              initialValue={game}
              options={GAME_LIST.map((game) => ({
                value: game,
                label: formatGame(game),
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
  
          {/* Title/Wrs */}
          <TracksTitles
            tmxLink={tmxLink}
            tas={tas}
            rta={rta}
            isTM2={isTM2}
            track={track}
          />
        </div>
  
        {/* Track image */}
        {tmxLink && (
          <div className="hidden lg:block shrink-0">
            <button
              onClick={() => setImageOpen(true)}
              className="relative overflow-hidden rounded-xl border border-slate-800 shadow-[0_5px_20px_rgba(0,0,0,0.6)] cursor-zoom-in"
            >
              {!imageLoaded && (
                <div className="absolute inset-0 animate-pulse bg-slate-800" />
              )}
  
              <Image
                src={`${tmxLink}/image/1`}
                alt={track}
                width={320}
                height={240}
                loading="eager"
                onLoad={() => setImageLoaded(true)}
                className={`h-46 w-69 object-cover transition-opacity duration-300 ${
                  imageLoaded ? "opacity-100" : "opacity-0"
                }`}
              />
  
              <div className="absolute inset-0 bg-black/15 hover:bg-black/0 transition" />
            </button>
          </div>
        )}
      </div>

      {track && (
        <div className="w-full max-w-7xl flex-1 flex flex-col justify-center items-center gap-4 lg:flex-row lg:items-start">

          {/* Record table */}
          <div className="overflow-hidden rounded-xl border border-slate-800 shadow-[0_5px_20px_rgba(0,0,0,0.6)] w-full max-w-160">
            {records && (
              <TrackRecordTable
                tmxGame={tmxGame}
                records={records}
                isTM2={isTM2}
                track={track}
                setCurrentRecord={setCurrentRecord}
              />
            )}
          </div>

          {/* Progression graph */}
          <div className="w-full max-w-180 mb-2">
            <RecordProgressionGraph 
              records={records}
              graphUnits={graphUnits}
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
              
              {!imageLoaded && (
                <div className="absolute inset-0 animate-pulse bg-slate-800 rounded-xl" />
              )}

              <Image
                src={`${tmxLink}/image/1`}
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
