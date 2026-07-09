"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { soundManager } from "@/lib/SoundManager";
import { Copy, Download, Loader2 } from "lucide-react";
import { getReplayURL } from "@/utils/common";
import { formatTime } from "@/utils/formatting";
import { createClient } from "@/utils/supabase/client";
import { Category, Game } from "@/utils/typing";
import { TRACKS } from "@/lib/TrackList";

type LoadState = "fetching" | "downloading" | "generating" | "done" | "error" | "timeout"
type RecordData = {
  "Game": Game,
  "Track": string,
  "Time": number,
  "Authors": string,
  "Category": Category,
}

const supabase = createClient();

function formatAuthors(authors: string[]) {
  if (authors.length < 3) {
    return `by ${authors.join(" and ")}`
  }
  return `by ${authors.slice(0, authors.length - 1).join(", ")}, and ${authors[authors.length - 1]}`
}

export default function InputsModal() {

  const { type, id } = useParams<{ type: string; id: string }>();
  const router = useRouter();

  const [status, setStatus] = useState<LoadState>("fetching");
  const [inputs, setInputs] = useState("");
  const [copied, setCopied] = useState<boolean>(false);
  const [record, setRecord] = useState<RecordData | null>(null);
  const [mounted, setMounted] = useState(false);

  async function handleCopy() {
    soundManager.play("click");
    navigator.clipboard.writeText(inputs);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  function handleDownload() {

    if (!record) return;

    soundManager.play("click");
    const blob = new Blob([inputs], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const fileName = `${record["Track"]}-${record["Time"]}${type === "rta" ? "-RTA" : ""}.txt`
      .replace(/[()]/g, "")
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9._-]/g, "")
      .replace(/-+/g, "-");

    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();

    URL.revokeObjectURL(url);
  }

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);
  
  useEffect(() => {
    let cancelled = false;

    async function run() {
      setStatus("fetching");
      setRecord(null);
      setInputs("");

      const { data, error } = await supabase
        .from(type === "tas" ? "tas_with_authors" : "rta_records")
        .select("*")
        .eq("id", Number(id))
        .single();

      if (cancelled) return;

      if (error || !data) {
        setStatus("error");
        return;
      }

      setRecord({
        "Game": data.game,
        "Track": data.track,
        "Time": data.time_ms,
        "Authors": type === "tas" ? formatAuthors(data.authors) : `by ${data.player} [RTA]`,
        "Category": data.category,
      });

      const replayURL =
        type === "tas"
          ? getReplayURL(data.game, data.track, data.time_ms, data.replay_path)
          : data.replay;

      if (!replayURL) {
        setStatus("error");
        return;
      }

      try {
        setStatus("downloading");

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 7000);
        const res = await fetch(
          `/api/download-replay?url=${encodeURIComponent(replayURL)}`,
          { signal: controller.signal }
        );
        clearTimeout(timeout);

        if (!res.ok) throw new Error();
        if (cancelled) return;

        setStatus("generating");
        const bytes = new Uint8Array(await res.arrayBuffer());
        const result = window.extractInputsFromBytes(bytes, {
          decimal: true,
          relative: false,
          separate: true,
        }) as string;

        if (cancelled) return;

        setInputs(result);
        setStatus("done");
      } catch (err: unknown) {
        if (cancelled) return;

        const isAbort = err instanceof DOMException && err.name === "AbortError";

        setStatus(isAbort ? "timeout" : "error");
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [id, type]);

  const preciseTime = record ? record["Game"] === "TM2" || TRACKS[record["Track"]].preciseTime : false;
  const displayTrack = record ? record["Category"] === "No Cut" && TRACKS[record["Track"]].noCutTrack ? TRACKS[record["Track"]].noCutTrack : record["Track"] : "-";

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm py-10 px-2
        transition-all duration-300
        ${mounted ? "bg-black/60 opacity-100" : "bg-black/0 opacity-0"}
      `}
      onClick={() => router.back()}
    >
      <div
        className={`relative flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-2xl shadow-black/60
          transition-all duration-300 ease-out
          ${mounted ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-55 translate-y-15"}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title bar */}
        <div className="flex items-start justify-between gap-2 border-b border-zinc-700 p-4 sm:p-6 bg-gradient-to-b from-zinc-900 to-zinc-950">

          {/* TAS info */}
          <div className="flex flex-col items-start mt-1">
            <div className="font-vga tracking-[0.1em] font-semibold text-slate-200 text-xl sm:text-2xl">
              {displayTrack}
            </div>

            <div className="font-mono font-semibold text-sky-400 whitespace-nowrap text-lg sm:text-xl">
              {record ? `${formatTime(record["Time"], preciseTime)}${TRACKS[record["Track"]].gameSet === "Stunt" ? " pts" : ""}` : "-"}
            </div>
            
            <div className="font-xs sm:font-sm text-slate-200">
              {record ? record["Authors"] : "-"}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col justify-end gap-3 mt-1">
            <button
              disabled={status !== "done"}
              onClick={handleCopy}
              className="flex-1 relative flex items-center justify-center gap-2 rounded-lg bg-zinc-800 px-3 py-2 text-sm cursor-pointer 
                hover:-translate-y-[1px] active:translate-y-[2px] active:scale-[0.97] hover:scale-105 hover:bg-zinc-700 disabled:opacity-40 
                active:brightness-90 transition-all"
            >
              <Copy size={20} />

              <div className="relative w-full">
                <span
                  className={`absolute inset-0 flex items-center justify-start transition-all duration-200 ${
                    copied ? "opacity-0 scale-95" : "opacity-100 scale-100"
                  }`}
                >
                  Copy
                </span>

                <span
                  className={`absolute inset-0 flex items-center justify-start transition-all duration-200 ${
                    copied ? "opacity-100 scale-100" : "opacity-0 scale-105"
                  }`}
                >
                  Copied!
                </span>
              </div>
            </button>

            <button
              disabled={status !== "done"}
              onClick={() => handleDownload()}
              className="flex items-center gap-2 rounded-lg bg-zinc-800 px-3 py-2 text-sm transition-all duration-150
                hover:bg-zinc-700 hover:-translate-y-[1px] active:translate-y-[2px] active:scale-[0.97] hover:scale-105
                active:brightness-90 disabled:opacity-40 cursor-pointer"
            >
              <Download size={16} />
              Download
            </button>
          </div>
        </div>
      
        {/* Inputs */}
        <div className="h-[60vh] bg-gradient-to-l from-cyan-900/30 to-slate-950/90">
          {status === "done" ? (
            <div className="h-full overflow-y-auto p-4 sm:px-6">
              <pre className="whitespace-pre font-mono text-sm leading-relaxed cursor-text">
                {inputs}
              </pre>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-zinc-400">
              {status === "error" || status === "timeout" ? (
                <>
                  <p className="text-base text-red-400 font-medium max-w-70 justify-center text-center">
                    {status === "timeout"
                      ? "The download took an unexpectedly long time. Please try again later..."
                      : "Sorry, either their was an expected error, or the replay does not exist..."}
                  </p>
                </>
              ) : (
                <>
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <p className="text-sm">
                    {status === "downloading"
                      ? "Downloading replay..."
                      : status === "fetching"
                        ? "Fetching replay data..."
                        : "Extracting inputs..."}
                  </p>
                </>
              )}
            </div>
          )}
        </div>
        
        {/* Glow */}
        <div className="pointer-events-none absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.15),transparent_60%)]" />
      </div>
    </div>
  );
}
