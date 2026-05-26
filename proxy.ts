
import { type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/admin-tas/:path*",
    "/admin-rta/:path*",
    "/profile/:path*",
    "/submit/:path*",
  ],
};
