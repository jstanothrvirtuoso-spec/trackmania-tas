
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
  { href: "/submit", label: "Submit TAS", modal: true },
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
        className={`flex items-center gap-2 rounded-full border border-slate-500 bg-slate-800/70 px-3 py-2 text-sm text-slate-200 transition hover:bg-slate-700 ${CURSOR}`}
        aria-label="User menu"
      >
        <div 
          className="h-6 w-6 p-0.5 rounded-full bg-sky-500/70 text-sm font-semibold text-black flex items-center justify-center border border-white/30"
          style={{ backgroundColor: PROFILE_COLOURS[profilePublicMe.colour] ?? PROFILE_COLOURS[0]}}
        >
          <Image
            src={PROFILE_AVATARS[profilePublicMe.avatar] ?? PROFILE_AVATARS[0]}
            alt="Avatar"
            width={24}
            height={24}
            className="object-cover"
          />
        </div>

        <span className="text-[17px]">
          {profilePublicMe.display_name.length > 15 ? `${profilePublicMe.display_name.slice(0, 15)}...` : profilePublicMe.display_name}
        </span>
      </button>

      <div
        onMouseEnter={!isTouch ? userMenu.openNow : undefined}
        onMouseLeave={!isTouch ? userMenu.closeLater : undefined}
        className={`
          absolute right-0 top-full w-38 pt-1
          transition-all duration-200 origin-top
          ${userMenu.open
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-2 pointer-events-none"
          }
        `}
      >
        <div className="rounded-md border border-slate-700 bg-slate-800 shadow-lg p-2 flex flex-col gap-1">

          {USER_LINKS.map((link) => (
            <Link
              key={(link.modal && isTouch) ? `${link.href}?modal=0` : link.href}
              href={(link.modal && isTouch) ? `${link.href}?modal=0` : link.href}
              className="px-3 py-2 text-sm text-slate-200 hover:bg-slate-700 rounded"
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
                className="flex items-center justify-between px-3 py-2 text-sm text-slate-200 hover:bg-slate-700 rounded cursor-pointer"
                onClick={adminMenu.toggle}
              >
                <span>Admin</span>
                <span className="text-slate-400">▶</span>
              </div>

              <div
                className={`
                  absolute left-full top-0 w-40
                  transition-all duration-150
                  ${
                    adminMenu.open
                      ? "opacity-100 pointer-events-auto"
                      : "opacity-0 pointer-events-none"
                  }
                `}
              >
                
                <div className="rounded-md border border-slate-700 bg-slate-800 shadow-lg p-2 flex flex-col gap-1">
                  {ADMIN_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="px-3 py-2 text-sm text-slate-200 hover:bg-slate-700 rounded"
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
            className="px-3 py-2 text-sm text-red-400 hover:bg-slate-700 rounded text-left cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}
