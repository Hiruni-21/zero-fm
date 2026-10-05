/*
 * Shared "what's playing now" lookup for the browser.
 *
 * Several parts of the page show the current song. They all call this,
 * so the page asks the server once and shares the answer instead of each
 * part polling on its own.
 */

// Short enough that a new song shows up within a few seconds of starting
const FRESH_FOR_MS = 4_000;

let lastResult: unknown = null;
let lastFetchedAt = 0;
let pending: Promise<unknown> | null = null;

export function fetchNowPlaying<T>(): Promise<T> {
  if (lastResult && Date.now() - lastFetchedAt < FRESH_FOR_MS) {
    return Promise.resolve(lastResult as T);
  }

  if (!pending) {
    pending = (async () => {
      const response = await fetch("/api/now-playing", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch current track");
      }

      const result: unknown = await response.json();
      lastResult = result;
      lastFetchedAt = Date.now();
      return result;
    })().finally(() => {
      pending = null;
    });
  }

  return pending as Promise<T>;
}

export const NOW_PLAYING_POLL_MS = 5_000;
