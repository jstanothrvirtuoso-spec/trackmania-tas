
import { use } from "react";
import TracksPage from "./TracksPage"
import { Game } from "@/utils/typing";

export default function Tracks({
  searchParams
}: {
  searchParams: Promise<{ game?: Game; track?: string }>
}) {

  const { game, track } = use(searchParams);

  return(
    <TracksPage 
      initialGame={game}
      initialTrack={track} 
    />
  )
}