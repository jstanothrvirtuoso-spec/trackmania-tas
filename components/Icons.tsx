
import Image from "next/image";
import { Game, TasEntry } from "@/utils/typing";
import { Environment } from "@/utils/typing";
// import { TRACKS } from "@/lib/TrackList";
// import { getReplayInputs } from "@/utils/common";

// const GAME_CONVERT: Record<string, Game> = {
//   "TMNF": "TMNF",
//   "TMNF No Cut": "TMNF",
//   "ESWC": "ESWC",
//   "TMN Remakes": "TMUF",
//   "TMUF": "TMUF",
//   "StarTrack": "TMUF",
//   "TMS": "TMUF",
//   "TMO": "TMUF",
//   "Demo/Beta": "TMUF",
//   "TM2": "TM2"
// }

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

export function RtaReplayIcon({ replay_url }: { replay_url: string }) {

  if (!replay_url) return null;

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

function slugify(value: string) {
  return value
    .replace(/\//g, "")
    .replace(/[^a-zA-Z0-9.()]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatDownloadTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const centiseconds = Math.floor((ms % 1000) / 10);

  return `${String(minutes).padStart(2, "0")}'${String(seconds).padStart(2, "0")}''${String(centiseconds).padStart(2, "0")}`;
}

export function ReplayIcon({ game, track, time_ms, replay_path }: { game: Game, track: string, time_ms: number, replay_path: string }) {

  const replayUrl = replay_path
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/downloads/` +
      `${slugify(game)}/${slugify(track)}/${replay_path}.gbx` +
      `?download=${encodeURIComponent(
        `${track} TAS (${formatDownloadTime(time_ms)}).Replay.Gbx`
      )}`
    : null;

  if (!replayUrl) return null;

  return (
    <a
      href={replayUrl}
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

// export function InputsIcon({ game, track, time_ms, replay_path }: { game: Game, track: string, time_ms: number, replay_path: string }) {
//   async function handleClick() {
//     try {
//       const inputs = await getReplayInputs(replayUrl);
//       console.log(inputs);

//       // do whatever you want here:
//       // open modal, set state, etc.
//     } catch (e) {
//       console.error("Failed to load inputs", e);
//     }
//   }

//   if (!replay_path) return null;

//   const replayUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/downloads/` +
//       `${slugify(game)}/${slugify(track)}/${replay_path}.gbx` +
//       `?download=${encodeURIComponent(
//         `${track} TAS (${formatDownloadTime(time_ms)}).Replay.Gbx`
//       )}`;

//   return (
//     <button
//       onClick={handleClick}
//       title="Show inputs"
//       className="hover:opacity-80 transition relative w-4 h-4 cursor-pointer"
//     >
//       <Image
//         src="/links/pastebin.webp"
//         alt="Inputs"
//         fill
//         sizes="20vw"
//       />
//     </button>
//   );
// }

// export function GbxIcon({ replay_path, track }: { replay_path: string, track: string }) {

//   if (!replay_path) return null;

//   const replayUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/downloads/` +
//       `${slugify(game)}/${slugify(track)}/${replay_path}.gbx` +
//       `?download=${encodeURIComponent(
//         `${track} TAS (${formatDownloadTime(time_ms)}).Replay.Gbx`
//       )}`;

//   const id = new URL(replay_url).searchParams.get("id");

//   let gbx_url = "";
//   if (id) {
//     gbx_url = `https://3d.gbx.tools/view/replay?gd=${id}`;
//   } else {
//     const trackInfo = TRACKS[track]
//     const game = GAME_CONVERT[trackInfo.tmx ?? trackInfo.game];
//     const mapId = trackInfo.id;
//     const replayId = replay_url.split("/").pop();

//     if (game === "TM2") {
//       gbx_url = `https://3d.gbx.tools/view/replay?mx=${game}&id=${replayId}&mapid=${mapId}`;
//     } else { 
//       gbx_url = `https://3d.gbx.tools/view/replay?tmx=${game}&id=${replayId}&mapid=${mapId}`;
//     }
//   }

//   return (
//     <a
//       href={gbx_url}
//       target="_blank"
//       rel="noreferrer"
//       title="Open 3D GBX tools"
//       className="hover:opacity-80 transition"
//     >
//       <Image
//         src="/links/3dgbx.webp"
//         alt="3dGbx"
//         width={18}
//         height={18}
//       />
//     </a>
//   );
// }

export function GbxIcon({ tas }: { tas: TasEntry }) {

  if (!tas.replay_path) return null;

  const replayUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/downloads/` +
      `${slugify(tas.game)}/${slugify(tas.track)}/${tas.replay_path}.gbx` +
      `?download=${encodeURIComponent(
        `${tas.track} TAS (${formatDownloadTime(tas.time_ms)}).Replay.Gbx`
      )}`;

  const gbxUrl = `https://3d.gbx.tools/view/replay?url=${replayUrl}`;

  // const id = new URL(replay_url).searchParams.get("id");

  // let gbx_url = "";
  // if (id) {
  //   gbx_url = `https://3d.gbx.tools/view/replay?gd=${id}`;
  // } else {
  //   const trackInfo = TRACKS[track]
  //   const game = GAME_CONVERT[trackInfo.tmx ?? trackInfo.game];
  //   const mapId = trackInfo.id;
  //   const replayId = replay_url.split("/").pop();

  //   if (game === "TM2") {
  //     gbx_url = `https://3d.gbx.tools/view/replay?mx=${game}&id=${replayId}&mapid=${mapId}`;
  //   } else { 
  //     gbx_url = `https://3d.gbx.tools/view/replay?tmx=${game}&id=${replayId}&mapid=${mapId}`;
  //   }
  // }

  return (
    <a
      href={gbxUrl}
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

      {/* <div className="absolute bottom-full mb-1 hidden group-hover:block whitespace-nowrap rounded bg-black px-2 py-1 text-xs text-white shadow">
        {environment}
      </div> */}
    </div>
  )
};

