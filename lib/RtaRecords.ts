
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { STALE_TIME } from "@/utils/constants";
import { RtaEntry } from "./TrackList";

async function getRtaRecords(): Promise<RtaEntry[]> {
  const supabase = createClient();

  const pageSize = 2000;
  let from = 0;
  let allRows: RtaEntry[] = [];

  while (true) {
    const { data, error } = await supabase
      .from("rta_records")
      .select("*")
      .range(from, from + pageSize - 1);

    if (error) throw error;

    if (!data?.length) break;

    allRows.push(...(data as RtaEntry[]));

    if (data.length < pageSize) break;

    from += pageSize;
  }

  return allRows;
}

export function useRtaRecords() {
  return useQuery({
    queryKey: ["rtaRecords"],
    queryFn: getRtaRecords,
    staleTime: STALE_TIME,
  });
}

export function buildBestRtaByTrack(records: RtaEntry[]) {
  const map = new Map<string, RtaEntry>();

  for (const entry of records) {
    const existing = map.get(entry.track);

    if (
      !existing ||
      entry.time_ms < existing.time_ms ||
      (
        entry.time_ms === existing.time_ms &&
        new Date(entry.date).getTime() <
          new Date(existing.date).getTime()
      )
    ) {

      map.set(entry.track, entry);
    }
  }

  return map;
}