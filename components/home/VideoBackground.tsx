"use client";

import { useEffect, useRef } from "react";

export default function VideoBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;

      if (containerRef.current) {
        containerRef.current.style.transform = `translate(${x * 15}px, ${y * 15}px) scale(1.03)`;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 -z-10 w-full h-full overflow-hidden">
      <div
        ref={containerRef}
        className="w-full h-full transition-transform duration-300 ease-out"
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/videos/wallpaper.mp4" type="video/mp4" />
        </video>
      </div>
    </div>
  );
}