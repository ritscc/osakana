import Rank from "./_components/rank";

type User = {
  id: string;
  username: string | null;
  combo: number;
};

type RankingResponse = {
  ranking: User[];
};

export default async function RankPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/ranking`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch ranking data");
  }

  const data: RankingResponse = await res.json();

  const players = data.ranking.map((user) => ({
    id: user.id,
    name: user.username ?? "Unknown",
    score: user.combo,
  }));

  return (
    <div className="min-h-screen px-4 py-10 bg-gray-50 dark:bg-gray-900">
      <Rank players={players} />
    </div>
  );
}
