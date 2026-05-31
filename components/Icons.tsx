
import Image from "next/image";
import { Environment } from "@/utils/typing";

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

  const size = type === "streamable" ? 18 : 16;

  return (
    <a
      href={video_url}
      target="_blank"
      rel="noreferrer"
      title="Watch video"
      className="hover:opacity-80 transition"
    >
      <Image
        src={src}
        alt="Video"
        width={size}
        height={size}
      />
    </a>
  );
}

export function ReplayIcon({ replay_url }: { replay_url: string }) {

  const type = replay_url.includes("discord.") ? "discord" : "replay";
  const src = type === "discord" ? "/links/discord.webp" : "/links/replay.webp";
  const size = type === "replay" ? 14 : 16;

  return (
    <a
      href={replay_url}
      target="_blank"
      rel="noreferrer"
      title="Download replay"
      className="hover:opacity-80 transition"
    >
      <Image
        src={src}
        alt="Replay"
        width={size}
        height={size}
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
      className="hover:opacity-80 transition"
    >
      <Image
        src="/links/pastebin.webp"
        alt="Inputs"
        width={14}
        height={14}
        style={{ width: "auto", height: "auto" }}
      />
    </a>
  );
}

export function GbxIcon({ replay_url }: { replay_url: string }) {

  const id = new URL(replay_url).searchParams.get("id");
  const gbx_url = `https://3d.gbx.tools/view/replay?gd=${id}`

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
    <div className="flex justify-center">
      <img
        src={`/medals/${badge_src}`}
        alt={alt}
        className="h-6 w-auto object-contain"
      />
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

