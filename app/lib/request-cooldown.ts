/*
 * Gentle limits on song requests from one browser, so a single listener
 * can't fill the queue: one request every 30 minutes and at most 5 a day, matching the
 * station's Radio.co request settings.
 * Shared by the request form and the music library. Stored in localStorage,
 * so it's a courtesy limit, not a security check.
 */

export const REQUEST_COOLDOWN_MS = 30 * 60 * 1000;
export const DAILY_REQUEST_LIMIT = 5;

const LAST_KEY = "zero-fm:last-request-at";
const DAY_KEY = "zero-fm:requests-today";

function today(): string {
  return new Date().toDateString();
}

function readDay(): { day: string; count: number } {
  try {
    const saved = JSON.parse(window.localStorage.getItem(DAY_KEY) || "null") as {
      day?: string;
      count?: number;
    } | null;
    if (saved?.day === today()) return { day: saved.day, count: saved.count || 0 };
  } catch {
    // Start fresh
  }
  return { day: today(), count: 0 };
}

/** Minutes left before this browser can request again (0 = can request now) */
export function requestCooldownMinutes(): number {
  try {
    const last = Number(window.localStorage.getItem(LAST_KEY) || 0);
    const left = last + REQUEST_COOLDOWN_MS - Date.now();
    return left > 0 ? Math.ceil(left / 60_000) : 0;
  } catch {
    return 0;
  }
}

/** True once this browser has used today's requests */
export function dailyLimitReached(): boolean {
  return readDay().count >= DAILY_REQUEST_LIMIT;
}

export function markRequestSent(): void {
  try {
    const { day, count } = readDay();
    window.localStorage.setItem(LAST_KEY, String(Date.now()));
    window.localStorage.setItem(DAY_KEY, JSON.stringify({ day, count: count + 1 }));
  } catch {
    // Private browsing: skip the limit
  }
}
