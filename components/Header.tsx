"use client";

import Link from "next/link";
import { useState } from "react";
import { leaderboards } from "../lib/leaderboards";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold text-white">
              Trackmania TAS
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