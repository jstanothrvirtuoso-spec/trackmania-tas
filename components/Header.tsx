"use client";

import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { gameLinks } from "@/lib/TrackList";
import { useProfile, AVATARS, PROFILE_COLOURS } from "@/lib/Profiles";

const supabase = createClient();
const menuLinks = [
  { href: "/", label: "Global Leaderboard" },
  { href: "highlight", label: "Highlight" },
  { href: "inputs", label: "Inputs" },
  { href: "/authors", label: "Authors" },
  { href: "/tracks", label: "Tracks" },
  { href: "/tmnf-stats", label: "TMNF Stats" },
  { href: "/about", label: "About" },
];

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
  const closeMenu = () => { menuTimeout.current = setTimeout(() => { setIsMainMenuOpen(false) }, 100) };
  const openUser = () => { if (userTimeout.current) clearTimeout(userTimeout.current); setIsUserOpen(true) };
  const closeUser = () => { userTimeout.current = setTimeout(() => { setIsUserOpen(false) }, 100) };

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

  // if (isLoading) {
  //   return <div>Loading...</div>;
  // }

  return (
    <header
      className={`
        fixed top-0 left-0 right-0 z-50
        transition-all duration-500 ease-out
        ${
          showHeader
            ? "-translate-y-0.5 opacity-100"
            : "-translate-y-6 opacity-0 pointer-events-none"
        }
      `}
    >
      <div className="flex justify-center px-4">
        <div
          className="w-full max-w-7xl border border-slate-700 bg-slate-950/50 shadow-xl backdrop-blur-md
            bg-gradient-to-br from-violet-700/30 to-blue-800/70 rounded-b-3xl px-4 py-3
          "
        >
          {/* LEFT */}
          <div className="grid grid-cols-[auto_auto_minmax(0,1fr)_auto] items-center gap-4">

            {/* MENU */}
            <div className="relative inline-block">
              <button
                onMouseEnter={openMenu}
                onMouseLeave={closeMenu}
                className="flex h-10 w-10 flex-col items-center justify-center gap-1 rounded-lg border border-slate-500 bg-slate-700 transition hover:bg-slate-700 shadow-lg cursor-[url('/cursor.png')_0_0,_auto]"
              >
                <span className="h-0.5 w-5 rounded bg-slate-100" />
                <span className="h-0.5 w-5 rounded bg-slate-100" />
                <span className="h-0.5 w-5 rounded bg-slate-100" />
              </button>

              <div
                onMouseEnter={openMenu}
                onMouseLeave={closeMenu}
                className={`
                  absolute left-0 top-full pt-1
                  transition-all duration-200 origin-top
                  ${isMainMenuOpen
                    ? "opacity-100 translate-y-0 pointer-events-auto"
                    : "opacity-0 -translate-y-2 pointer-events-none"
                  }
                `}
              >
                <div className="rounded-lg border border-slate-500 bg-gradient-to-bl from-green-900/95 to-blue-900/90 shadow-lg p-2 flex flex-col gap-1 whitespace-nowrap">

                  {!profile?.username && (
                    <Link
                      href={`/login?next=${encodeURIComponent(pathname)}`}
                      style={{ fontFamily: "DOSVGA" }}
                      className="px-2 py-0 text-lg text-slate-200 hover:bg-yellow-700/30 rounded font-dosvga"
                    >
                      Login/Register
                    </Link>
                  )}

                  {menuLinks.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      style={{ fontFamily: "DOSVGA" }}
                      className="px-2 py-0 text-lg text-slate-200 hover:bg-yellow-700/30 rounded font-dosvga"
                    >
                      {link.label}
                    </Link>
                  ))}

                </div>
              </div>
            </div> 
            
            {/* HOME */}
            <div className="pt-1">
              <Link
                href="/"
                style={{ fontFamily: "DOSVGA" }}
                className="text-2xl text-white whitespace-nowrap font-dosvga [text-shadow:0_2px_4px_rgba(0,0,0,0.9)]"
              >
                Leaderboard
              </Link>
            </div>

          {/* CENTER */}
          <div className="hidden md:flex min-w-0 items-center justify-center px-6">
            <nav className="flex items-center gap-4 overflow-x-auto scrollbar-none">
              {gameLinks.map((game) => {
                const isActive = currentPage === game.slug;

                return (
                  <Link
                    key={game.slug}
                    href={`/${game.slug}`}
                    className={`font-medium whitespace-nowrap transition [text-shadow:0_2px_4px_rgba(0,0,0,0.9)] ${
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
          <div className="flex items-center gap-4 whitespace-nowrap">
            
            {/* USER */}
            <div ref={userRef} className="relative">
              {!isLoading && profile?.username ? (
                <>
                  <button
                    onMouseEnter={openUser}
                    onMouseLeave={closeUser}
                    className="flex items-center gap-2 rounded-full border border-slate-500 bg-slate-800/70 px-3 py-2 text-sm text-slate-200 transition hover:bg-slate-700 cursor-[url('/cursor.png')_0_0,_auto]"
                  >
                    <div 
                      className="h-6 w-6 p-0.5 rounded-full bg-sky-500/70 text-sm font-semibold text-black flex items-center justify-center border border-white/30"
                      style={{ backgroundColor: PROFILE_COLOURS[profile?.colour ?? 0]}}
                    >
                      <img
                        src={AVATARS[profile.avatar]}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <span className="hidden text-[17px] lg:block">
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
                      <Link href="/submit" className="px-3 py-2 text-sm text-slate-200 hover:bg-slate-700 rounded">
                        Submit TAS
                      </Link>

                      <Link href="/profile" className="px-3 py-2 text-sm text-slate-200 hover:bg-slate-700 rounded">
                        Profile
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
              ) : (
                <div className="h-10.5 w-30" />
              )}
            </div>

          </div>
        </div>
      </div>
      </div>
    </header>
  );
}
