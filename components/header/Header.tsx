"use client";

import Link from "next/link";
import Image from "next/image";
import { FaDiscord } from "react-icons/fa";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useProfilePublicMe } from "@/lib/Profiles";
import { GAME_SLUGS } from "@/utils/constants"
import { UserMenu } from "./UserMenu";
import { MainMenu } from "./MainMenu";

export default function Header() {

  const pathname = usePathname();
  const currentPage = pathname === "/" ? "/" : pathname.split("/")[1];
  const { data: profilePublicMe, isLoading } = useProfilePublicMe();

  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);
  const isTouch = typeof window !== "undefined" && window.matchMedia("(hover: none)").matches;
  const isResetPassword = pathname === "/reset-password";

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

  if (isResetPassword) {
    return (
      null
    )
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out
        ${showHeader ? "-translate-y-0.5 opacity-100" : "-translate-y-6 opacity-0 pointer-events-none"}`}
    >
      <div className="mx-auto w-full max-w-[76rem] px-2">
        <div className="grid grid-cols-[auto_auto_minmax(0,1fr)_auto] items-center
          border border-slate-700 bg-slate-950/50 bg-gradient-to-br from-violet-700/30 to-blue-800/70
          shadow-xl backdrop-blur-md rounded-b-3xl px-4 py-3"
        >
          {/* MAIN MENU */}
          <MainMenu 
            pathname={pathname}
            isTouch={isTouch}
            profilePublicMe={profilePublicMe}
          />

          {/* HOME */}
          <div className="px-3 block sm:hidden">
            <Link
              href="/"
              className="block border border-white-100 rounded-lg transition-all duration-100 hover:brightness-110 hover:border-cyan-500"
            >
              <div className="relative h-9 w-[36px]">
                <Image
                  src="/header.webp"
                  alt="TAS-Nadeo"
                  fill
                  sizes="50vw"
                  loading="eager"
                  className="object-contain rounded-md drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]"
                />
              </div>
            </Link>
          </div>
          <div className="mt-[2px] px-3 hidden sm:block w-30">
            <span className="inline-flex overflow-hidden px-1 rounded-xl">
              <Link
                href="/"
                className="
                  font-vga text-2xl text-white whitespace-nowrap transition-transform duration-200 ease-out 
                  [text-shadow:0_2px_4px_rgba(0,0,0,0.9)] 
                  hover:tracking-[0.02em] hover:scale-[1.04] hover:text-transparent 
                  hover:bg-gradient-to-r hover:from-cyan-300 hover:via-blue-200 hover:to-violet-300 
                  hover:bg-clip-text hover:[text-shadow:0_0_20px_rgba(56,189,248,0.7)]
                "
              >
                TAS-Nadeo
              </Link>
            </span>
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
                    {game === "TM2" ? "TM²" : game}
                  </Link>
                );
              })}
            </nav>
          </div>
        
          {/* RIGHT */}
          <div className="flex justify-end items-center gap-2 whitespace-nowrap">
            
            {/* USER MENU */}
            {!isLoading && (
              <div>
                {profilePublicMe?.display_name ? (
                  <UserMenu 
                    isTouch={isTouch}
                    profilePublicMe={profilePublicMe}
                  />
                ) : (
                  <Link
                    href="/login"
                    className={`
                      flex items-center gap-3 rounded-full border border-cyan-400/20 cursor-pointer
                      bg-slate-800/90 px-3 py-0.5 text-sm text-cyan-100 shadow-[0_0_30px_rgba(34,211,238,0.18)] 
                      transition duration-200 hover:border-cyan-300/50 hover:bg-slate-900/95
                    `}
                    aria-label="Login"
                  >
                    <div className="h-6 w-6 rounded-full text-black flex items-center justify-center border border-cyan-400/20 shadow-[0_0_16px_rgba(34,211,238,0.24)] bg-slate-700">
                      <span className="text-[12px] font-semibold text-cyan-100">↪</span>
                    </div>

                    <div className="flex flex-col items-start leading-tight py-2">
                      <span className="text-[15px] font-semibold text-slate-100">Login</span>
                    </div>
                  </Link>
                )}
              </div>
            )}

            {/* DISCORD */}
            <a
              href="https://discord.gg/tD4rarRYpj"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#5865F2] text-white transition-transform hover:scale-105 border border-slate-400"
              aria-label="Discord"
            >
              <FaDiscord size={22} />
            </a>
            
            <Link
              href="https://tmtas.exchange/"
              className="block border border-slate-500/80 rounded-lg transition-all duration-100 hover:brightness-110 hover:border-cyan-500 hover:scale-105"
            >
              <div className="relative h-8 w-[32px]">
                <Image
                  src="/icons/tm-tas.png"
                  alt="TM-TAS.exchange"
                  fill
                  sizes="50vw"
                  loading="eager"
                  className="object-contain rounded-md drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]"
                />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
