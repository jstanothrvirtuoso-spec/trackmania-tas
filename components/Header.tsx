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

  const [headerHeight, setHeaderHeight] = useState(80);
  const headerRef = useRef<HTMLElement | null>(null);

  const [headerProgress, setHeaderProgress] = useState(1);

  // ---------------- HEIGHT ----------------
  useEffect(() => {
    const updateHeight = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  // ---------------- SCROLL PROGRESSIVE TOP REVEAL ----------------
  useEffect(() => {
    const MAX_DISTANCE = 120; // distance où le header disparaît totalement

    const handleScroll = () => {
      const y = window.scrollY;

      // 👉 clamp progress entre 0 et 1
      let progress = 1 - Math.min(y / MAX_DISTANCE, 1);

      setHeaderProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ---------------- MENU ----------------
  const openMenu = () => setIsMainMenuOpen(true);
  const closeMenu = () => setIsMainMenuOpen(false);

  const openUser = () => setIsUserOpen(true);
  const closeUser = () => setIsUserOpen(false);

  // ---------------- SIGN OUT ----------------
  async function signOut() {
    await supabase.auth.signOut();
    queryClient.removeQueries({ queryKey: ["profile"] });
    router.push("/");
    router.refresh();
  }

  if (isLoading) return <div>Loading...</div>;

  return (
    <>
      {/* spacer */}
      <div style={{ height: headerHeight }} />

      <header
        ref={headerRef}
        className="
          fixed top-0 left-0 w-full z-20
          border-b border-slate-800
          bg-slate-950/50 backdrop-blur-md
          bg-gradient-to-br from-violet-700/30 to-blue-800/70
          will-change-transform
          transition-transform duration-200 ease-out
        "
        style={{
          transform: `translateY(${(1 - headerProgress) * -110}%)`,
          opacity: headerProgress,
        }}
      >
        <div className="mx-auto px-4 py-4">
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4">

            {/* LEFT */}
            <div className="flex items-center">
              <Link
                href="/"
                style={{ fontFamily: "DOSVGA" }}
                className="text-2xl text-white whitespace-nowrap translate-x-4"
              >
                Leaderboard
              </Link>
            </div>

            {/* CENTER */}
            <div className="hidden md:flex items-center justify-center">
              <nav className="flex items-center gap-4">

                {gameLinks.map((game) => {
                  const isActive = currentPage === game.slug;

                  return (
                    <Link
                      key={game.slug}
                      href={`/${game.slug}`}
                      className={`text-lg font-medium whitespace-nowrap transition ${
                        isActive
                          ? "text-white border-b border-white"
                          : "text-slate-300 hover:text-white"
                      }`}
                    >
                      {game.name}
                    </Link>
                  );
                })}

                {/* MENU */}
                <div className="relative ml-2">
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
                      ${
                        isMainMenuOpen
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

                      <Link href="/" className="px-3 py-2 text-sm text-slate-200 hover:bg-slate-700 rounded">
                        Global Leaderboard
                      </Link>

                      <Link href="/" className="px-3 py-2 text-sm text-slate-200 hover:bg-slate-700 rounded">
                        Highlight
                      </Link>

                      <Link href="/" className="px-3 py-2 text-sm text-slate-200 hover:bg-slate-700 rounded">
                        Inputs
                      </Link>

                      <Link href="/authors" className="px-3 py-2 text-sm text-slate-200 hover:bg-slate-700 rounded">
                        Authors
                      </Link>

                      <Link href="/tracks" className="px-3 py-2 text-sm text-slate-200 hover:bg-slate-700 rounded">
                        Tracks
                      </Link>

                      <Link href="/tmnf-stats" className="px-3 py-2 text-sm text-slate-200 hover:bg-slate-700 rounded">
                        TMNF Stats
                      </Link>

                    </div>
                  </div>
                </div>

              </nav>
            </div>

          </div>
        </div>
      </header>
    </>
  );
}