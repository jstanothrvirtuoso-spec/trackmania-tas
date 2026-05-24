import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export type Profile = {
  id: string;
  username: string;

  avatar_url?: string | null;

  show_rta: boolean;
  show_time_saved: boolean;
  show_leaderboard: boolean;
  show_rta_leaderboard: boolean;
  highlight_recent: boolean;
  show_visitor_counter: boolean;
};

type ProfilePatch = Partial<Omit<Profile, "id">>;

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

export function useUpdateProfile1() {
  const queryClient = useQueryClient();

  return useMutation<Profile, Error, ProfilePatch>({
    mutationFn: async (patch: ProfilePatch) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

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

/* =========================================================
   UPDATE PREFERENCES
========================================================= */

export function useUpdateProfile2() {
  const queryClient = useQueryClient();

  return useMutation<Profile, Error, ProfilePatch>({
    mutationFn: async (patch: ProfilePatch) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

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

/* =========================================================
   AVATAR UPLOAD
========================================================= */

export function useUpdateProfileAvatar() {
  const queryClient = useQueryClient();

  return useMutation<Profile, Error, File>({
    mutationFn: async (file) => {
      // ✅ prevent undefined / invalid object
      if (!(file instanceof File)) {
        console.error("Invalid file:", file);
        throw new Error("Invalid file selected");
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("No user");
      }

      // ✅ safer extension extraction
      const parts = file.name.split(".");
      const fileExt = parts.length > 1 ? parts.pop() : "png";

      const filePath = `${user.id}/avatar.${fileExt}`;

      /* ================================
         1. Upload to Supabase Storage
      ================================= */

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          upsert: true,
        });

      if (uploadError) {
        console.error(uploadError);
        throw uploadError;
      }

      /* ================================
         2. Get public URL
      ================================= */

      const { data } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const avatar_url = data.publicUrl;

      /* ================================
         3. Save into profile table
      ================================= */

      const { data: updated, error } = await supabase
        .from("profiles")
        .update({
          avatar_url,
        })
        .eq("id", user.id)
        .select()
        .single();

      if (error) {
        console.error(error);
        throw error;
      }

      return updated;
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