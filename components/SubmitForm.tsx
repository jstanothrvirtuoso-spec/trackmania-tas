"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { timeMsToState, timeStateToMs } from "@/utils/common";
import { TimeState, Category } from "@/utils/typing";
import { MAX_NOTES, MAX_REPLAY_SIZE, CURSOR, CATEGORIES } from "@/utils/constants";
import { DropSelect } from "@/components/DropSelect";
import { useAlert } from "@/components/providers/AlertProvider";
import AuthorSelector from "@/components/AuthorSelector";
import { trackIds } from "@/lib/TrackId";
import { useProfilePublicMe } from "@/lib/Profiles";
import { trackList } from "@/lib/TrackList";
import { soundManager } from "@/lib/SoundManager";

type FormState = {
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

type ReplayState = {
  file: File | null;
  track: string;
  time: TimeState;
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

  const maxScanBytes = 8192;
  const decoder = new TextDecoder("utf-8", { fatal: false });
  const sample = decoder.decode(
    buffer.byteLength <= maxScanBytes ? buffer : buffer.slice(0, maxScanBytes)
  );

  let uid = sample.match(/<challenge uid="([^"]+)"/)?.[1] ?? sample.match(/<map uid="([^"]+)"/)?.[1] ?? null;
  let bestTimeRaw = sample.match(/<times best="(\d+)"/)?.[1];
  let version = sample.match(/<header[^>]*version="([^"]+)"/)?.[1] ?? null;
  let stuntScoreRaw = sample.match(/stuntscore="(\d+)"/)?.[1];
  let validableRaw = sample.match(/validable="(\d+)"/)?.[1];

  if (
    buffer.byteLength > maxScanBytes &&
    (uid === null || bestTimeRaw === undefined || version === null || stuntScoreRaw === undefined || validableRaw === undefined)
  ) {
    const text = decoder.decode(buffer);
    uid = uid ?? text.match(/<challenge uid="([^"]+)"/)?.[1] ?? text.match(/<map uid="([^"]+)"/)?.[1] ?? null;
    bestTimeRaw = bestTimeRaw ?? text.match(/<times best="(\d+)"/)?.[1];
    version = version ?? text.match(/<header[^>]*version="([^"]+)"/)?.[1] ?? null;
    stuntScoreRaw = stuntScoreRaw ?? text.match(/stuntscore="(\d+)"/)?.[1];
    validableRaw = validableRaw ?? text.match(/validable="(\d+)"/)?.[1];
  }

  return {
    uid,
    bestTime: bestTimeRaw ? Number(bestTimeRaw) : null,
    version,
    stuntScore: stuntScoreRaw ? Number(stuntScoreRaw) : null,
    validable: validableRaw ? validableRaw === "1" : null,
  };
}

const supabase = createClient();
const inputClass = "w-full rounded-md bg-slate-800 px-3 py-2 text-slate-100";
const labelClass = "text-sm text-slate-300 py-0.5";

