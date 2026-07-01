"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { formatTime, formatDate, formatGame } from "@/utils/formatting";
import { timeMsToState, timeStateToMs } from "@/utils/common";
import { TimeState, Game, RtaEntry, GameSet } from "@/utils/typing";
import { GAME_LIST } from "@/utils/constants";
import { useAlert } from "@/components/providers/AlertProvider";
import { useConfirm } from "@/components/providers/ConfirmProvider";
import { useTrackRtaRecords } from "@/lib/RtaRecords";
import { getGameSetOptions, TRACKS, tracksByGame } from "@/lib/TrackList";
import { ReplayIcon, VideoIcon } from "@/components/Icons";
import { DropSelect } from "@/components/DropSelect";
import { useProfilePublicMe } from "@/lib/Profiles";

type RtaForm = {
  game: Game;
  gameSet: GameSet;
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
  const confirm = useConfirm();
  const queryClient = useQueryClient();
  const [warning, setWarning] = useState("");
  const [loading, setLoading] = useState(false);
  const { data: profilePublicMe } = useProfilePublicMe();
  
  const [form, setForm] = useState<RtaForm>({
    game: "TMNF",
    gameSet: "White",
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

  const { data: trackRecords } = useTrackRtaRecords(form.track);
  const isStunt = form.track ? TRACKS[form.track]?.gameSet === "Stunt" : false;
  const timeMs = timeStateToMs(time);
  const gameSetOptions = getGameSetOptions(form.game);
  const trackOptions = tracksByGame[form.game].filter((track) => TRACKS[track].gameSet === form.gameSet);

  function update<K extends keyof RtaForm>(field: K, value: RtaForm[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function resetForm() {
    setForm((prev) => ({
      game: prev.game,
      gameSet: prev.gameSet,
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
      gameSet: TRACKS[t.track].gameSet,
      track: t.track,
      player: t.player,
      date: t.date.slice(0, 10),
      video: t.video ?? "",
      replay: t.replay ?? "",
    });

    setTime(timeMsToState(t.time_ms));
  }

  function updateGame(game: Game) {
    update("game", game);
    const gameSetOptions = getGameSetOptions(game);
    update("gameSet", gameSetOptions[0])
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

    const confirmed = await confirm(`
      Delete ${t.track} for ${t.player}?
        Time (ms): ${t.time_ms}
        Formatted Time: ${formatTime(t.time_ms, TRACKS[t.track].gameSet === "Stunt", t.game === "TM2")}\n
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
    <div className="mx-auto flex justify-center min-h-screen px-6 pt-20 pb-10 text-white bg-slate-950">
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
              <DropSelect
                initialValue={form.game}
                options={GAME_LIST.map((game) => ({
                  value: game,
                  label: formatGame(game),
                }))}
                onChange={(value) => updateGame(value)}
                fullWidth={true}
              />
            </div>

            {/* GAME SET */}
            <div>
              <div className={labelClass}>Game Set</div>
              <DropSelect
                initialValue={form.gameSet}
                options={gameSetOptions.map((gameSet) => ({
                  value: gameSet,
                  label: gameSet,
                }))}
                onChange={(value) => update("gameSet", value)}
                fullWidth={true}
              />
            </div>

            {/* TRACK */}
            <div>
              <div className={labelClass}>Track</div>
              <DropSelect
                initialValue={form.track}
                options={trackOptions.map((track) => ({
                  value: track,
                  label: track,
                }))}
                onChange={(value) => update("track", value)}
                defaultOption={{ value: "", label: "Select Track" }}
                fullWidth={true}
              />
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
                  <th className="py-2 px-2 text-center hidden sm:table-cell">Links</th>
                  <th className="py-2 px-2 text-center">Copy</th>
                  
                  {profilePublicMe && profilePublicMe.role === "admin" && (
                    <th className="py-2 px-2 text-center">Delete</th>
                  )}
                </tr>
              </thead>

              <tbody>
                {!trackRecords || trackRecords.length === 0 ? (
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
                          <div className="flex items-center justify-center gap-1">
                            <div className="w-5 h-5 flex items-center justify-center"><VideoIcon videoURL={t.video}/></div>
                            <div className="w-5 h-5 flex items-center justify-center"><ReplayIcon replayURL={t.replay}/></div>
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

                        {profilePublicMe && profilePublicMe.role === "admin" && (
                          <td className="px-2 py-1 text-center">
                            <button
                              onClick={() => deleteRta(t)}
                              title="Delete record"
                              className="rounded bg-red-900 px-2 py-0.5 hover:bg-red-700 cursor-pointer"
                            >
                              Delete
                            </button>
                          </td>
                        )}

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
