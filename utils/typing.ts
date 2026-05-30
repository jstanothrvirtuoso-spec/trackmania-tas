
export type SortOrder = "asc" | "desc";

export type Role = "user" | "moderator" | "admin"

export type TimeState = {
  minutes: number;
  seconds: number;
  hundredths: number;
  thousandth: number;
};

export const gameList = ["TMNF", "TMNF No Cut", "ESWC", "TMN Remakes", "TMUF", "StarTrack", "TMS", "TMO", "Demo/Beta", "TM2"] as const;
export type Game = (typeof gameList)[number];
export const categories = ["Open", "NOseboost", "No Uber", "WR Route", "No Cut", "Low Input"] as const;
export type Category = (typeof categories)[number];

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