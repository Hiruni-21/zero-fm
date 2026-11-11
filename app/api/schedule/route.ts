import { corsPreflight, withCors } from "../../lib/cors";
import { NextResponse } from "next/server";

type ScheduleItem = {
  time: string;
  endTime: string;
  program: string;
};

/*
 * Zero FM website schedule
 *
 * The schedule now comes straight from Radio.co. Whatever is set in
 * Radio.co Studio > Schedule shows here (and in the phone app) by itself,
 * so nothing needs to be typed in this file any more.
 *
 * Each show has a start time, an end time (24-hour, Colombo time) and a name.
 * "00:00" as the end time means the show finishes at midnight.
 */

const STATION_ID = "s83b3fe12f";
const RADIO_CO_SCHEDULE_URL = `https://public.radio.co/stations/${STATION_ID}/embed/schedule`;

// Hours with nothing booked in Radio.co play the default playlist
const EMPTY_SLOT_NAME = "Request Line";

// Ask Radio.co again at most every 5 minutes
const REFRESH_MS = 5 * 60_000;

// Shown only if Radio.co can't be reached, so the box is never empty
const BACKUP_SCHEDULE: ScheduleItem[] = [
  { time: "00:00", endTime: "06:00", program: "Zero Gravity" },
  { time: "06:00", endTime: "09:00", program: "Zero FM Morning Show" },
  { time: "09:00", endTime: "00:00", program: EMPTY_SLOT_NAME },
];

type RadioCoEvent = {
  start?: string;
  end?: string;
  playlist?: { name?: string | null; title?: string | null } | null;
};

const COLOMBO_OFFSET_MS = (5 * 60 + 30) * 60_000;
const DAY_MS = 24 * 60 * 60_000;

/* "1 COVER LANTHAYA - LIVE (Every Monday 6.30pm - 8.30pm)" -> "Cover Lanthaya" */
function cleanName(raw: string): string {
  let name = raw
    .replace(/\([^)]*\)/g, " ") // drop "(Every Monday ...)"
    .replace(/^\s*\d+\s*[.)-]?\s+/, "") // drop the "1 " in front
    .replace(/\s*-\s*live\b/i, "") // drop "- LIVE"
    .replace(/\s+/g, " ")
    .trim();

  // ALL CAPITALS -> Normal Capitals, but keep short words like FM / ZFM
  if (name && name === name.toUpperCase()) {
    name = name
      .toLowerCase()
      .replace(/(^|\s)([a-z])/g, (_, gap, letter) => gap + letter.toUpperCase())
      .replace(/\b(Fm|Zfm|Dj)\b/g, (word) => word.toUpperCase());
  }

  return name || EMPTY_SLOT_NAME;
}

/* Minutes after Colombo midnight -> "HH:MM" (24:00 is written "00:00") */
function toClock(minutes: number): string {
  const m = ((minutes % 1440) + 1440) % 1440;
  const hours = String(Math.floor(m / 60)).padStart(2, "0");
  const mins = String(m % 60).padStart(2, "0");
  return `${hours}:${mins}`;
}

/* Today's shows (Colombo date) from Radio.co's list, gaps filled */
function buildTodaysSchedule(events: RadioCoEvent[], now = Date.now()): ScheduleItem[] {
  const colomboNow = new Date(now + COLOMBO_OFFSET_MS);
  const today = colomboNow.toISOString().slice(0, 10);
  const dayStart = Date.parse(`${today}T00:00:00+05:30`);
  const dayEnd = dayStart + DAY_MS;

  const shows = events
    .map((event) => {
      const start = Date.parse(event.start ?? "");
      const end = Date.parse(event.end ?? "");
      const raw = event.playlist?.name || event.playlist?.title || "";
      return { start, end, program: cleanName(raw) };
    })
    .filter((show) => !Number.isNaN(show.start) && !Number.isNaN(show.end))
    .filter((show) => show.end > dayStart && show.start < dayEnd)
    .map((show) => ({
      // Minutes after midnight, cut to today only
      from: Math.round((Math.max(show.start, dayStart) - dayStart) / 60_000),
      to: Math.round((Math.min(show.end, dayEnd) - dayStart) / 60_000),
      program: show.program,
    }))
    .filter((show) => show.to > show.from)
    .sort((a, b) => a.from - b.from);

  if (shows.length === 0) return [];

  // Fill the empty hours with the default playlist
  const filled: { from: number; to: number; program: string }[] = [];
  let cursor = 0;
  for (const show of shows) {
    if (show.from > cursor) {
      filled.push({ from: cursor, to: show.from, program: EMPTY_SLOT_NAME });
    }
    const from = Math.max(show.from, cursor);
    if (show.to > from) {
      filled.push({ from, to: show.to, program: show.program });
      cursor = show.to;
    }
  }
  if (cursor < 1440) {
    filled.push({ from: cursor, to: 1440, program: EMPTY_SLOT_NAME });
  }

  // Join two back-to-back slots with the same name into one
  const joined: typeof filled = [];
  for (const slot of filled) {
    const last = joined[joined.length - 1];
    if (last && last.program === slot.program && last.to === slot.from) {
      last.to = slot.to;
    } else {
      joined.push({ ...slot });
    }
  }

  return joined.map((slot) => ({
    time: toClock(slot.from),
    endTime: toClock(slot.to),
    program: slot.program,
  }));
}

let saved: { events: RadioCoEvent[]; at: number } | null = null;

async function loadRadioCoEvents(): Promise<RadioCoEvent[] | null> {
  if (saved && Date.now() - saved.at < REFRESH_MS) return saved.events;

  try {
    const response = await fetch(RADIO_CO_SCHEDULE_URL, { cache: "no-store" });
    if (!response.ok) throw new Error(`Radio.co said ${response.status}`);
    const json = (await response.json()) as { data?: RadioCoEvent[] };
    const events = Array.isArray(json.data) ? json.data : [];
    saved = { events, at: Date.now() };
    return events;
  } catch (error) {
    console.error("Radio.co schedule error:", error);
    // An older copy is better than nothing
    return saved?.events ?? null;
  }
}

async function handleGET() {
  const events = await loadRadioCoEvents();
  const today = events ? buildTodaysSchedule(events) : [];
  const fromRadioCo = today.length > 0;

  return NextResponse.json(
    {
      station: "Zero FM",
      timezone: "Asia/Colombo",
      source: fromRadioCo ? "radio.co" : "backup",
      schedule: fromRadioCo ? today : BACKUP_SCHEDULE,
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        Pragma: "no-cache",
      },
    }
  );
}

export const GET = withCors(handleGET);
export const OPTIONS = corsPreflight;
