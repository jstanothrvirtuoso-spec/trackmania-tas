
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { STALE_TIME } from "@/utils/constants";
import { SubmitForm } from "@/utils/typing";

const supabase = createClient();

async function fetchAllSubmissions() {
  const { data, error } = await supabase
    .from("tas_submissions")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
}

export function useAllSubmissions() {
  return useQuery<SubmitForm[]>({
    queryKey: ["tas_submissions"],
    queryFn: fetchAllSubmissions,
    staleTime: STALE_TIME,
  });
}

export function useFetchUserSubmissions(userId?: string) {
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
