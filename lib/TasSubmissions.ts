
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { STALE_TIME } from "@/utils/constants";

const supabase = createClient();

async function fetchPendingSubmissions() {
  const { data, error } = await supabase
    .from("tas_submissions")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
}

export function usePendingSubmissions() {
  return useQuery({
    queryKey: ["tas_submissions", "pending"],
    queryFn: fetchPendingSubmissions,
    staleTime: STALE_TIME,
  });
}
