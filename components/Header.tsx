"use client";

import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { gameLinks } from "@/lib/TrackLists";
import { useProfile } from "@/lib/Profiles";

const supabase = createClient();

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const currentPage = pathname.split("/").filter(Boolean)[0];

  const { data: profile, isLoading } = useProfile();
  const queryClient = useQueryClient();

  const [isMainMenuOpen, setIsMainMenuOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const menuTimeout = useRef<NodeJS.Timeout | null>(null);
  const userTimeout = useRef<NodeJS.Timeout | null>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);

  const openMenu = () => { if (menuTimeout.current) clearTimeout(menuTimeout.current); setIsMainMenuOpen(true) };
  const closeMenu = () => { menuTimeout.current = setTimeout(() => { setIsMainMenuOpen(false) }, 40) };
  const openUser = () => { if (userTimeout.current) clearTimeout(userTimeout.current); setIsUserOpen(true) };
  const closeUser = () => { userTimeout.current = setTimeout(() => { setIsUserOpen(false) }, 40) };

  useEffect(() => {
    const handleScroll = () => {
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
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    queryClient.removeQueries({ queryKey: ["profile"] });
    setIsUserOpen(false);
    router.push("/");
    router.refresh();
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
     <header
      className={`
        sticky top-0 z-50
        border-b border-slate-800
        bg-slate-950/95 backdrop-blur-md
        transition-all duration-500 ease-out
        ${
          showHeader
            ? "translate-y-0 opacity-100"
            : "-translate-y-6 opacity-0 pointer-events-none"
        }
      `}
    >
      <div className="mx-auto px-4 py-4 bg-gradient-to-br from-violet-800/10 to-blue-900">
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4">

          {/* LEFT */}
          <div>
            <Link
              href="/"
              className="text-xl font-bold text-white font-okta whitespace-nowrap"
            >
              Leaderboard
            </Link>
          </div>

          {/* CENTER */}
          <div className="hidden md:flex items-center justify-center gap-8">
            <nav className="flex items-center gap-4">
              {gameLinks.map((game) => {
                const isActive = currentPage === game.slug;

                return (
                  <Link
                    key={game.slug}
                    href={`/${game.slug}`}
                    className={`text-sm font-medium whitespace-nowrap transition ${
                      isActive
                        ? "text-white border-b border-white"
                        : "text-slate-300 hover:text-white"
                    }`}
                  >
                    {game.name}
                  </Link>
                );
              })}
            </nav>
            
          </div>
          
          {/* RIGHT */}
          <div className="flex items-center gap-4">
            
            {/* MENU */}
            <div className="relative inline-block">
              <button
                onMouseEnter={openMenu}
                onMouseLeave={closeMenu}
                className="rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 transition hover:bg-slate-700 hover:text-white"
              >
                Menu
              </button>

              <div
                onMouseEnter={openMenu}
                onMouseLeave={closeMenu}
                className={`
                  absolute right-0 top-full pt-1
                  transition-all duration-200 origin-top
                  ${isMainMenuOpen
                    ? "opacity-100 translate-y-0 pointer-events-auto"
                    : "opacity-0 -translate-y-2 pointer-events-none"
                  }
                `}
              >
                <div className="rounded-md border border-slate-700 bg-slate-800 shadow-lg p-2 flex flex-col gap-1 whitespace-nowrap">

                  {!profile?.username && (
                    <Link
                      href={`/login?next=${encodeURIComponent(pathname)}`}
                      className="px-3 py-2 text-sm text-slate-200 hover:bg-slate-700 rounded"
                    >
                      Login
                    </Link>
                  )}

                  <Link
                    href="/"
                    className="px-3 py-2 text-sm text-slate-200 hover:bg-slate-700 rounded"
                  >
                    Global Leaderboard
                  </Link>

                  <Link
                    href="/authors"
                    className="px-3 py-2 text-sm text-slate-200 hover:bg-slate-700 rounded"
                  >
                    Authors
                  </Link>

                  <Link
                    href="/tracks"
                    className="px-3 py-2 text-sm text-slate-200 hover:bg-slate-700 rounded"
                  >
                    Tracks
                  </Link>

                </div>
              </div>
            </div>

            {/* USER */}
            <div ref={userRef} className="relative">
              {profile?.username && (
                <>
                  <button
                    onMouseEnter={openUser}
                    onMouseLeave={closeUser}
                    className="flex items-center gap-2 rounded-full border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-200 transition hover:bg-slate-700"
                  >
                    <div className="h-5 w-5 rounded-full bg-emerald-500 text-xs font-bold text-black flex items-center justify-center">
                      {(profile.username)?.[0]?.toUpperCase()}
                    </div>

                    <span className="hidden lg:block">
                      {profile.username}
                    </span>
                  </button>

                  <div
                    onMouseEnter={openUser}
                    onMouseLeave={closeUser}
                    className={`
                      absolute right-0 top-full w-38 pt-1
                      transition-all duration-200 origin-top
                      ${isUserOpen
                        ? "opacity-100 translate-y-0 pointer-events-auto"
                        : "opacity-0 -translate-y-2 pointer-events-none"
                      }
                    `}
                  >
                    <div className="rounded-md border border-slate-700 bg-slate-800 shadow-lg p-2 flex flex-col gap-1">
                      <Link
                        href="/submit"
                        className="px-3 py-2 text-sm text-slate-200 hover:bg-slate-700 rounded"
                      >
                        Submit TAS
                      </Link>

                      <Link
                        href="/preferences"
                        className="px-3 py-2 text-sm text-slate-200 hover:bg-slate-700 rounded"
                      >
                        Preferences
                      </Link>

                      <button
                        onClick={signOut}
                        className="px-3 py-2 text-sm text-red-400 hover:bg-slate-700 rounded text-left"
                      >
                        Logout
                      </button>

                    </div>
                  </div>
                </>
              )}
            </div>

          </div>
        </div>
      </div>
    </header>
  );
}