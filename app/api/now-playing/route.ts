import { NextResponse } from "next/server";

const STATION_ID = "s83b3fe12f";

export async function GET() {
  const url = `https://public.radio.co/api/v2/${STATION_ID}/track/current`;

  try {
    const response = await fetch(url, {
      cache: "no-store",
    });

    const text = await response.text();

    console.log("Radio.co status:", response.status);
    console.log("Radio.co response:", text);

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Radio.co current track request failed",
          radioStatus: response.status,
          radioResponse: text,
          url,
        },
        { status: 502 }
      );
    }

    let json;

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

    return NextResponse.json(json);
  } catch (error) {
    console.error("Radio.co connection error:", error);

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