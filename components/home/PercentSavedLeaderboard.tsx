"use client";

import { useMemo } from "react";
import { TasEntry, RtaEntry, trackList } from "@/lib/TrackLists";
import { useTasRecords } from "../../lib/TasRecords";
import { useRtaRecords, buildBestRtaByTrack } from "../../lib/RtaRecords";

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

      const pcSaved =
        ((rta.time_ms - tas.time_ms) / rta.time_ms) * 100;

      return {
        track: r.track,
        tas,
        rta,
        pcSaved,
      };
    })
    .filter((r) => r.pcSaved >= 50)
    .sort((a, b) => b.pcSaved - a.pcSaved);
}

const getTier = (pc: number) => {
  if (pc >= 70) return "70";
  if (pc >= 60) return "60";
  if (pc >= 50) return "50";
  return null;
};

const DIVIDER_COLOR = "white";

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
    <div className="mt-4 overflow-hidden rounded-lg border border-slate-800 bg-slate-900 text-sm">
      <table className="w-full text-center">
        <thead className="text-slate-400">
          <tr>
            <th className="px-3 py-2">Track</th>
            <th className="px-3 py-2">% Saved</th>
          </tr>
        </thead>

        <tbody>
          {data.map((row, index) => {
            const tier = getTier(row.pcSaved);
            const nextRow = data[index + 1];
            const nextTier = nextRow ? getTier(nextRow.pcSaved) : null;
            
            const showDivider = tier !== nextTier && nextTier !== null;

            const tierStyle =
              tier === "70"
                ? "border-l-4 border-emerald-400 bg-emerald-500/15"
                : tier === "60"
                ? "border-l-4 border-sky-400 bg-sky-500/15"
                : "border-l-4 border-slate-700 bg-slate-950/50";

            return (
              <tr
                key={row.track}
                className={`border-t border-slate-800 ${tierStyle}`}
                style={showDivider ? { borderBottom: `2px dashed ${DIVIDER_COLOR}` } : {}}
              >
                <td className="px-3 py-2 text-slate-100">
                  {row.track}
                </td>
                <td className="px-3 py-2 text-emerald-400">
                  {row.pcSaved.toFixed(1)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}