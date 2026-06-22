"use client";

import { soundManager } from "@/lib/SoundManager";
import { useEffect, useState } from "react";

type Drop = {
  left: number;
  delay: number;
  duration: number;
  opacity: number;
};

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function Rain() {

  const [drops] = useState<Drop[]>(() => {
    const rand = mulberry32(123456);

    return Array.from({ length: 60 }, () => ({
      left: rand() * 100,
      delay: rand() * 2,
      duration: 0.6 + rand() * 0.8,
      opacity: 0.35 + rand() * 0.6,
    }));
  });

  useEffect(() => {

    soundManager.setVolume("rain", 0)
    soundManager.play("rain")
    const targetRain = 0.4;

    let volumeRain = 0;
    const interval = window.setInterval(() => {
      volumeRain = Math.min(volumeRain + targetRain / 20, targetRain);
      soundManager.setVolume("rain", volumeRain);
    }, 100);

    return () => {
      clearInterval(interval);
      soundManager.pause("rain");
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
