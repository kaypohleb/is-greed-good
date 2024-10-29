import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";
import { MiniState } from "@/types";

export const fetchCache = "only-no-store";

export async function POST(
  request: Request,
  { params }: { params: { id: string, game: string, mode: string } }
): Promise<Response> {
  const miniState: MiniState = await request.json();
  if (miniState) {
    await kv.hset(`ministate:${params.game}:by-user-id:${params.id}:${params.mode}`, miniState);
  } else {
    return new Response("Invalid Mini State", { status: 400 });
  }
  return NextResponse.json(miniState);
}

export async function GET(
  request: Request,
  { params }: { params: { id: string, game: string, mode: string } }
) {
  const miniState: MiniState | null = await kv.hgetall(
    `ministate:${params.game}:by-user-id:${params.id}:${params.mode}`
  );
  if (!miniState) {
    return new Response("No Mini State Found", { status: 400 });
  }
  return NextResponse.json(miniState);
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string, game: string, mode: string } }
) {
  const miniState: MiniState = await request.json();
  if (miniState) {
    await kv.hset(`ministate:${params.game}:by-user-id:${params.id}:${params.mode}`, miniState);
  } else {
    return new Response("Invalid Mini State", { status: 400 });
  }
  return NextResponse.json(miniState);
}
