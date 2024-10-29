import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";
import { PlayState } from "@/types";

export const fetchCache = "only-no-store";

export async function POST(
  request: Request,
  { params }: { params: { id: string; mode: string } }
): Promise<Response> {
  const playState: PlayState = await request.json();
  if (playState) {
    await kv.hset(
      `playstate:by-user-id:${params.id}:${params.mode}`,
      playState
    );
  } else {
    return new Response("Invalid Play State", { status: 400 });
  }
  return NextResponse.json(playState);
}

export async function GET(
  request: Request,
  { params }: { params: { id: string; mode: string } }
) {
  const playState: PlayState | null = await kv.hgetall(
    `playstate:by-user-id:${params.id}:${params.mode}`
  );
  if (!playState) {
    return new Response("No Play State Found", { status: 400 });
  }
  return NextResponse.json(playState);
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string; mode: string } }
) {
  const playState: PlayState = await request.json();
  if (playState) {
    await kv.hset(
      `playstate:by-user-id:${params.id}:${params.mode}`,
      playState
    );
  } else {
    return new Response("Invalid Play State", { status: 400 });
  }
  return NextResponse.json(playState);
}
