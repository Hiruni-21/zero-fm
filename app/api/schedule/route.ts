import { NextResponse } from "next/server";

const SCHEDULE = [
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
  return NextResponse.json({
    station: "Zero FM",
    timezone: "Asia/Colombo",
    schedule: SCHEDULE,
  });
}