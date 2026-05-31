"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { timeMsToState, timeStateToMs } from "@/utils/common";
import { TimeState, AuthorInfo, Category } from "@/utils/typing";
import { MAX_NOTES, MAX_REPLAY_SIZE, CURSOR, CATEGORIES } from "@/utils/constants";
import { trackIds } from "@/lib/TrackId"
import { useAuthors } from "@/lib/Authors";
import { useProfile } from "@/lib/Profiles";
import { trackList } from "@/lib/TrackList";

type FormState = {
  track: string;
  authors: string[];
  category: Category | "Unsure";
  video: string;
  user_notes: string;
  date: string;
};

type GBXData = {
  uid: string | null;
  bestTime: number | null;
  version: string | null;
  stuntScore: number | null;
  validable: boolean | null;
};

const today = new Date().toISOString().split("T")[0];

function isValidUrl(url: string) {
  if (!url) return true;

  try {
    const u = new URL(url);

    return u.hostname.length > 0 && ["https:", "http:"].includes(u.protocol);
  } catch {
    return false;
  }
}

async function parseGBX(file: File): Promise<GBXData> {

  const buffer = await file.arrayBuffer();
  const header = new TextDecoder("utf-8").decode(buffer.slice(0, 64));
  
  if (!header.startsWith("GBX")) {
    return {
      uid: null,
      bestTime: null,
      version: null,
      stuntScore: null,
      validable: null,
    };
  }

  const text = new TextDecoder("utf-8", { fatal: false }).decode(buffer);
  const uid = text.match(/<challenge uid="([^"]+)"/)?.[1] ?? text.match(/<map uid="([^"]+)"/)?.[1] ?? null;
  const bestTimeRaw = text.match(/<times best="(\d+)"/)?.[1];
  const version = text.match(/<header[^>]*version="([^"]+)"/)?.[1] ?? null;
  const stuntScoreRaw = text.match(/stuntscore="(\d+)"/)?.[1];
  const validableRaw = text.match(/validable="(\d+)"/)?.[1];

  return {
    uid,
    bestTime: bestTimeRaw ? Number(bestTimeRaw) : null,
    version,
    stuntScore: stuntScoreRaw ? Number(stuntScoreRaw) : null,
    validable: validableRaw ? validableRaw === "1" : null,
  };
}

