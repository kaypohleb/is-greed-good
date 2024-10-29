import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";
import { MiniDayScores, Score } from "@/types";

export const fetchCache = "only-no-store";

export async function POST(
  request: Request,
  { params }: { params: { game: string; difficulty: string; day: string } }
): Promise<Response> {
  const score: Score = await request.json();
  if (score) {
    const miniScores: MiniDayScores = {
      date: params.day,
      game: params.game,
      difficulty: params.difficulty,
      scores: [score],
    };
    await kv.hset(
      `score:${params.game}:by-day:${params.day}:${params.difficulty}`,
      miniScores
    );
  } else {
    return new Response("Invalid Day Scores", { status: 400 });
  }
  return NextResponse.json(score);
}

export async function GET(
  request: Request,
  { params }: { params: { game: string; difficulty: string; day: string } }
) {
  const miniScores: MiniDayScores | null = await kv.hgetall(
    `score:${params.game}:by-day:${params.day}:${params.difficulty}`
  );
  if (!miniScores) {
    return new Response("No Day Score Found", { status: 400 });
  }
  return NextResponse.json(miniScores);
}

export async function PUT(
  request: Request,
  { params }: { params: { game: string; difficulty: string; day: string } }
) {
  const newMiniScores: Score = await request.json();
  const miniScores: MiniDayScores | null = await kv.hgetall(
    `score:${params.game}:by-day:${params.day}:${params.difficulty}`
  );
  if (miniScores) {
    if (
      miniScores.scores.find((score) => score.userId === newMiniScores.userId)
    ) {
      return new Response("User already has a score for this day", {
        status: 400,
      });
    }
    miniScores.scores.push(newMiniScores);
    await kv.hset(
      `score:${params.game}:by-day:${params.day}:${params.difficulty}`,
      miniScores
    );
  } else {
    return new Response("Invalid Day Scores", { status: 400 });
  }
  return NextResponse.json(miniScores);
}
