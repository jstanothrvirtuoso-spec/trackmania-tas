
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Role } from "@/utils/typing";
import { STALE_TIME } from "@/utils/constants";

type ProfileUpdate = Partial<Profile>;

export type Profile = {
  id: string;
  username: string;
  bio: string | null;
  user_number: number;
  role: Role;

  avatar: number;
  banner: number;
  colour: number;

  show_rta: boolean;
  show_time_saved: boolean;
  show_leaderboard: boolean;
  show_rta_leaderboard: boolean;
  highlight_recent: boolean;
  show_visitor_counter: boolean;
};

/* =========================================================
   FETCH PROFILE
========================================================= */

const supabase = createClient();

async function fetchProfile() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) throw error;

  return data;
}

export function useProfile() {
  return useQuery<Profile | null>({
    queryKey: ["profile"],
    queryFn: fetchProfile,
    staleTime: STALE_TIME,
  });
}

/* =========================================================
   UPDATE USERNAME
========================================================= */

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation<Profile, Error, ProfileUpdate>({
    mutationFn: async (profileUpdate) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("No user");

      const { data, error } = await supabase
        .from("profiles")
        .update(profileUpdate)
        .eq("id", user.id)
        .select()
        .single();

      if (error) throw error;

      return data;
    },

    onSuccess: (updatedProfile) => {
      queryClient.setQueryData<Profile>(["profile"], updatedProfile);
    },
  });
}
