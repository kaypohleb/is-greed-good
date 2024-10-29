import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";
import { DayScores, Score } from "@/types";

export const fetchCache = "only-no-store";

export async function POST(
  request: Request,
  { params }: { params: { difficulty: string; day: string } }
): Promise<Response> {
  const score: Score = await request.json();
  if (score) {
    const dayScores: DayScores = {
      date: params.day,
      difficulty: params.difficulty,
      scores: [score],
    };
    await kv.hset(`score:by-day:${params.day}:${params.difficulty}`, dayScores);
  } else {
    return new Response("Invalid Day Scores", { status: 400 });
  }
  return NextResponse.json(score);
}

export async function GET(
  request: Request,
  { params }: { params: { difficulty: string; day: string } }
) {
  const dayScores: DayScores | null = await kv.hgetall(
    `score:by-day:${params.day}:${params.difficulty}`
  );
  if (!dayScores) {
    return new Response("No Day Score Found", { status: 400 });
  }
  return NextResponse.json(dayScores);
}

export async function PUT(
  request: Request,
  { params }: { params: { difficulty: string; day: string } }
) {
  const newdayScores: Score = await request.json();
  const dayScores: DayScores | null = await kv.hgetall(
    `score:by-day:${params.day}:${params.difficulty}`
  );
  if (dayScores) {
    if (
      dayScores.scores.find((score) => score.userId === newdayScores.userId)
    ) {
      return new Response("User already has a score for this day", {
        status: 400,
      });
    }
    dayScores.scores.push(newdayScores);
    await kv.hset(`score:by-day:${params.day}:${params.difficulty}`, dayScores);
  } else {
    return new Response("Invalid Day Scores", { status: 400 });
  }
  return NextResponse.json(dayScores);
}
