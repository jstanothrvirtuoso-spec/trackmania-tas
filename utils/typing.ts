
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
  overrideTimeSaved?: number;  // For multilap tracks with partial TASes
  baseTrack?: string;  // Reference to original track for no-cut tracks
  noCutTrack?: string;  // Reference to no-cut version for TMNF tracks
};

export type RecordRow = {
  track: string;
  trackInfo: TrackInfo;
  tas: TasEntry | null;
  rta: RtaEntry | null;
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
  record: string;
  time_ms: number;
  player: string;
  date: string;
  video: string;
  replay: string;
};

export type TasEntry = {
  id: number;
  game: Game;
  track: string;
  category: Category;
  record: string;
  time_ms: number;
  authors: string[];
  date: string;
  video: string;
  replay: string;
  inputs: string;
};







