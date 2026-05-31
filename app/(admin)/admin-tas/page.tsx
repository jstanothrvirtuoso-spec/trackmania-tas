"use client";

import { useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { formatTime } from "@/utils/formatting";
import { CATEGORIES, GAME_LIST } from "@/utils/constants";
import { SubmitForm, TimeState, Game, Category, TasEntry, AuthorInfo } from "@/utils/typing";
import { timeMsToState, timeStateToMs } from "@/utils/common";
import { useAuthors } from "@/lib/Authors";
import { useTasRecords } from "@/lib/TasRecords";
import { usePendingSubmissions } from "@/lib/TasSubmissions";
import { trackList, tracksByGame } from "@/lib/TrackList";
import TrackRecords from "./TrackRecords";
import PendingRecords from "./PendingRecords";

export type TasForm = {
  game: Game;
  track: string;
  category: Category;
  authors: string[];
  date: string;
  video: string;
  replay: string;
  inputs: string;
};

const supabase = createClient();
const today = new Date().toISOString().split("T")[0];
const inputClass = "w-full rounded-md bg-slate-800 px-3 py-1.5 text-white outline-none focus:ring-2 focus:ring-slate-500";
const labelClass = "text-sm text-slate-300 mb-0.5";

const URL_FIELDS = [
  ["Video", "video", "https://youtu.be/<id>"],
  ["Replay", "replay", "https://drive.google.com/uc?export=download&id=<id>"],
  ["Inputs", "inputs", "https://pastebin.com/<id>"],
] as const;

export default function AdminPanel() {

  const queryClient = useQueryClient();
  const [warning, setWarning] = useState("");
  const [loading, setLoading] = useState(false);
  const [adminNote, setAdminNote] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState<SubmitForm | null>(null);
  const { data: authorData = [] } = useAuthors();
  const { data: tasRecords = [] } = useTasRecords();
  const { data: pendingSubmissions = [] } = usePendingSubmissions();
  
  const [form, setForm] = useState<TasForm>({
    game: "TMNF",
    track: "",
    category: "Open",
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

  const isStunt = form.track ? trackList[form.track]?.category === "Stunt" : false;
  const timeMs = timeStateToMs(time);
  const trackOptions = tracksByGame[form.game]

  const authorOptions = useMemo(() => {

    const unknown = authorData.find((a) => a.author === "Unknown");
    const rest = authorData.filter((a) => a.author !== "Unknown");
    const priority = rest.slice(0, 25);
    const remaining = rest.slice(25);

    const sorted = (arr: AuthorInfo[]) => [...arr].sort((a, b) => a.author.localeCompare(b.author));

    return [
      ...(unknown ? [{ id: unknown.id, author: unknown.author }] : []),
      ...sorted(priority),
      { id: "", author: "" },
      ...sorted(remaining),
    ];
  }, [authorData]);

  const trackTases = useMemo(() => {
    if (!form.track) return [];
    return tasRecords
      .filter((t) => t.track === form.track)
      .sort((a, b) => a.time_ms - b.time_ms);
  }, [tasRecords, form.track]);

  function update<K extends keyof TasForm>(field: K, value: TasForm[K]) {
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
    setSelectedSubmission(null)
    setForm({
      game: form.game,
      track: form.track,
      category: "Open",
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
    setSelectedSubmission(null);
    setForm({
      game: t.game,
      track: t.track,
      category: t.category,
      authors: t.authors,
      date: t.date.slice(0, 10),
      video: t.video ?? "",
      replay: t.replay ?? "",
      inputs: t.inputs ?? "",
    });
    setTime(timeMsToState(t.time_ms));
  }

  function copySubmissionToForm(s: SubmitForm) {

    const category = s.category && s.category != "Unsure" ? s.category : "Open"

    setSelectedSubmission(s);
    setForm({
      game: s.game ?? "TMNF",
      track: s.track ?? "",
      category: category,
      authors: Array.isArray(s.authors) ? s.authors : [],
      date: s.date?.slice(0, 10) ?? today,
      video: s.video ?? "",
      replay: "",
      inputs: "",
    });

    setTime(timeMsToState(s.time_ms ?? 0));
  }

  function updateAuthor(index: number, value: string) {
    const next = [...form.authors];
    next[index] = value;
    const unique = [...new Set(next)];
    update("authors", unique);
  }

  async function submit() {

    setWarning("");
    setLoading(true);
    try {
      if (!form.track) {
        setWarning("Please select a track.");
        return;
      }

      if (timeMs <= 0) {
        setWarning("Please set the time");
        return;
      }

      // 1. Upsert TAS record
      const payload = {
        game: form.game,
        track: form.track,
        category: form.category,
        time_ms: timeMs,
        date: new Date(form.date).toISOString(),
        video: form.video || null,
        replay: form.replay || null,
        inputs: form.inputs || null,
      };

      const { data: tasRecord, error: tasError } = await supabase
        .from("tas_records")
        .upsert(payload, { onConflict: "track,category,time_ms" })
        .select()
        .single();

      if (tasError) {
        setWarning(tasError.message);
        return;
      }

      // 2. Convert author names -> junction rows
      const authorRows = form.authors.map((name) => {
        const author = authorData.find((a) => a.author === name);
        return {
          tas_record_id: tasRecord.id,
          author_id: author?.id,
        };
      }).filter((x) => x.author_id);

      // Clear existing author links first
      await supabase
        .from("tas_record_authors")
        .delete()
        .eq("tas_record_id", tasRecord.id);

      // Insert new links
      const { error: authorsError } = await supabase
        .from("tas_record_authors")
        .insert(authorRows);

      if (authorsError) {
        setWarning(authorsError.message);
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: ["tasRecords"],
      });

      alert("Success!");
    } finally {
      setLoading(false);
    }
  }
  
  async function deleteTas(t: TasEntry) {

    setLoading(true);
    try {
      const confirmed = window.confirm(`
        Delete ${t.track} (${t.category}) by ${t.authors.join(", ")}?
          Time (ms): ${t.time_ms}
          Formatted Time: ${formatTime(t.time_ms, trackList[t.track].category === "Stunt", t.game === "TM2")}\n
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

      if (error) {
        alert(error.message);
      } else {
        alert("Record successfully deleted!")
      }
    } finally {
      setLoading(false);
    }
  }

  async function processSubmission(status: "approved" | "rejected") {

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
          status: status,
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
      
      if (status === "rejected") {
        alert("Record successfully deleted!")
      } else {
        await submit()
      }

      queryClient.setQueryData(
        ["tas_submissions", "pending"],
        (old: SubmitForm[] | undefined) =>
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

  async function downloadReplay(replayPath: string, fileName: string) {

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
                {CATEGORIES.map((c) => (
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
                  <div 
                    key={author} 
                    className="flex gap-2 items-stretch"
                  >
                    <select
                      value={author}
                      onChange={(e) => updateAuthor(index, e.target.value)}
                      className={`h-8 cursor-pointer ${inputClass} flex-1`}
                    >
                      {authorOptions.map((a, i) => (
                        <option key={a.author} value={a.author} className={`${i <= 25 ? "" : "italic"}`}>
                          {a.author}
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
            {URL_FIELDS.map(([label, key, placeholder]) => {
              const value = form[key] as string;

              return (
                <div key={key}>
                  <div className="mb-0.5 flex items-center justify-between">
                    <div className={labelClass}>{label}</div>

                    <button
                      type="button"
                      disabled={value.length === 0}
                      onClick={() => window.open(value, "_blank")}
                      className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300 hover:bg-slate-700 disabled:opacity-40"
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
                    onClick={() => processSubmission("approved")}
                    disabled={loading}
                    className="w-full rounded-md bg-emerald-600 px-4 py-2 font-medium hover:bg-emerald-500 disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? "Processing..." : "Approve user submission and submit"}
                  </button>

                  <button
                    onClick={() => processSubmission("rejected")}
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
          <PendingRecords
            submissions={pendingSubmissions}
            isStunt={isStunt}
            selectedSubmission={selectedSubmission}
            copySubmissionToForm={copySubmissionToForm}
            downloadReplay={downloadReplay}
          />
          
          {/* Existing Track Records */}
          <TrackRecords
            track={form.track}
            category={form.category}
            isStunt={isStunt}
            records={trackTases}
            copyTasToForm={copyTasToForm}
            deleteTas={deleteTas}
          />

        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 z-[9999] cursor-wait" />
      )}
    </div>
    
  );
}
