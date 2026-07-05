
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
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

    // 3. Delete from public bucket
    const deletePath = `${slugify(game)}/${slugify(track)}/${replayPath}.gbx`;
    const { error: deleteError } = await supabase.storage
      .from("downloads")
      .remove([deletePath]);

    if (deleteError) {
      return NextResponse.json(
        { error: "Deletion failed" },
        { status: 500 }
      );
    }

    return new NextResponse(null, { status: 204 });

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
