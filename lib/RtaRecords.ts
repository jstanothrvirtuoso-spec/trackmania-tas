
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { RtaEntry } from "./TrackLists";

export async function getRtaRecords(): Promise<RtaEntry[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("rta_records")
    .select("*");

  if (error) {
    console.error(error);
    return [];
  }

  return data as RtaEntry[];
}

export function useRtaRecords() {
  const [records, setRecords] = useState<RtaEntry[]>([]);

  useEffect(() => {
    getRtaRecords().then(setRecords);
  }, []);

  return records;
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