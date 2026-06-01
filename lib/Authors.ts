
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { STALE_TIME } from "@/utils/constants";
import { AuthorInfo } from "@/utils/typing"

async function getAuthors(): Promise<AuthorInfo[]> {

  const supabase = createClient();

  const { data, error } = await supabase
    .from("authors")
    .select("id,author,profile_id")
    .order("author");

  if (error) throw error;

  return data as AuthorInfo[];
}

export function useAuthors() {
  return useQuery({
    queryKey: ["authors"],
    queryFn: getAuthors,
    staleTime: STALE_TIME,
  });
}
