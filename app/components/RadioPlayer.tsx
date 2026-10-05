"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, MouseEvent } from "react";
import Schedule from "./Schedule";
import { useLanguage } from "./LanguageContext";
import {
  fetchNowPlaying,
  NOW_PLAYING_POLL_MS,
} from "../lib/now-playing";
import {
  PLAY_EVENT,
  showToast,
} from "../lib/ui-events";

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
  const { t } = useLanguage();

  const audioRef =
    useRef<HTMLAudioElement | null>(null);

  const [isPlaying, setIsPlaying] =
    useState(false);

  const [volume, setVolume] =
    useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const previousVolumeRef = useRef(80);

  const [track, setTrack] =
    useState<TrackData | null>(null);

  const [artworkFailed, setArtworkFailed] =
    useState(false);

  const [loadingTrack, setLoadingTrack] =
    useState(true);

  const [error, setError] =
    useState("");

  // Waiting for the stream to start after pressing play
  const [isBuffering, setIsBuffering] =
    useState(false);

  const [settingsOpen, setSettingsOpen] =
    useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  // Sleep timer: when the radio should stop by itself
  const [sleepEndsAt, setSleepEndsAt] =
    useState<number | null>(null);
  const [sleepMinutesLeft, setSleepMinutesLeft] =
    useState(0);
  const [sleepChoice, setSleepChoice] =
    useState<number | null>(null);

  /* ------------------------------------------------------------------------ */
  /* Current Track                                                            */
  /* ------------------------------------------------------------------------ */

  const loadNowPlaying = async () => {
    try {
      const result =
        await fetchNowPlaying<NowPlayingResponse>();

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
    loadNowPlaying();

    const interval = window.setInterval(
      () => {
        loadNowPlaying();
      },
      NOW_PLAYING_POLL_MS
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

  audioRef.current.volume = volume / 100;
  audioRef.current.muted = isMuted || volume === 0;
}, [volume, isMuted]);

  /* ------------------------------------------------------------------------ */
  /* Playback                                                                 */
  /* ------------------------------------------------------------------------ */

  // A live stream can't really be paused: the browser keeps the old audio
  // and resumes from where it stopped, so the player falls further behind
  // the broadcast each time. Stopping drops the connection instead, and
  // playing always reconnects to what's on air right now.
  const stopStream = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    audio.removeAttribute("src");
    audio.load();
  };

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        stopStream();
        setIsPlaying(false);
        return;
      }

      setError("");
      setIsBuffering(true);

      // A fresh address so neither the browser nor a cache serves old audio
      audio.src = `${RADIO_STREAM_URL}?t=${Date.now()}`;
      await audio.play();

      setIsPlaying(true);
    } catch (error) {
      setIsBuffering(false);

      console.error(
        "Unable to play radio stream:",
        error
      );

      setIsPlaying(false);

      setError(
        t("player.playError")
      );
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
    setError("");
  };

  const handlePause = () => {
    setIsPlaying(false);
    setIsBuffering(false);
  };

  const handleAudioError = () => {
    // Stopping clears the stream address; that isn't a real error
    if (!audioRef.current?.getAttribute("src")) return;

    setIsPlaying(false);
    setIsBuffering(false);

    setError(
      t("player.unavailable")
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
  /* Interactions                                                             */
  /* ------------------------------------------------------------------------ */

  // Keep the latest values for listeners that are set up once
  const latest = useRef({ togglePlay, isPlaying, volume, isMuted });
  latest.current = { togglePlay, isPlaying, volume, isMuted };

  // "Listen Live" buttons elsewhere on the page start the player
  useEffect(() => {
    const onPlayRequest = () => {
      document
        .getElementById("live")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });

      if (!latest.current.isPlaying) {
        void latest.current.togglePlay();
      }
    };

    window.addEventListener(PLAY_EVENT, onPlayRequest);
    return () => window.removeEventListener(PLAY_EVENT, onPlayRequest);
  }, []);

  // Keyboard shortcuts: Space / K play-pause, M mute, arrows change volume
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT", "BUTTON", "A", "IFRAME"].includes(
            target.tagName
          ))
      ) {
        return;
      }

      // Don't react while a popup is open
      if (document.querySelector('[aria-modal="true"]')) return;

      const { volume: currentVolume, isMuted: muted } = latest.current;

      if (event.key === " " || event.key.toLowerCase() === "k") {
        event.preventDefault();
        void latest.current.togglePlay();
      } else if (event.key.toLowerCase() === "m") {
        setIsMuted(!muted);
        showToast(muted ? t("player.unmuted") : t("player.muted"));
      } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        event.preventDefault();
        const next = Math.min(
          100,
          Math.max(0, currentVolume + (event.key === "ArrowUp" ? 5 : -5))
        );
        setVolume(next);
        setIsMuted(false);
        showToast(t("player.volumeToast", { n: next }));
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [t]);

  // Show the song on the browser tab and phone lock screen while playing
  useEffect(() => {
    const baseTitle = document.title.replace(/^▶ .*? · /, "");

    if (isPlaying) {
      document.title = `▶ ${trackTitle} · ${baseTitle}`;
    }

    if ("mediaSession" in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: trackTitle,
        artist: trackArtist,
        album: "Zero FM Live",
        artwork: artwork
          ? [{ src: artwork, sizes: "512x512" }]
          : [],
      });

      navigator.mediaSession.setActionHandler("play", () => {
        void latest.current.togglePlay();
      });
      navigator.mediaSession.setActionHandler("pause", () => {
        void latest.current.togglePlay();
      });
    }

    return () => {
      document.title = baseTitle;
    };
  }, [isPlaying, trackTitle, trackArtist, artwork]);

  // Sleep timer countdown
  useEffect(() => {
    if (!sleepEndsAt) return;

    const tick = () => {
      const left = sleepEndsAt - Date.now();

      if (left <= 0) {
        stopStream();
        setSleepEndsAt(null);
        setSleepChoice(null);
        showToast(t("player.sleepEnded"));
        return;
      }

      setSleepMinutesLeft(Math.ceil(left / 60_000));
    };

    tick();
    const interval = window.setInterval(tick, 15_000);
    return () => window.clearInterval(interval);
  }, [sleepEndsAt, t]);

  const setSleepTimer = (minutes: number | null) => {
    setSleepChoice(minutes);

    if (!minutes) {
      setSleepEndsAt(null);
      showToast(t("player.sleepOff"));
      return;
    }

    setSleepEndsAt(Date.now() + minutes * 60_000);
    setSleepMinutesLeft(minutes);
    showToast(t("player.sleepSet", { n: minutes }));
  };

  // Close the settings menu when clicking elsewhere
  useEffect(() => {
    if (!settingsOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!settingsRef.current?.contains(event.target as Node)) {
        setSettingsOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSettingsOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [settingsOpen]);

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

      <div className="mx-auto mb-8 flex w-full max-w-[1380px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-4">
          <div className="mt-24 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FFD400] text-[#090D16] shadow-[0_8px_30px_rgba(255,212,0,0.12)] sm:h-12 sm:w-12">
            <RadioIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>

          <div className="min-w-0">
            <p className="mt-24 font-mono text-[8px] font-bold uppercase tracking-[0.24em] text-[#FFD400] sm:text-[9px]">
              {t("player.studio")}
            </p>

            <h1 className="mt-1 truncate text-2xl font-bold tracking-[-0.035em] text-white sm:text-[30px]">
              {t("player.title")}
            </h1>
          </div>
        </div>

        <div className="mt-24 hidden shrink-0 items-center gap-2 rounded-full border border-white/[0.08] bg-[#0F1523] px-4 py-2.5 sm:flex">
          <span className="h-2 w-2 rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.35)]" />

          <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/45">
            {t("player.location")}
          </span>
        </div>
      </div>

      {/* ================================================================== */}
      {/* AUDIO                                                               */}
      {/* ================================================================== */}

      <audio
        ref={audioRef}
        preload="none"
        onPlay={handlePlay}
        onPlaying={() => setIsBuffering(false)}
        onWaiting={() => setIsBuffering(true)}
        onPause={handlePause}
        onError={handleAudioError}
      />

      {/* ================================================================== */}
      {/* THREE CARDS                                                        */}
      {/* ================================================================== */}

      <div className="mx-auto grid w-full max-w-[1380px] items-stretch gap-2.5 px-3 sm:px-4 lg:h-[680px] lg:min-h-[560px] lg:grid-cols-[1.16fr_0.84fr_0.94fr] lg:px-5 xl:gap-3">

        {/* ================================================================ */}
        {/* LEFT — RADIO PLAYER                                             */}
        {/* ================================================================ */}

        <section
          id="live"
          className="relative min-h-full overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#0F1523] transition-[border-color,box-shadow] duration-300 hover:border-white/[0.12]"
        >
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
                  {t("player.onAir")}
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
                    ? t("player.liveStream")
                    : t("player.ready")}
                </span>
              </div>
            </div>

            {/* ARTWORK */}

            <div
              className={`group/art relative mx-auto mt-5 aspect-square w-full max-w-[245px] overflow-hidden rounded-[18px] border bg-[#111A2B] shadow-[0_25px_80px_rgba(0,0,0,0.35)] transition-[border-color,box-shadow] duration-500 ${
                isPlaying
                  ? "artwork-breathe border-[#FFD400]/25 shadow-[0_25px_80px_rgba(255,212,0,0.10)]"
                  : "border-white/[0.08]"
              }`}
            >
              {artwork && !artworkFailed ? (
                <img
                  key={artwork}
                  src={artwork}
                  alt={`${trackTitle} artwork`}
                  className="track-fade absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover/art:scale-105"
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
                  {t("player.liveNow")}
                </span>
              </div>

              {loadingTrack ? (
                <>
                  <div className="mx-auto mt-3 h-6 w-56 animate-pulse rounded bg-white/[0.05]" />

                  <div className="mx-auto mt-2 h-4 w-28 animate-pulse rounded bg-white/[0.05]" />
                </>
              ) : (
                <>
                  <h2
                    key={`title-${trackTitle}`}
                    className="track-fade mx-auto mt-3 max-w-[500px] break-words text-lg font-bold leading-tight text-white sm:text-xl"
                  >
                    {trackTitle}
                  </h2>

                  <p
                    key={`artist-${trackArtist}`}
                    className="track-fade mt-1.5 text-sm text-white/45"
                  >
                    {trackArtist}
                  </p>
                </>
              )}

              <div className="mt-3 flex items-center justify-center gap-2">
                <span className="rounded-md border border-white/[0.08] bg-white/[0.025] px-3 py-1.5 font-mono text-[7px] uppercase tracking-[0.12em] text-white/35">
                  {t("player.liveRadio")}
                </span>

                <span className="rounded-md border border-white/[0.08] bg-white/[0.025] px-3 py-1.5 font-mono text-[7px] uppercase tracking-[0.12em] text-white/35">
                  {t("player.streamBitrate")}
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
                <button
  type="button"
  onClick={() => {
    if (isMuted || volume === 0) {
      setIsMuted(false);

      if (volume === 0) {
        setVolume(previousVolumeRef.current || 80);
      }
    } else {
      previousVolumeRef.current = volume;
      setIsMuted(true);
    }
  }}
  aria-label={isMuted || volume === 0 ? t("player.unmute") : t("player.mute")}
  title={isMuted || volume === 0 ? t("player.unmute") : t("player.mute")}
  className="shrink-0 cursor-pointer rounded-full transition hover:scale-110"
>
  <VolumeIcon
    className={`h-4 w-4 ${
      isMuted || volume === 0
        ? "text-white/25"
        : "text-[#FFD400]"
    }`}
  />
</button>

              <div className="relative flex h-[13px] flex-1 items-center">
  <input
    type="range"
    min="0"
    max="100"
    value={volume}
    onChange={(event) =>
      setVolume(Number(event.target.value))
    }
    aria-label={t("player.volumeAria")}
    className="volume-slider block h-[13px] w-full cursor-pointer appearance-none"
    style={
      {
        "--volume": `${volume}%`,
      } as CSSProperties
    }
  />
</div>
                <span className="hidden w-5 text-right font-mono text-[8px] text-white/30 sm:block">
                  {volume}
                </span>
              </div>

              {/* PLAY */}

              <button
                type="button"
                onClick={togglePlay}
                aria-label={
                  isPlaying
                    ? t("player.pause")
                    : t("player.play")
                }
                title={`${isPlaying ? t("player.pause") : t("player.play")} (Space)`}
                className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FFD400] text-[#090D16] shadow-[0_0_28px_rgba(255,212,0,0.14)] transition duration-200 hover:scale-105 hover:bg-[#FFE45C] active:scale-95"
              >
                {isPlaying && !isBuffering && (
                  <span
                    aria-hidden="true"
                    className="play-ring pointer-events-none absolute inset-0 rounded-full border-2 border-[#FFD400]"
                  />
                )}

                {isBuffering ? (
                  <span
                    aria-label={t("player.connecting")}
                    className="h-5 w-5 animate-spin rounded-full border-2 border-[#090D16]/25 border-t-[#090D16]"
                  />
                ) : isPlaying ? (
                  <PauseIcon className="h-6 w-6" />
                ) : (
                  <PlayIcon className="ml-0.5 h-6 w-6" />
                )}
              </button>

              {/* SETTINGS: sleep timer and keyboard shortcuts */}

              <div ref={settingsRef} className="relative hidden sm:block">
                <button
                  type="button"
                  aria-label={t("player.settings")}
                  aria-expanded={settingsOpen}
                  onClick={() => setSettingsOpen((open) => !open)}
                  className={`relative flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-white/[0.04] hover:text-white ${
                    settingsOpen || sleepEndsAt
                      ? "text-[#FFD400]"
                      : "text-white/30"
                  }`}
                >
                  <SettingsIcon
                    className={`h-4 w-4 transition-transform duration-300 ${
                      settingsOpen ? "rotate-90" : ""
                    }`}
                  />

                  {sleepEndsAt && (
                    <span className="absolute right-1 top-1 size-1.5 rounded-full bg-[#FFD400]" />
                  )}
                </button>

                {settingsOpen && (
                  <div className="settings-pop absolute bottom-11 right-0 z-30 w-[230px] rounded-xl border border-white/[0.1] bg-[#111A2B] p-3 text-left shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                    <p className="font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-[#FFD400]">
                      {t("player.sleepTimer")}
                    </p>

                    {sleepEndsAt && (
                      <p className="mt-1 text-[11px] text-white/55">
                        {t("player.sleepLeft", { n: sleepMinutesLeft })}
                      </p>
                    )}

                    <div className="mt-2 grid grid-cols-4 gap-1.5">
                      {[null, 15, 30, 60].map((minutes) => {
                        const selected = sleepChoice === minutes;

                        return (
                          <button
                            key={minutes ?? "off"}
                            type="button"
                            onClick={() => {
                              setSleepTimer(minutes);
                              setSettingsOpen(false);
                            }}
                            className={`rounded-lg border px-1 py-1.5 font-mono text-[10px] transition ${
                              selected
                                ? "border-[#FFD400]/40 bg-[#FFD400]/10 text-[#FFD400]"
                                : "border-white/[0.08] text-white/70 hover:border-[#FFD400]/30 hover:text-[#FFD400]"
                            }`}
                          >
                            {minutes ? `${minutes}m` : t("player.off")}
                          </button>
                        );
                      })}
                    </div>

                    <p className="mt-4 font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-[#FFD400]">
                      {t("player.shortcuts")}
                    </p>

                    <ul className="mt-2 space-y-1.5 text-[11px] text-white/60">
                      {[
                        ["Space", t("player.shortcutPlay")],
                        ["M", t("player.shortcutMute")],
                        ["↑ ↓", t("player.shortcutVolume")],
                      ].map(([key, label]) => (
                        <li
                          key={key}
                          className="flex items-center justify-between gap-2"
                        >
                          <span>{label}</span>
                          <kbd className="rounded border border-white/[0.12] bg-white/[0.04] px-1.5 py-0.5 font-mono text-[9px] text-white/70">
                            {key}
                          </kbd>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* SHARE */}

              <button
                type="button"
                aria-label={t("player.share")}
                onClick={async () => {
                  try {
                    const text = t("player.shareText", {
                      track: trackTitle,
                    });

                    if (navigator.share) {
                      await navigator.share({
                        title: "Zero FM",
                        text,
                        url: window.location.href,
                      });
                    } else {
                      await navigator.clipboard.writeText(
                        `${text} ${window.location.href}`
                      );
                      showToast(t("player.linkCopied"));
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
        {/* MIDDLE — REAL-TIME TODAY'S PROGRAMS                            */}
        {/* ================================================================ */}

        <section
  className="relative flex h-full min-h-0 min-w-0 overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#0F1523] transition-[border-color,box-shadow] duration-300 hover:border-white/[0.12]"
>
  <div className="pointer-events-none absolute right-[-100px] top-[-100px] h-[260px] w-[260px] rounded-full bg-[#FFD400]/[0.025] blur-[90px]" />

  <div className="relative flex min-h-0 w-full min-w-0 flex-col overflow-hidden">
    <Schedule />
  </div>
</section>

        {/* ================================================================ */}
        {/* RIGHT — MOBILE COMPANION                                        */}
        {/* ================================================================ */}

        <section
          id="app"
          className="relative scroll-mt-24 overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#0F1523] transition-[border-color,box-shadow] duration-300 hover:border-white/[0.12]"
        >

          {/* BACKGROUND IMAGE */}

          <img
            src="/images/cinematic-podcast-studio.png"
            alt=""
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-35"
          />

          {/* DARK OVERLAY */}

          <div className="pointer-events-none absolute inset-0 bg-[#0F1523]/65" />

          {/* EXISTING CONTENT */}

          <div className="relative z-10 h-full p-4 sm:p-5">

            {/* BADGE */}

            <div className="inline-flex items-center gap-2 rounded-full border border-[#FFD400]/20 bg-[#FFD400]/[0.025] px-3 py-1.5">
              <SmartphoneIcon className="h-3 w-3 text-[#FFD400]/90" />

              <span className="font-mono text-[7px] font-bold uppercase tracking-[0.2em] text-[#FFD400]/90">
                {t("mobileApp.tag")}
              </span>
            </div>

            {/* TITLE */}

            <div className="mt-5 max-w-[270px]">
              <h2 className="text-[27px] font-black leading-[0.94] tracking-[-0.04em] text-white">
                {t("mobileApp.title1")}
                <br />

                <span className="text-[#FFD400]">
                  {t("mobileApp.title2")}
                </span>
              </h2>

              <p className="mt-4 max-w-[320px] text-[10px] leading-5 text-white/40">
                {t("mobileApp.desc")}
              </p>
            </div>

            {/* FEATURES */}

            <div className="mt-5 grid grid-cols-2 gap-2">

              {/* LIVE */}

              <button
                type="button"
                onClick={() =>
                  scrollTo("live")
                }
                className="group rounded-lg border border-white/[0.08] bg-[#090D16] p-2.5 text-left transition duration-200 hover:-translate-y-0.5 hover:border-[#FFD400]/20 hover:bg-[#FFD400]/[0.025]"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#FFD400]/20 bg-[#FFD400]/[0.08] text-[#FFD400] transition duration-300 group-hover:scale-110 group-hover:bg-[#FFD400]/[0.13]">
                    <RadioIcon className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-white">
                      {t("player.liveRadio")}
                    </p>

                    <p className="mt-1 text-[8px] leading-4 text-white/35">
                      {t("mobileApp.streaming247")}
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
                className="group rounded-lg border border-white/[0.08] bg-[#090D16] p-2.5 text-left transition duration-200 hover:-translate-y-0.5 hover:border-[#FFD400]/20 hover:bg-[#FFD400]/[0.025]"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#FFD400]/20 bg-[#FFD400]/[0.08] text-[#FFD400] transition duration-300 group-hover:scale-110 group-hover:bg-[#FFD400]/[0.13]">
                    <MusicIcon className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-white">
                      {t("features.requestSongs")}
                    </p>

                    <p className="mt-1 text-[8px] leading-4 text-white/35">
                      {t("mobileApp.favoriteTracks")}
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
                className="group rounded-lg border border-white/[0.08] bg-[#090D16] p-2.5 text-left transition duration-200 hover:-translate-y-0.5 hover:border-[#FFD400]/20 hover:bg-[#FFD400]/[0.025]"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#FFD400]/20 bg-[#FFD400]/[0.08] text-[#FFD400] transition duration-300 group-hover:scale-110 group-hover:bg-[#FFD400]/[0.13]">
                    <ListIcon className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-white">
                      {t("mobileApp.musicLibrary")}
                    </p>

                    <p className="mt-1 text-[8px] leading-4 text-white/35">
                      {t("mobileApp.languages")}
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
                className="group rounded-lg border border-white/[0.08] bg-[#090D16] p-2.5 text-left transition duration-200 hover:-translate-y-0.5 hover:border-[#FFD400]/20 hover:bg-[#FFD400]/[0.025]"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#FFD400]/20 bg-[#FFD400]/[0.08] text-[#FFD400] transition duration-300 group-hover:scale-110 group-hover:bg-[#FFD400]/[0.13]">
                    <CalendarIcon className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-white">
                      {t("nav.programs")}
                    </p>

                    <p className="mt-1 text-[8px] leading-4 text-white/35">
                      {t("mobileApp.stayUpToDate")}
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
                    {t("mobileApp.zeroStreaming")}
                  </p>

                  <p className="mt-1 text-[8px] text-white/35">
                    {t("mobileApp.highQuality")}
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
                    {t("mobileApp.downloadOn")}
                  </p>

                  <p className="mt-0.5 text-sm font-semibold text-white">
                    {t("mobileApp.appStore")}
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
                    {t("mobileApp.getItOn")}
                  </p>

                  <p className="mt-0.5 text-sm font-semibold text-white">
                    {t("mobileApp.googlePlay")}
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
          <span className="h-2 w-2 rounded-full bg-[#FFD400]" />

          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/40 sm:text-[12px]">
            {t("player.footerStation")}
          </span>
        </div>

        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/35 sm:text-[12px]">
          {t("player.footerStream")}
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

        /* -------------------------------------------------------------- */
        /* Player motion                                                  */
        /* -------------------------------------------------------------- */

        .artwork-breathe {
          animation: zeroFmBreathe 4s ease-in-out infinite;
        }

        @keyframes zeroFmBreathe {
          0%,
          100% {
            scale: 1;
          }

          50% {
            scale: 1.015;
          }
        }

        .play-ring {
          animation: zeroFmRing 1.8s ease-out infinite;
        }

        @keyframes zeroFmRing {
          from {
            opacity: 0.55;
            scale: 1;
          }

          to {
            opacity: 0;
            scale: 1.6;
          }
        }

        .track-fade {
          animation: zeroFmTrackIn 0.6s ease;
        }

        @keyframes zeroFmTrackIn {
          from {
            opacity: 0;
            translate: 0 6px;
          }
        }

        .settings-pop {
          animation: zeroFmPop 0.18s ease-out;
        }

        @keyframes zeroFmPop {
          from {
            opacity: 0;
            translate: 0 6px;
            scale: 0.97;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .artwork-breathe,
          .play-ring,
          .track-fade,
          .settings-pop {
            animation: none;
          }
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
  -webkit-appearance: none;
  appearance: none;
  width: 13px;
  height: 13px;
  margin-top: 0;
  border-radius: 9999px;
  background: #ffd400;
  border: 2px solid #0f1523;
  box-shadow:
    0 0 0 1px rgba(255, 212, 0, 0.2),
    0 0 8px rgba(255, 212, 0, 0.12);
  cursor: pointer;
}

.volume-slider {
  background: transparent;
}

.volume-slider::-webkit-slider-runnable-track {
  height: 5px;
  border-radius: 9999px;
  background: linear-gradient(
    to right,
    #ffd400 0%,
    #ffd400 var(--volume),
    rgba(255, 255, 255, 0.1) var(--volume),
    rgba(255, 255, 255, 0.1) 100%
  );
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 13px;
  height: 13px;
  margin-top: -4px;
  border-radius: 9999px;
  background: #ffd400;
  border: 2px solid #0f1523;
  box-shadow:
    0 0 0 1px rgba(255, 212, 0, 0.2),
    0 0 8px rgba(255, 212, 0, 0.12);
  cursor: pointer;
}

.volume-slider::-moz-range-track {
  height: 5px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.1);
}

.volume-slider::-moz-range-progress {
  height: 5px;
  border-radius: 9999px;
  background: #ffd400;
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