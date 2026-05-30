"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Drop = {
  left: number;
  delay: number;
  duration: number;
  opacity: number;
};

export default function Rain() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const startedRef = useRef(false);

  // ✅ prevent SSR/client mismatch (important in Next.js)
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ✅ Generate ONCE after mount (fully safe for hydration)
  const drops = useMemo<Drop[]>(() => {
    if (!mounted) return [];

    return Array.from({ length: 60 }).map(() => ({
      left: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 0.6 + Math.random() * 0.8,
      opacity: 0.15 + Math.random() * 0.3,
    }));
  }, [mounted]);

  // ---------------------------
  // AUDIO (fixed autoplay + cleanup)
  // ---------------------------
  useEffect(() => {
    if (!mounted) return;

    const audio = new Audio("/sounds/rainLight1.mp3");
    audio.loop = true;
    audio.volume = 0;

    audioRef.current = audio;

    const fadeInterval = window.setInterval(() => {
      const a = audioRef.current;
      if (!a) return;

      if (!startedRef.current) {
        a.play().then(() => {
          startedRef.current = true;
        }).catch(() => {
          // ignored (browser autoplay rules)
        });
      }

      if (startedRef.current && a.volume < 0.4) {
        a.volume = Math.min(a.volume + 0.02, 0.4);
      }
    }, 100);

    return () => {
      clearInterval(fadeInterval);
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, [mounted]);

  // ---------------------------
  // prevent hydration render mismatch
  // ---------------------------
  if (!mounted) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {drops.map((d, i) => (
        <span
          key={i}
          className="rain-drop"
          style={{
            left: `${d.left}%`,
            animationDelay: `${d.delay}s`,
            animationDuration: `${d.duration}s`,
            opacity: d.opacity,
          }}
        />
      ))}

      <style jsx>{`
        .rain-drop {
          position: absolute;
          top: -20px;
          width: 1px;
          height: 20px;
          background: rgba(180, 220, 255, 0.5);
          animation: rainFall linear infinite;
        }

        @keyframes rainFall {
          from {
            transform: translateY(-20px);
          }
          to {
            transform: translateY(110vh);
          }
        }
      `}</style>
    </div>
  );
}