import { NextResponse } from "next/server";

const STATION_ID = "s83b3fe12f";

/*
 * Sends a listener's song request to the Radio.co request queue.
 * This is the same endpoint Radio.co's own request widget uses.
 * It has to go through this server because Radio.co only accepts
 * browser requests coming from embed.radio.co.
 */
const REQUEST_URL = `https://public.radio.co/stations/${STATION_ID}/requests`;

type QueueRequestBody = {
  trackId?: unknown;
};

function readRadioMessage(text: string): string | null {
  try {
    const json = JSON.parse(text) as {
      message?: unknown;
      error?: unknown;
    };

    if (typeof json.message === "string") return json.message;
    if (typeof json.error === "string") return json.error;
  } catch {
    // Not JSON; fall through.
  }

  return null;
}

export async function POST(request: Request) {
  let body: QueueRequestBody;

  try {
    body = (await request.json()) as QueueRequestBody;
  } catch {
    return NextResponse.json(
      { success: false, error: "A valid song request is required." },
      { status: 400 },
    );
  }

  const trackId = Number(body?.trackId);

  if (!Number.isInteger(trackId) || trackId <= 0) {
    return NextResponse.json(
      { success: false, error: "Please choose a song to request." },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(REQUEST_URL, {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        // Radio.co sits behind Cloudflare, which turns away server requests
        // that don't look like they come from its request widget.
        "User-Agent": "Mozilla/5.0 (compatible; ZeroFM/1.0; +https://zero-fm.wedagehiruni123.workers.dev)",
        Origin: "https://embed.radio.co",
        Referer: "https://embed.radio.co/",
      },
      body: JSON.stringify({ track_id: trackId }),
    });

    const text = await response.text();

    if (response.ok) {
      return NextResponse.json({ success: true });
    }

    console.error("Radio.co request failed:", response.status, text.slice(0, 300));

    if (response.status === 429) {
      return NextResponse.json(
        {
          success: false,
          error:
            "You've reached the request limit for now. Please try again a little later.",
        },
        { status: 429 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error:
          readRadioMessage(text) ||
          "Radio.co couldn't accept this request. Please try another song.",
        radioStatus: response.status,
      },
      { status: 502 },
    );
  } catch (error) {
    console.error("Radio.co request error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to reach Radio.co. Please try again.",
      },
      { status: 502 },
    );
  }
}
