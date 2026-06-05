
import { useRef, useState, useCallback, useEffect } from "react";
import { TimeState } from "./typing";

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

  useEffect(() => {
    return clear;
  }, [clear]);

  return {
    open,
    openNow,
    closeLater,
    closeNow,
  };
}

export function generateGraphColours(n: number) {
  return Array.from({ length: n }, (_, i) => {
    const hue = Math.round((360 * i) / n);
    return `hsl(${hue}, 70%, 55%)`;
  });
}
