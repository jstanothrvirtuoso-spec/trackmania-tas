
import Image from "next/image";
import { Environment } from "@/utils/typing";
import { trackList } from "@/lib/TrackList";

const GAME_CONVERT: Record<string, string> = {
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

export function VideoIcon({ video_url }: { video_url: string }) {
  const type = video_url.includes("discord.")
    ? "discord"
    : video_url.includes("streamable.com")
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
      href={video_url}
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

export function ReplayIcon({ replay_url }: { replay_url: string }) {

  const type = replay_url.includes("discord.") ? "discord" : "replay";
  const src = type === "discord" ? "/links/discord.webp" : "/links/replay.webp";
  const size = type === "replay" ? "w-4 h-4" : "w-3.5 h-3.5";

  return (
    <a
      href={replay_url}
      target="_blank"
      rel="noreferrer"
      title="Download replay"
      className={`hover:opacity-80 transition relative ${size}`}
    >
      <Image
        src={src}
        alt="Replay"
        fill
        sizes="20vw"
      />
    </a>
  );
}

export function InputsIcon({ inputs_url }: { inputs_url: string }) {

  return (
    <a
      href={inputs_url}
      target="_blank"
      rel="noreferrer"
      title="Show inputs"
      className="hover:opacity-80 transition relative w-4 h-4"
    >
      <Image
        src="/links/pastebin.webp"
        alt="Inputs"
        fill
        sizes="20vw"
      />
    </a>
  );
}

export function GbxIcon({ replay_url, track }: { replay_url: string, track: string }) {

  const id = new URL(replay_url).searchParams.get("id");

  let gbx_url = "";
  if (id) {
    gbx_url = `https://3d.gbx.tools/view/replay?gd=${id}`;
  } else {
    const trackInfo = trackList[track]
    const game = GAME_CONVERT[trackInfo.tmx ?? trackInfo.game];
    const mapId = trackInfo.id;
    const replayId = replay_url.split("/").pop();

    if (game === "TM2") {
      gbx_url = `https://3d.gbx.tools/view/replay?mx=${game}&id=${replayId}&mapid=${mapId}`;
    } else { 
      gbx_url = `https://3d.gbx.tools/view/replay?tmx=${game}&id=${replayId}&mapid=${mapId}`;
    }
  }

  return (
    <a
      href={gbx_url}
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
        fill
        sizes="10vw"
        className="object-contain"
      />
    </div>
  )
};

