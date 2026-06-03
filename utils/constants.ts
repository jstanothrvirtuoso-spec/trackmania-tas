
import { Category, Game } from "./typing";

//////////////////////////////////////////////////////////////
// Small constants //
//////////////////////////////////////////////////////////////

export const MAX_NOTES = 300;
export const STALE_TIME = 1000 * 60 * 60; // 60 minutes
export const MAX_REPLAY_SIZE = 10 * 1024 * 1024;  // 10 MB
export const CURSOR = "cursor-[url('/cursor.png')_0_0,_auto]";


//////////////////////////////////////////////////////////////
// TrackMania TAS info //
//////////////////////////////////////////////////////////////

export const GAME_LIST = ["TMNF", "TMNF No Cut", "ESWC", "TMN Remakes", "TMUF", "StarTrack", "TMS", "TMO", "Demo/Beta", "TM2"] as const;

export const ENVIRONMENT = ["All", "Stadium", "Island", "Desert", "Rally", "Bay", "Coast", "Snow", "Canyon", "Stadium²", "Valley", "Lagoon"] as const;

export const CATEGORIES = ["Open", "NOseboost", "No Uber", "WR Route", "No Cut", "Low Input"] as const;
export const CATEGORY_ORDER = Object.fromEntries(CATEGORIES.map((c, i) => [c, i]));

export const GRAPH_CATEGORIES = ["Open", "NOseboost", "No Uber", "WR Route", "No Cut", "RTA"] as const;


export const GAME_SETS: Record<Game, string[]> = {
  "TMNF": ["White", "Green", "Blue", "Red", "Black"],
  "TMNF No Cut": ["White", "Green", "Blue", "Red", "Black"],
  "ESWC": ["Beginner", "Advanced", "Expert", "Pro", "Bonus"],
  "TMN Remakes": ["Beginner", "Advanced", "Expert", "Pro", "Bonus"],
  "TMUF": ["White", "Green", "Blue", "Red", "Black", "TMU", "Platform", "Puzzle", "Stunt", "StuntRace"],
  "StarTrack": ["White", "Green", "Blue", "Red", "Black"],
  "TMS": ["Race", "Extreme", "Crazy", "Bonus", "Platform", "Puzzle", "Stunt", "StuntRace", "Remix"],
  "TMO": ["Race", "Survival", "Platform", "Puzzle", "Stunt", "StuntRace"],
  "Demo/Beta": ["TM Demo 1", "TM Demo 2", "TMPU Demo", "TMO Demo", "TMS Beta", "TMSX Demo", "Stunt", "TMU Beta", "TMNF Prerelease", "ESWC Beta", "TMX 22nd Anniversary", "TMSX Demo Stunt"],
  "TM2": ["Canyon", "Stadium", "Valley", "Lagoon", "Platform", "Beta"],
} as const;

export const GAME_SLUGS: Record<string, Game> = {
  "tmnf": "TMNF",
  "eswc": "ESWC",
  "tmn-remakes": "TMN Remakes",
  "tmuf": "TMUF",
  "star-track": "StarTrack",
  "tms": "TMS",
  "tmo": "TMO",
  "demo-beta": "Demo/Beta",
  "tm2": "TM2"
}

export const CATEGORY_FILTERS: Record<Category | "RTA", Set<Category | "RTA">> = {
  "Open": new Set(["Open", "NOseboost", "No Uber", "WR Route", "No Cut"]),
  "NOseboost": new Set(["NOseboost", "No Uber", "WR Route", "No Cut"]),
  "No Uber": new Set(["No Uber", "WR Route", "No Cut"]),
  "WR Route": new Set(["WR Route", "No Cut"]),
  "No Cut": new Set(["No Cut"]),
  "Low Input": new Set(["Low Input"]),
  "RTA": new Set(["RTA"])
} as const;



//////////////////////////////////////////////////////////////
// General //
//////////////////////////////////////////////////////////////

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

export const CATEGORY_COLOURS: Record<string, [string, string, string]> = {
  "Open": ["#c271f8", "bg-[#c271f8]/30", "bg-[#c271f8]/40"],
  "NOseboost": ["#60a5fa", "bg-[#60a5fa]/30", "bg-[#60a5fa]/40"],
  "No Uber": ["#34d399", "bg-[#34d399]/20", "bg-[#34d399]/30"],
  "WR Route": ["#ffc637", "bg-[#ffc637]/20", "bg-[#ffc637]/30"],
  "No Cut": ["#4d59ff", "bg-[#4d59ff]/20", "bg-[#4d59ff]/30"],
  "RTA": ["#fa5252", "bg-[#fa5252]/20", "bg-[#fa5252]/30"],
  "Low Input": ["#000000", "bg-[#000000]/30", "bg-[#000000]/50"],
} as const;

export const BADGE_RANKS = {
  "TAS": [2, 5, 10, 20, 40, 60, 80, 100],
  "Contributions": [1.5, 2.5, 5, 10, 20, 40, 70, 100],
  "Saved": [5, 15, 30, 60, 90, 120, 240, 360]
} as const;

export const BADGE_IMAGES = [
  "novice.png",
  "apprentice.png",
  "adept.png",
  "expert.png",
  "elite.png",
  "master.png",
  "legend.png",
  "mythic.png",
] as const;

export const KEY_AUTHORS = [
  "Kimura",
  "DELETE_CLUB",
  "BdcapTAS",
  "igntuL",
  "Bice",
  "mufattmf",
  "CrizpyCheese",
  "charlie",
  "Thoman",
  "ezmTAS",
  "Ibozz91",
  "MidnightEuphoria",
  "Oogy749",
  "Gl1tch3D",
  "Miku",
  "fabi",
  "LittleD3m0",
  "caleb",
  "xnferno",
  "faiby",
  "TTR_Mc 77",
  "Arkes",
  "trabadia",
  "Virtuoso",
  "threadd",
  "Alex",
  "plastorex",
  "Molosii",
  "XvX",
  "Thunder",
  "Don Johnson",
  "maB-TM",
  "Q0uut",
  "Jsap",
  "Winterly",
  "Lukalyc",
  "exlpt",
]
