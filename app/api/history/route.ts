import { NextResponse } from "next/server";

const STATION_ID = "s83b3fe12f";

type HistoryTrack = {
  title?: string;
  start_time?: string;
  artwork_url?: string | null;
};

type HistoryResponse = {
  tracks?: HistoryTrack[];
};

export async function GET() {
  const url = `https://public.radio.co/stations/${STATION_ID}/history`;

  try {
    const response = await fetch(url, {
      cache: "no-store",
    });

    const text = await response.text();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Failed to fetch history from Radio.co",
          radioStatus: response.status,
          radioResponse: text,
        },
        { status: 502 }
      );
    }

    let json: HistoryResponse;

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

    return NextResponse.json({
      data: json.tracks || [],
    });
  } catch (error) {
    console.error("Radio.co history error:", error);

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