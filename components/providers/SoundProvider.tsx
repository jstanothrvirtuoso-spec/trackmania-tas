"use client";

import { useEffect } from "react";
import { soundManager } from "@/lib/SoundManager";
import { useProfilePrivate } from "@/lib/Profiles";

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const { data: profilePrivate } = useProfilePrivate();

  useEffect(() => {
    soundManager.init();
  }, []);

  useEffect(() => {
    const unlock = () => soundManager.unlock();

    window.addEventListener("pointerdown", unlock, { once: true });

    return () => window.removeEventListener("pointerdown", unlock);
  }, []);

  useEffect(() => {
    soundManager.setEnabled(profilePrivate?.allow_sounds ?? true);
  }, [profilePrivate?.allow_sounds]);

  return <>{children}</>;
}