export default function SubmitForm() {

  const { data: profilePublicMe } = useProfilePublicMe();
  const { showAlert } = useAlert();
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [warning, setWarning] = useState("");

  const [form, setForm] = useState<FormState>({
    authors: [],
    category: "Open",
    video: "",
    user_notes: "",
    date: today,
  });

  const [replay, setReplay] = useState<ReplayState>({
    file: null,
    track: "",
    time: timeMsToState(0),
  });

  const timeMs = timeStateToMs(replay.time);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function resetForm() {
    setReplay({ file: null, track: "", time: timeMsToState(0) });
    setForm({
      authors: [],
      category: "Open",
      video: "",
      user_notes: "",
      date: today,
    });
    setWarning("");
  }

  async function onFileSelect(file?: File) {

    setReplay({ file: null, track: "", time: timeMsToState(0) });

    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".gbx")) {
      showAlert("Only .gbx files allowed");
      return;
    }

    if (file.size > MAX_REPLAY_SIZE) {
      showAlert("Replay exceeds 10 MB limit");
      return;
    }

    const parsed = await parseGBX(file);
    if (!parsed.uid) {
      showAlert("Invalid replay file");
      return;
    }

    setReplay({
      file,
      track: trackIds[parsed.uid] ?? trackIds[`${parsed.uid}-${parsed.version}`] ?? "",
      time: parsed.bestTime && parsed.validable ? timeMsToState(parsed.bestTime) : timeMsToState(0),
    });
  }

  async function submit() {

    if (loading) return;

    setLoading(true);
    setWarning("");

    try {

      if (!replay.file) {
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

      if (!profilePublicMe?.id) {
        setWarning("Please log in to submit a TAS");
        return;
      }

      const game = trackList[replay.track]?.game;
      const filePath = `pending/${profilePublicMe.id}/${crypto?.randomUUID?.() ?? Date.now()}.gbx`;

      const { error: uploadError } = await supabase.storage
        .from("replays")
        .upload(filePath, replay.file);

      if (uploadError) {
        setWarning(`Replay error: ${uploadError.message}`);
        return;
      }

      const payload = {
        game,
        track: replay.track,
        category: form.category,
        time_ms: timeMs ?? null,
        authors: cleanAuthors,
        date: new Date(form.date).toISOString(),
        video: videoUrl || null,
        user_notes: form.user_notes.trim() || null,
        replay_path: filePath,
        file_name: replay.file.name,
        submitted_by: profilePublicMe.id,
        submitted_by_name: profilePublicMe?.display_name ?? null,
        status: "pending",
      };

      const { error } = await supabase
        .from("tas_submissions")
        .insert(payload);

      if (error) {
        setWarning(`Submission error: ${error.message}`);
        await supabase.storage.from("replays").remove([filePath]);
        return;
      }

      showAlert("Your TAS was submitted successfully! A moderator will review your submission soon. You will be notified when it has been processed.");
      resetForm();
    } finally {
      setLoading(false);

      soundManager.play("send")
    }
  }

  return (
    <div className="relative z-10 overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-xl">
      <div className="flex max-h-[calc(100vh-6rem)] flex-col overflow-hidden rounded-2xl shadow-2xl">
        <div className="overflow-y-auto p-6 md:p-8">

          {/* HEADER */}
          <div className="flex items-start justify-between">
            <h1 className="text-3xl font-bold">
              Submit TAS
            </h1>
            <button 
              type="button"
              onClick={resetForm}
              disabled={loading}
              title="Clear the form"
              className="rounded-md bg-slate-800 px-3 py-1 text-sm text-slate-300 transition hover:bg-slate-700 cursor-pointer"
            >
              Reset
            </button>
          </div>
          <div className="my-3 border-b border-slate-700" />

          <div className="flex flex-col gap-2">

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
                  onChange={(e) => onFileSelect(e.target.files?.[0])}
                />

                <div className="text-lg font-medium">Drop replay here</div>
                <div className="mt-1 text-sm text-slate-400">or click to browse</div>

                {replay.file && (
                  <div className={`mt-3 text-xs ${replay.track ? "text-emerald-400" : "text-red-400"}`}>
                    {replay.file.name} ({(replay.file.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                )}
              </label>
            </div>

            {/* TRACK AND TIME */}
            {replay.file && (
              <div className="rounded-lg bg-slate-800/60 px-4 py-3 text-sm">
                {replay.track ? (
                  <>
                    <div>
                      Track:
                      <span className="ml-2 font-medium text-emerald-400">{replay.track}</span>
                    </div>
                    {timeMs > 0 ? (
                      <div className="mt-1">
                        Time:
                        <span className="ml-2 font-medium text-emerald-400">
                          {`${replay.time.minutes > 0 ? String(replay.time.minutes) + ":" : ""}`}
                          {String(replay.time.seconds).padStart(2, "0")}.
                          {String(replay.time.hundredths).padStart(2, "0")}
                          {`${trackList[replay.track].game === "TM2" ? replay.time.thousandth : ""}`}
                        </span>
                      </div>
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
            <AuthorSelector authors={form.authors} onChange={(next) => update("authors", next)} />

            {/* VIDEO */}
            <div>
              <div className="flex items-center w-full">
                <div className={labelClass}>Video (recommended)</div>
                <div className="group relative ml-auto cursor-help px-1 py-0.5">
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border text-[10px]">?</span>
                  <div className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 w-66 -translate-x-58 rounded-lg border border-zinc-700 bg-zinc-900 p-3 text-xs text-zinc-200 opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
                    Provide a video URL for your TAS. YouTube is preferred (even if unlisted), but Streamable or Discord videos will be accepted. You must provide a video for your TAS to be eligible for TAS of the Day.
                  </div>
                </div>
              </div>
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
                className={`${CURSOR} ${inputClass} [&::-webkit-calendar-picker-indicator]:opacity-70 hover:[&::-webkit-calendar-picker-indicator]:opacity-100`}
              />
            </div>

            {/* CATEGORY */}
            <div>
              <div className="flex items-center w-full">
                <div className={labelClass}>Category (optional)</div>
                <div className="group relative ml-auto cursor-help px-1 py-0.5">
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border text-[10px]">?</span>
                  <div className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 w-66 -translate-x-58 rounded-lg border border-zinc-700 bg-zinc-900 p-3 text-xs text-zinc-200 opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
                    You may indicate the target category for your TAS. Note, this may be updated by the moderators at any time. Please see the About page for more info on TAS categories.
                  </div>
                </div>
              </div>
              
              <DropSelect
                initialValue={form.category}
                options={[...CATEGORIES, "Unsure"].map((category) => ({
                  value: category,
                  label: category,
                }))}
                onChange={(value) => update("category", value as Category | "Unsure")}
                fullWidth={true}
              />
            </div>

            {/* NOTES */}
            <div>
              <div className="flex items-center w-full">
                <div className={labelClass}>Notes (optional)</div>
                <div className="group relative ml-auto cursor-help px-1 py-0.5">
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border text-[10px]">?</span>
                  <div className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 w-58 -translate-x-50 rounded-lg border border-zinc-700 bg-zinc-900 p-3 text-xs text-zinc-200 opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
                    These notes are visible only to the moderators. Write any information that may be needed to process the TAS.
                  </div>
                </div>
              </div>
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
                <span className={form.user_notes.length > MAX_NOTES * 0.9 ? "text-amber-400" : "text-slate-400"}>
                  {MAX_NOTES - form.user_notes.length} characters remaining
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SUBMIT */}
        <div className="border-t border-slate-700 bg-slate-950/50 px-6 py-4">
          {warning && (
            <div className="mb-3 rounded-md border border-red-500/40 bg-red-950/40 px-3 py-2 text-sm text-red-300">
              {warning}
            </div>
          )}

          <button
            onClick={submit}
            disabled={
              loading || !replay.file || form.authors.filter((a) => a.trim() !== "").length === 0
            }
            className={`w-full rounded-md bg-emerald-600 px-4 py-2 font-medium disabled:opacity-50 ${
              loading || !replay.file || form.authors.filter((a) => a.trim() !== "").length === 0 ? "cursor-not-allowed" : "hover:bg-emerald-500 cursor-pointer"
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
