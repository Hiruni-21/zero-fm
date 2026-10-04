import { NextResponse } from "next/server";

type ScheduleItem = {
  time: string;
  endTime: string;
  program: string;
};

/*
 * Zero FM website schedule
 *
 * Radio.co does not need to be changed.
 * This schedule is maintained on the website side.
 * Each show has a start time, an end time (24-hour, Colombo time) and a name.
 * To add or change a show, edit this list. Use "00:00" as the end time for a
 * show that finishes at midnight.
 */
const SCHEDULE: ScheduleItem[] = [
  // Morning shows: these names are placeholders. Change them to your real shows.
  {
    time: "00:00",
    endTime: "06:00",
    program: "After Midnight Non-Stop",
  },
  {
    time: "06:00",
    endTime: "09:00",
    program: "Good Morning Sri Lanka",
  },
  {
    time: "09:00",
    endTime: "12:00",
    program: "Morning Classics",
  },
  {
    time: "12:00",
    endTime: "14:00",
    program: "Non Stop Sri Lankan Chartbusters",
  },
  {
    time: "14:00",
    endTime: "17:00",
    program: "Zero Hits",
  },
  {
    time: "17:00",
    endTime: "20:00",
    program: "Deep Lo-Fi & Sri Lankan Ambient",
  },
  {
    time: "20:00",
    endTime: "22:00",
    program: "Night Vibes",
  },
  {
    time: "22:00",
    endTime: "00:00",
    program: "Live DJ Sets & Community Calls",
  },
];

export async function GET() {
  return NextResponse.json(
    {
      station: "Zero FM",
      timezone: "Asia/Colombo",
      schedule: SCHEDULE,
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        Pragma: "no-cache",
      },
    }
  );
}