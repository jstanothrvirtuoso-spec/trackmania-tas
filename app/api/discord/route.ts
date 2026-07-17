
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  const webhook = process.env.DISCORD_WEBHOOK_URL;

  if (!webhook) {
    return NextResponse.json(
      { error: "Webhook missing" },
      { status: 500 }
    );
  }

  const categoryColours: Record<string, number> = {
    "Open": 0xc271f8,
    "NOseboost": 0x60a5fa,
    "No Uber": 0x34d399,
    "WR Route": 0xffc637,
    "No Cut": 0x4d59ff,
    "Low Input": 0x000000,
  };

  const colour = categoryColours[body.category] ?? 0x00c853;

  const response = await fetch(webhook, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      embeds: [
        {
          title: "📥 New TAS Submission",
          color: colour,
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
              name: "Category",
              value: body.category,
              inline: true,
            },
            {
              name: "Authors",
              value: body.authors.join(", "),
            },
            {
              name: "Submitted by",
              value: body.submitter,
            },
          ],
          timestamp: new Date().toISOString(),
        },
      ],
    }),
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: "Discord failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
