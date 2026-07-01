
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function requireModerator() {
  const supabase = createClient(await cookies());

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("UNAUTHENTICATED");
  }

  const { data: profile } = await supabase
    .from("profiles_public")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role;

  if (role !== "admin" && role !== "moderator") {
    throw new Error("UNAUTHORISED");
  }

  return user;
}
