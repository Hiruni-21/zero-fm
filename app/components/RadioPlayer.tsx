"use client";

import { useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";

const RADIO_STREAM_URL =
  "https://s5.radio.co/s83b3fe12f/listen";

const APP_STORE_URL = "#";
const GOOGLE_PLAY_URL = "#";

type TrackData = {
  title?: string;
  track_title?: string;
  track_artist?: string;
  artist?: string;
  artwork_urls?: {
    standard?: string;
    large?: string;
  };
};

type NowPlayingResponse = {
  data?: TrackData;
};

/* -------------------------------------------------------------------------- */
/* Icons                                                                      */
/* -------------------------------------------------------------------------- */

function RadioIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="2.2" />
      <path d="M8.5 8.5a5 5 0 0 0 0 7" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      <path d="M5.5 5.5a9 9 0 0 0 0 13" />
      <path d="M18.5 5.5a9 9 0 0 1 0 13" />
    </svg>
  );
}

function MusicIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <path d="M9 18V5l10-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="16" cy="16" r="3" />
    </svg>
  );
}

function ListIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <path d="M8 6h11" />
      <path d="M8 12h11" />
      <path d="M8 18h11" />
      <path d="M4 6h.01" />
      <path d="M4 12h.01" />
      <path d="M4 18h.01" />
    </svg>
  );
}

function CalendarIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4" />
      <path d="M8 3v4" />
      <path d="M3 10h18" />
    </svg>
  );
}

function SmartphoneIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <rect x="6" y="2.5" width="12" height="19" rx="2.2" />
      <path d="M10 5h4" />
      <circle cx="12" cy="18.5" r=".7" fill="currentColor" />
    </svg>
  );
}

function PlayIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M8 5.8v12.4c0 .8.9 1.3 1.6.9l9.4-6.2a1 1 0 0 0 0-1.6L9.6 4.9C8.9 4.5 8 5 8 5.8Z" />
    </svg>
  );
}

function PauseIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <rect x="7" y="5" width="3.5" height="14" rx="1" />
      <rect x="13.5" y="5" width="3.5" height="14" rx="1" />
    </svg>
  );
}

function VolumeIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 10v4h4l5 4V6l-5 4H4Z" />
      <path d="M17 9.5a4 4 0 0 1 0 5" />
      <path d="M19.5 7a7.5 7.5 0 0 1 0 10" />
    </svg>
  );
}

function PreviousIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <rect x="5" y="5" width="2" height="14" rx="1" />
      <path d="M18 6.5v11a1 1 0 0 1-1.6.8l-7.2-5.5a1 1 0 0 1 0-1.6l7.2-5.5a1 1 0 0 1 1.6.8Z" />
    </svg>
  );
}

function NextIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <rect x="17" y="5" width="2" height="14" rx="1" />
      <path d="M6 6.5v11a1 1 0 0 0 1.6.8l7.2-5.5a1 1 0 0 0 0-1.6L7.6 5.7A1 1 0 0 0 6 6.5Z" />
    </svg>
  );
}

function SettingsIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" />
      <path d="M19 13.5v-3l-2-.5a7 7 0 0 0-.8-1.8l1-1.8-2.1-2.1-1.8 1a7 7 0 0 0-1.8-.8l-.5-2h-3l-.5 2a7 7 0 0 0-1.8.8l-1.8-1-2.1 2.1 1 1.8a7 7 0 0 0-.8 1.8l-2 .5v3l2 .5a7 7 0 0 0 .8 1.8l-1 1.8 2.1 2.1 1.8-1a7 7 0 0 0 1.8.8l.5 2h3l.5-2a7 7 0 0 0 1.8-.8l1.8 1 2.1-2.1-1-1.8a7 7 0 0 0 .8-1.8l2-.5Z" />
    </svg>
  );
}

function ShareIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <circle cx="18" cy="5" r="2.5" />
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="19" r="2.5" />
      <path d="m8.2 10.8 7.6-4.5" />
      <path d="m8.2 13.2 7.6 4.5" />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* Google Play Icon                                                           */
/* -------------------------------------------------------------------------- */

function GooglePlayIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      aria-hidden="true"
    >
      <path
        fill="#00C853"
        d="M6.7 4.3C5.6 5.2 5 6.7 5 8.6v30.8c0 1.9.6 3.4 1.7 4.3L27.1 24 6.7 4.3Z"
      />
      <path
        fill="#00B0FF"
        d="M27.1 24 33.6 17.7 11.8 5.3C9.9 4.2 8 3.6 6.7 4.3L27.1 24Z"
      />
      <path
        fill="#FFD740"
        d="M27.1 24 6.7 43.7c1.3.7 3.2.1 5.1-1l21.8-12.4L27.1 24Z"
      />
      <path
        fill="#FF5252"
        d="m33.6 17.7-6.5 6.3 6.5 6.3 7.6-4.3c2.9-1.7 2.9-4.1 0-5.8l-7.6-2.5Z"
      />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* Schedule                                                                   */
