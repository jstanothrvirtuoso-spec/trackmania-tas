"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { formatTime, formatDate } from "@/utils/formatting";
import { useRtaRecords } from "@/lib/RtaRecords";
import { Game, gameList, getGameTracks, RtaEntry, trackList } from "@/lib/TrackList";

type FormState = {
  game: Game;
  track: string;
  time_ms: number;
  player: string;
  date: string;
  video: string;
  replay: string;
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
  const { data: rtaRecords = [] } = useRtaRecords();
  
  const [form, setForm] = useState<FormState>({
    game: "TMNF",
    track: "",
    time_ms: 0,
    player: "Fwo.Link",
    date: today,
    video: "",
    replay: "",
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

  function resetForm() {
    setForm({
      game: form.game,
      track: form.track,
      time_ms: 0,
      player: "Fwo.Link",
      date: today,
      video: "",
      replay: "",
    });

    setTime({
      minutes: 0,
      seconds: 0,
      hundredths: 0,
      thousandth: 0,
    });

    setWarning("");
  }

  function copyRtaToForm(t: RtaEntry) {

    const minutes = Math.floor(t.time_ms / 60_000);
    const seconds = Math.floor((t.time_ms % 60_000) / 1000);
    const hundredths = Math.floor((t.time_ms % 1000) / 10);
    const thousandth = t.time_ms % 10;

    setForm({
      game: t.game,
      track: t.track,
      time_ms: t.time_ms,
      player: t.player,
      date: t.date.slice(0, 10),
      video: t.video ?? "",
      replay: t.replay ?? "",
    });

    setTime({
      minutes,
      seconds,
      hundredths,
      thousandth,
    });
  }

  const trackOptions = useMemo(() => {
    return getGameTracks(form.game);
  }, [form.game]);

  const timeMs = useMemo(() => {
    const time_ms = time.minutes * 60_000 + time.seconds * 1_000 + time.hundredths * 10 + time.thousandth
    update("time_ms", time_ms)
    return time_ms;
  }, [time]);

  const trackRecords = useMemo(() => {
    if (!form.track) return [];
    setStunt(trackList[form.track].category === "Stunt")
    return rtaRecords
      .filter((t) => t.track === form.track)
      .sort((a, b) => a.time_ms - b.time_ms);
  }, [rtaRecords, form.track]);

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
      time_ms: Number(form.time_ms),
      player: form.player,
      date: new Date(form.date).toISOString(),
      video: form.video || null,
      replay: form.replay || null,
    };

    const { error } = await supabase
      .from("rta_records")
      .upsert(payload, { onConflict: "track,time_ms" });

    if (error) {
      alert(error.message);
    } else {
      alert("Success!");
    }
    setLoading(false);
  }
  
  async function deleteRta(t: RtaEntry) {

    const confirmed = window.confirm(`
      Delete ${t.track} for ${t.player}?
        Time (ms): ${t.time_ms}
        Formatted Time: ${formatTime(t.time_ms, t.game === "TM2")}\n
      This cannot be undone!`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("rta_records")
      .delete()
      .eq("track", t.track)
      .eq("time_ms", t.time_ms);

    if (error) {
      alert(error.message);
    } else {
      alert("Record successfully deleted!")
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-6 pt-20 pb-10 text-white">
      <div className="grid gap-6 lg:grid-cols-[660px_1fr] items-start">

        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4 shadow-xl">
          <div className="mb-3 border-b border-slate-700 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-semibold">
                  RTA Submission
                </h1>

                <div className="mt-1 text-sm text-slate-400">
                  Submit or update RTA records
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

            {/* Player */}
            <div>
              <div className={labelClass}>Player</div>
              <input
                className={inputClass}
                value={form.player}
                onChange={(e) => update("player", e.target.value)}
              />
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
                  <th className="py-2 px-2">
                    {`${isStunt ? "Points" : "Time"}`}
                  </th>
                  <th className="py-2 px-2">Player</th>
                  <th className="py-2 px-2">Date</th>
                  <th className="py-2 px-2 text-center">Video</th>
                  <th className="py-2 px-2 text-center">Copy</th>
                  <th className="py-2 px-2 text-center">Delete</th>
                </tr>
              </thead>

              <tbody>
                {trackRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-slate-500">
                      Select track
                    </td>
                  </tr>
                ) : (
                  trackRecords.map((t, i) => {
                    return (
                      <tr
                        key={i}
                        className="border-b border-slate-800"
                      >
                        <td className="py-2 px-2">
                          {formatTime(t.time_ms, isStunt, t.game === "TM2")}
                        </td>

                        <td className="py-1 px-2">
                          {t.player}
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
                            onClick={() => copyRtaToForm(t)}
                            title="Copy to form"
                            className="rounded bg-slate-800 px-2 py-0.5 hover:bg-slate-700"
                          >
                            Copy
                          </button>
                        </td>

                        <td className="px-2 py-1 text-center">
                          <button
                            onClick={() => deleteRta(t)}
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
