"use client";

import { useMemo, useState } from "react";
import { authorList, Author } from "@/lib/AuthorList";
import { categories, Category, trackList } from "@/lib/TrackList";
import { trackIds } from "@/lib/TrackId"

type FormState = {
  authors: Author[];
  category: Category;
  video: string;
  date: string;
};

type TimeState = {
  minutes: number;
  seconds: number;
  hundredths: number;
  thousandth: number;
};

export default function SubmitPage() {
  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState<FormState>({
    authors: ["Unknown"],
    category: "Open",
    video: "",
    date: today,
  });

  const [time, setTime] = useState<TimeState>({
    minutes: 0,
    seconds: 0,
    hundredths: 0,
    thousandth: 0,
  });

  const [preview, setPreview] = useState<{
    uid: string | null;
    bestTime: number | null;
  }>({ uid: null, bestTime: null });

  const [replayFile, setReplayFile] = useState<File | null>(null);

  const authorOptions = useMemo(() => {
    const sorted = [...authorList];
    return sorted;
  }, []);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateAuthor(index: number, value: Author) {
    setForm((prev) => {
      const next = [...prev.authors];
      next[index] = value;
      return { ...prev, authors: next };
    });
  }

  function addAuthor() {
    setForm((prev) => ({
      ...prev,
      authors: [...prev.authors, "Unknown"],
    }));
  }

  function removeAuthor(index: number) {
    setForm((prev) => ({
      ...prev,
      authors: prev.authors.filter((_, i) => i !== index),
    }));
  }

  function setTimeFromMs(ms: number) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const hundredths = Math.floor((ms % 1000) / 10);
    const thousandth = Math.floor((ms % 10));

    setTime({
      minutes,
      seconds,
      hundredths,
      thousandth,
    });
  }

  const inputClass = "w-full rounded-md bg-slate-800 px-3 py-2 text-slate-100";
  const labelClass = "text-sm text-slate-300";

  async function parseGBX(file: File) {

    const buffer = await file.arrayBuffer();
    const text = new TextDecoder("utf-8", { fatal: false }).decode(buffer);
    const uid = text.match(/<challenge uid="([^"]+)"/)?.[1] ?? null;
    const bestTimeRaw = text.match(/<times best="(\d+)"/)?.[1];

    return {
      uid,
      bestTime: bestTimeRaw ? Number(bestTimeRaw) : null,
    };
  }

  async function onFileSelect(file?: File) {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".gbx")) {
      alert("Only .gbx files allowed");
      return;
    }

    setReplayFile(file);

    const parsed = await parseGBX(file);
    setPreview(parsed);

    if (!parsed.uid) return;

    const track = trackIds[parsed.uid];
    if (!track) return;

    const game = trackList[track]?.game;

    setForm((prev) => ({
      ...prev,
      track,
      game,
    }));

    if (parsed.bestTime) {
      setTimeFromMs(parsed.bestTime);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 text-slate-100 space-y-4">

      <h1 className="text-xl font-bold">Submit TAS</h1>

      {/* REPLAY */}
      <div>
        <div className={labelClass}>Replay (.gbx)</div>
        <input
          type="file"
          accept=".gbx"
          onChange={(e) => onFileSelect(e.target.files?.[0])}
          className={inputClass}
        />
        {replayFile && (
          <div className="text-xs text-slate-400 mt-1">
            {replayFile.name}
          </div>
        )}
      </div>

      {preview.uid && (
        <div className="text-xs text-slate-400 space-y-1">
          <div>Track UID: {preview.uid}</div>
          <div>
            Parsed Time: {preview.bestTime ? `${preview.bestTime} ms` : "N/A"}
          </div>
        </div>
      )}

      {/* CATEGORY */}
      <div>
        <div className={labelClass}>Category</div>
        <select
          value={form.category}
          onChange={(e) => update("category", e.target.value as Category)}
          className={inputClass}
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* AUTHORS */}
      <div>
        <div className="flex items-center justify-between">
          <div className={labelClass}>Author(s)</div>
        </div>

        <div className="space-y-1">
          {form.authors.map((author, index) => (
            <div key={index} className="flex gap-2">
              <select
                value={author}
                onChange={(e) =>
                  updateAuthor(index, e.target.value as Author)
                }
                className={`${inputClass} flex-1`}
              >
                {authorOptions.map((a, i) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>

              {index === 0 ? (
                <button
                  type="button"
                  onClick={addAuthor}
                  disabled={form.authors.length >= 20}
                  className="rounded bg-emerald-600 w-10 hover:bg-emerald-500 disabled:opacity-40"
                >
                  +
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => removeAuthor(index)}
                  className="rounded bg-red-600 w-10 hover:bg-red-500"
                >
                  -
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* VIDEO */}
      <div>
        <div className={labelClass}>Video</div>
        <input
          value={form.video}
          onChange={(e) => update("video", e.target.value)}
          className={inputClass}
          placeholder="https://..."
        />
      </div>

      {/* DATE */}
      <div>
        <div className={labelClass}>Date</div>
        <input
          type="date"
          value={form.date}
          onChange={(e) => update("date", e.target.value)}
          className={inputClass}
        />
      </div>

      {/* SUBMIT */}
      <button className="w-full rounded-md bg-slate-700 py-2 hover:bg-slate-600">
        Submit
      </button>
    </div>
  );
}