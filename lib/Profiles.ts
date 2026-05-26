
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export type Profile = {
  id: string;
  username: string;
  bio: string | null;

  avatar: number;
  banner: number;

  show_rta: boolean;
  show_time_saved: boolean;
  show_leaderboard: boolean;
  show_rta_leaderboard: boolean;
  highlight_recent: boolean;
  show_visitor_counter: boolean;
};

type ProfileUpdate = Partial<Profile>;

export const BANNERS: Record<number, string> = {
  0: "/banners/bay.webp",
  1: "/banners/canyon.webp",
  2: "/banners/coast.webp",
  3: "/banners/desert.webp",
  4: "/banners/island.webp",
  5: "/banners/lagoon.webp",
  6: "/banners/rally.webp",
  7: "/banners/snow.webp",
  8: "/banners/stadium.webp",
  9: "/banners/valley.webp",
};

export const AVATARS: Record<number, string> = {
  0: "/avatars/bay.webp",
  1: "/avatars/canyon.webp",
  2: "/avatars/coast.webp",
  3: "/avatars/desert.webp",
  4: "/avatars/island.webp",
  5: "/avatars/lagoon.webp",
  6: "/avatars/rally.webp",
  7: "/avatars/snow.webp",
  8: "/avatars/stadium.webp",
  9: "/avatars/valley.webp",
};

const supabase = createClient();

/* =========================================================
   FETCH PROFILE
========================================================= */

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
    staleTime: 1000 * 60 * 60,
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