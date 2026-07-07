
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

export const GAME_LIST = ["TMNF", "TMNF No Cut", "ESWC", "TMN Remakes", "TMUF", "TMUF No Cut", "StarTrack", "TMS", "TMO", "Demo/Beta", "TM2"] as const;

export const ENVIRONMENT = ["Stadium", "Island", "Desert", "Rally", "Bay", "Coast", "Snow", "Canyon", "Stadium²", "Valley", "Lagoon"] as const;

export const CATEGORIES = ["Open", "NOseboost", "No Uber", "WR Route", "No Cut", "Low Input"] as const;
export const CATEGORY_ORDER = Object.fromEntries(CATEGORIES.map((c, i) => [c, i]));

export const GRAPH_CATEGORIES = ["Open", "NOseboost", "No Uber", "WR Route", "No Cut", "RTA"] as const;

export const GAME_SETS: Record<Game, string[]> = {
  "TMNF": ["White", "Green", "Blue", "Red", "Black"],
  "TMNF No Cut": ["White", "Green", "Blue", "Red", "Black"],
  "ESWC": ["Beginner", "Advanced", "Expert", "Pro", "Bonus"],
  "TMN Remakes": ["Beginner", "Advanced", "Expert", "Pro", "Bonus"],
  "TMUF": ["White", "Green", "Blue", "Red", "Black", "TMU", "Platform", "Puzzle", "Stunt", "StuntRace"],
  "TMUF No Cut": ["White", "Green", "Blue", "Red", "TMU"],
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

export const OVERRIDE_TIME_SAVED: Record<string, Record<number, number>> = {
  "E05-Endurance": { 
    1480790: 61.17,  // Open 2 laps by VIIT
    1354190: 95.94,  // Open 3 laps by KMSS
    1283240: 131.23,  // Open 4 laps by KMSST
    1243670: 166.62,  // Open 5 laps by T
    1229990: 167.76,  // Open 5 laps by TM
    1109590: 108.19,  // Open 3 laps by JVTCIM
    2786990: 10.83,  // NOseboost 1 lap by Alex
    2738990: 11.63,  // NOseboost 1 lap by Alex
    2698790: 12.30,  // NOseboost 1 lap by Alex
    2569190: 24.90,  // NOseboost 2 laps by AD
    2267990: 19.47,  // NOseboost 1 lap by Midnight
    3158790: 1.37,  // No cut 2 laps by Virtuoso
  },
  "E03-Endurance": {
    267110: 2.23,  // WR Route by DELETE_CLUB
    265820: 2.66,  // WR Route by DELETE_CLUB
    249590: 8.07,  // No Uber by DELETE_CLUB
    248180: 8.54,  // No Uber by DELETE_CLUB
    245030: 9.59,  // No Uber by threadd
    165620: 36.06,  // Open by Lukalyc
  },
  "D15-Endurance": {
    410690: 2.66,  // No Uber by DarkLink
    395790: 6.37,  // No Uber by DV
    382640: 9.00,  // No Uber by CrizpyCheese
    187610: 117.11,  // Open by EGF
    123540: 60.82,  // Open by CM
  },
}


//////////////////////////////////////////////////////////////
// General //
//////////////////////////////////////////////////////////////

export const PROFILE_BANNERS: Record<number, string> = {
  0: "/banners/noseboost1.webp",
  1: "/banners/noseboost2.webp",
  2: "/banners/noseboost3.webp",
  3: "/banners/coast1.webp",
  4: "/banners/island1.webp",
  5: "/banners/island2.webp",
  6: "/banners/rings.webp",
  7: "/banners/snow1.webp",
  8: "/banners/stadium1.webp",
  9: "/banners/tmi-console.webp",
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

export const DISPLAY_SETTINGS = [
  { key: "show_rta", label: "RTA Records", desc: "Show RTA record table" },
  { key: "show_time_saved", label: "Time Saved", desc: "Display time saved table"},
  { key: "show_leaderboard", label: "Leaderboard", desc: "Show TAS leaderboard rankings" },
  { key: "show_rta_leaderboard", label: "RTA Leaderboard", desc: "Show RTA leaderboard rankings"},
  { key: "show_recent", label: "Highlight Recent", desc: "Highlight recently added TASes" },
  // { key: "show_visitor_counter", label: "Visitor Counter", desc: "Display visitor count" },
  { key: "allow_sounds", label: "Allow Sounds", desc: "Allow/mute all website sounds/music" },
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

export const SUBMISSION_STATUS = [
  "All", 
  "Pending", 
  "Approved", 
  "Rejected"
] as const;

export const STATUS_COLOUR = {
  "pending": ["bg-[#3230af]/30", "bg-[#3230af]/40"],
  "approved": ["bg-[#6cbe36]/20", "bg-[#6cbe36]/30"],
  "rejected": ["bg-[#9e2121]/20", "bg-[#9e2121]/30"]
};

export const TIMESPAN = [
  "Past month", 
  "Past year", 
  "All"
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
];
