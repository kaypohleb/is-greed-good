
import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";

export const fetchCache = "only-no-store";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const origin = new URL(request.url).origin;
    const updatedUser: User = await request.json();
    console.log("updating User", updatedUser);
    await kv.hset(`user-cur:${updatedUser.id}`, updatedUser);
    //const randomSeed = Math.random().toString(36).substring(7);
    return NextResponse.json({
      url: `make/${updatedUser.id}`,
    });
  } catch (error: any) {
    throw new Error("Error updating user", error?.message);
  }
}
