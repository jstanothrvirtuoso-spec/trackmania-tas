"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { gameLinks, trackList, categoryFilters, GraphCategory } from "@/lib/TrackList";
import { useTasRecords } from "@/lib/TasRecords";
import { useRtaRecords, buildBestRtaByTrack } from "@/lib/RtaRecords";
import { formatDate, formatTime } from "@/utils/formatting"
import { RecordProgressionGraph, categoryColours } from "./ProgressionGraph";

export default function TracksPage() {

  const router = useRouter();
  const searchParams = useSearchParams();
  const gameOptions = gameLinks.map((g) => g.name);

  const { data: rtaRecords = [] } = useRtaRecords();
  const { data: tasRecords = [] } = useTasRecords();
  const bestRtaByTrack = useMemo(() => {
    if (!rtaRecords.length) return new Map();
    return buildBestRtaByTrack(rtaRecords)
  }, [rtaRecords])

  const [game, setGame] = useState("TMNF");
  const [track, setTrack] = useState("A01-Race");

  const trackOptions = useMemo(() => {
    return Object.entries(trackList)
      .filter(([, t]) => t.game === game)
      .map(([name]) => name);
  }, [game]);

  // Default from URL or fallback
  useEffect(() => {
    const g = searchParams.get("game");
    const t = searchParams.get("track");

    if (g) {
      setGame(g);
      if (t) {
        setTrack(t);
      }
    } else if (trackOptions.length) {
      const random = trackOptions[Math.floor(Math.random() * trackOptions.length)];
      setGame("TMNF")
      setTrack(random);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!trackOptions.includes(track)) {
      setTrack(trackOptions[0] ?? "");
    }
  }, [game, trackOptions]);

  const updateURL = (g: string, t: string) => {
    router.replace(`/tracks?game=${encodeURIComponent(g)}&track=${encodeURIComponent(t)}`);
  };

  const rta = bestRtaByTrack.get(track)
  const isStunt = track ? trackList[track].category === "Stunt" : false
  const isTM2 = track ? trackList[track].game === "TM2" : false
  const useMinutes = rta ? rta.time_ms >= 120000 : false;

  const tasRows = useMemo(() => {
    if (!track) return [];

    return tasRecords
      .filter((t) => t.track === track)
      .sort((a, b) => a.time_ms - b.time_ms);
  }, [track, tasRecords]);

  const progression = useMemo<Record<GraphCategory, { date: string; time: number }[]>>(() => {
    const sorted = [...tasRows].sort(
      (a, b) =>
        new Date(a.date).getTime() -
        new Date(b.date).getTime()
    );

    const buildPoints = (category: GraphCategory) => {
      const allowedCategories = categoryFilters[category]
      const points: { date: string; time: number, category: string }[] = [];
      
      if (isStunt) {
        let best = 0;
        sorted
          .filter((tas) => allowedCategories.has(tas.category))
          .forEach((tas) => {
            if (tas.time_ms > best) {
              best = tas.time_ms;
              points.push({
                date: tas.date,
                time: tas.time_ms / 1000,
                category: tas.category
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
                date: tas.date,
                time: useMinutes ? tas.time_ms / 60000 : tas.time_ms / 1000,
                category: tas.category
              });
            }
          });
      }

      const filterPoints = points.filter((tas) => tas.category === category)

      return filterPoints.length > 0 ? points : [];
    };

    const rtaTime = rta ? isStunt ? rta.time_ms / 1000
      : useMinutes ? rta.time_ms / 60000 : rta.time_ms / 1000 : 0

    return {
      "Open": buildPoints("Open"),
      "NOseboost": buildPoints("NOseboost"),
      "No Uber": buildPoints("No Uber"),
      "WR Route": buildPoints("WR Route"),
      "No Cut": buildPoints("No Cut"),
      "RTA": rta? [{ date: rta.date, time: rtaTime }]: [],
    };
  }, [tasRows, useMinutes]);

  return (
    <div className="mx-auto flex w-full pt-20 flex-col items-center overflow-x-auto px-4 py-8 text-slate-100">
      <div className="flex flex-row items-start gap-4">
        <select
          value={game}
          onChange={(e) => {
            const newGame = e.target.value;
            setGame(newGame);
            setTrack("");
            updateURL(newGame, "");
          }}
          className="w-40 rounded-md bg-slate-800 px-3 py-2"
        >
          {gameOptions.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>

        <select
          value={track}
          onChange={(e) => {
            const newTrack = e.target.value;
            setTrack(newTrack);
            updateURL(game, newTrack);
          }}
          className="min-w-60 rounded-md bg-slate-800 px-3 py-2"
        >
          {trackOptions.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4 mt-6 text-center">
        <h1 className="text-2xl font-bold text-white">
          {track}
        </h1>

        <div className="mt-1 text-slate-400">
          {rta && `RTA: ${formatTime(rta.time_ms, isStunt, isTM2)} by ${rta.player} (${formatDate(rta.date)})`}
        </div>
      </div>

      {track && (

        <div className="flex items-start gap-5">

          <div className="overflow-x-auto">
            <table className="border-collapsed text-sm rounded-lg">
              <thead>
                <tr className="border-x border-slate-800 text-slate-300 bg-slate-900/90 ">
                  <th className="px-3 py-2 text-center whitespace-nowrap">Record</th>
                  <th className="px-3 py-2 text-center whitespace-nowrap">Time Saved</th>
                  <th className="px-3 py-2 text-center whitespace-nowrap">Authors</th>
                  <th className="px-3 py-2 text-center whitespace-nowrap">Date</th>
                  <th className="px-3 py-2 text-center whitespace-nowrap">Category</th>
                </tr>
              </thead>

              <tbody>
                {tasRows.map((tas, i) => {
                  
                  const colourIndex = i % 2 == 0 ? 2 : 1
                  const rowColour = categoryColours[tas.category]?.[colourIndex] ?? "bg-slate-500/10"
                  
                  return (
                    <tr
                      key={`${tas.time_ms}-${tas.date}`}
                      className={`border-x border-slate-800 transition-colors hover:bg-emerald-400/20 ${rowColour}`}
                    >
                      <td className="px-3 py-1.5 text-center font-medium text-slate-200">
                        { formatTime(tas.time_ms, isStunt, isTM2) }
                      </td>

                      <td className="px-3 py-1.5 text-center italic font-bold text-slate-200">
                        { rta ? formatTime(tas.time_ms - rta.time_ms, isStunt, isTM2, true) : "-" }
                      </td>

                      <td className="px-3 py-1.5 text-center text-slate-200 max-w-[420px]">
                        {tas.authors.join(", ")}
                      </td>

                      <td className="px-3 py-1.5 text-center text-slate-300 whitespace-nowrap">
                        { formatDate(tas.date) }
                      </td>
                      
                      <td className="px-3 py-1.5 text-center text-slate-300 whitespace-nowrap">
                        {tas.category}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <RecordProgressionGraph 
            progression={progression}
            useMinutes={useMinutes}
            isStunt={isStunt}
          />

        </div>
      )}

    </div>
  );
}
