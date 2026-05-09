
import { Game } from "../lib/TrackLists";
import { Category } from "../lib/TrackLists";
import rawData from "../data/tasRecords.json";

export type TasEntry = {
  game: Game;
  track: string;
  category: Category;
  record: string;
  timeMs: number;
  authors: string[];
  date: string;
  video: string;
  replay: string;
  inputs: string;
};

export const TasRecords = rawData as TasEntry[];
