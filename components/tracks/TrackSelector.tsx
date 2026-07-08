
import { TRACKS } from "@/lib/TrackList";
import { useHoverDropdown, useOnClickOutside } from "@/utils/common";
import { CAMPAIGNS } from "@/utils/constants";
import { Campaign, Game, GameSet } from "@/utils/typing";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

type TrackTree = Record<Campaign, Record<GameSet, string[]>>;

export const TRACK_TREE: TrackTree = CAMPAIGNS.reduce((games, game) => {
  games[game] = {} as Record<GameSet, string[]>;

  for (const [track, info] of Object.entries(TRACKS)) {

    const campaign = ["TMNF No Cut", "TMUF No Cut"].includes(info.game) ? "No Cut" : info.game;

    if (campaign !== game) continue;

    if (!games[game][info.gameSet]) {
      games[game][info.gameSet] = [];
    }

    games[game][info.gameSet].push(track);
  }

  for (const gameSet of Object.keys(games[game])) {
    games[game][gameSet as GameSet].sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true })
    );
  }

  return games;
}, {} as TrackTree);

function splitEven<T>(items: T[], maxPerCol: number): T[][] {

  const cols = Math.ceil(items.length / maxPerCol);
  const base = Math.floor(items.length / cols);
  const extra = items.length % cols;

  const result: T[][] = [];
  let index = 0;

  for (let i = 0; i < cols; i++) {
    const size = base + (i < extra ? 1 : 0);
    result.push(items.slice(index, index + size));
    index += size;
  }

  return result;
}

interface TrackSelectorProps {
  selectedGame: Game;
  selectedTrack: string;
  updateTrack: (t: string) => void;
}

