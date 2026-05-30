
export const MAX_NOTES = 300;
export const STALE_TIME = 1000 * 60 * 60; // 60 minutes
export const MAX_REPLAY_SIZE = 10 * 1024 * 1024;  // 10 MB
export const CURSOR = "cursor-[url('/cursor.png')_0_0,_auto]";

export const PROFILE_BANNERS: Record<number, string> = {
  0: "/banners/bay.webp",
  1: "/banners/canyon.webp",
  2: "/banners/coast.webp",
  3: "/banners/desert.webp",
  4: "/banners/island.webp",
  5: "/banners/lagoon.webp",
  6: "/banners/rally.webp",
  7: "/banners/snow.webp",
  8: "/banners/stadium.webp",
  9: "/banners/valley.webp",
};

export const PROFILE_AVATARS: Record<number, string> = {
  0: "/avatars/bay.webp",
  1: "/avatars/canyon.webp",
  2: "/avatars/coast.webp",
  3: "/avatars/desert.webp",
  4: "/avatars/island.webp",
  5: "/avatars/lagoon.webp",
  6: "/avatars/rally.webp",
  7: "/avatars/snow.webp",
  8: "/avatars/stadium.webp",
  9: "/avatars/valley.webp",
};

export const PROFILE_COLOURS: Record<number, string> = {
  0: "#64748b",
  1: "#ffffff",
  2: "#ef4444",
  3: "#f97316",
  4: "#eab308",
  5: "#22c55e",
  6: "#06b6d4",
  7: "#3b82f6",
  8: "#8b5cf6",
  9: "#ec4899",
};

export const DISPLAY_SETTINGS = [
  { key: "show_rta", label: "RTA Records", desc: "Show RTA record table" },
  { key: "show_time_saved", label: "Time Saved", desc: "Display time saved table"},
  { key: "show_leaderboard", label: "Leaderboard", desc: "Show TAS leaderboard rankings" },
  { key: "show_rta_leaderboard", label: "RTA Leaderboard", desc: "Show RTA leaderboard rankings"},
  { key: "highlight_recent", label: "Highlight Recent", desc: "Highlight recently added TASes" },
  { key: "show_visitor_counter", label: "Visitor Counter", desc: "Display visitor count" },
] as const;
