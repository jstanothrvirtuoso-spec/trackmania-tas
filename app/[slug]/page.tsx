import { leaderboards } from "../../lib/leaderboards";
import LeaderboardTable from "./LeaderboardTable";

export default async function GamePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const game = leaderboards.find((g) => g.slug === slug);

  if (!game) {
    throw new Error("Game not found");
  }

  return <LeaderboardTable game={game} />;
}