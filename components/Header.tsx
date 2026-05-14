"use client";

import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { gameLinks } from "../lib/TrackLists";
import { useVisibleTables } from "../lib/VisibleTablesContext";

const supabase = createClient();

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { 
    showRta, showTimeSaved, showRecent, showLeaderboard, showRtaLeaderboard, showVisitorCounter, 
    setShowRta, setShowTimeSaved, setShowRecent, setShowLeaderboard, setShowRtaLeaderboard, setShowVisitorCounter
  } = useVisibleTables();
  const optionsDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const currentPage = pathname.split("/").filter(Boolean)[0];
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        optionsDropdownRef.current &&
        !optionsDropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }

      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node)
      ) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  async function signOut() {
    const supabase = createClient();

    const { error } = await supabase.auth.signOut();

    if (error) return;

    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur-md">
      <div className="mx-auto max-w-àxl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold text-white font-okta">
              TrackMania TAS
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              {gameLinks.map((game) => {
                const isActive = currentPage === game.slug;

                return (
                  <Link
                    key={game.slug}
                    href={`/${game.slug}`}
                    className={`text-sm font-medium transition ${
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

          <div className="flex items-center gap-8">
            
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

            <div className="relative" ref={optionsDropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:border-slate-500 focus:outline-none flex items-center gap-2 transition hover:bg-slate-700 hover:text-white"
              >
                Options
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isDropdownOpen && (
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
                className="rounded-full bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 ring-1 ring-slate-700 transition hover:bg-slate-700 hover:text-white"
              >
                Submit TAS
              </Link>
            </div>

            <div className="relative" ref={userDropdownRef}>
              {user ? (
                <>
                  <button
                    onClick={() =>
                      setIsUserDropdownOpen(!isUserDropdownOpen)
                    }
                    className="
                      flex items-center gap-2 rounded-full
                      border border-slate-700 bg-slate-800
                      px-3 py-2 text-sm text-slate-200
                      transition hover:bg-slate-700
                    "
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-slate-950">
                      {user.email[0].toUpperCase()}
                    </div>

                    <span className="hidden lg:block">
                      {user.email}
                    </span>

                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {isUserDropdownOpen && (
                    <div
                      className="
                        absolute right-0 top-full mt-2 w-48
                        rounded-md border border-slate-700
                        bg-slate-800 shadow-lg
                      "
                    >
                      <div className="p-2">
                        <Link
                          href="/preferences"
                          className="
                            block rounded px-3 py-2 text-sm
                            text-slate-200 transition
                            hover:bg-slate-700
                          "
                        >
                          Preferences
                        </Link>

                        <Link
                          href="/admin"
                          className="
                            block rounded px-3 py-2 text-sm
                            text-slate-200 transition
                            hover:bg-slate-700
                          "
                        >
                          Admin
                        </Link>

                        <button
                          onClick={signOut}
                          className="
                            w-full rounded px-3 py-2 text-left
                            text-sm text-red-400 transition
                            hover:bg-slate-700
                          "
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={`/login?next=${encodeURIComponent(pathname)}`}
                  className="
                    rounded-full border border-slate-700
                    bg-slate-800 px-4 py-2
                    text-sm font-medium text-slate-100
                    transition hover:bg-slate-700 hover:text-white
                  "
                >
                  Login
                </Link>
              )}
            </div>

            <button
              className="md:hidden rounded-md p-2 text-slate-400 hover:text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
        {isMenuOpen && (
          <div className="md:hidden mt-4 border-t border-slate-800 pt-4">
            <nav className="flex flex-col gap-4">
              {gameLinks.map((game) => {
                const isActive = currentPage === game.slug;

                return (
                  <Link
                    key={game.slug}
                    href={`/${game.slug}`}
                    className={`text-sm font-medium transition ${
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
        )}
      </div>
    </header>
  );
}