export function TrackSelector({selectedGame, selectedTrack, updateTrack}: TrackSelectorProps) {

  const ref = useRef<HTMLDivElement>(null);
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);
  const gameSetRefs = useRef<Record<GameSet, HTMLDivElement | null>>({});
  const trackRef = useRef<HTMLDivElement>(null);
  const isInTrackColumn = useRef(false);

  const [hoverPath, setHoverPath] = useState<{ game: Campaign | null; set: GameSet | null, track: string | null }>({ game: null, set: null, track: null });
  const [trackTop, setTrackTop] = useState(-1);

  const isTouch = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  const menu = useHoverDropdown();

  useOnClickOutside(ref, menu.closeNow, isTouch);
  
  useEffect(() => {
    return () => clearHoverTimeout();
  }, []);

  useLayoutEffect(() => {
    if (!hoverPath.set) return;

    const setEl = gameSetRefs.current[hoverPath.set];
    const trackEl = trackRef.current;
    if (!setEl || !trackEl) return;

    const setBottom = setEl.offsetTop + setEl.offsetHeight;
    const top = Math.max(-1, setBottom - trackEl.offsetHeight + 10);

    setTrackTop(top);
  }, [hoverPath.set]);

  function clearHoverTimeout() {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current);
      hoverTimeout.current = null;
    }
  };

  function updateHover(next: { game?: Campaign; set?: GameSet }) {
    clearHoverTimeout();

    hoverTimeout.current = setTimeout(() => {
      if (next.set && isInTrackColumn.current) return;

      setHoverPath((prev) => ({
        game: next.game ?? prev.game,
        set: next.set ?? (next.game ? null : prev.set),
        track: prev.track,
      }));
    }, 100);
  }

  function openMenu() {
    setHoverPath({ game: null, set: null, track: null });
    menu.openNow();
  }

  return (
    <div ref={ref} className="relative inline-block">

      {/* Trigger */}
      <button
        onMouseEnter={!isTouch ? openMenu : undefined}
        onMouseLeave={!isTouch ? menu.closeLater : undefined}
        onClick={menu.toggle}
        className="group flex items-center gap-3 rounded-xl border border-cyan-400/15
          bg-slate-900/80 px-4 py-2 transition hover:border-cyan-400/35
          hover:bg-slate-950/80 shadow-[0_8px_40px_rgba(0,0,0,.35)]"
      >
        <span className="pr-15">
          Select track
        </span>
        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-5 w-5 items-center justify-center">
          <svg viewBox="0 0 20 20" className="h-5 w-5 fill-current text-slate-100">
            <path d="M10 14l5-5H5l5 5z" />
          </svg>
        </span>
      </button>

      {/* Root menu */}
      <div
        onMouseEnter={!isTouch ? menu.openNow : undefined}
        onMouseLeave={!isTouch ? menu.closeLater : undefined}
        className={`
          absolute left-0 top-full mt-1 flex
          transition-all duration-150 text-xs
          ${menu.open ? "opacity-100" : "opacity-0 pointer-events-none"}
        `}
      >
        <div className="flex rounded-2xl border border-cyan-500/10 bg-gradient-to-br from-slate-900/95
          via-slate-950/95 to-[#04070c]/95 shadow-[0_20px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl p-1"
        >
          {/* GAME COLUMN */}
          <div className="min-w-[140px] py-1">
            {CAMPAIGNS.map((game) => {
              const active = hoverPath.game === game;
              const current = game === selectedGame;

              return (
                <div
                  key={game}
                  onMouseEnter={() => !isTouch && updateHover({ game: game })}
                  onClick={() => setHoverPath(prev => ({ game: prev.game === game ? null : game, set: null, track: null }))}
                  className={`
                    relative px-3 py-2 rounded-lg cursor-pointer text-xs transition-colors 
                    ${active ? "bg-cyan-500/10 text-cyan-200" : "text-cyan-100 hover:bg-cyan-500/10"}
                  `}
                >
                  {current && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-emerald-400 rounded-full opacity-70" />
                  )}
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-cyan-400 rounded-full" />
                  )}
                  {game}
                  
                  <span className={`absolute right-1 top-1/2 -translate-y-1/2 text-cyan-500 text-2xl leading-none ${active ? "opacity-100" : current ? "opacity-70 text-emerald-500" : "opacity-20"}`}>
                    ▸
                  </span>
                </div>
              );
            })}
          </div>

          {/* GAMESET COLUMN */}
          {hoverPath.game && (
            <div className="min-w-[160px] border-l border-cyan-500/10 pl-2 py-1">
              {Object.keys(TRACK_TREE[hoverPath.game] ?? {}).map((set) => {
                const active = hoverPath.set === set;
                const current = set === TRACKS[selectedTrack].gameSet && TRACKS[selectedTrack].game === hoverPath.game;

                return (
                  <div
                    key={set}
                    ref={el => { gameSetRefs.current[set as GameSet] = el }}
                    onMouseEnter={() => !isTouch && updateHover({ set: set as GameSet })}
                    onClick={() => setHoverPath((prev) => ({ game: prev.game, set: prev.set === set ? null : (set as GameSet), track: null }))}
                    className={`
                      relative px-3 py-1.5 rounded-lg cursor-pointer text-xs whitespace-nowrap
                      flex justify-between items-center transition-colors
                      ${active ? "bg-cyan-500/10 text-cyan-200" : "text-cyan-100 hover:bg-cyan-500/10"}
                    `}
                  >
                    {current && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-emerald-400 rounded-full opacity-70" />
                    )}
                    {active && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-cyan-400 rounded-full" />
                    )}

                    <span className="pr-7">{set}</span>
                    <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-cyan-500 text-2xl leading-none ${active ? "opacity-100" : current ? "opacity-70 text-emerald-500" : "opacity-20"}`}>
                      ▸
                    </span>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* TRACK COLUMN */}
        {hoverPath.game && hoverPath.set && (() => {
          const tracks = TRACK_TREE[hoverPath.game][hoverPath.set] ?? [];
          const columns = splitEven(tracks, 26);

          return (
            <div
              ref={trackRef}
              className="absolute left-full -ml-3"
              style={{ top: trackTop }}
            >
              <div className="min-w-[140px] flex rounded-2xl border border-cyan-500/15 bg-[linear-gradient(135deg,#0d1620_0%,#070d14_55%,#04070c_100%)] py-2 shadow-[0_20px_80px_rgba(0,0,0,0.6)] backdrop-blur-xl">
                {columns.map((col, i) => (
                  <div
                    key={i}
                    onMouseEnter={() => (isInTrackColumn.current = true)}
                    onMouseLeave={() => (isInTrackColumn.current = false)}
                    className={`min-w-[90px] w-full px-2 ${i !== 0 ? "border-l border-cyan-500/10" : ""}`}
                  >
                    {col.map((track) => {
                      const active = hoverPath.track === track;
                      const current = track === selectedTrack;

                      return (
                        <div
                          key={track}
                          onMouseEnter={() => (setHoverPath(prev => ({...prev, track})))}
                          onClick={() => { if (track !== selectedTrack) updateTrack(track); menu.closeNow() }}
                          className={`relative rounded-lg py-1.5 px-2 text-xs cursor-pointer whitespace-nowrap transition-colors
                            ${active ? "bg-cyan-500/10 text-cyan-200" : current ? "bg-emerald-500/10 text-emerald-100" : "text-cyan-100 hover:bg-cyan-500/10"}`}
                        >
                          {current && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-emerald-400 rounded-full opacity-70" />
                          )}
                          {active && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-cyan-400 rounded-full" />
                          )}

                          <div className="pl-1 pr-2">{track}</div>
                        </div>
                      )}
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
