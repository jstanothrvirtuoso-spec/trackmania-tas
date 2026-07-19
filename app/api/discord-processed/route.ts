
import { requireModerator } from "@/utils/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {

  try {
    await requireModerator();

    const body = await req.json();

    const webhook = process.env.DISCORD_WEBHOOK_URL;

    if (!webhook) {
      return NextResponse.json(
        { error: "Webhook missing" },
        { status: 500 }
      );
    }

    const response = await fetch(webhook, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        embeds: [
          {
            title: `${body.decision === "approved" ? "✅" : "❌"}  TAS ${body.decision} by ${body.decisionBy}`,
            color: body.decision === "approved" ? 0x00c853 : 0xf70f0f,
            fields: [
              {
                name: "Track",
                value: body.track,
                inline: true,
              },
              {
                name: "Time",
                value: body.time,
                inline: true,
              },
              {
                name: "Submitted by",
                value: body.submittedBy,
                inline: true,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Discord message failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
    
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
      { error: "Discord message failed" },
      { status: 500 }
    );
  }
}
