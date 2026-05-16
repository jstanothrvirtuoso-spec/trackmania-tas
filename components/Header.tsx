"use client";

import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { gameLinks } from "../lib/TrackLists";
import { useVisibleTables } from "../lib/VisibleTablesContext";

const supabase = createClient();

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const currentPage = pathname.split("/").filter(Boolean)[0];
  const { 
    showRta, showTimeSaved, showRecent, showLeaderboard, showRtaLeaderboard, showVisitorCounter, 
    setShowRta, setShowTimeSaved, setShowRecent, setShowLeaderboard, setShowRtaLeaderboard, setShowVisitorCounter
  } = useVisibleTables();

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isMainMenuOpen, setIsMainMenuOpen] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const optionsRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const menuTimeout = useRef<NodeJS.Timeout | null>(null);
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);

  const openMenu = () => {
    if (menuTimeout.current) clearTimeout(menuTimeout.current);
    setIsMainMenuOpen(true);
  };

  const closeMenu = () => {
    menuTimeout.current = setTimeout(() => {
      setIsMainMenuOpen(false);
    }, 40);
  };

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser();

      const user = data.user;
      setUser(user);

      if (!user) return;
      
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(profileData);
      setShowRta(profileData.show_rta?? true)
      setShowTimeSaved(profileData.show_time_saved?? true)
      setShowRecent(profileData.show_recent?? true)
      setShowLeaderboard(profileData.show_leaderboard?? true)
      setShowRtaLeaderboard(profileData.show_rta_leaderboard?? true)
      setShowVisitorCounter(profileData.show_visitor_counter?? true)
    };

    init();

    const { data: listener } =
      supabase.auth.onAuthStateChange(
        (_event, session) => {
          setUser(session?.user ?? null);
          init();
        }
      );

    return () =>
      listener.subscription.unsubscribe();
  }, []);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        optionsRef.current &&
        !optionsRef.current.contains(event.target as Node)
      ) {
        setIsOptionsOpen(false);
      }

      if (
        userRef.current &&
        !userRef.current.contains(event.target as Node)
      ) {
        setIsUserOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setIsUserOpen(false);
    router.push("/");
    router.refresh();
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
      <div className="mx-auto px-4 py-4">
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
            
            <div className="flex items-center gap-8">
              <Link
                href="/authors"
                className={`text-sm font-medium transition ${
                  currentPage === "authors"
                    ? "text-white border-b border-white"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                Authors
              </Link>
            </div>
            
            <div className="flex items-center gap-8">
              <Link
                href="/tracks"
                className={`text-sm font-medium transition ${
                  currentPage === "tracks"
                    ? "text-white border-b border-white"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                Tracks
              </Link>
            </div>

          </div>
          
          {/* RIGHT */}
          <div className="flex items-center gap-4">
            
            <div className="relative" ref={optionsRef}>
              <button
                onClick={() => setIsOptionsOpen(!isOptionsOpen)}
                className="rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 flex items-center gap-2 transition hover:bg-slate-700 hover:text-white"
              >
                Options
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isOptionsOpen && (
                <div className="absolute top-full mt-1 text-nowrap bg-slate-800 border border-slate-700 rounded-md shadow-lg z-50">
                  <div className="p-2">
                    <label className="flex items-center gap-2 text-sm text-slate-100 cursor-pointer hover:bg-slate-700 px-2 py-1 rounded">
                      <input type="checkbox" checked={showRta} onChange={(e) => setShowRta(e.target.checked)} />
                      RTA
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-100 cursor-pointer hover:bg-slate-700 px-2 py-1 rounded">
                      <input type="checkbox" checked={showTimeSaved} onChange={(e) => setShowTimeSaved(e.target.checked)} />
                      Time Saved
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-100 cursor-pointer hover:bg-slate-700 px-2 py-1 rounded">
                      <input type="checkbox" checked={showTimeSaved} onChange={(e) => setShowLeaderboard(e.target.checked)} />
                      Leaderboard
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-100 cursor-pointer hover:bg-slate-700 px-2 py-1 rounded">
                      <input
                        type="checkbox"
                        checked={showRtaLeaderboard}
                        onChange={(e) => setShowRtaLeaderboard(e.target.checked)}
                        className="rounded"
                      />
                      RTA Leaderboard
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-100 cursor-pointer hover:bg-slate-700 px-2 py-1 rounded">
                      <input
                        type="checkbox"
                        checked={showRecent}
                        onChange={(e) => setShowRecent(e.target.checked)}
                        className="rounded"
                      />
                      Highlight Recent
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-100 cursor-pointer hover:bg-slate-700 px-2 py-1 rounded">
                      <input
                        type="checkbox"
                        checked={showVisitorCounter}
                        onChange={(e) => setShowVisitorCounter(e.target.checked)}
                        className="rounded"
                      />
                      Visitor Counter
                    </label>
                  </div>
                </div>
              )}
            </div>
            
          {/* MENU (NEW) */}
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
                absolute right-0 top-full w-48 pt-1
                transition-all duration-200 origin-top
                ${isMainMenuOpen
                  ? "opacity-100 translate-y-0 pointer-events-auto"
                  : "opacity-0 -translate-y-2 pointer-events-none"
                }
              `}
            >
              <div className="rounded-md border border-slate-700 bg-slate-800 shadow-lg p-2 flex flex-col gap-1">

                {user ? (
                  <Link
                    href="/preferences"
                    className="px-3 py-2 text-sm text-slate-200 hover:bg-slate-700 rounded"
                  >
                    Profile
                  </Link>
                ) : (
                  <Link
                    href={`/login?next=${encodeURIComponent(pathname)}`}
                    className="px-3 py-2 text-sm text-slate-200 hover:bg-slate-700 rounded"
                  >
                    Login
                  </Link>
                )}

                <Link
                  href="/submit"
                  className="px-3 py-2 text-sm text-slate-200 hover:bg-slate-700 rounded"
                >
                  Submit TAS
                </Link>

              </div>
            </div>
          </div>

          {/* LOGIN / USER */}
          <div ref={userRef} className="relative">
            {user ? (
              <>
                <button
                  onClick={() => setIsUserOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-full border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-200 transition hover:bg-slate-700"
                >
                  <div className="h-5 w-5 rounded-full bg-emerald-500 text-xs font-bold text-black flex items-center justify-center">
                    {(profile?.username ?? "")?.[0]?.toUpperCase()}
                  </div>

                  <span className="hidden lg:block">
                    {profile?.username ?? ""}
                  </span>
                </button>

                {isUserOpen && (
                  <div className="absolute right-0 mt-2 w-44 rounded-md border border-slate-700 bg-slate-800 p-2">
                    <Link
                      href="/preferences"
                      className="block rounded px-2 py-1 hover:bg-slate-700"
                    >
                      Preferences
                    </Link>

                    <button
                      onClick={signOut}
                      className="w-full text-left rounded px-2 py-1 text-red-400 hover:bg-slate-700"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div />
            )}
            
          </div>

          </div>

           {/* USER
          <div className="relative" ref={userRef}>
            {user ? (
              <>
                <button
                  onClick={() => setIsUserOpen(!isUserOpen)}
                  className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 transition hover:bg-slate-700"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-slate-950">
                    {user.email[0].toUpperCase()}
                  </div>
                  <span className="hidden lg:block">{user.email}</span>
                </button>

                {isUserOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-md border border-slate-700 bg-slate-800 shadow-lg">
                    <div className="p-2">
                      <Link href="/preferences" className="block px-3 py-2 text-sm text-slate-200 hover:bg-slate-700 rounded">
                        Preferences
                      </Link>

                      <Link href="/admin" className="block px-3 py-2 text-sm text-slate-200 hover:bg-slate-700 rounded">
                        Admin
                      </Link>

                      <button
                        onClick={signOut}
                        className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-slate-700 rounded"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              // ✅ IMPORTANT : plus de Login ici (sinon doublon)
              <div />
            )}
          </div> */}


        </div>

      </div>
    </header>
  );
}