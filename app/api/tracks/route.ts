import { NextResponse } from "next/server";

const STATION_ID = "s83b3fe12f";

type RadioTrack = {
  id: number;
  artist: string;
  title: string;
  artwork?: {
    url?: string | null;
    large_url?: string | null;
  } | null;
};

type RadioTracksResponse = {
  tracks?: RadioTrack[];
};

export async function GET() {
  const url = `https://public.radio.co/stations/${STATION_ID}/requests/tracks`;

  try {
    // The catalogue rarely changes, so reuse it for a minute instead of
    // asking Radio.co again on every Explore click.
    const response = await fetch(url, {
      next: { revalidate: 60 },
    });

    const text = await response.text();


    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Failed to fetch tracks from Radio.co",
          radioStatus: response.status,
          radioResponse: text,
        },
        { status: 502 }
      );
    }

    let json: RadioTracksResponse;

    try {
      json = JSON.parse(text);
    } catch {
      return NextResponse.json(
        {
          error: "Radio.co returned invalid JSON",
          radioResponse: text,
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      {
        data: json.tracks || [],
      },
      {
        headers: {
          "Cache-Control":
            "public, max-age=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error("Radio.co tracks error:", error);

    return NextResponse.json(
      {
        error: "Unable to connect to Radio.co",
        details:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 }
    );
  }
}