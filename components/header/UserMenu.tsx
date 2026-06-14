
import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useHoverDropdown, useOnClickOutside } from "@/utils/common";
import { PROFILE_AVATARS, PROFILE_COLOURS, CURSOR } from "@/utils/constants"
import { ProfilePublic } from "@/lib/Profiles";

const USER_LINKS = [
  { href: "/submit", label: "Submit TAS" },
  { href: "/profile", label: "Profile" },
];
const ADMIN_LINKS = [
  { href: "/admin-tas", label: "TAS" },
  { href: "/admin-rta", label: "RTA" },
  { href: "/admin-authors", label: "Authors" },
];

const supabase = createClient();

export function UserMenu({ isTouch, profilePublicMe }: { isTouch: boolean, profilePublicMe: ProfilePublic }) {

  const router = useRouter();
  const queryClient = useQueryClient();
  
  const userMenu = useHoverDropdown();
  const adminMenu = useHoverDropdown();
  const ref = useRef<HTMLDivElement>(null);

  useOnClickOutside(ref, userMenu.closeNow, isTouch);

  async function signOut() {
    await supabase.auth.signOut();
    queryClient.removeQueries({ queryKey: ["profile_public_me"] });
    queryClient.removeQueries({ queryKey: ["profile_private"] });
    userMenu.closeNow();
    router.push("/");
    router.refresh();
  }

  return (
    <div ref={ref} className="relative">
      <button
        onMouseEnter={!isTouch ? userMenu.openNow : undefined}
        onMouseLeave={!isTouch ? userMenu.closeLater : undefined}
        onClick={userMenu.toggle}
        className={`
          flex items-center gap-3 rounded-full border border-cyan-400/20 
          bg-slate-950/90 px-3 py-0.5 text-sm text-cyan-100 shadow-[0_0_30px_rgba(34,211,238,0.18)] 
          transition duration-200 hover:border-cyan-300/50 hover:bg-slate-900/95 ${CURSOR}`}
        aria-label="User menu"
      >
        <div 
          className="h-6 w-6 rounded-full text-black flex items-center justify-center border border-cyan-400/20 shadow-[0_0_16px_rgba(34,211,238,0.24)]"
          style={{ backgroundColor: PROFILE_COLOURS[profilePublicMe.colour] ?? PROFILE_COLOURS[0] }}
        >
          <Image
            src={PROFILE_AVATARS[profilePublicMe.avatar] ?? PROFILE_AVATARS[0]}
            alt="Avatar"
            width={24}
            height={24}
            className="object-cover rounded-full"
          />
        </div>

        <div className="flex flex-col items-start leading-tight py-2">
          <span className="text-[15px] font-semibold text-slate-100">
            {profilePublicMe.display_name.length > 15 ? `${profilePublicMe.display_name.slice(0, 15)}...` : profilePublicMe.display_name}
          </span>
        </div>
      </button>

      <div
        onMouseEnter={!isTouch ? userMenu.openNow : undefined}
        onMouseLeave={!isTouch ? userMenu.closeLater : undefined}
        className={`
          absolute right-0 top-full mt-1 min-w-[120px] w-34
          transition-all duration-200 origin-top-right
          ${userMenu.open
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-3 pointer-events-none"
          }
        `}
      >
        <div className="rounded-2xl border border-cyan-500/15 bg-slate-950/95 shadow-[0_18px_60px_rgba(14,116,144,0.24)] backdrop-blur-xl p-2 flex flex-col gap-1">

          {USER_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-xl px-3 py-2 text-sm text-cyan-100 hover:bg-cyan-500/10 transition"
              onClick={userMenu.closeNow}
            >
              {link.label}
            </Link>
          ))}
        
          {profilePublicMe?.role === "admin" && (
            <div
              className="relative"
              onMouseEnter={!isTouch ? adminMenu.openNow : undefined}
              onMouseLeave={!isTouch ? adminMenu.closeLater : undefined}
            >
              <div
                className="flex items-center justify-between rounded-xl px-3 text-sm text-cyan-100 hover:bg-cyan-500/10 transition cursor-pointer"
                onClick={adminMenu.toggle}
              >
                <span className="py-2">Admin</span>
                <span className="text-cyan-300 text-2xl">▸</span>
              </div>

              <div
                className={`
                  absolute left-full top-0 -ml-2 w-40
                  transition-all duration-150
                  ${
                    adminMenu.open
                      ? "opacity-100 translate-x-0 pointer-events-auto"
                      : "opacity-0 -translate-x-2 pointer-events-none"
                  }
                `}
              >
                <div className="rounded-2xl border border-cyan-500/15 bg-slate-950/95 shadow-[0_18px_40px_rgba(14,116,144,0.18)] backdrop-blur-xl p-2 flex flex-col gap-1">
                  {ADMIN_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="rounded-xl px-3 py-2 text-sm text-cyan-100 hover:bg-cyan-500/10 transition"
                      onClick={() => {
                        adminMenu.closeNow();
                        userMenu.closeNow();
                      }}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          <button
            onClick={signOut}
            className="rounded-xl px-3 py-2 text-sm text-rose-300 hover:bg-rose-500/10 transition text-left"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}
