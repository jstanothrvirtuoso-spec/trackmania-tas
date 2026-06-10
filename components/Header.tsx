"use client";

import Link from "next/link";
import Image from "next/image";
import { FaDiscord } from "react-icons/fa";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useProfilePublicMe } from "@/lib/Profiles";
import { PROFILE_AVATARS, PROFILE_COLOURS, CURSOR, GAME_SLUGS } from "@/utils/constants"
import { useHoverDropdown } from "@/utils/common";

const MENU_LINKS = [
  { href: "/", label: "Global Leaderboard" },
  { href: "/highlight", label: "Highlight" },
  { href: "/inputs", label: "Inputs" },
  { href: "/authors", label: "Authors" },
  { href: "/tracks", label: "Tracks" },
  { href: "/tmnf-stats", label: "TMNF Stats" },
  { href: "/about", label: "About" },
];

const supabase = createClient();

export default function Header() {

  const router = useRouter();
  const pathname = usePathname();
  const currentPage = pathname === "/" ? "/" : pathname.split("/")[1];

  const { data: profilePublicMe, isLoading } = useProfilePublicMe();
  const queryClient = useQueryClient();

  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);

  const menu = useHoverDropdown();
  const userMenu = useHoverDropdown();
  const adminMenu = useHoverDropdown();
  const gamesMenu = useHoverDropdown();

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const lastY = lastScrollY.current;

        if (currentY <= 10) {
          setShowHeader(true);
        } else if (currentY > lastY) {
          setShowHeader(false);
        } else if (currentY < lastY && currentY <= 100) {
          setShowHeader(true);
        }

        lastScrollY.current = currentY;
        ticking = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    queryClient.removeQueries({ queryKey: ["profile_public_me"] });
    queryClient.removeQueries({ queryKey: ["profile_private"] });
    userMenu.closeNow();
    router.push("/");
    router.refresh();
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out
        ${showHeader ? "-translate-y-0.5 opacity-100" : "-translate-y-6 opacity-0 pointer-events-none"}`}
    >
      <div className="flex justify-center">
        <div className="w-full max-w-[76rem] border border-slate-700 bg-slate-950/50 shadow-xl backdrop-blur-md bg-gradient-to-br from-violet-700/30 to-blue-800/70 rounded-b-3xl px-4 py-3">
          <div className="grid grid-cols-[auto_auto_minmax(0,1fr)_auto] items-center gap-3 sm:gap-4">
            
            {/* MENU */}
            <div className="relative inline-block">
              <button
                onMouseEnter={menu.openNow}
                onMouseLeave={menu.closeLater}
                onClick={menu.toggle}
                className={`flex h-10 w-10 flex-col items-center justify-center gap-1 rounded-lg border border-slate-500 bg-slate-700 transition hover:bg-slate-700 shadow-lg ${CURSOR}`}
                aria-label="Open menu"
              >
                <span className="h-0.5 w-5 rounded bg-slate-100" />
                <span className="h-0.5 w-5 rounded bg-slate-100" />
                <span className="h-0.5 w-5 rounded bg-slate-100" />
              </button>

              <div
                onMouseEnter={menu.openNow}
                onMouseLeave={menu.closeLater}
                className={`
                  absolute left-0 top-full pt-1
                  transition-all duration-200 origin-top
                  ${menu.open
                    ? "opacity-100 translate-y-0 pointer-events-auto"
                    : "opacity-0 -translate-y-2 pointer-events-none"
                  }
                `}
              >
                <div className="rounded-lg border border-slate-500 bg-gradient-to-bl from-green-900/95 to-blue-900/90 shadow-lg p-2 flex flex-col gap-1 whitespace-nowrap">

                  {!profilePublicMe?.display_name && (
                    <Link
                      href={`/login?next=${encodeURIComponent(pathname)}`}
                      style={{ fontFamily: "DOSVGA" }}
                      className="px-2 py-0 text-lg text-slate-200 hover:bg-yellow-700/30 rounded font-dosvga"
                      onClick={menu.closeNow}
                    >
                      Login/Register
                    </Link>
                  )}

                  {MENU_LINKS.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      style={{ fontFamily: "DOSVGA" }}
                      className="px-2 py-0 text-lg text-slate-200 hover:bg-yellow-700/30 rounded font-dosvga"
                      onClick={menu.closeNow}
                    >
                      {link.label}
                    </Link>
                  ))}

                </div>
              </div>
            </div>
            
            {/* HOME */}
            <div className="mt-[2px]">
              <Link
                href="/"
                style={{ fontFamily: "DOSVGA" }}
                className="text-2xl text-white whitespace-nowrap font-dosvga [text-shadow:0_2px_4px_rgba(0,0,0,0.9)]"
              >
                Leaderboard
              </Link>
            </div>

            {/* GAMES */}
            <div className="hidden lg:flex min-w-0 items-center justify-center px-6">
              <nav className="flex items-center gap-4 overflow-x-auto scrollbar-none">
                {Object.entries(GAME_SLUGS).map(([slug, game]) => {
                  const isActive = currentPage === slug;

                  return (
                    <Link
                      key={slug}
                      href={`/${slug}`}
                      className={`font-medium whitespace-nowrap transition [text-shadow:0_2px_4px_rgba(0,0,0,0.9)] ${
                        isActive
                          ? "text-white border-b border-white"
                          : "text-slate-300 hover:text-white"
                      }`}
                    >
                      {game}
                    </Link>
                  );
                })}
              </nav>
            </div>
          
            {/* MOBILE GAMES */}
            <div className="relative lg:hidden">
              <button
                onMouseEnter={gamesMenu.openNow}
                onMouseLeave={gamesMenu.closeLater}
                onClick={gamesMenu.toggle}
                className="flex h-10 items-center gap-2 rounded-lg border border-slate-500 bg-slate-700 px-3 text-sm text-slate-200 transition hover:bg-slate-700 shadow-lg"
                aria-label="Open games menu"
              >
                Games
              </button>

              <div
                onMouseEnter={gamesMenu.openNow}
                onMouseLeave={gamesMenu.closeLater}
                className={`absolute right-0 top-full mt-1 w-44 transition-all duration-200 origin-top ${gamesMenu.open ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"}`}
              >
                <div className="rounded-lg border border-slate-500 bg-slate-800 shadow-lg p-2 flex flex-col gap-1">
                  {Object.entries(GAME_SLUGS).map(([slug, game]) => (
                    <Link
                      key={slug}
                      href={`/${slug}`}
                      className="px-3 py-2 text-sm text-slate-200 hover:bg-slate-700 rounded"
                      onClick={gamesMenu.closeNow}
                    >
                      {game}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-3 whitespace-nowrap">

              {/* USER */}
              <div className="relative">
                {!isLoading && profilePublicMe?.display_name ? (
                  <>
                    <button
                      onMouseEnter={userMenu.openNow}
                      onMouseLeave={userMenu.closeLater}
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
                      onMouseEnter={userMenu.openNow}
                      onMouseLeave={userMenu.closeLater}
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
                        <Link href="/submit" className="px-3 py-2 text-sm text-slate-200 hover:bg-slate-700 rounded" onClick={userMenu.closeNow}>
                          Submit TAS
                        </Link>

                        <Link href="/profile" className="px-3 py-2 text-sm text-slate-200 hover:bg-slate-700 rounded" onClick={userMenu.closeNow}>
                          Profile
                        </Link>
                                                
                        {profilePublicMe?.role === "admin" && (
                          <div
                            className="relative"
                            onMouseEnter={adminMenu.openNow}
                            onMouseLeave={adminMenu.closeLater}
                          >
                            <div
                              className="flex items-center justify-between px-3 py-2 text-sm text-slate-200 hover:bg-slate-700 rounded cursor-pointer"
                              onMouseEnter={adminMenu.openNow}
                              onClick={adminMenu.toggle}
                            >
                              <span>Admin</span>
                              <span className="text-slate-400">▶</span>
                            </div>

                            <div
                              onMouseEnter={adminMenu.openNow}
                              onMouseLeave={adminMenu.closeLater}
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
                                <Link
                                  href="/admin-tas"
                                  className="px-3 py-2 text-sm text-slate-200 hover:bg-slate-700 rounded"
                                  onClick={() => {
                                    adminMenu.closeNow();
                                    userMenu.closeNow();
                                  }}
                                >
                                  TAS
                                </Link>

                                <Link
                                  href="/admin-rta"
                                  className="px-3 py-2 text-sm text-slate-200 hover:bg-slate-700 rounded"
                                  onClick={() => {
                                    adminMenu.closeNow();
                                    userMenu.closeNow();
                                  }}
                                >
                                  RTA
                                </Link>

                                <Link
                                  href="/admin-authors"
                                  className="px-3 py-2 text-sm text-slate-200 hover:bg-slate-700 rounded"
                                  onClick={() => {
                                    adminMenu.closeNow();
                                    userMenu.closeNow();
                                  }}
                                >
                                  Authors
                                </Link>
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
                  </>
                ) : (
                  <div className="h-10.5 w-30" />
                )}
              </div>

              {/* DISCORD */}
              <a
                href="https://discord.gg/tD4rarRYpj"
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 items-center justify-center rounded-full bg-[#5865F2] text-white transition-transform hover:scale-105 hidden lg:flex"
                aria-label="Discord"
              >
                <FaDiscord size={22} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
