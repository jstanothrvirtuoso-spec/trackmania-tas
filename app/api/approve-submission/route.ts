
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import { requireModerator } from "@/utils/auth";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  throw new Error("Missing Supabase environment variables.");
}

const supabase = createClient(url, key);

function slugify(value: string) {
  return value
    .replace(/\//g, "")
    .replace(/[^a-zA-Z0-9.()]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(req: NextRequest) {
  try {
    // 1. Authorisation gate FIRST
    await requireModerator();

    // 2. Validate input
    const body = await req.json();

    const replayPath: string | undefined = body?.replayPath;
    const game: string | undefined = body?.game;
    const track: string | undefined = body?.track;

    if (!replayPath || !game || !track) {
      return NextResponse.json(
        { error: "Missing parameters" },
        { status: 400 }
      );
    }

    // 3. Download from private bucket (service role required)
    const { data: file, error: downloadError } = await supabase.storage
      .from("replays")
      .download(replayPath);

    if (downloadError || !file) {
      return NextResponse.json(
        { error: "Download failed" },
        { status: 500 }
      );
    }

    const replayUid = randomUUID();
    const uploadPath = `${slugify(game)}/${slugify(track)}/${replayUid}.gbx`;

    // 4. Upload to public bucket
    const { error: uploadError } = await supabase.storage
      .from("downloads")
      .upload(uploadPath, file, {
        contentType: "application/octet-stream",
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: "Upload failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      replayUid,
      uploadPath,
    });

  } catch (err) {

    const message = err instanceof Error ? err.message : "Unknown error";

    if (message === "UNAUTHENTICATED") {
      return NextResponse.json(
        { error: "Not logged in" },
        { status: 401 }
      );
    }

    if (message === "UNAUTHORISED") {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    console.error(err);

    return NextResponse.json(
      { error: "Replay migration failed" },
      { status: 500 }
    );
  }
}
