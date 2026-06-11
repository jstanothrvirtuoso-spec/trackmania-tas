
import { GAME_SETS, GAME_LIST, ENVIRONMENT, CATEGORIES } from "./constants";

export type SortOrder = "asc" | "desc";

export type Role = "user" | "moderator" | "admin"

export type TimeState = {
  minutes: number;
  seconds: number;
  hundredths: number;
  thousandth: number;
};

export type Game = (typeof GAME_LIST)[number];
export type Environment = (typeof ENVIRONMENT)[number];
export type Category = (typeof CATEGORIES)[number];


export type SubmitForm = {
  id: string;
  game: Game | null;
  track: string | null;
  category: Category | "Unsure";
  time_ms: number | null;
  authors: string[];
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

export type SetTMNF = (typeof GAME_SETS["TMNF"])[number];
export type SetESWC = (typeof GAME_SETS["ESWC"])[number];
export type SetTMUF = (typeof GAME_SETS["TMUF"])[number];
export type SetTMS = (typeof GAME_SETS["TMS"])[number];
export type SetTMO = (typeof GAME_SETS["TMO"])[number];
export type SetDemo = (typeof GAME_SETS["Demo/Beta"])[number];
export type SetTM2 = (typeof GAME_SETS["TM2"])[number];

export type TrackInfo = {
  game: Game;
  id: number;
  category: SetTMNF | SetESWC | SetTMUF | SetTMS | SetTMO | SetDemo | SetTM2;
  environment: Environment;
  order?: number; // Sorting non-alphabetical tracks
  baseTrack?: string;  // Reference to original track for no-cut tracks
  noCutTrack?: string;  // Reference to no-cut version for TMNF tracks
  tmx?: string;  // TMX when track is on a different tmx to the game set
};

export type RecordRow = {
  track: string;
  trackInfo: TrackInfo;
  tas: TasEntry | null;
  rta: RtaEntry | null;
  isCurrentBestTas?: boolean;
};

export type AuthorInfo = {
  id: string;
  author: string;
  profile_id: string | null;
};

export type RtaEntry = {
  id: number;
  game: Game;
  track: string;
  time_ms: number;
  player: string;
  date: string;
  video: string | null;
  replay: string | null;
};

export type TasEntry = {
  id: number;
  game: Game;
  track: string;
  category: Category;
  time_ms: number;
  num_inputs: number | null;
  authors: string[];
  date: string;
  video: string | null;
  replay: string | null;
  inputs: string | null;
  created_at: string;
};

export type ProfileDraft = {
  display_name: string;
  bio: string;
  avatar: number;
  banner: number;
  colour: number;

  show_rta: boolean;
  show_time_saved: boolean;
  show_leaderboard: boolean;
  show_rta_leaderboard: boolean;
  show_recent: boolean;
  show_visitor_counter: boolean;
};
