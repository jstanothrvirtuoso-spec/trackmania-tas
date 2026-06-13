
import crypto from "crypto";
import { use } from "react";
import TracksPage from "./TracksPage"
import { Game } from "@/utils/typing";
import { tracksByGame } from "@/lib/TrackList";

export default function Tracks({
  searchParams
}: {
  searchParams: Promise<{ game?: Game; track?: string }>
}) {

  const { game, track } = use(searchParams);
  const initialGame = game ?? "TMNF";
  const initialTrack = track ?? tracksByGame[initialGame][crypto.randomInt(tracksByGame[initialGame].length)];

  return(
    <TracksPage 
      initialGame={initialGame}
      initialTrack={initialTrack}
    />
  )
}