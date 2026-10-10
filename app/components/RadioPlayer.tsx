"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import Schedule from "./Schedule";
import { useLanguage } from "./LanguageContext";
import { useLiveRadio } from "./LiveRadio";
import NowPlayingArt from "./NowPlayingArt";
import { showToast } from "../lib/ui-events";

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

  // The stream itself lives in LiveRadio (root layout), so it keeps playing
  // on the other pages; this card only shows it and controls it.
  const {
    isPlaying,
    isBuffering,
    volume,
    isMuted,
    trackTitle,
    trackArtist,
    loadingTrack,
    error,
    sleepEndsAt,
    sleepMinutesLeft,
    sleepChoice,
    togglePlay,
    setVolume,
    setIsMuted,
    toggleMute,
    setSleepTimer,
  } = useLiveRadio();

  const [settingsOpen, setSettingsOpen] =
    useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  // Keep the latest values for listeners that are set up once
  const latest = useRef({ togglePlay, volume, isMuted });
  latest.current = { togglePlay, volume, isMuted };

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


  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="relative w-full bg-[#05080F] pt-20 sm:pt-28">
      {/* ================================================================== */}
      {/* HEADER                                                             */}
      {/* ================================================================== */}

      <div className="mx-auto mb-10 flex w-full max-w-[1380px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FFD400] text-[#090D16] shadow-[0_8px_30px_rgba(255,212,0,0.12)] sm:h-12 sm:w-12">
            <RadioIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>

          <div className="min-w-0">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-[#FFD400] sm:text-[11px]">
              {t("player.studio")}
            </p>

            <h2 className="mt-2 font-display text-[28px] font-bold leading-[1.35] tracking-[-0.03em] text-white sm:text-[40px] lg:text-[48px]">
              {t("player.title")}
            </h2>
          </div>
        </div>

        <div className="hidden shrink-0 items-center gap-2 rounded-full border border-white/[0.08] bg-[#0F1523] px-4 py-2.5 sm:flex">
          <span className="h-2 w-2 rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.35)]" />

          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-white/45">
            {t("player.location")}
          </span>
        </div>
      </div>

      {/* ================================================================== */}
      {/* THREE CARDS                                                        */}
      {/* ================================================================== */}

      <div className="mx-auto grid w-full max-w-[1380px] items-stretch gap-2.5 px-3 sm:px-4 lg:h-[680px] lg:min-h-[560px] lg:grid-cols-[1fr_1.2fr] lg:px-5 xl:gap-3 mb-10 sm:mb-14">

        {/* ================================================================ */}
        {/* LEFT — RADIO PLAYER                                             */}
        {/* ================================================================ */}

        <section
          id="live"
          className="zf-card relative min-h-full scroll-mt-[130px] overflow-hidden rounded-[28px]"
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

                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#FFD400]">
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

                <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/30">
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
              <NowPlayingArt
                playing={isPlaying}
                className="absolute inset-0 transition-transform duration-700 group-hover/art:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#090D16]/45 via-transparent to-transparent" />
            </div>

            {/* TRACK */}

            <div className="mt-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-400">
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
                <span className="rounded-md border border-white/[0.08] bg-white/[0.025] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-white/35">
                  {t("player.liveRadio")}
                </span>

                <span className="rounded-md border border-white/[0.08] bg-white/[0.025] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-white/35">
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
  onClick={toggleMute}
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
                <span className="mr-3 w-7 shrink-0 text-right font-mono text-xs tabular-nums text-white/70">
                  {isMuted ? 0 : volume}
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
                    <p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[#FFD400]">
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
                            className={`rounded-lg border px-1 py-1.5 font-mono text-[12px] transition ${
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

                    <p className="mt-4 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[#FFD400]">
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
                          <kbd className="rounded border border-white/[0.12] bg-white/[0.04] px-1.5 py-0.5 font-mono text-[11px] text-white/70">
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
              <p className="mt-3 text-center font-mono text-[10px] text-red-400/80">
                {error}
              </p>
            )}
          </div>
        </section>

        {/* ================================================================ */}
        {/* MIDDLE — REAL-TIME TODAY'S PROGRAMS                            */}
        {/* ================================================================ */}

        <section
  id="programs"
  className="zf-card relative flex h-full min-h-0 min-w-0 scroll-mt-24 overflow-hidden rounded-[28px] lg:scroll-mt-[130px]"
>
  <div className="pointer-events-none absolute right-[-100px] top-[-100px] h-[260px] w-[260px] rounded-full bg-[#FFD400]/[0.025] blur-[90px]" />

  <div className="relative flex min-h-0 w-full min-w-0 flex-col overflow-hidden">
    <Schedule />
  </div>
</section>
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