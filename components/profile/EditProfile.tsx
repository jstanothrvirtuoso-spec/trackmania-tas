import Image from "next/image";
import { useState } from "react";
import { ProfileDraft } from "@/utils/typing";
import {
  ProfilePrivate,
  ProfilePublic,
  useUpdateProfilePrivate,
  useUpdateProfilePublic,
} from "@/lib/Profiles";
import {
  PROFILE_AVATARS,
  PROFILE_BANNERS,
  DISPLAY_SETTINGS,
} from "@/utils/constants";

type EditMode = "avatar" | "banner" | null;

const DISPLAY_NAME_REGEX =
  /^(?! )[a-zA-Z0-9_-]+( [a-zA-Z0-9_-]+)*(?<! )$/;

export default function EditProfile({
  profilePrivate,
  profilePublicMe,
  isSaving,
  setIsSaving,
  setIsEditingProfile,
}: {
  profilePrivate: ProfilePrivate;
  profilePublicMe: ProfilePublic;
  isSaving: boolean;
  setIsSaving: (setting: boolean) => void;
  setIsEditingProfile: (setting: boolean) => void;
}) {
  const updateProfilePublic = useUpdateProfilePublic();
  const updateProfilePrivate = useUpdateProfilePrivate();

  const [editMode, setEditMode] = useState<EditMode>(null);
  const [displayNameError, setDisplayNameError] = useState<string | null>(
    null
  );

  const [draft, setDraft] = useState<ProfileDraft>(() => ({
    display_name: profilePublicMe.display_name,
    bio: profilePublicMe.bio ?? "",
    avatar: profilePublicMe.avatar ?? 0,
    banner: profilePublicMe.banner ?? 0,
    colour: profilePublicMe.colour,

    show_rta: profilePrivate.show_rta,
    show_time_saved: profilePrivate.show_time_saved,
    show_leaderboard: profilePrivate.show_leaderboard,
    show_rta_leaderboard: profilePrivate.show_rta_leaderboard,
    show_recent: profilePrivate.show_recent,
    show_visitor_counter: false,
  }));

  function updateDraft<K extends keyof ProfileDraft>(
    key: K,
    value: ProfileDraft[K]
  ) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function handleSaveProfile() {
    if (!draft.display_name || displayNameError) return;

    setIsSaving(true);

    const publicDraft = {
      display_name: draft.display_name,
      bio: draft.bio,
      avatar: draft.avatar,
      banner: draft.banner,
      colour: draft.colour,
    };

    updateProfilePublic.mutate(
      { user: profilePublicMe, profileUpdate: publicDraft },
      {
        onSuccess: () => {
          setIsSaving(false);
          setIsEditingProfile(false);
        },
        onError: () => setIsSaving(false),
      }
    );

    const privateDraft = {
      show_rta: draft.show_rta,
      show_time_saved: draft.show_time_saved,
      show_leaderboard: draft.show_leaderboard,
      show_rta_leaderboard: draft.show_rta_leaderboard,
      show_recent: draft.show_recent,
      show_visitor_counter: false,
    };

    updateProfilePrivate.mutate(privateDraft, {
      onSuccess: () => {
        setIsSaving(false);
        setIsEditingProfile(false);
      },
      onError: () => setIsSaving(false),
    });
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center p-6 z-50"
      onClick={() => setIsEditingProfile(false)}
    >
      <div
        className="text-slate-200 bg-slate-900 rounded-2xl w-full max-w-4xl p-4 md:p-8"
        onClick={(e) => e.stopPropagation()}
      >

        <h2 className="text-2xl font-bold mb-6">
          Edit Profile
        </h2>

        <div className="flex flex-col gap-6 items-center md:flex-row md:items-start">

          {/* BANNER */}
          <div className="hidden md:block md:w-80">
            {editMode !== "banner" ? (
              <button
                type="button"
                onClick={() => setEditMode("banner")}
                className="w-full max-w-[160px] aspect-[9/16] rounded-xl overflow-hidden hover:bg-slate-800 transition cursor-pointer"
              >
                <div className="relative w-full h-full banner-frame">
                  <Image
                    src={PROFILE_BANNERS[draft?.banner ?? 0]}
                    alt="Banner"
                    fill
                    className="object-cover opacity-80"
                    sizes="192px"
                  />
                </div>
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(PROFILE_BANNERS).map(([key, src]) => {
                  const id = Number(key);

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        updateDraft("banner", id);
                        setEditMode(null);
                      }}
                      className={`h-16 rounded overflow-hidden border cursor-pointer ${
                        draft?.banner === id ? "border-emerald-500" : "border-transparent"}`}
                    >
                      <Image
                        src={src}
                        alt="Banner"
                        width={100}
                        height={50}
                        className={`object-cover hover:opacity-100 transition ${
                          draft?.banner === id ? "opacity-100" : "opacity-50"}`}
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* MIDDLE */}
          <div className="flex flex-col space-y-4 items-center w-full justify-center">

            {/* AVATAR */}
            {editMode !== "avatar" ? (
              <button
                type="button"
                onClick={() => setEditMode("avatar")}
                className="w-[120px] h-[120px] rounded-full overflow-hidden hover:bg-slate-800 cursor-pointer flex justify-center items-center hover:scale-105 transition"
                style={{
                  backgroundColor: `hsl(${draft?.colour ?? 200}, 80%, 60%)`,
                }}
              >
                <Image
                  src={PROFILE_AVATARS[draft?.avatar ?? 0]}
                  alt="Avatar"
                  width={100}
                  height={100}
                  className="object-cover"
                />
              </button>
            ) : (
              <div className="flex flex-col items-center gap-3">
                
                {/* AVATAR GRID */}
                <div className="grid grid-cols-5 gap-2 w-[380px]">
                  {Object.entries(PROFILE_AVATARS).map(([key, src]) => {
                    const id = Number(key);

                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          updateDraft("avatar", id);
                          setEditMode(null);
                        }}
                        className={`h-16 rounded overflow-hidden border cursor-pointer ${
                          draft?.avatar === id
                            ? "border-emerald-500"
                            : "border-transparent"
                        }`}
                      >
                        <div className="flex justify-center">
                          <Image
                            src={src}
                            alt="Avatar"
                            width={50}
                            height={50}
                            className={`object-cover transition ${
                              draft?.avatar === id ? "opacity-100" : "opacity-50"
                            }`}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* HUE PICKER */}
                <div className="w-[380px] flex flex-col gap-2">
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={draft?.colour ?? 200}
                    onChange={(e) => updateDraft("colour", Number(e.target.value))}
                    className="w-full cursor-pointer"
                  />

                  <div
                    className="h-4 rounded-lg"
                    style={{
                      background: `linear-gradient(
                        to right,
                        hsl(0, 80%, 60%),
                        hsl(60, 80%, 60%),
                        hsl(120, 80%, 60%),
                        hsl(180, 80%, 60%),
                        hsl(240, 80%, 60%),
                        hsl(300, 80%, 60%),
                        hsl(360, 80%, 60%)
                      )`,
                    }}
                  />
                </div>

              </div>
            )}
            
            {/* DISPLAY NAME */}
            <input
              value={draft?.display_name ?? ""}
              maxLength={20}
              onChange={(e) => {
                const value = e.target.value;
                updateDraft("display_name", value);

                if (!value) {
                  setDisplayNameError("Display name is required");
                } else if (value.length < 3) {
                  setDisplayNameError("Too short (min 3 characters)");
                } else if (value.length > 20) {
                  setDisplayNameError("Too long (max 20 characters)");
                } else if (value[0] === " ") {
                  setDisplayNameError("You cannot start your display name with a space");
                } else if (!DISPLAY_NAME_REGEX.test(value)) {
                  setDisplayNameError("This display name is invalid");
                } else {
                  setDisplayNameError(null);
                }
              }}
              className="w-full p-3 bg-slate-800 rounded-xl"
              placeholder="Display Name"
            />
            {displayNameError && (
              <p className="mt-1 text-sm text-red-400">
                {displayNameError}
              </p>
            )}

            {/* BIO */}
            <textarea
              value={draft?.bio ?? ""}
              onChange={(e) =>
                updateDraft("bio", e.target.value)
              }
              className="w-full p-3 bg-slate-800 rounded-xl"
              rows={4}
              maxLength={300}
              placeholder="❝...❞"
            />
          </div>

          {/* SETTINGS PANEL */}
          <div className="rounded-3xl bg-slate-900/70 p-1">
            <h2 className="text-xl font-semibold mb-2">
              Display Settings
            </h2>

            <div className="grid gap-2.5">
              {DISPLAY_SETTINGS.map((setting) => (
                <div
                  key={setting.key}
                  className="px-3 py-2 bg-slate-800 rounded-xl flex justify-between items-center gap-5"
                >
                  <div className="whitespace-nowrap">
                    {setting.label}
                  </div>

                  <button
                    type="button"
                    onClick={() => updateDraft(setting.key, !(draft?.[setting.key] ?? true))}
                    className={`relative w-10 h-6 rounded-full transition cursor-pointer ${
                      draft?.[setting.key] ? "bg-emerald-600 hover:bg-emerald-500" : "bg-slate-700 hover:bg-slate-600"}`}
                  >
                    <div
                      className={`absolute top-1 left-1 h-4 w-4 bg-white rounded-full transition-transform duration-200 ${
                        draft?.[setting.key] ? "translate-x-4" : "translate-x-0"}`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
 
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={() => setIsEditingProfile(false)}
            className="px-5 py-3 bg-slate-700 rounded-xl cursor-pointer hover:bg-slate-600"
          >
            Cancel
          </button>

          <button
            disabled={!draft || !draft.display_name || (displayNameError?.length ?? 0) > 0 || isSaving}
            onClick={handleSaveProfile}
            className="px-5 py-3 bg-emerald-600 rounded-xl disabled:opacity-50 hover:bg-emerald-500 flex items-center justify-center cursor-pointer"
          >
            {isSaving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </div>
    </div>
  )
}
