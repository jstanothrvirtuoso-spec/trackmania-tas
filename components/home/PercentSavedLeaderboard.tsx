"use client";

import { useMemo } from "react";
import { TasEntry, RtaEntry, trackList } from "@/lib/TrackLists";
import { useTasRecords } from "@/lib/TasRecords";
import { useRtaRecords, buildBestRtaByTrack } from "@/lib/RtaRecords";

function buildPercentSavedLeaderboard(
  records: {
    track: string;
    tas: TasEntry | null;
    rta: RtaEntry | null;
  }[]
) {
  return records
    .filter((r) => r.tas && r.rta)
    .map((r) => {
      const tas = r.tas!;
      const rta = r.rta!;
      const pcSaved = ((rta.time_ms - tas.time_ms) / rta.time_ms) * 100;
      const tier = pcSaved > 70 ? 0 : pcSaved > 60 ? 1 : 2

      return {
        track: r.track,
        tas,
        rta,
        pcSaved,
        tier,
      };
    })
    .filter((r) => r.pcSaved >= 50)
    .sort((a, b) => b.pcSaved - a.pcSaved);
}

const tierColours = [
  ["bg-emerald-500/30", "bg-emerald-500/40"],
  ["bg-orange-500/35", "bg-orange-500/40"],
  ["bg-purple-950/20", "bg-purple-950/35"],
] as const;

export default function PercentSavedLeaderboard() {

  const { data: rtaRecords = [] } = useRtaRecords();
  const { data: tasRecords = [] } = useTasRecords();
  const bestRtaByTrack = useMemo(() => {
    if (!rtaRecords.length) return new Map();
    return buildBestRtaByTrack(rtaRecords)
  }, [rtaRecords])

  const bestTasByTrack = useMemo(() => {
    const map = new Map<string, TasEntry>();

    for (const entry of tasRecords) {
      const existing = map.get(entry.track);

      if (
        !existing ||
        entry.time_ms < existing.time_ms ||
        (entry.time_ms === existing.time_ms &&
          new Date(entry.date).getTime() <
            new Date(existing.date).getTime())
      ) {
        map.set(entry.track, entry);
      }
    }

    return map;
  }, [tasRecords]);

  const currentRecords = useMemo(() => {
    return Object.entries(trackList).map(([track, info]) => ({
      track,
      info,
      tas: bestTasByTrack.get(track) ?? null,
      rta: bestRtaByTrack.get(track) ?? null,
    }));
  }, [bestTasByTrack, bestRtaByTrack]);

  const data = useMemo(() => {
    if (!currentRecords?.length) return [];
    return buildPercentSavedLeaderboard(currentRecords);
  }, [currentRecords]);

  if (data.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 text-sm shadow-[0_10px_40px_rgba(0,0,0,0.85)]">
      <table className="text-center backdrop-blur-md rounded-2xl">
        <thead className="text-slate-400">
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
            const rowColour = tierColours[row.tier]?.[colourIndex] ?? "bg-slate-500/10"
            
            return (
              <tr
                key={row.track}
                className={`border-t border-slate-800 ${rowColour} hover:bg-blue-900/50`}
                style={showDivider ? { borderBottom: `2px dashed grey` } : {}}
              >
                <td className="px-3 py-1 text-slate-100 whitespace-nowrap">
                  {row.track}
                </td>
                <td className="px-3 py-1 text-emerald-400">
                  {row.pcSaved.toFixed(1)}
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
  );
}
