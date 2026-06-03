"use client";

import { useEffect, useRef, useState } from "react";

type Drop = {
  left: number;
  delay: number;
  duration: number;
  opacity: number;
};

/**
 * Deterministic RNG (seeded)
 */
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function Rain() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const startedRef = useRef(false);

  // ✅ deterministic generator (same rain every load)
  const [drops] = useState<Drop[]>(() => {
    const rand = mulberry32(123456); // fixed seed

    return Array.from({ length: 60 }, () => ({
      left: rand() * 100,
      delay: rand() * 2,
      duration: 0.6 + rand() * 0.8,
      opacity: 0.35 + rand() * 0.6,
    }));
  });

  useEffect(() => {
    const audio = new Audio("/sounds/rainLight1.mp3");
    audio.loop = true;
    audio.volume = 0;

    audioRef.current = audio;

    const fadeInterval = window.setInterval(() => {
      const a = audioRef.current;
      if (!a) return;

      if (!startedRef.current) {
        a.play()
          .then(() => {
            startedRef.current = true;
          })
          .catch(() => {});
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
  }, []);

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




