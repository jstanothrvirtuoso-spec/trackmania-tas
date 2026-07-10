"use client";

import { useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { formatGame, formatTime } from "@/utils/formatting";
import { CATEGORIES, GAME_LIST, MAX_REPLAY_SIZE } from "@/utils/constants";
import { SubmitForm, TimeState, Game, Category, TasEntry, GameSet, ReplayState } from "@/utils/typing";
import { getReplayURL, parseGbx, timeMsToState, timeStateToMs } from "@/utils/common";
import { useAlert } from "@/components/providers/AlertProvider";
import { useConfirm } from "@/components/providers/ConfirmProvider";
import { useAuthors } from "@/lib/Authors";
import { useTasRecords } from "@/lib/TasRecords";
import { getGameSetOptions, TRACKS, tracksByGame } from "@/lib/TrackList";
import { DropSelect } from "@/components/DropSelect";
import { trackIds } from "@/lib/TrackId";
import AuthorSelector from "@/components/AuthorSelector";
import TrackRecords from "./TrackRecords";
import TasSubmissions from "./TasSubmissions";

export type TasForm = {
  game: Game;
  gameSet: GameSet;
  track: string;
  category: Category;
  num_inputs: number;
  authors: string[];
  date: string;
  video: string;
  replay_path: string;
};

const supabase = createClient();
const TODAY = new Date().toISOString().split("T")[0];
const INPUT = "w-full rounded-md bg-slate-800 px-3 py-1.5 text-white outline-none focus:ring-2 focus:ring-slate-500";
const LABEL = "text-sm text-slate-300 mb-0.5";
const REPLAY_OPTIONS = ["Keep existing", "Replace"] as const;
type ReplayOptions = (typeof REPLAY_OPTIONS)[number];

function timesEqual(a: TimeState, b: TimeState): boolean {
  return (
    a.minutes === b.minutes &&
    a.seconds === b.seconds &&
    a.hundredths === b.hundredths &&
    a.thousandth === b.thousandth
  );
}

export default function AdminTas() {

  const { showAlert } = useAlert();
  const confirm = useConfirm();
  const queryClient = useQueryClient();
  const [warning, setWarning] = useState("");
  const [loading, setLoading] = useState(false);
  const [adminNote, setAdminNote] = useState("");
  const [dragging, setDragging] = useState(false);
  const [selectedReplayOption, setSelectedReplayOption] = useState<ReplayOptions>("Keep existing")
  const [selectedSubmission, setSelectedSubmission] = useState<SubmitForm | null>(null);
  const [selectedCopiedTas, setSelectedCopiedTas] = useState<TasEntry | null>(null);

  const { data: authorData = [] } = useAuthors();
  const { data: tasRecords = [] } = useTasRecords();
  
  const [replay, setReplay] = useState<ReplayState>({
    file: null,
    track: "",
    time: timeMsToState(0),
    timeMs: 0,
  });

  const [form, setForm] = useState<TasForm>({
    game: "TMNF",
    gameSet: "White",
    track: "",
    category: "Open",
    num_inputs: 0,
    authors: ["Kimura"],
    date: TODAY,
    video: "",
    replay_path: "",
  });

  const [time, setTime] = useState<TimeState>({
    minutes: 0,
    seconds: 0,
    hundredths: 0,
    thousandth: 0,
  });

  const isStunt = form.track ? TRACKS[form.track]?.gameSet === "Stunt" : false;
  const timeMs = timeStateToMs(time);
  const gameSetOptions = getGameSetOptions(form.game);
  const trackOptions = tracksByGame[form.game].filter((track) => TRACKS[track].gameSet === form.gameSet);

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

    setSelectedSubmission(null);
    setSelectedCopiedTas(null);
    setSelectedReplayOption("Keep existing");

    setForm({
      game: form.game,
      gameSet: form.gameSet,
      track: form.track,
      category: "Open",
      num_inputs: 0,
      authors: ["Kimura"],
      date: TODAY,
      video: "",
      replay_path: "",
    });

    setTime({
      minutes: 0,
      seconds: 0,
      hundredths: 0,
      thousandth: 0,
    });

    setReplay({ file: null, track: "", time: timeMsToState(0), timeMs: 0 });
    setWarning("");
  }

  function updateGame(game: Game) {
    update("game", game);
    const gameSetOptions = getGameSetOptions(game);
    update("gameSet", gameSetOptions[0])
  }
  
  function copySubmissionToForm(submission: SubmitForm) {

    const category = submission.category && submission.category != "Unsure" ? submission.category : "Open"

    getSubmissionReplayData(submission.replay_path, submission.file_name);
    setSelectedSubmission(submission);
    setSelectedCopiedTas(null);
    setForm({
      game: submission.game ?? "TMNF",
      gameSet: submission.track ? TRACKS[submission.track].gameSet : "White",
      track: submission.track ?? "",
      category: category,
      num_inputs: 0,
      authors: Array.isArray(submission.authors) ? submission.authors : [],
      date: submission.date?.slice(0, 10) ?? TODAY,
      video: submission.video ?? "",
      replay_path: "",
    });
    setTime(timeMsToState(Math.abs(submission.time_ms ?? 0)));
  }

  async function copyTasToForm(tas: TasEntry) {

    setReplay({ file: null, track: "", time: timeMsToState(0), timeMs: 0 });
    const replayURL = getReplayURL(tas.game, tas.track, tas.time_ms, tas.replay_path);

    if (replayURL) {
      
      setLoading(true);

      try {
        const res = await fetch(`/api/download-replay?url=${encodeURIComponent(replayURL)}`);

        if (!res.ok) {
          showAlert("Failed to download replay.");
          return;
        }

        const blob = await res.blob();
        const totalSeconds = Math.floor(tas.time_ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const centiseconds = Math.floor((tas.time_ms % 1000) / 10);
        const timeString = `${String(minutes).padStart(2, "0")}'${String(seconds).padStart(2, "0")}''${String(centiseconds).padStart(2, "0")}`;
        const file = new File(
          [blob],
          `${tas.track} TAS (${timeString}).Replay.Gbx`,
          { type: "application/octet-stream" }
        );

        await onFileSelect(file);
      } finally {
        setLoading(false);
      }
    }

    setSelectedSubmission(null);
    setSelectedCopiedTas(tas);
    setForm({
      game: tas.game,
      gameSet: TRACKS[tas.track].gameSet,
      track: tas.track,
      category: tas.category,
      num_inputs: tas.num_inputs ?? 0,
      authors: tas.authors,
      date: tas.date.slice(0, 10),
      video: tas.video ?? "",
      replay_path: tas.replay_path ?? "",
    });
    setTime(timeMsToState(Math.abs(tas.time_ms)));
  }

  async function onFileSelect(file?: File) {

    setReplay({ file: null, track: "", time: timeMsToState(0), timeMs: 0 });

    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".gbx")) {
      showAlert("Only .gbx files allowed");
      return;
    }

    if (file.size > MAX_REPLAY_SIZE) {
      showAlert("Replay exceeds 10 MB limit");
      return;
    }

    const parsed = await parseGbx(file);
    if (!parsed.uid) {
      showAlert("Invalid replay file");
      return;
    }

    setReplay({
      file,
      track: trackIds[parsed.uid] ?? trackIds[`${parsed.uid}-${parsed.version}`] ?? "",
      time: parsed.bestTime && parsed.validable ? timeMsToState(parsed.bestTime) : timeMsToState(0),
      timeMs: parsed.bestTime && parsed.validable ? parsed.bestTime : 0,
    });
  }

  async function deleteTas(tas: TasEntry) {

    setLoading(true);
    try {
      const confirmed = await confirm(`
        Delete ${tas.track} (${tas.category}) by ${tas.authors.join(", ")}?
          Time (ms): ${tas.time_ms}
          Formatted Time: ${formatTime(tas.time_ms, tas.game === "TM2")}\n
        This cannot be undone!`
      );

      if (!confirmed) return;

      const { error } = await supabase
        .from("tas_records")
        .delete()
        .eq("track", tas.track)
        .eq("category", tas.category)
        .eq("time_ms", tas.time_ms);
      
      if (tas.replay_path) {
        await deleteReplay(tas.replay_path, tas.game, tas.track)
      }

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

  async function uploadReplay() {

    if (!replay.file) {
      setWarning("Replay migration failed.");
      return;
    };

    const formData = new FormData();

    formData.append("file", replay.file);
    formData.append("game", form.game);
    formData.append("track", form.track);

    const response = await fetch("/api/upload-replay", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      setWarning("Replay migration failed.");
      return;
    };

    const { replayUid } = await response.json();

    return replayUid;
        
  }

  async function deleteReplay(replay_path: string, game: Game, track: string) {

    const response = await fetch("/api/delete-replay", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        replayPath: replay_path,
        game: game,
        track: track,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to delete replay");
    }

  }

  async function handleSubmit() {

    setLoading(true)

    try {

      {/* Checks */}
      if (timeMs === 0) {
        showAlert("Please fill in the replay time!");
        return;
      }

      {/* New TAS */}
      if (!selectedCopiedTas) {

        {/* Add without replay */}
        if (!replay.file) {
          await submit(null);
          return;
        }

        {/* Add with replay */}
        const replayUid = await uploadReplay();
        await submit(replayUid);
        return;
      }

      {/* Edit TAS */}
      {/* No existing replay */}
      if (!form.replay_path) {

        {/* Stay as nothing */}
        if (!replay.file) {
          await submit(null);
          return;
        }

        {/* Add new replay */}
        const replayUid = await uploadReplay();
        await submit(replayUid);
        return;
      }

      {/* Existing replay */}
      if (form.replay_path) {

        {/* Keep existing */}
        if (selectedReplayOption === "Keep existing") {
          await submit(form.replay_path);
          return;
        }

        {/* Replace with new file */}
        await deleteReplay(form.replay_path, form.game, form.track);
        const replayUid = await uploadReplay();
        await submit(replayUid);
        return;
      }

    } finally {
      resetForm();
      setLoading(false)
    }
  }

  async function processSubmission(status: "approved" | "rejected") {

    if (!selectedSubmission) return;
    setLoading(true);

    try {

      const oldPath = selectedSubmission.replay_path;
      const filename = oldPath.split("/").pop() ?? "";
      const newPath = `${status}/${selectedSubmission.submitted_by}/${filename}`;

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

        const response = await fetch("/api/approve-submission", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            replayPath: newPath,
            game: selectedSubmission.game,
            track: selectedSubmission.track,
          }),
        });

        if (!response.ok) {
          setWarning("Replay migration failed.");
          return;
        }

        const { replayUid } = await response.json();
        
        await submit(replayUid)
      }

      queryClient.setQueryData(["tas_submissions"],
        (old: SubmitForm[] | undefined) => old?.filter((x) => x.id !== selectedSubmission.id)
      );

      await queryClient.invalidateQueries({
        queryKey: ["tas_submissions"],
      });

      setAdminNote("");
      resetForm();
    } finally {
      setLoading(false);
    }
  }

  async function submit(replayUid: string | null) {

    setWarning("");

    if (!form.track) {
      setWarning("Please select a track.");
      return;
    }

    if (timeMs <= 0) {
      setWarning("Please set the time");
      return;
    }

    // Upsert TAS record
    const payload = {
      game: form.game,
      track: form.track,
      category: form.category,
      num_inputs: form.num_inputs || null,
      time_ms: isStunt ? -timeMs : timeMs,
      date: new Date(form.date).toISOString(),
      video: form.video || null,
      replay_path: replayUid,
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
  }

  async function getSubmissionReplayData(replayPath: string, fileName: string) {
    if (!replayPath) return;

    setLoading(true);

    try {
      const { data, error } = await supabase.storage
        .from("replays")
        .createSignedUrl(replayPath, 60 * 5);

      if (error || !data?.signedUrl) return;

      const res = await fetch(data.signedUrl);

      if (!res.ok) {
        showAlert("Failed to download replay.");
        return;
      }

      const blob = await res.blob();

      const file = new File(
        [blob],
        fileName || "replay.gbx",
        { type: "application/octet-stream" }
      );

      await onFileSelect(file);

    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex justify-center px-6 pt-20 pb-10 text-white bg-slate-950 min-h-screen">
      <div className="grid gap-4 lg:grid-cols-[460px_1fr] items-start">

        {/* TAS submission form */}
        <div className={`rounded-2xl border border-slate-700 p-4 shadow-xl ${selectedSubmission ? "bg-sky-400/10" : selectedCopiedTas ? "bg-emerald-500/10" : "bg-slate-900"}`}>
          <div className="mb-3 border-b border-slate-700 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-semibold">
                  TAS Submission
                </h1>

                <div className="mt-1 text-sm text-slate-400 italic">
                  {`${selectedSubmission ? "Processing user submission" : selectedCopiedTas ? "Editing existing TAS" : "Adding new TAS"}`}
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
              <div className={LABEL}>Game</div>
              {selectedCopiedTas ? (
                <span className="text-sm text-slate-400 pl-3">{form.game}</span>
              ) : (
                <DropSelect
                  initialValue={form.game}
                  options={GAME_LIST
                    .filter((game) => !["TMUF No Cut", "TMNF No Cut"].includes(game))
                    .map((game) => ({
                      value: game,
                      label: formatGame(game),
                    }))
                  }
                  onChange={(value) => updateGame(value)}
                  fullWidth={true}
                />
              )}
            </div>

            {/* GAME SET */}
            <div>
              <div className={LABEL}>Game Set</div>
              {selectedCopiedTas ? (
                <span className="text-sm text-slate-400 pl-3">{form.gameSet}</span>
              ) : (
                <DropSelect
                  initialValue={form.gameSet}
                  options={gameSetOptions.map((gameSet) => ({
                    value: gameSet,
                    label: gameSet,
                  }))}
                  onChange={(value) => update("gameSet", value)}
                  fullWidth={true}
                />
              )}
            </div>

            {/* TRACK */}
            <div>
              <div className={LABEL}>Track</div>
              {selectedCopiedTas ? (
                <span className="text-sm text-slate-400 pl-3">{form.track}</span>
              ) : (
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
              )}
            </div>

            {/* CATEGORY */}
            <div>
              <div className={LABEL}>Category</div>
              {selectedCopiedTas ? (
                <span className="text-sm text-slate-400 pl-3">{form.category}</span>
              ) : (
                <DropSelect
                  initialValue={form.category}
                  options={CATEGORIES.map((category) => ({
                    value: category,
                    label: category,
                  }))}
                  onChange={(value) => update("category", value as Category)}
                  fullWidth={true}
                />
              )}
            </div>

            {/* TIME */}
            <div>
              <div className={LABEL}>Time (minutes | seconds | hundreths | thousandth)</div>

              {!selectedCopiedTas && (
                <div className="grid grid-cols-4 gap-2">
                  <input
                    type="number"
                    min={0}
                    max={60}
                    className={INPUT}
                    value={time.minutes}
                    onChange={(e) =>
                      setTime((t) => ({ ...t, minutes: Number(e.target.value) }))
                    }
                  />

                  <input
                    type="number"
                    min={0}
                    max={59}
                    className={INPUT}
                    value={time.seconds}
                    onChange={(e) =>
                      setTime((t) => ({ ...t, seconds: Number(e.target.value) }))
                    }
                  />

                  <input
                    type="number"
                    min={0}
                    max={99}
                    className={INPUT}
                    value={time.hundredths}
                    onChange={(e) =>
                      setTime((t) => ({ ...t, hundredths: Number(e.target.value) }))
                    }
                  />

                  <input
                    type="number"
                    min={0}
                    max={9}
                    className={INPUT}
                    value={time.thousandth}
                    onChange={(e) =>
                      setTime((t) => ({ ...t, thousandth: Number(e.target.value) }))
                    }
                  />
                </div>
              )}

              <div className="mt-2 text-sm text-slate-400 pl-3">
                {`Formatted time: ${formatTime(isStunt ? -timeMs : timeMs, time.thousandth > 0)} ${isStunt ? "(Stunt points)" : ""}`}
              </div>
              <div className="text-sm text-slate-400 pl-3">
                Database time: {timeMs} ms
              </div>
            </div>

            {/* NUM INPUTS */}
            {form.category === "Low Input" && (
              <div>
                <div className={LABEL}>Num Inputs (Low Input TASes only)</div>

                <div className="grid grid-cols-4 gap-2">
                  <input
                    type="number"
                    min={0}
                    max={60}
                    className={INPUT}
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
              <div className={LABEL}>Date</div>
              <input
                type="date"
                className={INPUT}
                value={form.date}
                onChange={(e) => update("date", e.target.value)}
              />
            </div>

            {/* VIDEO */}
            <div>
              <div className="mb-0.5 flex items-center justify-between">
                <div className={LABEL}>{"Video"}</div>

                <button
                  type="button"
                  disabled={form["video"].length === 0}
                  onClick={() => window.open(form["video"], "_blank")}
                  className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300 hover:bg-slate-700 disabled:opacity-40"
                >
                  Check URL
                </button>
              </div>

              <input
                className={`placeholder:text-slate-500 ${INPUT}`}
                value={form["video"]}
                onChange={(e) => update("video", e.target.value)}
                placeholder={"https://youtu.be/<id>"}
              />
            </div>
            
            {/* REPLAY */}
            <div className="flex flex-col gap-2">
              <div className="flex flex-row justify-between w-full items-end">
                <div className={LABEL}>Replay (.gbx)</div>

                {form.replay_path && (
                  <DropSelect
                    initialValue={selectedReplayOption}
                    options={REPLAY_OPTIONS.map((replayOption) => ({
                      value: replayOption,
                      label: replayOption,
                    }))}
                    onChange={(value) => setSelectedReplayOption(value)}
                  />
                )}
              </div>
              
              {(!form.replay_path || (form.replay_path && selectedReplayOption === "Replace")) && (
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
                  className={`flex h-26 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition
                    ${dragging ? "border-emerald-400 bg-emerald-500/10" : "border-slate-700 bg-slate-800 hover:border-slate-500"}`}
                >
                  <input
                    hidden
                    type="file"
                    accept=".gbx"
                    onChange={(e) => onFileSelect(e.target.files?.[0])}
                  />

                  <div className="text-lg font-medium text-slate-200">Drop replay here</div>
                  <div className="mt-1 text-sm text-slate-400">or click to browse</div>

                  {replay.file && (
                    <div className={`mt-3 text-xs ${replay.track ? "text-emerald-400" : "text-red-400"}`}>
                      {replay.file.name} ({(replay.file.size / 1024 / 1024).toFixed(2)} MB)
                    </div>
                  )}
                </label>
              )}

              {/* TRACK AND TIME */}
              {replay.file && (
                <div className="rounded-lg px-4 py-3 text-sm bg-slate-800/60">
                  {replay.track ? (
                    <>
                      <div className="text-slate-300">
                        Track:
                        <span className={`ml-2 font-medium ${replay.track === form.track ? "text-emerald-400" : "text-red-400"}`}>
                          {replay.track}
                          {replay.track === form.track ? " (Match)" : " (DOES NOT MATCH!)"}
                        </span>
                      </div>
                      {replay.timeMs ? (
                        <div className="mt-1 text-slate-300">
                          Time:
                          <span className={`ml-2 font-medium ${timesEqual(replay.time, time) ? "text-emerald-400" : "text-red-400"}`}>
                            {`${replay.time.minutes > 0 ? String(replay.time.minutes) + ":" : ""}`}
                            {String(replay.time.seconds).padStart(2, "0")}.
                            {String(replay.time.hundredths).padStart(2, "0")}
                            {`${TRACKS[replay.track].game === "TM2" ? replay.time.thousandth : ""}`}
                            {timesEqual(replay.time, time) ? " (Match)" : " (DOES NOT MATCH!)"}
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
            </div>

            {/* SUBMIT */}
            <div>
              {warning && (
                <div className="my-3 rounded-md border border-red-500/40 bg-red-950/40 px-3 py-2 text-sm text-red-300">
                  {warning}
                </div>
              )}

              {!selectedSubmission ? (
                <button
                  onClick={() => handleSubmit()}
                  disabled={loading}
                  className="w-full mt-3 rounded-md bg-emerald-600 px-4 py-2 font-medium hover:bg-emerald-500 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? "Please wait..." : "Submit"}
                </button>
              ) : (
                <div className="space-y-3">
                  
                  <div className={LABEL}>Admin note (mainly to give user reason for rejection)</div>
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
          <TasSubmissions
            selectedSubmission={selectedSubmission}
            copySubmissionToForm={copySubmissionToForm}
            setLoading={setLoading}
          />
          
          {/* Existing Track Records */}
          <TrackRecords
            track={form.track}
            category={form.category}
            isStunt={isStunt}
            records={trackTases}
            selectedCopiedTas={selectedCopiedTas}
            setLoading={setLoading}
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
