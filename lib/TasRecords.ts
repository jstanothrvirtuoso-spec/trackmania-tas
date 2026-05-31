
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { STALE_TIME } from "@/utils/constants";
import { TasEntry } from "@/utils/typing";

async function getTasRecords(): Promise<TasEntry[]> {
  const supabase = createClient();

  const pageSize = 2000;
  const allRows: TasEntry[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("tas_with_authors")
      .select("*")
      .range(from, from + pageSize - 1);

    if (error) throw error;
    if (!data?.length) break;
    allRows.push(...(data as TasEntry[]));
    if (data.length < pageSize) break;
    from += pageSize;
  }

  return allRows;
}

export function useTasRecords() {
  return useQuery({
    queryKey: ["tasRecords"],
    queryFn: getTasRecords,
    staleTime: STALE_TIME,
  });
}
