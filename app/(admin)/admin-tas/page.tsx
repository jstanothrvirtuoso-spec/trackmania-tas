"use client";

import { useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { formatTime } from "@/utils/formatting";
import { CATEGORIES, GAME_LIST } from "@/utils/constants";
import { SubmitForm, TimeState, Game, Category, TasEntry } from "@/utils/typing";
import { timeMsToState, timeStateToMs } from "@/utils/common";
import { useAlert } from "@/components/providers/AlertProvider";
import { useConfirm } from "@/components/providers/ConfirmProvider";
import { useAuthors } from "@/lib/Authors";
import { useTasRecords } from "@/lib/TasRecords";
import { usePendingSubmissions } from "@/lib/TasSubmissions";
import { TRACKS, tracksByGame } from "@/lib/TrackList";
import { DropSelect } from "@/components/DropSelect";
import AuthorSelector from "@/components/AuthorSelector";
import TrackRecords from "./TrackRecords";
import PendingRecords from "./PendingRecords";

export type TasForm = {
  game: Game;
  track: string;
  category: Category;
  num_inputs: number;
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

export default function AdminTas() {

  const { showAlert } = useAlert();
  const confirm = useConfirm();
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
    num_inputs: 0,
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

  const isStunt = form.track ? TRACKS[form.track]?.category === "Stunt" : false;
  const timeMs = timeStateToMs(time);
  const trackOptions = tracksByGame[form.game]

  const trackTases = useMemo(() => {
    if (!form.track) return [];
    return tasRecords
      .filter((t) => t.track === form.track)
      .sort((a, b) => a.time_ms - b.time_ms);
  }, [tasRecords, form.track]);

  function update<K extends keyof TasForm>(field: K, value: TasForm[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function resetForm() {
    setSelectedSubmission(null)
    setForm({
      game: form.game,
      track: form.track,
      category: "Open",
      num_inputs: 0,
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
      num_inputs: t.num_inputs ?? 0,
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
      num_inputs: 0,
      authors: Array.isArray(s.authors) ? s.authors : [],
      date: s.date?.slice(0, 10) ?? today,
      video: s.video ?? "",
      replay: "",
      inputs: "",
    });

    setTime(timeMsToState(s.time_ms ?? 0));
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
        num_inputs: form.num_inputs || null,
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

      // Find authors that don't exist yet
      const existingAuthors = authorData.map((a) => a.author);

      const newAuthors = form.authors.filter(
        (name) => !existingAuthors.includes(name)
      );

      // Insert missing authors
      if (newAuthors.length) {
        const { error: newAuthorsError } = await supabase
          .from("authors")
          .insert(newAuthors.map((author) => ({ author })));

        if (newAuthorsError) {
          setWarning(newAuthorsError.message);
          return;
        }
        
        await queryClient.invalidateQueries({
          queryKey: ["authors"],
        });
      }

      // Re-fetch all relevant authors
      const { data: allAuthors, error: authorsFetchError } = await supabase
        .from("authors")
        .select("id, author")
        .in("author", form.authors);

      if (authorsFetchError) {
        setWarning(authorsFetchError.message);
        return;
      }

      // Build junction rows
      const authorRows = form.authors.map((name) => ({
        tas_record_id: tasRecord.id,
        author_id: allAuthors.find((a) => a.author === name)?.id,
      }));

      // Clear existing links
      await supabase
        .from("tas_record_authors")
        .delete()
        .eq("tas_record_id", tasRecord.id);

      // Insert links
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

      showAlert("Success!");
    } finally {
      setLoading(false);
    }
  }
  
  async function deleteTas(t: TasEntry) {

    setLoading(true);
    try {
      const confirmed = await confirm(`
        Delete ${t.track} (${t.category}) by ${t.authors.join(", ")}?
          Time (ms): ${t.time_ms}
          Formatted Time: ${formatTime(t.time_ms, TRACKS[t.track].category === "Stunt", t.game === "TM2")}\n
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
        showAlert(error.message);
      } else {
        showAlert("Record successfully deleted!")
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
        showAlert("Record successfully deleted!")
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

        {/* TAS submission form */}
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
              <DropSelect
                initialValue={form.game}
                options={GAME_LIST.map((game) => ({
                  value: game,
                  label: game,
                }))}
                onChange={(value) => update("game", value as Game)}
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

            {/* CATEGORY */}
            <div>
              <div className={labelClass}>Category</div>
              <DropSelect
                initialValue={form.category}
                options={CATEGORIES.map((category) => ({
                  value: category,
                  label: category,
                }))}
                onChange={(value) => update("category", value as Category)}
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

            {/* NUM INPUTS */}
            {form.category === "Low Input" && (
              <div>
                <div className={labelClass}>Num Inputs (Low Input TASes only)</div>

                <div className="grid grid-cols-4 gap-2">
                  <input
                    type="number"
                    min={0}
                    max={60}
                    className={inputClass}
                    value={form.num_inputs}
                    onChange={(e) => update("num_inputs", Number(e.target.value))}
                  />
                </div>
              </div>
            )}

            {/* AUTHORS */}
            <AuthorSelector
              authors={form.authors}
              onChange={(next) => update("authors", next)}
            />

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

        <div className="flex flex-col gap-4 items-center lg:items-start">

          {/* Pending records */}
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
