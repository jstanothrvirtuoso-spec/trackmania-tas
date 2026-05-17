
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export type Profile = {
  id: string;
  username: string;
  show_rta: boolean;
  show_time_saved: boolean;
  show_leaderboard: boolean;
  show_rta_leaderboard: boolean;
  highlight_recent: boolean;
  show_visitor_counter: boolean;
};
type ProfilePatch = Partial<Omit<Profile, "id">>;

const supabase = createClient();

async function fetchProfile() {
  const { data: { user } } = await supabase.auth.getUser();
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

export function useUpdateProfile1() {
  const queryClient = useQueryClient();

  return useMutation<Profile, Error, ProfilePatch>({
    mutationFn: async (patch: ProfilePatch) => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error("No user");

      const { data, error } = await supabase
        .from("profiles")
        .update(patch)
        .eq("id", user.id)
        .select()
        .single();

      if (error) throw error;

      return data;
    },

    onSuccess: (updatedProfile) => {
      queryClient.setQueryData<Profile>(["profile"], (old) => {
        if (!old) return updatedProfile;

        return {
          ...old,
          ...updatedProfile,
        };
      });
    },
  });
}

export function useUpdateProfile2() {
  const queryClient = useQueryClient();

  return useMutation<Profile, Error, ProfilePatch>({
    mutationFn: async (patch: ProfilePatch) => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error("No user");

      const { data, error } = await supabase
        .from("profiles")
        .update(patch)
        .eq("id", user.id)
        .select()
        .single();

      if (error) throw error;

      return data;
    },

    onSuccess: (updatedProfile) => {
      queryClient.setQueryData<Profile>(["profile"], (old) => {
        if (!old) return updatedProfile;

        return {
          ...old,
          ...updatedProfile,
        };
      });
    },
  });
}
