
import { RtaEntry } from "../lib/TrackLists";
import rawData from "../data/rtaRecords.json";

export const RtaRecords = rawData as RtaEntry[];

export function buildBestRtaByTrack() {
  const map = new Map<string, RtaEntry>();

  for (const entry of RtaRecords) {
    const existing = map.get(entry.track);

    if (
      !existing ||
      entry.timeMs < existing.timeMs ||
      (entry.timeMs === existing.timeMs &&
        new Date(entry.date).getTime() <
          new Date(existing.date).getTime())
    ) {
      map.set(entry.track, entry);
    }
  }

  return map;
}
