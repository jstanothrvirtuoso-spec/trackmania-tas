
import { useRef, useState, useCallback, useEffect } from "react";
import { TimeState, Game, GbxData } from "./typing";

export function timeMsToState(time_ms: number): TimeState {
  return {
    minutes: Math.floor(time_ms / 60_000),
    seconds: Math.floor((time_ms % 60_000) / 1000),
    hundredths: Math.floor((time_ms % 1000) / 10),
    thousandth: time_ms % 10,
  };
}

export function timeStateToMs(time: TimeState): number {
  return (
    time.minutes * 60_000 +
    time.seconds * 1_000 +
    time.hundredths * 10 +
    time.thousandth
  );
}

export function useHoverDropdown(delay = 100) {

  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clear = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const openNow = useCallback(() => {
    clear();
    setOpen(true);
  }, [clear]);

  const closeLater = useCallback(() => {
    clear();
    timeoutRef.current = setTimeout(() => {
      setOpen(false);
    }, delay);
  }, [clear, delay]);

  const closeNow = useCallback(() => {
    clear();
    setOpen(false);
  }, [clear]);

  const toggle = useCallback(() => {
    clear();
    setOpen((prevOpen) => !prevOpen);
  }, [clear]);

  useEffect(() => {
    return clear;
  }, [clear]);

  return {
    open,
    openNow,
    closeLater,
    closeNow,
    toggle,
  };
}

export function generateGraphColours(n: number) {
  return Array.from({ length: n }, (_, i) => {
    const hue = Math.round((360 * i) / n);
    return `hsl(${hue}, 70%, 55%)`;
  });
}

export function useOnClickOutside(
  ref: React.RefObject<HTMLElement | null>,
  handler: () => void,
  enabled = true
) {
  useEffect(() => {
    if (!enabled) return;

    function handle(event: MouseEvent | TouchEvent) {
      const el = ref.current;
      if (!el) return;

      if (!el.contains(event.target as Node)) {
        handler();
      }
    }

    document.addEventListener("mousedown", handle);
    document.addEventListener("touchstart", handle);

    return () => {
      document.removeEventListener("mousedown", handle);
      document.removeEventListener("touchstart", handle);
    };
  }, [ref, handler, enabled]);
}

export function getTmxLink(id: number, game: Game) {
  if (id === 0) return "";

  if (game === "TMNF" || game === "TMNF No Cut") {
    return `https://tmnf.exchange/trackshow/${id}`;
  }

  if (game === "TM2") {
    return `https://tm.mania.exchange/mapshow/${id}`;
  }

  if (game === "ESWC") {
    return `https://nations.tm-exchange.com/trackshow/${id}`;
  }

  return `https://tmuf.exchange/trackshow/${id}`;
}

export function getYouTubeId(input?: string | null): string | null {
  if (!input) return null;

  try {
    const url = new URL(input);

    // youtu.be/<id>
    if (url.hostname === "youtu.be") {
      return url.pathname.slice(1).split("/")[0] || null;
    }

    // youtube.com/watch?v=<id>
    const v = url.searchParams.get("v");
    if (v) return v;

    // youtube.com/embed/<id>
    // youtube.com/shorts/<id>
    // youtube.com/live/<id>
    const match = url.pathname.match(
      /^\/(embed|shorts|live)\/([^/?]+)/,
    );

    if (match) {
      return match[2];
    }

    return null;
  } catch {
    return null;
  }
}

function slugify(value: string) {
  return value
    .replace(/\//g, "")
    .replace(/[^a-zA-Z0-9.()]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getReplayURL(game: Game, track: string, time_ms: number, replay_path: string | null) {

  if (!replay_path) return null;

  const totalSeconds = Math.floor(time_ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const centiseconds = Math.floor((time_ms % 1000) / 10);
  const timeString = `${String(minutes).padStart(2, "0")}'${String(seconds).padStart(2, "0")}''${String(centiseconds).padStart(2, "0")}`;

  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/downloads/` +
      `${slugify(game)}/${slugify(track)}/${replay_path}.gbx` +
      `?download=${encodeURIComponent(`${track} TAS (${timeString}).Replay.Gbx`)}`;
}

export async function parseGbx(file: File): Promise<GbxData> {

  const buffer = await file.arrayBuffer();
  const header = new TextDecoder("utf-8").decode(buffer.slice(0, 64));

  if (!header.startsWith("GBX")) {
    return {
      uid: null,
      bestTime: null,
      version: null,
      stuntScore: null,
      validable: null,
    };
  }

  const maxScanBytes = 8192;
  const decoder = new TextDecoder("utf-8", { fatal: false });
  const sample = decoder.decode(
    buffer.byteLength <= maxScanBytes ? buffer : buffer.slice(0, maxScanBytes)
  );

  let uid = sample.match(/<challenge uid="([^"]+)"/)?.[1] ?? sample.match(/<map uid="([^"]+)"/)?.[1] ?? null;
  let bestTimeRaw = sample.match(/<times best="(\d+)"/)?.[1];
  let version = sample.match(/<header[^>]*version="([^"]+)"/)?.[1] ?? null;
  let stuntScoreRaw = sample.match(/stuntscore="(\d+)"/)?.[1];
  let validableRaw = sample.match(/validable="(\d+)"/)?.[1];

  if (
    buffer.byteLength > maxScanBytes &&
    (uid === null || bestTimeRaw === undefined || version === null || stuntScoreRaw === undefined || validableRaw === undefined)
  ) {
    const text = decoder.decode(buffer);
    uid = uid ?? text.match(/<challenge uid="([^"]+)"/)?.[1] ?? text.match(/<map uid="([^"]+)"/)?.[1] ?? null;
    bestTimeRaw = bestTimeRaw ?? text.match(/<times best="(\d+)"/)?.[1];
    version = version ?? text.match(/<header[^>]*version="([^"]+)"/)?.[1] ?? null;
    stuntScoreRaw = stuntScoreRaw ?? text.match(/stuntscore="(\d+)"/)?.[1];
    validableRaw = validableRaw ?? text.match(/validable="(\d+)"/)?.[1];
  }

  return {
    uid,
    bestTime: bestTimeRaw ? Number(bestTimeRaw) : null,
    version,
    stuntScore: stuntScoreRaw ? Number(stuntScoreRaw) : null,
    validable: validableRaw ? validableRaw === "1" : null,
  };
}
