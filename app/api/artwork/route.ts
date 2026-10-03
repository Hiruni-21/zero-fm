import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const artist = searchParams.get("artist")?.trim();
    const title = searchParams.get("title")?.trim();

    if (!artist || !title) {
      return NextResponse.json(
        { artwork: null },
        { status: 400 },
      );
    }

    const query = encodeURIComponent(
      `${artist} ${title}`,
    );

    const response = await fetch(
      `https://itunes.apple.com/search?term=${query}&entity=song&limit=5`,
      {
        cache: "force-cache",
      },
    );

    if (!response.ok) {
      return NextResponse.json({
        artwork: null,
      });
    }

    const data = await response.json();

    const results = Array.isArray(data.results)
      ? data.results
      : [];

    if (results.length === 0) {
      return NextResponse.json({
        artwork: null,
      });
    }

    /*
     * Try to find the closest artist/title match.
     */

    const normalize = (value: string) =>
      value
        .toLowerCase()
        .replace(/[’'".,_\-()[\]{}:/\\]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    const normalizedArtist = normalize(artist);
    const normalizedTitle = normalize(title);

    const exactMatch = results.find(
      (item: {
        artistName?: string;
        trackName?: string;
      }) => {
        const resultArtist = normalize(
          item.artistName || "",
        );

        const resultTitle = normalize(
          item.trackName || "",
        );

        return (
          resultArtist === normalizedArtist &&
          resultTitle === normalizedTitle
        );
      },
    );

    const result = exactMatch || results[0];

    if (!result.artworkUrl100) {
      return NextResponse.json({
        artwork: null,
      });
    }

    /*
     * iTunes normally returns 100x100.
     * Replace it with 600x600 for better quality.
     */

    const artwork = result.artworkUrl100.replace(
      "100x100",
      "600x600",
    );

    return NextResponse.json({
      artwork,
    });
  } catch (error) {
    console.error(
      "Artwork lookup error:",
      error,
    );

    return NextResponse.json({
      artwork: null,
    });
  }
}