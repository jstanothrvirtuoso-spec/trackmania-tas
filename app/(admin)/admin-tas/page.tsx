"use client";

import { useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { formatTime, formatDate } from "@/utils/formatting";
import { Author, authorList } from "@/lib/AuthorList";
import { useTasRecords } from "@/lib/TasRecords";
import { usePendingSubmissions } from "@/lib/TasSubmissions";
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

type SubmissionState = {
  id: string;
  game: Game | null;
  track: string | null;
  category: Category | "Unsure";
  time_ms: number | null;
  authors: Author[];
  date: string;
  video: string | null;
  replay_path: string;
  file_name: string;
  submitted_by: string | null;
  submitted_by_name: string | null;
  status: "pending" | "approved" | "rejected";
  user_notes: string | null;
  admin_notes: string | null;
  created_at: string;
}

export default function AdminPanel() {

  const supabase = createClient();
  const queryClient = useQueryClient();
  const [warning, setWarning] = useState("");
  const [loading, setLoading] = useState(false);
  const [isStunt, setStunt] = useState(false);
  const [adminNote, setAdminNote] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionState | null>(null);
  const today = new Date().toISOString().split("T")[0];
  const inputClass = "w-full rounded-md bg-slate-800 px-3 py-1.5 text-white outline-none focus:ring-2 focus:ring-slate-500";
  const labelClass = "text-sm text-slate-300 mb-0.5";
  const { data: tasRecords = [] } = useTasRecords();
  const { data: pendingSubmissions = [] } = usePendingSubmissions();
  
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

  function timeAgo(dateStr: string) {
    const date = new Date(dateStr).getTime();
    const now = Date.now();
    const diff = Math.floor((now - date) / 1000);

    const minutes = Math.floor(diff / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    return `${minutes}m`;
  }

  function resetForm() {
    setSelectedSubmission(null)
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

    setSelectedSubmission(null);
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

  function copySubmissionToForm(s: SubmissionState) {

    const minutes = Math.floor((s.time_ms ?? 0) / 60_000);
    const seconds = Math.floor(((s.time_ms ?? 0) % 60_000) / 1000);
    const hundredths = Math.floor(((s.time_ms ?? 0) % 1000) / 10);
    const thousandth = (s.time_ms ?? 0) % 10;
    const category = s.category && s.category != "Unsure" ? s.category : "Open"

    setSelectedSubmission(s);
    setForm({
      game: s.game ?? "TMNF",
      track: s.track ?? "",
      category: category,
      time_ms: s.time_ms ?? 0,
      authors: Array.isArray(s.authors) ? s.authors : [],
      date: s.date?.slice(0, 10) ?? today,
      video: s.video ?? "",
      replay: "",
      inputs: "",
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

  function renderLinks({video, replayPath, fileName}: { video: string; replayPath: string; fileName: string }) {
    const downloadReplay = async () => {
      if (!replayPath) return;

      setLoading(true);

      try {

        const { data, error } = await supabase
          .storage
          .from("replays")
          .createSignedUrl(replayPath, 60 * 5);

        if (error || !data?.signedUrl) return;

        const res = await fetch(data.signedUrl);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");

        a.href = url;
        a.download = fileName || "replay.gbx";
        document.body.appendChild(a);
        a.click();
        a.remove();

        URL.revokeObjectURL(url);
      
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="flex items-center justify-center gap-1">
        <div className="w-5 h-5 flex items-center justify-center">
          {video && (
            <a href={video} target="_blank" rel="noreferrer">
              <img src="/links/youtube.webp" className="w-4 h-4 cursor-pointer" />
            </a>
          )}
        </div>

        <div className="w-5 h-5 flex items-center justify-center">
          {replayPath && (
            <button
              type="button"
              onClick={downloadReplay}
              className="hover:opacity-80 transition cursor-pointer"
              title={`Download: ${fileName}`}
            >
              <img src="/links/replay.webp" className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    );
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

    setWarning("");
    setLoading(true);

    try {

      if (!form.track) {
        setWarning("Please select a track.");
        return;
      }

      if (form.time_ms <= 0) {
        setWarning("Please set the time");
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

      await queryClient.invalidateQueries({
        queryKey: ["tasRecords"],
      });

      if (error) {
        setWarning(error.message);
      } else {
        alert("Success!");
      }
    } finally {
      setLoading(false);
    }
  }
  
  async function deleteTas(t: TasEntry) {

    setLoading(true);
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

    await queryClient.invalidateQueries({
      queryKey: ["tasRecords"],
    });

    setLoading(false);
    if (error) {
      alert(error.message);
    } else {
      alert("Record successfully deleted!")
    }
  }

  async function approveSubmission() {

    if (!selectedSubmission) return;
    setLoading(true);

    try {

      const oldPath = selectedSubmission.replay_path;
      const filename = oldPath.split("/").pop() ?? "";
      const newPath = `approved/${selectedSubmission.submitted_by}/${filename}`;

      const { error: moveError } = await supabase.storage
        .from("replays")
        .move(oldPath, newPath);
      
      if (moveError) {
        setWarning(`Replay move failed: ${moveError.message}`);
        return;
      }

      const { error } = await supabase
        .from("tas_submissions")
        .update({
          status: "approved",
          admin_notes: adminNote || null,
          replay_path: newPath,
        })
        .eq("id", selectedSubmission.id);

      if (error) {
        await supabase.storage
          .from("replays")
          .move(newPath, oldPath);

        setWarning(error.message);
        return;
      }

      submit()

      queryClient.setQueryData(
        ["tas_submissions", "pending"],
        (old: SubmissionState[] | undefined) =>
          old?.filter((x) => x.id !== selectedSubmission.id)
      );

      await queryClient.invalidateQueries({
        queryKey: ["tas_submissions", "pending"],
      });

      setAdminNote("");
      resetForm()
    } finally {
      setLoading(false);
    }
  }

  async function rejectSubmission() {

    if (!selectedSubmission) return;
    setLoading(true);

    try {

      const oldPath = selectedSubmission.replay_path;
      const filename = oldPath.split("/").pop() ?? "";
      const newPath = `rejected/${selectedSubmission.submitted_by}/${filename}`;

      const { error: moveError } = await supabase.storage
        .from("replays")
        .move(oldPath, newPath);
      
      if (moveError) {
        setWarning(`Replay move failed: ${moveError.message}`);
        return;
      }

      const { error } = await supabase
        .from("tas_submissions")
        .update({
          status: "rejected",
          admin_notes: adminNote || null,
          replay_path: newPath,
        })
        .eq("id", selectedSubmission.id);

      if (error) {
        await supabase.storage
          .from("replays")
          .move(newPath, oldPath);

        setWarning(error.message);
        return;
      } else {
        alert("Record successfully deleted!")
      }

      queryClient.setQueryData(
        ["tas_submissions", "pending"],
        (old: SubmissionState[] | undefined) =>
          old?.filter((x) => x.id !== selectedSubmission.id)
      );

      await queryClient.invalidateQueries({
        queryKey: ["tas_submissions", "pending"],
      });

      setAdminNote("");
      resetForm()
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex justify-center px-6 pt-20 pb-10 text-white">
      <div className="grid gap-4 lg:grid-cols-[460px_1fr] items-start">

        {/* TAS FORM */}
        <div className={`rounded-2xl border border-slate-700 p-4 shadow-xl ${selectedSubmission ? "bg-sky-400/10" : "bg-slate-900"}`}>
          <div className="mb-3 border-b border-slate-700 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-semibold">
                  TAS Submission
                </h1>

                <div className="mt-1 text-sm text-slate-400 italic">
                  {`${selectedSubmission ? "Processing user submission" : "Adding new or updating existing TAS"}`}
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
                className={`cursor-pointer ${inputClass}`}
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
                className={`cursor-pointer ${inputClass}`}
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
                className={`cursor-pointer ${inputClass}`}
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
                  <div key={index} className="flex gap-2 items-stretch">
                    <select
                      value={author}
                      onChange={(e) => updateAuthor(index, e.target.value as Author)}
                      className={`h-8 cursor-pointer ${inputClass} flex-1`}
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
                        className="rounded bg-emerald-600 w-10 hover:bg-emerald-500 disabled:opacity-40 cursor-pointer"
                      >
                        +
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => removeAuthor(index)}
                        className="rounded bg-red-600 w-10 hover:bg-red-500 cursor-pointer"
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
                  <div className="mb-0.5 flex items-center justify-between">
                    <div className={labelClass}>{label}</div>

                    <button
                      type="button"
                      onClick={() => window.open(value, "_blank")}
                      className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300 hover:bg-slate-700 disabled:opacity-40"
                    >
                      Check URL
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
            <div>
              {warning && (
                <div className="mb-3 rounded-md border border-red-500/40 bg-red-950/40 px-3 py-2 text-sm text-red-300">
                  {warning}
                </div>
              )}

              {!selectedSubmission ? (
                <button
                  onClick={submit}
                  disabled={loading}
                  className="w-full rounded-md bg-emerald-600 px-4 py-2 font-medium hover:bg-emerald-500 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? "Submitting..." : "Submit"}
                </button>
              ) : (
                <div className="space-y-3">
                  
                  <div className={labelClass}>Admin Note</div>
                  <textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="Optional admin note..."
                    className="w-full rounded-md bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-slate-500"
                    rows={3}
                  />

                  <button
                    onClick={() => approveSubmission()}
                    disabled={loading}
                    className="w-full rounded-md bg-emerald-600 px-4 py-2 font-medium hover:bg-emerald-500 disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? "Processing..." : "Approve user submission and submit"}
                  </button>

                  <button
                    onClick={() => rejectSubmission()}
                    disabled={loading}
                    className="w-full rounded-md bg-red-800 px-4 py-2 font-medium hover:bg-red-500 disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? "Processing..." : "Reject user submission"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 items-start">

          {/* PENDING TABLE */}
          <div className="rounded-2xl border border-yellow-500/20 bg-slate-900 p-6">
            <h2 className="mb-4 text-xl font-semibold text-yellow-300">
              Pending Submissions
            </h2>

            <div className="overflow-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-slate-400">
                  <tr className="border-b border-slate-700">
                    <th className="px-2 py-2">Action</th>
                    <th className="px-2 py-2">Submitted</th>
                    <th className="px-2 py-2">Track</th>
                    <th className="px-2 py-2">Category</th>
                    <th className="px-2 py-2">Time</th>
                    <th className="px-2 py-2">Authors</th>
                    <th className="px-2 py-2">Date</th>
                    <th className="px-2 py-2">Links</th>
                    <th className="px-2 py-2">Notes</th>
                  </tr>
                </thead>

                <tbody>
                  {pendingSubmissions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-slate-500">
                        No pending submissions
                      </td>
                    </tr>
                  ) : (
                    pendingSubmissions.map((s) => (
                      <tr
                        key={s.id}
                        className={`border-b border-slate-800 transition
                          ${s.id == selectedSubmission?.id ? "bg-sky-500/40" : ""}
                        `}
                      >

                        <td className="px-2 py-2">
                          <button
                            onClick={() => copySubmissionToForm(s)}
                            className="rounded bg-slate-800 px-2 py-1 text-xs hover:bg-slate-700 cursor-pointer"
                          >
                            Copy
                          </button>
                        </td>

                        <td className="px-2 py-2 whitespace-nowrap text-slate-300">
                          {timeAgo(s.created_at)}{"-"}
                          <span>
                            {s.submitted_by_name ?? "Unknown"}
                          </span>
                        </td>

                        <td className="px-2 py-2 whitespace-nowrap">
                          {s.track ?? "-"}
                        </td>

                        <td className="px-2 py-2 whitespace-nowrap">
                          {s.category}
                        </td>

                        <td className="px-2 py-2">
                          {s.time_ms ? formatTime(s.time_ms, s.game === "TM2") : "-"}
                        </td>
                        <td className="px-2 py-2">
                          {Array.isArray(s.authors) ? s.authors.join(", ") : ""}
                        </td>
                        <td className="px-2 py-2">{formatDate(s.date)}</td>

                        <td className="px-2 py-2 text-center">
                          { renderLinks({ video: s.video, replayPath: s.replay_path, fileName: s.file_name }) }
                        </td>

                        <td className="px-2 py-2 max-w-150 break-all whitespace-normal">
                            {s.user_notes ?? "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* EXISTING TASes */}
          <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-semibold">
              {form.track ? `Existing Records for ${form.track}` : "Choose a track"}
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

                          <td className="py-1 px-2 max-w-80">
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
                              className="rounded bg-slate-800 px-2 py-0.5 hover:bg-slate-700 cursor-pointer"
                            >
                              Copy
                            </button>
                          </td>

                          <td className="px-2 py-1 text-center">
                            <button
                              onClick={() => deleteTas(t)}
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

      </div>

      {loading && (
        <div className="fixed inset-0 z-[9999] cursor-wait" />
      )}
    </div>
    
  );
}
