import Rank from "./_components/rank";

export default function RankPage() {
  const testPlayers = [
    { id: "1", name: "Alice", score: 92 },
    { id: "2", name: "Bob", score: 75 },
    { id: "3", name: "Carol", score: 88 },
    { id: "4", name: "Dave", score: 60 },
    { id: "5", name: "Alice", score: 50 },
  ];

  return (
    <div className="min-h-screen px-4 py-10 bg-gray-50 dark:bg-gray-900">
      <Rank players={testPlayers} />
    </div>
  );
}
