
import Link from "next/link";
import { ProfilePublic } from "@/lib/Profiles";
import { useHoverDropdown } from "@/utils/common";
import { GAME_SLUGS, CURSOR } from "@/utils/constants";

const MENU_LINKS = [
  { href: "/", label: "Global LB" },
  { href: "/highlight", label: "Highlight" },
  { href: "/inputs", label: "Inputs" },
  { href: "/authors", label: "Authors" },
  { href: "/tracks", label: "Tracks" },
  { href: "/tmnf-stats", label: "TMNF Stats" },
  { href: "/about", label: "About" },
];

export function MainMenu({ pathname, isTouch, profilePublicMe }: { 
  pathname: string, 
  isTouch: boolean, 
  profilePublicMe?: ProfilePublic
}) {

  const menu = useHoverDropdown();
  const gamesMenu = useHoverDropdown();

  return (
    <div 
      onMouseEnter={!isTouch ? menu.openNow : undefined}
      onMouseLeave={!isTouch ? menu.closeLater : undefined}
      className="relative inline-block"
    >
      <button
        onClick={menu.toggle}
        className={`flex h-10 w-10 flex-col items-center justify-center gap-1 rounded-lg border border-slate-500 bg-slate-700 transition hover:bg-slate-700 shadow-lg ${CURSOR}`}
        aria-label="Open menu"
      >
        <span className="h-0.5 w-5 rounded bg-slate-100" />
        <span className="h-0.5 w-5 rounded bg-slate-100" />
        <span className="h-0.5 w-5 rounded bg-slate-100" />
      </button>

      <div
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

          <div
            className="relative lg:hidden"
            onMouseEnter={!isTouch ? gamesMenu.openNow : undefined}
            onMouseLeave={!isTouch ? gamesMenu.closeLater : undefined}
          >
            <div
              className="flex items-center justify-between cursor-pointer px-2 py-0 text-lg text-slate-200 hover:bg-yellow-700/30 rounded font-dosvg"
              style={{ fontFamily: "DOSVGA" }}
              onClick={gamesMenu.toggle}
            >
              <span>Games</span>
              <span className="text-slate-400">▶</span>
            </div>

            <div
              className={`absolute left-full top-0 transition-all duration-150 rounded-lg border border-slate-500 bg-gradient-to-bl from-green-900/95 to-blue-900/90 shadow-lg p-2 flex flex-col whitespace-nowrap
                ${gamesMenu.open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
            >
              <div className="flex flex-col gap-1">
                {Object.entries(GAME_SLUGS).map(([slug, game]) => (
                  <Link
                    key={slug}
                    href={`/${slug}`}
                    className="px-2 py-0 text-lg text-slate-200 hover:bg-yellow-700/30"
                    style={{ fontFamily: "DOSVGA" }}
                    onClick={() => {
                      gamesMenu.closeNow();
                      menu.closeNow();
                    }}
                  >
                    {game}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {MENU_LINKS.map((link) => (
            <Link
              key={link.href}
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
            
  )
}
