"use client";

import Link from "next/link";
import { useState } from "react";
import { leaderboards } from "../lib/leaderboards";
import { useRta } from "../lib/RtaContext";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { showRta, setShowRta } = useRta();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold text-white">
              TrackMania TAS
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              {leaderboards.map((game) => (
                <Link
                  key={game.slug}
                  href={`/${game.slug}`}
                  className="text-sm font-medium text-slate-300 transition hover:text-white"
                >
                  {game.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowRta(!showRta)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ring-1 ${
                showRta
                  ? "bg-emerald-900/40 text-emerald-300 ring-emerald-700/50 hover:bg-emerald-900/60"
                  : "bg-slate-800 text-slate-300 ring-slate-700 hover:bg-slate-700 hover:text-white"
              }`}
              title={showRta ? "Hide RTA records" : "Show RTA records"}
            >
              Show RTA
              {showRta && (
                <svg className="w-4 h-4 ml-1 inline" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
            <button className="rounded-full bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 ring-1 ring-slate-700 transition hover:bg-slate-700 hover:text-white">
              Submit TAS
            </button>
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
              {leaderboards.map((game) => (
                <Link
                  key={game.slug}
                  href={`/${game.slug}`}
                  className="text-sm font-medium text-slate-300 transition hover:text-white"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {game.name}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}