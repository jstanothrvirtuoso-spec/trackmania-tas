
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { STALE_TIME } from "@/utils/constants";
import { RtaEntry } from "@/utils/typing";

const supabase = createClient();

// All RTA records

async function getRtaRecords(): Promise<RtaEntry[]> {

  const pageSize = 2000;
  const allRows: RtaEntry[] = [];
  let from = 0;

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

// Map of best RTA record for all tracks

async function getBestRtaRecords(): Promise<Map<string, RtaEntry>> {

  const { data, error } = await supabase
    .from("best_rta_records")
    .select("*");

  if (error) throw error;

  return new Map((data as RtaEntry[]).map(r => [r.track, r]));
}

export function useBestRtaRecords() {
  return useQuery<Map<string, RtaEntry>>({
    queryKey: ["bestRtaRecords"],
    queryFn: getBestRtaRecords,
    staleTime: STALE_TIME,
  });
}

// All RTA records from one game

async function getRtaGameRecords(games: string[]): Promise<RtaEntry[]> {

  const pageSize = 2000;
  const allRows: RtaEntry[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("rta_records")
      .select("*")
      .in("game", games)
      .order("date", { ascending: true })
      .order("time_ms", { ascending: false })
      .range(from, from + pageSize - 1);

    if (error) throw error;
    if (!data?.length) break;
    allRows.push(...(data as RtaEntry[]));
    if (data.length < pageSize) break;
    from += pageSize;
  }

  return allRows;
}

export function useGameRtaRecords(games: string[]) {

  console.log('here', games)
  return useQuery<RtaEntry[]>({
    queryKey: ["rtaRecords", games],
    enabled: !!games.length,
    queryFn: () => getRtaGameRecords(games),
    staleTime: STALE_TIME,
  });
}

// All RTA records from one track

export function useTrackRtaRecords(track?: string) {
  return useQuery<RtaEntry[]>({
    queryKey: ["rtaRecords", track],
    enabled: !!track,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rta_records")
        .select("*")
        .eq("track", track)
        .order("time_ms", { ascending: false })
        .order("date", { ascending: false });

      if (error) throw error;
      return data;
    },
    staleTime: STALE_TIME,
  });
}

// const bestRtaByTrack = useMemo(() => {
//   if (!rtaRecords) return new Map();

//   const map = new Map<string, RtaEntry>();
//   for (const entry of rtaRecords) {
//     const existing = map.get(entry.track);

//     if (!existing || entry.time_ms < existing.time_ms ||
//       (entry.time_ms === existing.time_ms && new Date(entry.date).getTime() < new Date(existing.date).getTime())
//     ) {
//       map.set(entry.track, entry);
//     }
//   }

//   return map;
// }, [rtaRecords]);
