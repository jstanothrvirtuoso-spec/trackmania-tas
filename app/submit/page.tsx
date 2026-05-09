"use client";

import { useMemo, useState } from "react";
import { gameLinks, trackList } from "@/lib/TrackLists";

export default function SubmitPage() {
  const [game, setGame] = useState("");
  const [track, setTrack] = useState("");

  const [record, setRecord] = useState("");
  const [video, setVideo] = useState("");
  const [replay, setReplay] = useState("");
  const [inputs, setInputs] = useState("");
  const [authors, setAuthors] = useState("");

  const gameOptions = gameLinks.map((g) => g.name);
  const [replayFile, setReplayFile] = useState<File | null>(null);

  const trackOptions = useMemo(() => {
    if (!game) return [];

    return Object.entries(trackList)
      .filter(([, t]) => t.game === game)
      .map(([name]) => name);
  }, [game]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 text-slate-100">
      <h1 className="text-xl font-bold mb-6">Submit TAS</h1>

      <form className="flex flex-col gap-4">
        {/* GAME */}
        <select
          value={game}
          onChange={(e) => {
            setGame(e.target.value);
            setTrack("");
          }}
          className="rounded-md bg-slate-800 px-3 py-2"
        >
          <option value="">Select game</option>
          {gameOptions.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>

        {/* TRACK */}
        <select
          value={track}
          disabled={!game}
          onChange={(e) => setTrack(e.target.value)}
          className={`rounded-md px-3 py-2 bg-slate-800 ${
            !game ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <option value="">Select track</option>
          {trackOptions.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        {/* RECORD */}
        <input
          placeholder="Record (0:34.41)"
          value={record}
          onChange={(e) => setRecord(e.target.value)}
          className="rounded-md bg-slate-800 px-3 py-2"
        />

        {/* VIDEO */}
        <input
          placeholder="Video URL"
          value={video}
          onChange={(e) => setVideo(e.target.value)}
          className="rounded-md bg-slate-800 px-3 py-2"
        />

        {/* REPLAY */}
        <input
          type="file"
          accept=".gbx"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            const isGbx = file.name.toLowerCase().endsWith(".gbx");

            if (!isGbx) {
              alert("Only .gbx files are allowed");
              e.target.value = "";
              return;
            }

            setReplayFile(file);
          }}
          className="rounded-md bg-slate-800 px-3 py-2 text-sm"
        />

        {replayFile && (
          <p className="text-xs text-slate-400">
            Selected: {replayFile.name}
          </p>
        )}

        {/* INPUTS */}
        <input
          placeholder="Inputs URL"
          value={inputs}
          onChange={(e) => setInputs(e.target.value)}
          className="rounded-md bg-slate-800 px-3 py-2"
        />

        {/* AUTHORS */}
        <input
          placeholder="Authors (comma separated)"
          value={authors}
          onChange={(e) => setAuthors(e.target.value)}
          className="rounded-md bg-slate-800 px-3 py-2"
        />

        <button
          type="submit"
          className="rounded-md bg-slate-700 px-4 py-2 hover:bg-slate-600 transition"
        >
          Submit
        </button>
      </form>
    </div>
  );
}