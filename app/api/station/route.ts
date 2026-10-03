import { NextResponse } from "next/server";

const STATION_ID = "s83b3fe12f";

const STATION_URL =
  `https://public.radio.co/api/v2/${STATION_ID}`;

const STATUS_URL =
  `https://public.radio.co/stations/${STATION_ID}/status`;

type RadioStationResponse = {
  data?: {
    name?: unknown;
    logo?: unknown;
    streaming_links?: unknown;
  };
};

type RadioStatusResponse = {
  status?: unknown;
};

export async function GET() {
  try {
    const [stationResponse, statusResult] = await Promise.all([
      fetch(STATION_URL, { cache: "no-store" }),
      fetch(STATUS_URL, { cache: "no-store" })
        .then(async (response) => response.ok
          ? await response.json() as RadioStatusResponse
          : null)
        .catch(() => null),
    ]);

    if (!stationResponse.ok) {
      return NextResponse.json(
        {
          error: "Failed to fetch station information from Radio.co.",
          radioStatus: stationResponse.status,
        },
        { status: 502 }
      );
    }

    const stationResponseData: RadioStationResponse =
      await stationResponse.json();
    const stationData = stationResponseData.data;

    if (!stationData || typeof stationData.name !== "string") {
      return NextResponse.json(
        { error: "Radio.co returned invalid station information." },
        { status: 502 }
      );
    }

    const streamingLinks = Array.isArray(stationData.streaming_links)
      ? stationData.streaming_links.flatMap((link) => {
          if (
            link &&
            typeof link === "object" &&
            "url" in link &&
            typeof link.url === "string"
          ) {
            return [{ url: link.url }];
          }

          return [];
        })
      : [];

    return NextResponse.json({
      data: {
        name: stationData.name,
        logo: typeof stationData.logo === "string" ? stationData.logo : null,
        streaming_links: streamingLinks,
      },
      status:
        typeof statusResult?.status === "string"
          ? statusResult.status
          : "unknown",
    });
  } catch (error) {
    console.error("Station API error:", error);

    return NextResponse.json(
      {
        error: "Unable to connect to Radio.co.",
      },
      {
        status: 502,
      }
    );
  }
}