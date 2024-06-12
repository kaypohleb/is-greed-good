import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";
import { PlayState } from "@/types";

export const fetchCache = "only-no-store";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
): Promise<Response> {
  const playState: PlayState = await request.json();
  if (playState) {
    await kv.hset(`playstate:by-user-id:${params.id}`, playState);
  } else {
    return new Response("Invalid Play State", { status: 400 });
  }
  return NextResponse.json(playState);
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const playState: PlayState | null = await kv.hgetall(
    `playstate:by-user-id:${params.id}`
  );
  if (!playState) {
    return new Response("No Play State Founds", { status: 400 });
  }
  return NextResponse.json(playState);
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const playState: PlayState = await request.json();
  if (playState) {
    await kv.hset(`playstate:by-user-id:${params.id}`, playState);
  } else {
    return new Response("Invalid Play State", { status: 400 });
  }
  return NextResponse.json(playState);
}
