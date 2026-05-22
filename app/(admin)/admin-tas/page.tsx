"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { formatTime, formatDate } from "@/utils/formatting";
import { Author, authorList } from "@/lib/AuthorList";
import { useTasRecords } from "@/lib/TasRecords";
import { Game, gameList, getGameTracks, Category, categories, TasEntry, trackList } from "@/lib/TrackList";

type FormState = {
  game: Game;
  track: string;
  category: Category;
  time_ms: number;
  authors: Author[];
  date: string;
  video: string;
  replay: string;
  inputs: string;
};

type TimeState = {
  minutes: number;
  seconds: number;
  hundredths: number;
  thousandth: number;
};

export default function AdminPanel() {

  const supabase = createClient();
  const [warning, setWarning] = useState("");
  const [loading, setLoading] = useState(false);
  const [isStunt, setStunt] = useState(false);
  const today = new Date().toISOString().split("T")[0];
  const inputClass = "w-full rounded-md bg-slate-800 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-slate-500";
  const labelClass = "text-sm text-slate-300 mb-1";
  const { data: tasRecords = [] } = useTasRecords();
  
  const [form, setForm] = useState<FormState>({
    game: "TMNF",
    track: "",
    category: "Open",
    time_ms: 0,
    authors: ["Kimura"],
    date: today,
    video: "",
    replay: "",
    inputs: "",
  });

  const [time, setTime] = useState<TimeState>({
    minutes: 0,
    seconds: 0,
    hundredths: 0,
    thousandth: 0,
  });

  function update<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function addAuthor() {
    if (form.authors.length >= 20) return;
    update("authors", [...form.authors, "Unknown"]);
  }

  function removeAuthor(index: number) {
    if (form.authors.length <= 1) return;
    update(
      "authors",
      form.authors.filter((_, i) => i !== index)
    );
  }

  function resetForm() {
    setForm({
      game: form.game,
      track: form.track,
      category: "Open",
      time_ms: 0,
      authors: ["Kimura"],
      date: today,
      video: "",
      replay: "",
      inputs: "",
    });

    setTime({
      minutes: 0,
      seconds: 0,
      hundredths: 0,
      thousandth: 0,
    });

    setWarning("");
  }

  function copyTasToForm(t: TasEntry) {

    const minutes = Math.floor(t.time_ms / 60_000);
    const seconds = Math.floor((t.time_ms % 60_000) / 1000);
    const hundredths = Math.floor((t.time_ms % 1000) / 10);
    const thousandth = t.time_ms % 10;

    setForm({
      game: t.game,
      track: t.track,
      category: t.category,
      time_ms: t.time_ms,
      authors: t.authors,
      date: t.date.slice(0, 10),
      video: t.video ?? "",
      replay: t.replay ?? "",
      inputs: t.inputs ?? "",
    });

    setTime({
      minutes,
      seconds,
      hundredths,
      thousandth,
    });
  }

  function updateAuthor(index: number, value: Author) {
    const next = [...form.authors];
    next[index] = value;
    const unique = [...new Set(next)];
    update("authors", unique as Author[]);
  }

  const authorOptions = useMemo(() => {
    const [,, ...rest] = authorList;
    const priority = rest.slice(0, 25);
    const remaining = rest.slice(25);
    return [
      "Unknown",
      ...priority.sort((a, b) => a.localeCompare(b)),
      "",
      ...remaining.sort((a, b) => a.localeCompare(b)),
    ];
  }, []);

  const trackOptions = useMemo(() => {
    return getGameTracks(form.game);
  }, [form.game]);

  const timeMs = useMemo(() => {
    const time_ms = time.minutes * 60_000 + time.seconds * 1_000 + time.hundredths * 10 + time.thousandth
    update("time_ms", time_ms)
    return time_ms;
  }, [time]);

  const trackTases = useMemo(() => {
    if (!form.track) return [];
    setStunt(trackList[form.track].category === "Stunt")
    return tasRecords
      .filter((t) => t.track === form.track)
      .sort((a, b) => a.time_ms - b.time_ms);
  }, [tasRecords, form.track]);

  async function submit() {

    setLoading(true);
    setWarning("");

    if (!form.track) {
      setWarning("Please select a track.");
      setLoading(false);
      return;
    }

    if (form.time_ms <= 0) {
      setWarning("Please set the time");
      setLoading(false);
      return;
    }

    const payload = {
      game: form.game,
      track: form.track,
      category: form.category,
      time_ms: Number(form.time_ms),
      authors: form.authors,
      date: new Date(form.date).toISOString(),
      video: form.video || null,
      replay: form.replay || null,
      inputs: form.inputs || null,
    };

    const { error } = await supabase
      .from("tas_records")
      .upsert(payload, { onConflict: "track,category,time_ms" });

    if (error) {
      alert(error.message);
    } else {
      alert("Success!");
    }
    setLoading(false);
  }
  
  async function deleteTas(t: TasEntry) {

    const confirmed = window.confirm(`
      Delete ${t.track} (${t.category}) by ${t.authors.join(", ")}?
        Time (ms): ${t.time_ms}
        Formatted Time: ${formatTime(t.time_ms, t.game === "TM2")}\n
      This cannot be undone!`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("tas_records")
      .delete()
      .eq("track", t.track)
      .eq("category", t.category)
      .eq("time_ms", t.time_ms);

    if (error) {
      alert(error.message);
    } else {
      alert("Record successfully deleted!")
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-6 pt-20 pb-10 text-white">
      <div className="grid gap-6 lg:grid-cols-[460px_1fr] items-start">

        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4 shadow-xl">
          <div className="mb-3 border-b border-slate-700 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-semibold">
                  TAS Submission
                </h1>

                <div className="mt-1 text-sm text-slate-400">
                  Submit or update TAS records
                </div>
              </div>

              <button
                type="button"
                onClick={resetForm}
                className="rounded-md bg-slate-800 px-3 py-1 text-sm text-slate-300 transition hover:bg-slate-700"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="space-y-3">

            {/* GAME */}
            <div>
              <div className={labelClass}>Game</div>
              <select
                value={form.game}
                onChange={(e) => update("game", e.target.value as Game)}
                className={inputClass}
              >
                {gameList.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            {/* TRACK */}
            <div>
              <div className={labelClass}>Track</div>
              <select
                value={form.track}
                onChange={(e) => update("track", e.target.value)}
                className={inputClass}
              >
                <option value="">Select track</option>
                {trackOptions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* CATEGORY */}
            <div>
              <div className={labelClass}>Category</div>
              <select
                value={form.category}
                onChange={(e) =>
                  update("category", e.target.value as Category)
                }
                className={inputClass}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* TIME */}
            <div>
              <div className={labelClass}>Time (minutes | seconds | hundreths | thousandth)</div>

              <div className="grid grid-cols-4 gap-2">
                <input
                  type="number"
                  min={0}
                  max={60}
                  className={inputClass}
                  value={time.minutes}
                  onChange={(e) =>
                    setTime((t) => ({ ...t, minutes: Number(e.target.value) }))
                  }
                />

                <input
                  type="number"
                  min={0}
                  max={59}
                  className={inputClass}
                  value={time.seconds}
                  onChange={(e) =>
                    setTime((t) => ({ ...t, seconds: Number(e.target.value) }))
                  }
                />

                <input
                  type="number"
                  min={0}
                  max={99}
                  className={inputClass}
                  value={time.hundredths}
                  onChange={(e) =>
                    setTime((t) => ({ ...t, hundredths: Number(e.target.value) }))
                  }
                />

                <input
                  type="number"
                  min={0}
                  max={9}
                  className={inputClass}
                  value={time.thousandth}
                  onChange={(e) =>
                    setTime((t) => ({ ...t, thousandth: Number(e.target.value) }))
                  }
                />
              </div>

              <div className="mt-2 text-sm text-slate-400">
                {`Formatted time: ${formatTime(timeMs, isStunt, time.thousandth > 0)} ${isStunt ? "(Stunt points)" : ""}`}
              </div>
              <div className="text-sm text-slate-400">
                Database time: {timeMs} ms
              </div>
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
                      onChange={(e) => updateAuthor(index, e.target.value as Author)}
                      className={`${inputClass} flex-1`}
                    >
                      {authorOptions.map((author, i) => (
                        <option key={author} value={author} className={`${i <= 25 ? "" : "italic"}`}>
                          {author}
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

            {/* DATE */}
            <div>
              <div className={labelClass}>Date</div>
              <input
                type="date"
                className={inputClass}
                value={form.date}
                onChange={(e) => update("date", e.target.value)}
              />
            </div>

            {/* URL FIELDS */}
            {[
              ["Video", "video", "https://youtu.be/<id>"],
              ["Replay", "replay", "https://drive.google.com/uc?export=download&id=<id>"],
              ["Inputs", "inputs", "https://pastebin.com/<id>"],
            ].map(([label, key, placeholder]) => {
              const value = (form as any)[key] as string;

              return (
                <div key={key}>
                  <div className="mb-1 flex items-center justify-between">
                    <div className={labelClass}>{label}</div>

                    <button
                      type="button"
                      onClick={() => window.open(value, "_blank")}
                      className="rounded bg-slate-800 px-2 py-1 text-xs text-slate-300 hover:bg-slate-700 disabled:opacity-40"
                    >
                      Test
                    </button>
                  </div>

                  <input
                    className={`placeholder:text-slate-500 ${inputClass}`}
                    value={value}
                    onChange={(e) => update(key as any, e.target.value)}
                    placeholder={placeholder}
                  />
                </div>
              );
            })}

            {/* SUBMIT */}
            <div className="py-2">
              {warning && (
                <div className="mb-3 rounded-md border border-red-500/40 bg-red-950/40 px-3 py-2 text-sm text-red-300">
                  {warning}
                </div>
              )}

              <button
                onClick={submit}
                disabled={loading}
                className="w-full rounded-md bg-emerald-600 px-4 py-2 font-medium hover:bg-emerald-500 disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-xl">
          <h2 className="mb-4 text-xl font-semibold">
            Existing Records
          </h2>

          <div className="overflow-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-slate-400">
                <tr className="border-b border-slate-700">
                  <th className="py-2 px-2">Category</th>
                  <th className="py-2 px-2">
                    {`${isStunt ? "Points" : "Time"}`}
                  </th>
                  <th className="py-2 px-2">Authors</th>
                  <th className="py-2 px-2">Date</th>
                  <th className="py-2 px-2 text-center">Video</th>
                  <th className="py-2 px-2 text-center">Copy</th>
                  <th className="py-2 px-2 text-center">Delete</th>
                </tr>
              </thead>

              <tbody>
                {trackTases.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-slate-500">
                      Select track
                    </td>
                  </tr>
                ) : (
                  trackTases.map((t, i) => {
                    const isMatch = t.category === form.category;

                    return (
                      <tr
                        key={i}
                        className={`border-b border-slate-800 ${
                          isMatch ? "bg-emerald-500/20 italic" : ""
                        }`}
                      >
                        <td className="py-2 px-2">
                          {t.category}
                        </td>

                        <td className="py-2 px-2">
                          {formatTime(t.time_ms, isStunt, t.game === "TM2")}
                        </td>

                        <td className="py-1 px-2">
                          {t.authors.join(", ")}
                        </td>

                        <td className="py-2 px-2 whitespace-nowrap">
                          {formatDate(t.date)}
                        </td>
                        
                        <td className="py-2 px-2 text-center align-middle">
                          <div className="flex justify-center">
                            {t.video && (
                              <a
                                href={t.video}
                                target="_blank"
                                rel="noreferrer"
                                title="Watch video"
                                className="hover:opacity-80 transition"
                              >
                                { t.video.includes("discord.") 
                                  ? <img src="/links/discord.webp" alt="Replay" className="w-4 h-4" />
                                  : t.video.includes("streamable.com")
                                    ? <img src="/links/streamable.webp" alt="Replay" className="w-4.5" />
                                    : <img src="/links/youtube.webp" alt="Replay" className="w-4 h-4" />
                                }
                              </a>
                            )}
                          </div>
                        </td>

                        <td className="px-2 py-1 text-center">
                          <button
                            onClick={() => copyTasToForm(t)}
                            title="Copy to form"
                            className="rounded bg-slate-800 px-2 py-0.5 hover:bg-slate-700"
                          >
                            Copy
                          </button>
                        </td>

                        <td className="px-2 py-1 text-center">
                          <button
                            onClick={() => deleteTas(t)}
                            title="Delete record"
                            className="rounded bg-red-900 px-2 py-0.5 hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
