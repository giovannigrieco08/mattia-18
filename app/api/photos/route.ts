import { NextResponse } from "next/server";
import { getPhotos } from "@/lib/photos";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const photos = await getPhotos();
  return NextResponse.json(
    { photos },
    { headers: { "Cache-Control": "no-store" } }
  );
}
