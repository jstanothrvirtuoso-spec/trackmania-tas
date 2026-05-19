"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { Game, gameList, getGameTracks, Category, categories } from "@/lib/TrackLists";

type FormState = {
  game: Game;
  track: string;
  category: Category;
  time_ms: number;
  authors: string;
  date: string;
  video: string;
  replay: string;
  inputs: string;
};

type TimeState = {
  minutes: number;
  seconds: number;
  hundredths: number;
};

function isValidUrl(url: string) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export default function AdminPanel() {

  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const today = new Date().toISOString().split("T")[0];
  
  const [form, setForm] = useState<FormState>({
    game: "TMNF",
    track: "",
    category: "Open",
    time_ms: 0,
    authors: "",
    date: today,
    video: "",
    replay: "",
    inputs: "",
  });

  const [time, setTime] = useState<TimeState>({
    minutes: 0,
    seconds: 0,
    hundredths: 0,
  });

  function update<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  const trackOptions = useMemo(() => {
    return getGameTracks(form.game);
  }, [form.game]);

  const timeMs = useMemo(() => {
    return time.minutes * 60_000 + time.seconds * 1_000 + time.hundredths * 10;
  }, [time]);

  const formattedTime = useMemo(() => {
    const mm = String(time.minutes).padStart(2, "0");
    const ss = String(time.seconds).padStart(2, "0");
    const xx = String(time.hundredths).padStart(2, "0");
    return `${mm}:${ss}.${xx}`;
  }, [time]);

  const inputClass = "w-full rounded-md bg-slate-800 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-slate-500";
  const labelClass = "text-sm text-slate-300 mb-1";

  async function submit() {
    setLoading(true);

    const { error } = await supabase.from("tas_records").insert({
      game: form.game,
      track: form.track,
      category: form.category,
      time_ms: Number(form.time_ms),
      authors: form.authors,
      date: new Date(form.date).toISOString(),
      video: form.video,
      replay: form.replay,
      inputs: form.inputs,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
    } else {
      alert("Success!");
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-3 pt-18 text-white">
      <h1 className="text-xl font-semibold">TAS Submission</h1>

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
        <div className={labelClass}>Time</div>

        <div className="grid grid-cols-3 gap-2">
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
        </div>

        <div className="mt-2 text-sm text-slate-400">
          {formattedTime} • {timeMs} ms
        </div>
      </div>

      {/* AUTHORS */}
      <div>
        <div className={labelClass}>Authors</div>
        <input
          className={inputClass}
          value={form.authors}
          onChange={(e) => update("authors", e.target.value)}
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
        ["Video", "video"],
        ["Replay", "replay"],
        ["Inputs", "inputs"],
      ].map(([label, key]) => (
        <div key={key}>
          <div className={labelClass}>{label}</div>
          <input
            className={inputClass}
            value={(form as any)[key]}
            onChange={(e) => update(key as any, e.target.value)}
            placeholder="https://..."
          />
        </div>
      ))}

      {/* SUBMIT */}
      <div className="py-2">
        <button
          onClick={submit}
          disabled={loading}
          className="w-full rounded-md bg-emerald-600 px-4 py-2 font-medium hover:bg-emerald-500 disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </div>
    </div>
  );
}