"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type Player = {
  id: string;
  name: string;
  score: number;
};

export default function Rank({ players }: { players: Player[] }) {
  const crowns = [
    "/crowns/ranking_crown_no1.png",
    "/crowns/ranking_crown_no2.png",
    "/crowns/ranking_crown_no3.png",
  ];
  return (
    <Card className="w-full max-w-xl mx-auto shadow-lg rounded-2xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          ランキング
        </CardTitle>
      </CardHeader>

      <CardContent>
        {players.map((p, index) => (
          <div key={p.id}>
            <div className="flex items-center py-3">
              {index < 3 ? (
                <Image
                  src={crowns[index]}
                  alt="crown"
                  width={32}
                  height={32}
                  className="mr-3"
                />
              ) : (
                <div className="w-9 ml-2 text-lg font-bold">{index + 1}</div>
              )}

              <div className="flex-1 text-base">{p.name}</div>

              <div className="w-16 text-right font-semibold">{p.score}</div>
            </div>

            {index < players.length - 1 && <Separator />}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

