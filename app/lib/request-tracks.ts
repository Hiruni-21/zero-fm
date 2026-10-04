/*
 * The Zero FM request catalogue (songs listeners can request).
 *
 * Loaded once in the background and shared by Explore and the
 * Request Song form, so neither has to wait or download it twice.
 */

export type RequestableTrack = {
  id: number;
  title: string;
  artist: string;

  artwork?: {
    url?: string | null;
    large_url?: string | null;
  } | null;

  language?: string | null;
  genre?: string | null;
  category?: string | null;
  categories?: string[] | null;
  genres?: string[] | null;
  tags?: string[] | null;
};

type TracksResponse = {
  data?: RequestableTrack[];
  error?: string;
};


const TRACKS_CACHE_MS = 5 * 60 * 1000;

let cachedTracks: RequestableTrack[] | null = null;
let cachedAt = 0;
let pendingTracks: Promise<RequestableTrack[]> | null = null;

export function getCachedTracks(): RequestableTrack[] | null {
  return cachedTracks && Date.now() - cachedAt < TRACKS_CACHE_MS
    ? cachedTracks
    : null;
}

export function preloadRequestableTracks(
  force = false,
): Promise<RequestableTrack[]> {
  const cached = getCachedTracks();
  if (cached && !force) return Promise.resolve(cached);
  if (pendingTracks) return pendingTracks;

  pendingTracks = (async () => {
    const response = await fetch("/api/tracks");
    const result: TracksResponse = await response.json();

    if (!response.ok) {
      throw new Error(
        result.error || "Unable to load requestable songs.",
      );
    }

    const tracks = Array.isArray(result.data) ? result.data : [];
    cachedTracks = tracks;
    cachedAt = Date.now();
    return tracks;
  })().finally(() => {
    pendingTracks = null;
  });

  return pendingTracks;
}
