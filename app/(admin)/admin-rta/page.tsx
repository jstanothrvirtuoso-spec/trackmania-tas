"use client";

import { useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { formatTime, formatDate } from "@/utils/formatting";
import { timeMsToState, timeStateToMs } from "@/utils/common";
import { TimeState, Game, RtaEntry } from "@/utils/typing";
import { GAME_LIST } from "@/utils/constants";
import { useAlert } from "@/components/AlertProvider";
import { useRtaRecords } from "@/lib/RtaRecords";
import { trackList, tracksByGame } from "@/lib/TrackList";
import { VideoIcon } from "@/components/Icons";

type RtaForm = {
  game: Game;
  track: string;
  player: string;
  date: string;
  video: string;
  replay: string;
};

const supabase = createClient();
const today = new Date().toISOString().split("T")[0];
const inputClass = "w-full rounded-md bg-slate-800 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-slate-500";
const labelClass = "text-sm text-slate-300 mb-1";
const URL_FIELDS = [
  ["Video", "video", "https://youtu.be/<id>"],
  ["Replay", "replay", "https://drive.google.com/uc?export=download&id=<id>"],
] as const;

export default function AdminRta() {

  const { showAlert } = useAlert();
  const queryClient = useQueryClient();
  const [warning, setWarning] = useState("");
  const [loading, setLoading] = useState(false);
  const { data: rtaRecords = [] } = useRtaRecords();
  
  const [form, setForm] = useState<RtaForm>({
    game: "TMNF",
    track: "",
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

  const isStunt = form.track ? trackList[form.track]?.category === "Stunt" : false;
  const timeMs = timeStateToMs(time);
  const trackOptions = tracksByGame[form.game]

  const trackRecords = useMemo(() => {
    if (!form.track) return [];
    return rtaRecords
      .filter((t) => t.track === form.track)
      .sort((a, b) => a.time_ms - b.time_ms);
  }, [rtaRecords, form.track]);

  function update<K extends keyof RtaForm>(field: K, value: RtaForm[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function resetForm() {
    setForm((prev) => ({
      game: prev.game,
      track: prev.track,
      player: "Fwo.Link",
      date: today,
      video: "",
      replay: "",
    }));

    setTime({
      minutes: 0,
      seconds: 0,
      hundredths: 0,
      thousandth: 0,
    });

    setWarning("");
  }

  function copyRtaToForm(t: RtaEntry) {
    setForm({
      game: t.game,
      track: t.track,
      player: t.player,
      date: t.date.slice(0, 10),
      video: t.video ?? "",
      replay: t.replay ?? "",
    });

    setTime(timeMsToState(t.time_ms));
  }

  async function submit() {

    setLoading(true);
    setWarning("");

    try {

      if (!form.track) {
        setWarning("Please select a track.");
        return;
      }

      if (timeMs <= 0) {
        setWarning("Please set the time");
        return;
      }

      const payload = {
        game: form.game,
        track: form.track,
        time_ms: timeMs,
        player: form.player,
        date: new Date(form.date).toISOString(),
        video: form.video || null,
        replay: form.replay || null,
      };

      const { error } = await supabase
        .from("rta_records")
        .upsert(payload, { onConflict: "track,time_ms" });

      if (error) {
        showAlert(error.message);
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: ["rtaRecords"],
      });

      showAlert("Success!");

    } finally {
      setLoading(false);
    }
  }
  
  async function deleteRta(t: RtaEntry) {

    const confirmed = window.confirm(`
      Delete ${t.track} for ${t.player}?
        Time (ms): ${t.time_ms}
        Formatted Time: ${formatTime(t.time_ms, trackList[t.track].category === "Stunt", t.game === "TM2")}\n
      This cannot be undone!`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("rta_records")
      .delete()
      .eq("track", t.track)
      .eq("time_ms", t.time_ms);

    if (error) {
      showAlert(error.message);
    } else {
      
      await queryClient.invalidateQueries({
        queryKey: ["rtaRecords"],
      });

      showAlert("Record successfully deleted!")
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
                className="rounded-md bg-slate-800 px-3 py-1 text-sm text-slate-300 transition hover:bg-slate-700 cursor-pointer"
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
                className={`${inputClass} cursor-pointer`}
              >
                {GAME_LIST.map((g) => (
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
                className={`${inputClass} cursor-pointer`}
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
                className={`${inputClass} cursor-pointer`}
                value={form.date}
                onChange={(e) => update("date", e.target.value)}
              />
            </div>

            {/* URL FIELDS */}
            {URL_FIELDS.map(([label, key, placeholder]) => {
              const value = form[key] as string;

              return (
                <div key={key}>
                  <div className="mb-1 flex items-center justify-between">
                    <div className={labelClass}>{label}</div>

                    <button
                      type="button"
                      onClick={() => window.open(value, "_blank")}
                      className="rounded bg-slate-800 px-2 py-1 text-xs text-slate-300 hover:bg-slate-700 disabled:opacity-40 cursor-pointer"
                    >
                      Check URL
                    </button>
                  </div>

                  <input
                    className={`placeholder:text-slate-500 ${inputClass}`}
                    value={value}
                    onChange={(e) => update(key, e.target.value)}
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
                className="w-full rounded-md bg-emerald-600 px-4 py-2 font-medium hover:bg-emerald-500 disabled:opacity-50 cursor-pointer"
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
                  <th className="py-2 px-2 hidden sm:table-cell">Date</th>
                  <th className="py-2 px-2 text-center hidden sm:table-cell">Video</th>
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

                        <td className="py-2 px-2 whitespace-nowrap hidden sm:table-cell">
                          {formatDate(t.date)}
                        </td>
                        
                        <td className="py-2 px-2 text-center align-middle hidden sm:table-cell">
                          <div className="flex justify-center">
                            {t.video && (<VideoIcon video_url={t.video}/>)}
                          </div>
                        </td>
                        
                        <td className="px-2 py-1 text-center">
                          <button
                            onClick={() => copyRtaToForm(t)}
                            title="Copy to form"
                            className="rounded bg-slate-800 px-2 py-0.5 hover:bg-slate-700 cursor-pointer"
                          >
                            Copy
                          </button>
                        </td>

                        <td className="px-2 py-1 text-center">
                          <button
                            onClick={() => deleteRta(t)}
                            title="Delete record"
                            className="rounded bg-red-900 px-2 py-0.5 hover:bg-red-700 cursor-pointer"
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
      
      {loading && (
        <div className="fixed inset-0 z-[9999] cursor-wait" />
      )}
    </div>
  );
}
