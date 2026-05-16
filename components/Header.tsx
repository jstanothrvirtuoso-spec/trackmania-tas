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
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const optionsRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

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
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur-md">
      <div className="mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-10">

          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold text-white font-okta whitespace-nowrap">
              TrackMania TAS
            </Link>

            <nav className="hidden md:flex items-center gap-4">
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

          <div className="flex items-center gap-4">
            
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

            <div className="relative" ref={optionsRef}>
              <button
                onClick={() => setIsOptionsOpen(!isOptionsOpen)}
                className="rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:border-slate-500 focus:outline-none flex items-center gap-2 transition hover:bg-slate-700 hover:text-white"
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
                      <input
                        type="checkbox"
                        checked={showRta}
                        onChange={(e) => setShowRta(e.target.checked)}
                        className="rounded"
                      />
                      RTA
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-100 cursor-pointer hover:bg-slate-700 px-2 py-1 rounded">
                      <input
                        type="checkbox"
                        checked={showTimeSaved}
                        onChange={(e) => setShowTimeSaved(e.target.checked)}
                        className="rounded"
                      />
                      Time Saved
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-100 cursor-pointer hover:bg-slate-700 px-2 py-1 rounded">
                      <input
                        type="checkbox"
                        checked={showLeaderboard}
                        onChange={(e) => setShowLeaderboard(e.target.checked)}
                        className="rounded"
                      />
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
            
            <div className="flex items-center gap-8">
              <Link
                href="/submit"
                className="rounded-full bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 ring-1 ring-slate-700 transition hover:bg-slate-700 hover:text-white whitespace-nowrap"
              >
                Submit TAS
              </Link>
            </div>

            {/* LOGIN / USER */}
            <div ref={userRef} className="relative">
              {user ? (
                <>
                  <button
                    onClick={() => setIsUserOpen((v) => !v)}
                    className="flex items-center gap-2 rounded-full bg-slate-800 px-3 py-2 text-sm"
                  >
                    <div className="h-6 w-6 rounded-full bg-emerald-500 text-xs font-bold text-black flex items-center justify-center">
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
                <Link
                  href={`/login?next=${encodeURIComponent(pathname)}`}
                  className="rounded-full bg-slate-800 px-4 py-2 text-sm"
                >
                  Login
                </Link>
              )}
            </div>

          </div>
        </div>

      </div>
    </header>
  );
}