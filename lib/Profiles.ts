
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Role } from "@/utils/typing";
import { STALE_TIME } from "@/utils/constants";

export type ProfilePublic = {
  id: string;
  display_name: string;
  avatar: number;
  banner: number;
  colour: number;
  bio: string | null;
  user_number: number;
  role: Role;
};

export type ProfilePrivate = {
  id: string;
  show_rta: boolean;
  show_time_saved: boolean;
  show_leaderboard: boolean;
  show_rta_leaderboard: boolean;
  show_recent: boolean;
  show_visitor_counter: boolean;
  allow_sounds: boolean;
};

/* =========================================================
   FETCH PROFILE
========================================================= */

const supabase = createClient();

async function fetchProfile() {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles_private")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) throw error;

  return data;
}

export function useProfilePrivate() {
  return useQuery<ProfilePrivate | null>({
    queryKey: ["profile_private"],
    queryFn: fetchProfile,
    staleTime: STALE_TIME,
  });
}

export function useProfilePublicMe() {
  return useQuery<ProfilePublic>({
    queryKey: ["profile_public_me"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("profiles_public")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data;
    }
  });
}

export function useProfilePublic(userId?: string) {
  return useQuery<ProfilePublic | null>({
    queryKey: ["profile_public", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles_public")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      return data;
    },
    staleTime: STALE_TIME,
  });
}

/* =========================================================
   UPDATE
========================================================= */

export function useUpdateProfilePrivate() {
  const queryClient = useQueryClient();

  return useMutation<ProfilePrivate, Error, Partial<ProfilePrivate>>({
    mutationFn: async (profileUpdate) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("No user");

      const { data, error } = await supabase
        .from("profiles_private")
        .update(profileUpdate)
        .eq("id", user.id)
        .select()
        .single();

      if (error) throw error;

      return data;
    },

    onSuccess: (updatedProfile) => {
      queryClient.setQueryData<ProfilePrivate>(["profile_private"], updatedProfile);
    },
  });
}

export function useUpdateProfilePublic() {
  const queryClient = useQueryClient();

  return useMutation<ProfilePublic, Error, { user: { id: string }; profileUpdate: Partial<ProfilePublic> }>({
    mutationFn: async ({ user, profileUpdate }) => {

      if (!user) throw new Error("No user");

      const { data, error } = await supabase
        .from("profiles_public")
        .update(profileUpdate)
        .eq("id", user.id)
        .select()
        .single();

      if (error) throw error;

      return data;
    },

    onSuccess: (updatedProfile) => {
      queryClient.setQueryData<ProfilePublic>(["profile_public_me"], updatedProfile);
    },
  });
}