/* -------------------------------------------------------------------------- */

const SCHEDULE = [
  {
    time: "12:00",
    endTime: "14:00",
    program: "Non Stop Sri Lankan Chartbusters",
    number: "01",
  },
  {
    time: "14:00",
    endTime: "17:00",
    program: "Zero Hits",
    number: "LIVE",
  },
  {
    time: "17:00",
    endTime: "20:00",
    program: "Deep Lo-Fi & Sri Lankan Ambient",
    number: "NEXT",
  },
  {
    time: "20:00",
    endTime: "22:00",
    program: "Night Vibes",
    number: "04",
  },
  {
    time: "22:00",
    endTime: "00:00",
    program: "Live DJ Sets & Community Calls",
    number: "05",
  },
  {
    time: "00:00",
    endTime: "02:00",
    program: "Throwback Night",
    number: "06",
  },
];

function getCurrentSchedule() {
  const now = new Date();

  const minutes =
    now.getHours() * 60 + now.getMinutes();

  return SCHEDULE.find((item) => {
    const [startHour, startMinute] = item.time
      .split(":")
      .map(Number);

    const [endHour, endMinute] = item.endTime
      .split(":")
      .map(Number);

    const start =
      startHour * 60 + startMinute;

    let end =
      endHour * 60 + endMinute;

    if (end === 0) {
      end = 24 * 60;
    }

    return (
      minutes >= start &&
      minutes < end
    );
  });
}

/* -------------------------------------------------------------------------- */
/* Waveform                                                                   */
/* -------------------------------------------------------------------------- */

const WAVEFORM = [
  12, 18, 28, 17, 34, 21, 42, 26,
  19, 35, 48, 24, 39, 30, 18, 44,
  28, 38, 21, 31, 45, 26, 17, 36,
  23, 42, 29, 19, 34, 25, 39, 20,
  32, 16, 27, 43, 22, 35, 18, 29,
  41, 24, 17, 33, 26, 38, 20, 30,
];

/* -------------------------------------------------------------------------- */
/* Main Component                                                             */
/* -------------------------------------------------------------------------- */

