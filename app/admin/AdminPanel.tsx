"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function AdminPanel() {
  const supabase = createClient();

  const [form, setForm] = useState({
    game: "TMNF",
    track: "",
    category: "",
    record: "",
    time_ms: "",
    player: "",
    date: "",
    video: "",
    replay: "",
    inputs: "",
  });

  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function submit() {
    setLoading(true);

    const { error } = await supabase.from("tas_records").insert({
      game: form.game,
      track: form.track,
      category: form.category,
      record: form.record,
      time_ms: Number(form.time_ms),
      player: form.player,
      date: form.date,
      video: form.video,
      replay: form.replay,
      inputs: form.inputs,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
    } else {
      alert("Inserted");
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-3 p-6 text-white">
      <h1 className="text-xl font-semibold">Admin Panel</h1>

      <input placeholder="Track" onChange={(e) => update("track", e.target.value)} />
      <input placeholder="Category" onChange={(e) => update("category", e.target.value)} />
      <input placeholder="Record" onChange={(e) => update("record", e.target.value)} />
      <input placeholder="Time ms" onChange={(e) => update("time_ms", e.target.value)} />
      <input placeholder="Player" onChange={(e) => update("player", e.target.value)} />
      <input placeholder="Date" onChange={(e) => update("date", e.target.value)} />
      <input placeholder="Video" onChange={(e) => update("video", e.target.value)} />
      <input placeholder="Replay" onChange={(e) => update("replay", e.target.value)} />
      <input placeholder="Inputs" onChange={(e) => update("inputs", e.target.value)} />

      <button onClick={submit} disabled={loading}>
        {loading ? "Submitting..." : "Submit"}
      </button>
    </div>
  );
}