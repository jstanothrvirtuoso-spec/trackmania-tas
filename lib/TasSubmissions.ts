
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { STALE_TIME } from "@/utils/constants";
import { SubmitForm } from "@/utils/typing";

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

export function fetchUserSubmissions(userId?: string) {
  return useQuery<SubmitForm[]>({
    queryKey: ["my_tas_submissions"],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tas_submissions")
        .select("*")
        .eq("submitted_by", userId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as SubmitForm[];
    },
    staleTime: STALE_TIME,
  });
}