export default function RadioPlayer() {
  const audioRef =
    useRef<HTMLAudioElement | null>(null);

  const [isPlaying, setIsPlaying] =
    useState(false);

  const [volume, setVolume] =
    useState(80);

  const [track, setTrack] =
    useState<TrackData | null>(null);

  const [artworkFailed, setArtworkFailed] =
    useState(false);

  const [loadingTrack, setLoadingTrack] =
    useState(true);

  const [error, setError] =
    useState("");

  const [currentProgram, setCurrentProgram] =
    useState(getCurrentSchedule());

  /* ------------------------------------------------------------------------ */
  /* Current Track                                                            */
  /* ------------------------------------------------------------------------ */

  const fetchNowPlaying = async () => {
    try {
      const response = await fetch(
        "/api/now-playing",
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch current track"
        );
      }

      const result: NowPlayingResponse =
        await response.json();

      setTrack(result.data ?? null);
      setError("");
    } catch (error) {
      console.error(
        "Failed to fetch current track:",
        error
      );
    } finally {
      setLoadingTrack(false);
    }
  };

  useEffect(() => {
    fetchNowPlaying();

    const interval = window.setInterval(
      () => {
        fetchNowPlaying();
      },
      15000
    );

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  /* ------------------------------------------------------------------------ */
  /* Schedule Refresh                                                         */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    const interval = window.setInterval(
      () => {
        setCurrentProgram(
          getCurrentSchedule()
        );
      },
      30000
    );

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  /* ------------------------------------------------------------------------ */
  /* Volume                                                                   */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!audioRef.current) return;

    audioRef.current.volume =
      volume / 100;
  }, [volume]);

  /* ------------------------------------------------------------------------ */
  /* Playback                                                                 */
  /* ------------------------------------------------------------------------ */

  const togglePlay = async () => {
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        return;
      }

      setError("");

      await audioRef.current.play();

      setIsPlaying(true);
    } catch (error) {
      console.error(
        "Unable to play radio stream:",
        error
      );

      setIsPlaying(false);

      setError(
        "Unable to start the live stream. Please try again."
      );
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
    setError("");
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleAudioError = () => {
    setIsPlaying(false);

    setError(
      "Live stream is currently unavailable."
    );
  };

  /* ------------------------------------------------------------------------ */
  /* Track Information                                                        */
  /* ------------------------------------------------------------------------ */

  const trackTitle =
    track?.track_title ||
    track?.title ||
    "Zero FM Live";

  const trackArtist =
    track?.track_artist ||
    track?.artist ||
    "Zero FM";

  const artwork =
    track?.artwork_urls?.large ||
    track?.artwork_urls?.standard ||
    "";

  useEffect(() => {
    setArtworkFailed(false);
  }, [artwork]);

  /* ------------------------------------------------------------------------ */
  /* Helpers                                                                  */
  /* ------------------------------------------------------------------------ */

  const scrollTo = (id: string) => {
    const element =
      document.getElementById(id);

    if (!element) return;

    element.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleAppLink = (
    event: MouseEvent<HTMLAnchorElement>,
    url: string
  ) => {
    if (url === "#") {
      event.preventDefault();
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="w-full">
      {/* ================================================================== */}
      {/* HEADER                                                             */}
      {/* ================================================================== */}

      <div className="mx-auto mb-64 flex w-full max-w-[1380px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FFD400] text-[#090D16] shadow-[0_8px_30px_rgba(255,212,0,0.12)] sm:h-12 sm:w-12">
            <RadioIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>

          <div className="min-w-0">
            <p className="font-mono text-[8px] font-bold uppercase tracking-[0.24em] text-[#FFD400] sm:text-[9px]">
              Zero FM On-Air Studio
            </p>

            <h1 className="mt-1 truncate text-2xl font-bold tracking-[-0.035em] text-white sm:text-[30px]">
              Live Player & Station Schedule
            </h1>
          </div>
        </div>

        <div className="hidden shrink-0 items-center gap-2 rounded-full border border-white/[0.08] bg-[#0F1523] px-4 py-2.5 sm:flex">
          <span className="h-2 w-2 rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.35)]" />

          <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/45">
            Colombo, Sri Lanka (UTC+5:30)
          </span>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={RADIO_STREAM_URL}
        preload="none"
        onPlay={handlePlay}
        onPause={handlePause}
        onError={handleAudioError}
      />

      {/* ================================================================== */}
      {/* THREE CARDS                                                        */}
      {/* ================================================================== */}

<div className="mx-auto grid w-full max-w-[1380px] items-stretch gap-2.5 px-3 sm:px-4 lg:h-[560px] lg:grid-cols-[1.16fr_0.84fr_0.94fr] lg:px-5 xl:gap-3">        {/* ================================================================ */}
        {/* LEFT — RADIO PLAYER                                             */}
        {/* ================================================================ */}

        <section
          id="live"
className="relative h-full overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#0F1523] transition-[border-color,box-shadow] duration-300 hover:border-white/[0.12]"        >
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div
              className={`absolute left-[-120px] top-[-80px] h-[330px] w-[330px] rounded-full blur-[100px] transition-opacity duration-700 ${
                isPlaying
                  ? "bg-[#FFD400]/[0.055] opacity-100"
                  : "bg-[#FFD400]/[0.025] opacity-70"
              }`}
            />

            <div className="absolute bottom-[-150px] right-[-100px] h-[350px] w-[350px] rounded-full bg-blue-500/[0.025] blur-[110px]" />
          </div>

          <div className="relative p-4 sm:p-5">
            {/* ON AIR */}

            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#FFD400]/25 bg-[#FFD400]/[0.035] px-3 py-1.5">
                <span className="flex items-center gap-[2px] text-[#FFD400]">
                  <span
                    className={`h-2 w-[2px] rounded-full ${
                      isPlaying
                        ? "animate-pulse bg-[#FFD400]"
                        : "bg-[#FFD400]/35"
                    }`}
                  />

                  <span
                    className={`h-3 w-[2px] rounded-full ${
                      isPlaying
                        ? "animate-pulse bg-[#FFD400]"
                        : "bg-[#FFD400]/35"
                    }`}
                  />

                  <span
                    className={`h-2 w-[2px] rounded-full ${
                      isPlaying
                        ? "animate-pulse bg-[#FFD400]"
                        : "bg-[#FFD400]/35"
                    }`}
                  />
                </span>

                <span className="font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-[#FFD400]">
                  On Air
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isPlaying
                      ? "animate-pulse bg-emerald-400"
                      : "bg-white/20"
                  }`}
                />

                <span className="font-mono text-[7px] uppercase tracking-[0.15em] text-white/30">
                  {isPlaying
                    ? "Live Stream"
                    : "Ready"}
                </span>
              </div>
            </div>

            {/* ARTWORK */}

            <div className="relative mx-auto mt-5 aspect-square w-full max-w-[245px] overflow-hidden rounded-[18px] border border-white/[0.08] bg-[#111A2B] shadow-[0_25px_80px_rgba(0,0,0,0.35)]">
              {artwork && !artworkFailed ? (
                <img
                  src={artwork}
                  alt={`${trackTitle} artwork`}
                  className="absolute inset-0 h-full w-full object-cover"
                  onError={() => {
                    setArtworkFailed(true);
                  }}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-[#0B111D]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,212,0,0.08),transparent_58%)]" />

                  <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.035),transparent_45%,rgba(255,212,0,0.018))]" />

                  <div className="relative flex h-36 w-36 items-center justify-center rounded-full border border-white/[0.08] bg-[#090D16] shadow-[0_20px_60px_rgba(0,0,0,0.45)] sm:h-36 sm:w-36">
                    <div className="absolute inset-3 rounded-full border border-[#FFD400]/15" />

                    <div className="absolute inset-7 rounded-full border border-white/[0.05]" />

                    <div className="text-center">
                      <span className="block text-2xl font-black tracking-[-0.08em] text-white sm:text-3xl">
                        ZERO
                      </span>

                      <span className="mt-1 block font-mono text-[6px] uppercase tracking-[0.22em] text-white/30">
                        FM.LIVE
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-[#090D16]/45 via-transparent to-transparent" />
            </div>

            {/* TRACK */}

            <div className="mt-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                <span className="font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-emerald-400">
                  Live Now
                </span>
              </div>

              {loadingTrack ? (
                <>
                  <div className="mx-auto mt-3 h-6 w-56 animate-pulse rounded bg-white/[0.05]" />

                  <div className="mx-auto mt-2 h-4 w-28 animate-pulse rounded bg-white/[0.05]" />
                </>
              ) : (
                <>
                  <h2 className="mx-auto mt-3 max-w-[500px] break-words text-lg font-bold leading-tight text-white sm:text-xl">
                    {trackTitle}
                  </h2>

                  <p className="mt-1.5 text-sm text-white/45">
                    {trackArtist}
                  </p>
                </>
              )}

              <div className="mt-3 flex items-center justify-center gap-2">
                <span className="rounded-md border border-white/[0.08] bg-white/[0.025] px-3 py-1.5 font-mono text-[7px] uppercase tracking-[0.12em] text-white/35">
                  Live Radio
                </span>

                <span className="rounded-md border border-white/[0.08] bg-white/[0.025] px-3 py-1.5 font-mono text-[7px] uppercase tracking-[0.12em] text-white/35">
                  320kbps Stream
                </span>
              </div>
            </div>

            {/* WAVEFORM */}

            <div className="relative mt-1 overflow-hidden rounded-xl border border-white/[0.06] bg-[#080D17] px-4 py-4">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />

              <div className="flex h-[46px] items-center justify-center gap-[3px]">
                {WAVEFORM.map(
                  (height, index) => (
                    <span
                      key={index}
                      className={`wave-bar w-[3px] rounded-full transition-colors duration-300 ${
                        isPlaying
                          ? "is-playing bg-[#FFD400] shadow-[0_0_8px_rgba(255,212,0,0.22)]"
                          : "bg-white/20"
                      }`}
                      style={{
                        height: `${height}px`,
                        opacity: isPlaying
                          ? 0.92
                          : 0.22,
                        animationDelay: `${index * 38}ms`,
                        transformOrigin:
                          "center",
                      }}
                    />
                  )
                )}
              </div>
            </div>

            {/* CONTROLS */}

            <div className="mt-4 flex items-center gap-2">
              {/* VOLUME */}

              <div className="flex min-w-0 flex-1 items-center gap-2.5">
                <VolumeIcon
                  className={`h-4 w-4 shrink-0 ${
                    volume > 0
                      ? "text-[#FFD400]"
                      : "text-white/25"
                  }`}
                />

                <div className="relative flex-1">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(event) =>
                        setVolume(Number(event.target.value))
                    }
                    aria-label="Volume"
                    className="volume-slider w-full cursor-pointer appearance-none"
                    style={{
                        background: `linear-gradient(
                        to right,
                        #FFD400 0%,
                        #FFD400 ${volume}%,
                        rgba(255,255,255,0.10) ${volume}%,
                        rgba(255,255,255,0.10) 100%
                        ) center / 100% 5px no-repeat`,
                    }}
/>
                </div>

                <span className="hidden w-5 text-right font-mono text-[8px] text-white/30 sm:block">
                  {volume}
                </span>
              </div>

              {/* PREVIOUS */}

              <button
                type="button"
                aria-label="Previous track"
                className="hidden h-8 w-8 items-center justify-center rounded-full text-white/30 transition hover:bg-white/[0.04] hover:text-white sm:flex"
              >
                <PreviousIcon className="h-4 w-4" />
              </button>

              {/* PLAY */}

              <button
                type="button"
                onClick={togglePlay}
                aria-label={
                  isPlaying
                    ? "Pause Zero FM"
                    : "Play Zero FM"
                }
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FFD400] text-[#090D16] shadow-[0_0_28px_rgba(255,212,0,0.14)] transition duration-200 hover:scale-105 hover:bg-[#FFE45C] active:scale-95"
              >
                {isPlaying ? (
                  <PauseIcon className="h-6 w-6" />
                ) : (
                  <PlayIcon className="ml-0.5 h-6 w-6" />
                )}
              </button>

              {/* NEXT */}

              <button
                type="button"
                aria-label="Next track"
                className="hidden h-8 w-8 items-center justify-center rounded-full text-white/30 transition hover:bg-white/[0.04] hover:text-white sm:flex"
              >
                <NextIcon className="h-4 w-4" />
              </button>

              {/* SETTINGS */}

              <button
                type="button"
                aria-label="Player settings"
                className="hidden h-8 w-8 items-center justify-center rounded-full text-white/30 transition hover:bg-white/[0.04] hover:text-white sm:flex"
              >
                <SettingsIcon className="h-4 w-4" />
              </button>

              {/* SHARE */}

              <button
                type="button"
                aria-label="Share Zero FM"
                onClick={async () => {
                  try {
                    if (navigator.share) {
                      await navigator.share({
                        title: "Zero FM",
                        text: "Listen to Zero FM Live",
                        url: window.location.href,
                      });
                    } else {
                      await navigator.clipboard.writeText(
                        window.location.href
                      );
                    }
                  } catch {
                    // User cancelled share.
                  }
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full text-white/30 transition hover:bg-white/[0.04] hover:text-white"
              >
                <ShareIcon className="h-4 w-4" />
              </button>
            </div>

            {error && (
              <p className="mt-3 text-center font-mono text-[8px] text-red-400/80">
                {error}
              </p>
            )}
          </div>
        </section>

        {/* ================================================================ */}
        {/* MIDDLE — TODAY'S PROGRAMS                                       */}
        {/* ================================================================ */}

        <section
          id="programs"
        className="relative flex h-full min-h-0 overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#0F1523] transition-[border-color,box-shadow] duration-300 hover:border-white/[0.12]"        >
          <div className="pointer-events-none absolute right-[-100px] top-[-100px] h-[260px] w-[260px] rounded-full bg-[#FFD400]/[0.025] blur-[90px]" />

          <div className="relative flex min-h-0 w-full flex-col p-4 sm:p-5">
            {/* HEADER */}

            <div className="flex shrink-0 items-start justify-between">
              <div>
                <p className="font-mono text-[7px] font-bold uppercase tracking-[0.22em] text-[#FFD400]/80">
                  Zero FM
                </p>

                <div className="mt-2 flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-white/65" />

                  <h2 className="text-lg font-bold text-white">
                    Today's Programs
                  </h2>
                </div>
              </div>

              <span className="pt-3 font-mono text-[7px] uppercase tracking-[0.15em] text-white/30">
                ASIA / COLOMBO
              </span>
            </div>

            {/* SCROLLABLE PROGRAM CONTENT */}

            <div className="program-scroll mt-4 min-h-0 flex-1 overflow-y-auto pr-2">
              {/* LIVE NOW */}

              <div className="rounded-xl border border-[#FFD400]/20 bg-[#FFD400]/[0.025] p-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[8px] font-bold uppercase tracking-[0.16em] text-[#FFD400]/85">
                    Live Now
                  </span>

                  <span className="rounded-full border border-emerald-400/20 bg-emerald-400/[0.07] px-2.5 py-1 font-mono text-[7px] font-bold uppercase tracking-[0.1em] text-emerald-400">
                    ● Live
                  </span>
                </div>

                <p className="mt-2 text-sm font-semibold text-white">
                  {currentProgram?.program ||
                    "Zero Hits"}
                </p>

                <p className="mt-1 font-mono text-[8px] text-white/35">
                  {currentProgram
                    ? `${currentProgram.time} – ${currentProgram.endTime}`
                    : "14:00 – 17:00"}
                </p>
              </div>

              {/* NEXT PROGRAM */}

              <div className="mt-3 rounded-xl border border-white/[0.08] bg-[#090D16]/50 p-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[8px] font-bold uppercase tracking-[0.16em] text-white/40">
                    Next Program
                  </span>

                  <span className="font-mono text-[9px] font-bold text-[#FFD400]/80">
                    17:00
                  </span>
                </div>

                <p className="mt-2 text-sm font-semibold text-white">
                  Deep Lo-Fi & Sri Lankan Ambient
                </p>

                <p className="mt-1 font-mono text-[8px] text-white/35">
                  17:00 – 20:00
                </p>
              </div>

              {/* SCHEDULE */}

              <div className="mt-4">
                {SCHEDULE.map((item) => {
                  const isLive =
                    currentProgram?.program ===
                    item.program;

                  const isNext =
                    item.program ===
                    "Deep Lo-Fi & Sri Lankan Ambient";

                  return (
                    <div
                      key={item.time}
                      className="flex items-center gap-3 border-b border-white/[0.06] py-3"
                    >
                      <div className="w-10 shrink-0">
                        <p
                          className={`font-mono text-[9px] ${
                            isLive
                              ? "text-[#FFD400]"
                              : "text-white/70"
                          }`}
                        >
                          {item.time}
                        </p>

                        <p className="mt-0.5 font-mono text-[7px] text-white/25">
                          {item.time} –{" "}
                          {item.endTime}
                        </p>
                      </div>

                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-[11px] font-semibold ${
                            isLive
                              ? "text-white"
                              : "text-white/75"
                          }`}
                        >
                          {item.program}
                        </p>
                      </div>

                      <span
                        className={`font-mono text-[7px] font-bold uppercase ${
                          isLive
                            ? "text-emerald-400"
                            : isNext
                              ? "text-[#FFD400]/60"
                              : "text-white/25"
                        }`}
                      >
                        {isLive
                          ? "LIVE"
                          : isNext
                            ? "NEXT"
                            : item.number}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* FULL SCHEDULE */}

            <button
              type="button"
              onClick={() =>
                scrollTo("programs")
              }
              className="mt-4 flex h-11 shrink-0 w-full items-center justify-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.015] font-mono text-[8px] font-semibold uppercase tracking-[0.14em] text-white/50 transition hover:border-[#FFD400]/20 hover:text-white"
            >
              View Full Schedule
              <span>→</span>
            </button>
          </div>
        </section>

        {/* ================================================================ */}
        {/* RIGHT — MOBILE COMPANION                                        */}
        {/* ================================================================ */}

        <section className="relative overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#0F1523] transition-[border-color,box-shadow] duration-300 hover:border-white/[0.12]">
          <div className="pointer-events-none absolute right-[-80px] top-[-80px] h-[260px] w-[260px] rounded-full bg-[#FFD400]/[0.025] blur-[80px]" />

          <div className="pointer-events-none absolute bottom-[-100px] left-[-100px] h-[250px] w-[250px] rounded-full bg-blue-500/[0.025] blur-[90px]" />

          <div className="relative h-full p-4 sm:p-5">
            {/* BADGE */}

            <div className="inline-flex items-center gap-2 rounded-full border border-[#FFD400]/20 bg-[#FFD400]/[0.025] px-3 py-1.5">
              <SmartphoneIcon className="h-3 w-3 text-[#FFD400]/90" />

              <span className="font-mono text-[7px] font-bold uppercase tracking-[0.2em] text-[#FFD400]/90">
                Mobile Companion
              </span>
            </div>

            {/* TITLE */}

            <div className="mt-5 max-w-[270px]">
              <h2 className="text-[27px] font-black leading-[0.94] tracking-[-0.04em] text-white">
                TAKE ZERO FM
                <br />
                <span className="text-[#FFD400]">
                  WITH YOU
                </span>
              </h2>

              <p className="mt-4 max-w-[320px] text-[10px] leading-5 text-white/40">
                Listen anytime, anywhere in lossless
                digital fidelity. Zero ads,
                unlimited stream recordings &
                real-time song requesting.
              </p>
            </div>

            {/* PHONE */}

            <div className="pointer-events-none absolute right-0 top-[48px] hidden h-[148px] w-[98px] rotate-[6deg] rounded-[18px] border-[3px] border-[#273247] bg-[#080D17] shadow-2xl sm:block">
              <div className="absolute left-1/2 top-2 h-3 w-9 -translate-x-1/2 rounded-full bg-black" />

              <div className="flex h-full flex-col items-center justify-center rounded-[14px] bg-gradient-to-b from-[#182235] to-[#090D16]">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#FFD400]/20 bg-[#FFD400]/90">
                  <span className="text-[7px] font-black tracking-[-0.08em] text-[#090D16]">
                    ZERO
                  </span>
                </div>

                <p className="mt-3 font-mono text-[6px] uppercase tracking-[0.12em] text-white/30">
                  FM.LIVE
                </p>

                <div className="mt-3 flex items-end gap-[2px]">
                  {[8, 14, 20, 12, 18, 9].map(
                    (height, index) => (
                      <span
                        key={index}
                        className="w-[2px] rounded-full bg-[#FFD400]/75"
                        style={{
                          height: `${height}px`,
                        }}
                      />
                    )
                  )}
                </div>
              </div>
            </div>

            {/* FEATURES */}

            <div className="mt-5 grid grid-cols-2 gap-2">
              {/* LIVE */}

              <button
                type="button"
                onClick={() =>
                  scrollTo("live")
                }
                className="group rounded-lg border border-white/[0.08] bg-[#090D16] p-2.5 text-left transition duration-200 hover:border-[#FFD400]/20 hover:bg-[#FFD400]/[0.025]"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#FFD400]/20 bg-[#FFD400]/[0.08] text-[#FFD400] transition group-hover:bg-[#FFD400]/[0.13]">
                    <RadioIcon className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-white">
                      Live Radio
                    </p>

                    <p className="mt-1 text-[8px] leading-4 text-white/35">
                      24/7 Streaming
                    </p>
                  </div>
                </div>
              </button>

              {/* REQUEST */}

              <button
                type="button"
                onClick={() =>
                  scrollTo("request")
                }
                className="group rounded-lg border border-white/[0.08] bg-[#090D16] p-2.5 text-left transition duration-200 hover:border-[#FFD400]/20 hover:bg-[#FFD400]/[0.025]"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#FFD400]/20 bg-[#FFD400]/[0.08] text-[#FFD400] transition group-hover:bg-[#FFD400]/[0.13]">
                    <MusicIcon className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-white">
                      Request Songs
                    </p>

                    <p className="mt-1 text-[8px] leading-4 text-white/35">
                      Your Favorite Tracks
                    </p>
                  </div>
                </div>
              </button>

              {/* MUSIC */}

              <button
                type="button"
                onClick={() =>
                  scrollTo("music")
                }
                className="group rounded-lg border border-white/[0.08] bg-[#090D16] p-2.5 text-left transition duration-200 hover:border-[#FFD400]/20 hover:bg-[#FFD400]/[0.025]"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#FFD400]/20 bg-[#FFD400]/[0.08] text-[#FFD400] transition group-hover:bg-[#FFD400]/[0.13]">
                    <ListIcon className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-white">
                      Music Library
                    </p>

                    <p className="mt-1 text-[8px] leading-4 text-white/35">
                      Sinhala · Tamil · English
                    </p>
                  </div>
                </div>
              </button>

              {/* PROGRAMS */}

              <button
                type="button"
                onClick={() =>
                  scrollTo("programs")
                }
                className="group rounded-lg border border-white/[0.08] bg-[#090D16] p-2.5 text-left transition duration-200 hover:border-[#FFD400]/20 hover:bg-[#FFD400]/[0.025]"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#FFD400]/20 bg-[#FFD400]/[0.08] text-[#FFD400] transition group-hover:bg-[#FFD400]/[0.13]">
                    <CalendarIcon className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-white">
                      Programs
                    </p>

                    <p className="mt-1 text-[8px] leading-4 text-white/35">
                      Stay Up to Date
                    </p>
                  </div>
                </div>
              </button>
            </div>

            {/* STREAM STATUS */}

            <div className="mt-5 flex items-center justify-between rounded-xl border border-white/[0.10] bg-[#090D16] px-4 py-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400/[0.10]">
                  <span
                    className={`h-3 w-3 rounded-full ${
                      isPlaying
                        ? "animate-pulse bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.45)]"
                        : "bg-white/20"
                    }`}
                  />
                </div>

                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-emerald-400">
                    Zero FM Streaming
                  </p>

                  <p className="mt-1 text-[8px] text-white/35">
                    High Quality Audio
                  </p>
                </div>
              </div>

              <div className="h-6 w-px bg-white/10" />

              <div className="rounded-full border border-white/[0.10] bg-white/[0.025] px-3 py-1.5">
                <span className="flex items-center gap-2 font-mono text-[8px] font-bold text-white/60">
                  <span className="flex items-end gap-[2px]">
                    <span className="h-2 w-[2px] rounded-full bg-[#FFD400]" />
                    <span className="h-3 w-[2px] rounded-full bg-[#FFD400]" />
                    <span className="h-1.5 w-[2px] rounded-full bg-[#FFD400]" />
                    <span className="h-2.5 w-[2px] rounded-full bg-[#FFD400]" />
                  </span>

                  320 KBPS
                </span>
              </div>
            </div>

            {/* APP BUTTONS */}

            <div className="mt-5 grid grid-cols-2 gap-2.5">
              {/* APP STORE */}

              <a
                href={APP_STORE_URL}
                onClick={(event) =>
                  handleAppLink(
                    event,
                    APP_STORE_URL
                  )
                }
                className="flex min-h-[62px] items-center gap-3 rounded-xl border border-white/[0.10] bg-[#090D16] px-4 transition duration-200 hover:border-white/[0.20] hover:bg-white/[0.025]"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center text-white">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-7 w-7"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.81 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.12-.57 1.5-1.31 2.99-2.54 4.08l.01.01ZM12.03 7.25C11.88 5.02 13.69 3.18 15.77 3c.29 2.58-2.34 4.5-3.74 4.25Z" />
                  </svg>
                </div>

                <div>
                  <p className="text-[7px] text-white/35">
                    Download on the
                  </p>

                  <p className="mt-0.5 text-sm font-semibold text-white">
                    App Store
                  </p>
                </div>
              </a>

              {/* GOOGLE PLAY */}

              <a
                href={GOOGLE_PLAY_URL}
                onClick={(event) =>
                  handleAppLink(
                    event,
                    GOOGLE_PLAY_URL
                  )
                }
                className="flex min-h-[62px] items-center gap-3 rounded-xl border border-white/[0.10] bg-[#090D16] px-4 transition duration-200 hover:border-white/[0.20] hover:bg-white/[0.025]"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center">
                  <GooglePlayIcon className="h-8 w-8" />
                </div>

                <div>
                  <p className="text-[7px] text-white/35">
                    Get it on
                  </p>

                  <p className="mt-0.5 text-sm font-semibold text-white">
                    Google Play
                  </p>
                </div>
              </a>
            </div>
          </div>
        </section>
      </div>

      {/* ================================================================== */}
      {/* BOTTOM INFO                                                        */}
      {/* ================================================================== */}

      <div className="mx-auto mt-30 flex w-full max-w-[1380px] flex-col gap-2 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#FFD400]" />

          <span className="font-mono text-[7px] uppercase tracking-[0.18em] text-white/25">
            Zero FM · Colombo 104.2 FM
          </span>
        </div>

        <span className="font-mono text-[7px] uppercase tracking-[0.18em] text-white/20">
          Nationwide Digital Stream · 24/7
        </span>
      </div>

      {/* ================================================================== */}
      {/* CUSTOM RANGE + SCROLLBAR                                          */}
      {/* ================================================================== */}

      <style jsx>{`
        /* -------------------------------------------------------------- */
        /* Waveform                                                       */
        /* -------------------------------------------------------------- */

        .wave-bar {
          animation-name: zeroFmWave;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
          animation-play-state: paused;
        }

        .wave-bar:nth-child(3n) {
          animation-duration: 720ms;
        }

        .wave-bar:nth-child(3n + 1) {
          animation-duration: 900ms;
        }

        .wave-bar:nth-child(3n + 2) {
          animation-duration: 640ms;
        }

        .wave-bar.is-playing {
          animation-play-state: running;
        }

        @keyframes zeroFmWave {
          0%,
          100% {
            transform: scaleY(0.72);
          }

          50% {
            transform: scaleY(1.18);
          }
        }

        /* -------------------------------------------------------------- */
        /* Volume                                                         */
        /* -------------------------------------------------------------- */

        .volume-slider::-webkit-slider-thumb {
          appearance: none;
          width: 13px;
          height: 13px;
          border-radius: 9999px;
          background: #ffd400;
          border: 2px solid #0f1523;
          box-shadow:
            0 0 0 1px rgba(255, 212, 0, 0.2),
            0 0 8px rgba(255, 212, 0, 0.12);
          cursor: pointer;
        }

        .volume-slider::-moz-range-thumb {
          width: 13px;
          height: 13px;
          border-radius: 9999px;
          background: #ffd400;
          border: 2px solid #0f1523;
          box-shadow:
            0 0 0 1px rgba(255, 212, 0, 0.2),
            0 0 8px rgba(255, 212, 0, 0.12);
          cursor: pointer;
        }

        .volume-slider::-webkit-slider-runnable-track {
          height: 5px;
          border-radius: 9999px;
        }

        .volume-slider::-moz-range-track {
          height: 5px;
          border-radius: 9999px;
        }

        /* -------------------------------------------------------------- */
        /* Program Scroll                                                  */
        /* -------------------------------------------------------------- */

        .program-scroll {
          scrollbar-width: thin;
          scrollbar-color:
            rgba(255, 212, 0, 0.3)
            rgba(255, 255, 255, 0.03);
        }

        .program-scroll::-webkit-scrollbar {
          width: 4px;
        }

        .program-scroll::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.025);
          border-radius: 9999px;
        }

        .program-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 212, 0, 0.3);
          border-radius: 9999px;
        }

        .program-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 212, 0, 0.48);
        }

        /* -------------------------------------------------------------- */
        /* Mobile                                                         */
        /* -------------------------------------------------------------- */

        @media (max-width: 1023px) {
          .program-scroll {
            max-height: 520px;
          }
        }

        @media (max-width: 639px) {
          .program-scroll {
            max-height: 460px;
          }
        }
      `}</style>
    </div>
  );
}