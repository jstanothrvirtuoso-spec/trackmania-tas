
import { useRef, useState, useCallback, useEffect } from "react";
import { TimeState, Game } from "./typing";

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