export default function SubmitPage() {

  const supabase = createClient();
  const { data: profile } = useProfile();
  const [replayFile, setReplayFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [warning, setWarning] = useState("");
  const inputClass = "w-full rounded-md bg-slate-800 px-3 py-2 text-slate-100";
  const labelClass = "text-sm text-slate-300 py-0.5";
  const { data: authorData = [] } = useAuthors();

  const [form, setForm] = useState<FormState>({
    track: "",
    authors: [""],
    category: "Open",
    video: "",
    user_notes: "",
    date: today,
  });

  const [time, setTime] = useState<TimeState>({
    minutes: 0,
    seconds: 0,
    hundredths: 0,
    thousandth: 0,
  });

  const timeMs = timeStateToMs(time);

  const authorOptions = useMemo(() => {
    const rest = authorData.filter((a) => a.author !== "Unknown");
    const priority = rest.slice(0, 25);
    const remaining = rest.slice(25);
    const sorted = (arr: AuthorInfo[]) => [...arr].sort((a, b) => a.author.localeCompare(b.author));
    return [
      ...sorted(priority),
      { id: "", author: "" },
      ...sorted(remaining),
    ];
  }, [authorData]);

  const usedAuthors = useMemo(
    () => new Set(form.authors),
    [form.authors]
  );

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateAuthor(index: number, value: string) {
    setForm((prev) => {
      const next = [...prev.authors];
      next[index] = value;
      return { ...prev, authors: next };
    });
  }

  function addAuthor() {
    setForm((prev) => ({
      ...prev,
      authors: [...prev.authors, ""],
    }));
  }

  function removeAuthor(index: number) {
    setForm((prev) => ({
      ...prev,
      authors: prev.authors.filter((_, i) => i !== index),
    }));
  }

  function resetForm() {
    setTime(timeMsToState(0))
    setForm({
      track: "",
      authors: [""],
      category: "Open",
      video: "",
      user_notes: "",
      date: today,
    });
    setWarning("");
    setReplayFile(null);
  }

  async function onFileSelect(file?: File) {

    update("track", "");
    setReplayFile(null);
    setTime(timeMsToState(0));

    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".gbx")) {
      alert("Only .gbx files allowed");
      return;
    }

    if (file.size > MAX_REPLAY_SIZE) {
      alert("Replay exceeds 10 MB limit");
      return;
    }

    const parsed = await parseGBX(file);
    if (!parsed.uid) {
      alert("Invalid replay file");
      return;
    };
    setReplayFile(file);

    const track = trackIds[parsed.uid] ?? trackIds[`${parsed.uid}-${parsed.version}`] ?? "";
    update("track", track)
    if (parsed.bestTime && parsed.validable) {
      setTime(timeMsToState(parsed.bestTime));
    }
  }

  async function submit() {

    if (loading) return;
    setLoading(true);
    setWarning("");

    try {

      if (!replayFile) {
        setWarning("Please upload a replay file");
        return;
      }

      const videoUrl = form.video.trim();
      if (!isValidUrl(videoUrl)) {
        setWarning("Invalid video URL");
        return;
      }

      const cleanAuthors = form.authors.filter((a) => a.trim() !== "");
      if (cleanAuthors.length === 0) {
        setWarning("Please choose at least one author");
        return;
      }

      const user = (await supabase.auth.getUser()).data.user;

      if (!user) {
        setWarning("You must be signed in");
        return;
      }

      const todayStart = new Date();
      todayStart.setHours(0,0,0,0);

      const { count } = await supabase
        .from("tas_submissions")
        .select("id", { count: "exact", head: true })
        .eq("submitted_by", user.id)
        .gte("created_at", todayStart.toISOString());

      if ((count ?? 0) >= 20) {
        setWarning("You have reached the daily maximum of 20 submissions. Please try again tomorrow.");
        return;
      }

      const game = trackList[form.track]?.game;
      const filePath = `pending/${user.id}/${crypto?.randomUUID?.() ?? Date.now()}.gbx`;

      const { error: uploadError } = await supabase.storage
        .from("replays")
        .upload(filePath, replayFile);

      if (uploadError) {
        setWarning(`Replay error: ${uploadError.message}`);
        return;
      }

      const payload = {
        game,
        track: form.track,
        category: form.category,
        time_ms: timeMs ?? null,
        authors: cleanAuthors,
        date: new Date(form.date).toISOString(),
        video: videoUrl || null,
        user_notes: form.user_notes.trim() || null,
        replay_path: filePath,
        file_name: replayFile.name,
        submitted_by: user.id,
        submitted_by_name: profile?.username ?? null,
        status: "pending",
      };

      const { error } = await supabase
        .from("tas_submissions")
        .insert(payload);

      if (error) {
        setWarning(`Submission error: ${error.message}`);
        await supabase.storage
          .from("replays")
          .remove([filePath]);
        return;
      }

      alert("Your TAS was submitted successfully! A moderator will review your submission soon. You will be notified when it has been processed.");
      resetForm();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-10 text-slate-100">
      <div className="w-full max-w-3xl rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-xl space-y-4">

        {/* HEADER */}
        <div className="flex items-start justify-between">
          <h1 className="text-3xl font-bold">
            Submit TAS
          </h1>

          <button
            type="button"
            onClick={resetForm}
            disabled={loading}
            className={`rounded-md bg-slate-800 px-3 py-1 text-sm text-slate-300 transition hover:bg-slate-700 ${CURSOR}`}
          >
            Reset
          </button>
        </div>
        <div className="my-3 border-b border-slate-700" />

        {/* REPLAY */}
        <div>
          <div className={labelClass}>Replay (.gbx)</div>

          <label
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);

              const file = e.dataTransfer.files?.[0];
              onFileSelect(file);
            }}
            className={`
              flex h-26 cursor-pointer flex-col items-center justify-center
              rounded-xl border-2 border-dashed transition
              ${
                dragging
                  ? "border-emerald-400 bg-emerald-500/10"
                  : "border-slate-700 bg-slate-800 hover:border-slate-500"
              }
            `}
          >
            <input
              hidden
              type="file"
              accept=".gbx"
              onChange={(e) =>
                onFileSelect(e.target.files?.[0])
              }
            />

            <div className="text-lg font-medium">
              Drop replay here
            </div>

            <div className="mt-1 text-sm text-slate-400">
              or click to browse
            </div>

            {replayFile && (
              <div className={`mt-3 text-xs ${form.track ? "text-emerald-400" : "text-red-400"}`}>
                {replayFile.name} ({(replayFile.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            )}
          </label>
        </div>

        {/* TRACK AND TIME */}
        {replayFile && (
          <div className="rounded-lg bg-slate-800/60 px-4 py-3 text-sm">
            {form.track ? (
              <>
                <div>
                  Track:
                  <span className="ml-2 font-medium text-emerald-400">
                    {form.track}
                  </span>
                </div>
              
                {timeMs > 0 ? (
                  <>
                    <div className="mt-1">
                      Time:
                      <span className="ml-2 font-medium text-emerald-400">
                        {`${time.minutes > 0 ? String(time.minutes) + ":" : ""}`}
                        {String(time.seconds).padStart(2,"0")}.
                        {String(time.hundredths).padStart(2,"0")}
                        {`${trackList[form.track].game === "TM2" ? time.thousandth : ""}`}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="mt-1 font-medium text-red-400">
                    This replay may be unfinished. Please check before submitting.
                  </div>
                )}
              </>
            ) : (
              <div className="font-medium text-red-400">
                This replay does not seem to be from a nadeo track. Please check before submitting.
              </div>
            )}
          </div>
        )}

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
                  onChange={(e) => updateAuthor(index, e.target.value)}
                  className={`${inputClass} ${!author ? "text-slate-500" : "text-slate-100"} flex-1 cursor-pointer`}
                >
                  {!author && (
                    <option value="" disabled hidden>
                      Select author
                    </option>
                  )}
                  {authorOptions.map((a) => {
                    const alreadyUsed = usedAuthors.has(a.author) && a.author !== author;
                    return (
                      <option
                        key={a.author}
                        value={a.author}
                        disabled={alreadyUsed}
                        className={alreadyUsed ? "text-emerald-500" : "text-slate-100"}
                      >
                        {a.author}
                      </option>
                    );
                  })}
                </select>

                {index === 0 ? (
                  <button
                    type="button"
                    onClick={addAuthor}
                    disabled={form.authors.length >= 20}
                    className="rounded cursor-pointer bg-emerald-600 w-10 hover:bg-emerald-500 disabled:opacity-40"
                  >
                    +
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => removeAuthor(index)}
                    className="rounded cursor-pointer bg-red-800 w-10 hover:bg-red-500"
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
          <div className={labelClass}>Video URL (recommended)</div>
          <input
            value={form.video}
            onChange={(e) => update("video", e.target.value)}
            className={`${inputClass} placeholder:text-slate-500`}
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
            className={`${CURSOR} ${inputClass}
              [&::-webkit-calendar-picker-indicator]:opacity-70
              hover:[&::-webkit-calendar-picker-indicator]:opacity-100
            `}
          />
        </div>

        {/* CATEGORY */}
        <div>
          <div className={labelClass}>Category</div>
          <select
            value={form.category}
            onChange={(e) => update("category", e.target.value as Category)}
            className={`${inputClass} cursor-pointer`}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
            <option value="Unsure">
              Unsure
            </option>
          </select>
        </div>

        {/* NOTES */}
        <div>
          <div className={labelClass}>Notes (optional)</div>
          <textarea
            rows={2}
            value={form.user_notes}
            onChange={(e) => {
              const val = e.target.value;

              if (val.length <= MAX_NOTES) {
                update("user_notes", val);
              }
            }}
            onPaste={(e) => {
              const text = e.clipboardData.getData("text");
              const current = form.user_notes;
              const next = (current + text).slice(0, MAX_NOTES);
              e.preventDefault();
              update("user_notes", next);
            }}
            placeholder="Comments..."
            className={`${inputClass} placeholder:text-slate-500 resize-none`}
          />
          <div className="mt-1 flex justify-end text-xs">
            <span
              className={
                form.user_notes.length > MAX_NOTES * 0.9
                  ? "text-amber-400"
                  : "text-slate-400"
              }
            >
              {MAX_NOTES - form.user_notes.length} characters remaining
            </span>
          </div>
        </div>

        {/* SUBMIT */}
        <div className="py-2">
          {warning && (
            <div className="mb-3 rounded-md border border-red-500/40 bg-red-950/40 px-3 py-2 text-sm text-red-300">
              {warning}
            </div>
          )}

          <button
            onClick={submit}
            disabled={loading || !replayFile || form.authors.filter((a) => a.trim() !== "").length === 0}
            className={`w-full rounded-md bg-emerald-600 px-4 py-2 font-medium disabled:opacity-50 ${
              loading || !replayFile || form.authors.filter((a) => a.trim() !== "").length === 0 ? "cursor-not-allowed" : "hover:bg-emerald-500 cursor-pointer"
            }`}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>

      </div>
      
      {loading && (
        <div className="fixed inset-0 z-[9999] cursor-wait" />
      )}
    </div>
  );
}
