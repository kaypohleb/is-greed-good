import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";
import { MiniState } from "@/types";

export const fetchCache = "only-no-store";

export async function POST(
  request: Request,
  { params }: { params: { id: string, game: string } }
): Promise<Response> {
  const playState: MiniState = await request.json();
  if (playState) {
    await kv.hset(`ministate:${params.game}:by-user-id:${params.id}`, playState);
  } else {
    return new Response("Invalid Play State", { status: 400 });
  }
  return NextResponse.json(playState);
}

export async function GET(
  request: Request,
  { params }: { params: { id: string, game: string } }
) {
  const playState: MiniState | null = await kv.hgetall(
    `ministate:${params.game}:by-user-id:${params.id}`
  );
  if (!playState) {
    return new Response("No Play State Founds", { status: 400 });
  }
  return NextResponse.json(playState);
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string, game: string } }
) {
  const playState: MiniState = await request.json();
  if (playState) {
    await kv.hset(`ministate:${params.game}:by-user-id:${params.id}`, playState);
  } else {
    return new Response("Invalid Play State", { status: 400 });
  }
  return NextResponse.json(playState);
}
