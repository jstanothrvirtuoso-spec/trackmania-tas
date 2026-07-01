"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Environment, Game } from "@/utils/typing";
import { TRACKS } from "@/lib/TrackList";

const GAME_CONVERT: Record<string, Game> = {
  "TMNF": "TMNF",
  "TMNF No Cut": "TMNF",
  "ESWC": "ESWC",
  "TMN Remakes": "TMUF",
  "TMUF": "TMUF",
  "StarTrack": "TMUF",
  "TMS": "TMUF",
  "TMO": "TMUF",
  "Demo/Beta": "TMUF",
  "TM2": "TM2"
}

export function VideoIcon({ videoURL }: { videoURL: string | null }) {

  if (!videoURL) return null;

  const type = videoURL.includes("discord.")
    ? "discord"
    : videoURL.includes("streamable.com")
      ? "streamable"
      : "youtube";

  const src =
    type === "discord"
      ? "/links/discord.webp"
      : type === "streamable"
        ? "/links/streamable.webp"
        : "/links/youtube.webp";

  const size =
    type === "discord"
      ? "w-4.5 h-4.5"
      : type === "streamable"
        ? "w-5 h-3.5"
        : "w-4 h-4.5";

  return (
    <a
      href={videoURL}
      target="_blank"
      rel="noreferrer"
      title="Watch video"
      className={`hover:opacity-80 transition relative ${size}`}
    >
      <Image
        src={src}
        alt="Video"
        fill
        sizes="20vw"
      />
    </a>
  );
}

export function ReplayIcon({ replayURL }: { replayURL: string | null }) {

  if (!replayURL) return null;

  return (
    <a
      href={replayURL}
      target="_blank"
      rel="noreferrer"
      title="Download replay"
      className="hover:opacity-80 transition relative w-4 h-4"
    >
      <Image
        src="/links/replay.webp"
        alt="Replay"
        fill
        sizes="20vw"
      />
    </a>
  );
}

export function InputsIcon({ replayID, replayType }: { replayID: number, replayType: "tas" | "rta" }) {
  
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(`/input-loader/${replayType}/${replayID}`)}
      title="Load inputs"
      className="hover:opacity-80 transition relative w-4 h-4 cursor-pointer"
    >
      <Image
        src="/links/inputs.webp"
        alt="Inputs"
        fill
        sizes="20vw"
      />
    </button>
  );
}

export function GbxIcon({ replayURL, track }: { replayURL: string | null, track?: string }) {

  if (!replayURL) return null;

  let gbxURL = "";
  if (!track) {
    gbxURL = `https://3d.gbx.tools/view/replay?url=${replayURL}`;
  } else {
    const trackInfo = TRACKS[track]
    const game = GAME_CONVERT[trackInfo.tmx ?? trackInfo.game];
    const mapId = trackInfo.id;
    const replayId = replayURL.split("/").pop();

    if (game === "TM2") {
      gbxURL = `https://3d.gbx.tools/view/replay?mx=${game}&id=${replayId}&mapid=${mapId}`;
    } else { 
      gbxURL = `https://3d.gbx.tools/view/replay?tmx=${game}&id=${replayId}&mapid=${mapId}`;
    }
  }

  return (
    <a
      href={gbxURL}
      target="_blank"
      rel="noreferrer"
      title="Open 3D GBX tools"
      className="hover:opacity-80 transition"
    >
      <Image
        src="/links/3dgbx.webp"
        alt="3dGbx"
        width={18}
        height={18}
        loading="eager"
      />
    </a>
  );
}

export function BadgeIcon({ badge_src }: { badge_src: string }) {

  const alt = badge_src
    .replace(".png", "")
    .replace(/\b\w/g, c => c.toUpperCase())
  
  return (
    <div className="relative group flex justify-center">
      <Image
        src={`/badges/${badge_src}`}
        alt={alt}
        width={0}
        height={0}
        style={{height: 'auto', width: 'auto'}}
        sizes="100vw"
      />
    
      <div className="absolute bottom-full mb-1 hidden group-hover:block whitespace-nowrap rounded bg-black px-2 py-1 text-xs text-white shadow">
        {alt}
      </div>
    </div>
  );
};

export function EnvironmentIcon({ environment }: { environment: Environment }) {
  const key = environment
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace("²", "")

  return (
    <div className="w-6 h-6 relative">
      <Image
        src={`/environments/${key}.webp`}
        alt={environment.slice(5)}
        loading="eager"
        fill
        sizes="10vw"
        className="object-contain"
      />

      {/* <div className="absolute bottom-full mb-1 hidden group-hover:block whitespace-nowrap rounded bg-black px-2 py-1 text-xs text-white shadow">
        {environment}
      </div> */}
    </div>
  )
};
