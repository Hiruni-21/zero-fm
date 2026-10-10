"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { useLanguage } from "./LanguageContext";
import { useLiveRadio } from "./LiveRadio";
import NowPlayingArt from "./NowPlayingArt";

/*
 * Slim player fixed at the top of the screen, under the menu bar (`top`
 * says how far down). It doesn't play anything itself: it controls the
 * site's one live stream, so it can sit on every page.
 */

export default function MiniPlayer({ top = "top-[72px]" }: { top?: string }) {
  const { t } = useLanguage();
  const radio = useLiveRadio();
  const state = {
    isPlaying: radio.isPlaying,
    isBuffering: radio.isBuffering,
    volume: radio.volume,
    isMuted: radio.isMuted,
    title: radio.trackTitle,
    artist: radio.trackArtist,
  };

  const silent = state.isMuted || state.volume === 0;

  return (
    <div
      className={`fixed inset-x-0 ${top} z-[99] border-b border-[#FFD400]/15 bg-[#070B13]/80 shadow-[0_18px_40px_rgba(0,0,0,0.4)] backdrop-blur-xl`}
      role="region"
      aria-label={t("player.liveRadio")}
    >
      {/* Gold hairline that glows while the radio plays */}
      <div
        aria-hidden="true"
        className={`absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#FFD400] to-transparent transition-opacity duration-700 ${
          state.isPlaying ? "opacity-80" : "opacity-25"
        }`}
      />

      <div className="mx-auto flex h-14 max-w-[1440px] items-center gap-3 px-4 sm:gap-4 sm:px-8 lg:px-12">
        {/* Song */}
        <Link href="/#live" className="flex min-w-0 flex-1 items-center gap-3">
          <div className="relative size-10 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-[#0F1523]">
            <NowPlayingArt playing={state.isPlaying} className="absolute inset-0" />
          </div>

          <div className="min-w-0">
            <p className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#FFD400]">
              <span
                className={`size-1.5 rounded-full ${
                  state.isPlaying ? "animate-pulse bg-[#34D399]" : "bg-red-400"
                }`}
              />
              {state.isBuffering ? t("player.connecting") : t("player.liveNow")}
            </p>
            <p className="truncate text-[14px] font-semibold text-white">
              {state.title}
            </p>
            <p className="truncate text-[12px] text-[#94A3B8]">{state.artist}</p>
          </div>
        </Link>

        {/* Equaliser bars while playing */}
        <div
          aria-hidden="true"
          className="hidden h-5 items-end gap-[3px] md:flex"
        >
          {[0.9, 0.5, 1, 0.7, 0.4].map((height, index) => (
            <span
              key={index}
              className={`w-[3px] rounded-full bg-[#FFD400] ${
                state.isPlaying ? "zf-eq" : ""
              }`}
              style={
                {
                  height: state.isPlaying ? `${height * 100}%` : "20%",
                  animationDelay: `${index * 0.13}s`,
                } as CSSProperties
              }
            />
          ))}
        </div>

        {/* Play / stop */}
        <button
          type="button"
          onClick={() => void radio.togglePlay()}
          aria-label={state.isPlaying ? t("player.pause") : t("player.play")}
          className="relative flex size-10 shrink-0 items-center justify-center rounded-full bg-[#FFD400] text-[#090D16] shadow-[0_0_30px_rgba(255,212,0,0.35)] transition hover:scale-105"
        >
          {state.isBuffering ? (
            <span className="size-5 animate-spin rounded-full border-2 border-[#090D16]/30 border-t-[#090D16]" />
          ) : state.isPlaying ? (
            <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden="true">
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="ml-0.5 size-5" fill="currentColor" aria-hidden="true">
              <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" />
            </svg>
          )}
        </button>

        {/* Volume */}
        <div className="flex shrink-0 items-center gap-2.5">
          <button
            type="button"
            onClick={radio.toggleMute}
            aria-label={silent ? t("player.unmuted") : t("player.muted")}
            className="flex size-9 items-center justify-center rounded-full text-[#FFD400] transition hover:bg-white/[0.06]"
          >
            <svg viewBox="0 0 24 24" className={`size-5 ${silent ? "text-white/30" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M11 5 6 9H3v6h3l5 4V5Z" />
              {silent ? (
                <path d="m22 9-6 6M16 9l6 6" />
              ) : (
                <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
              )}
            </svg>
          </button>

          <input
            type="range"
            min="0"
            max="100"
            value={silent ? 0 : state.volume}
            onChange={(event) => {
              radio.setVolume(Number(event.target.value));
              radio.setIsMuted(false);
            }}
            aria-label={t("player.volumeAria")}
            className="volume-slider hidden h-[13px] w-28 cursor-pointer appearance-none sm:block lg:w-36"
            style={
              { "--volume": `${silent ? 0 : state.volume}%` } as CSSProperties
            }
          />
        </div>
      </div>

      <style jsx global>{`
        /* Equaliser bars */
        .zf-eq {
          animation: zf-eq 0.9s ease-in-out infinite alternate;
          transform-origin: bottom;
        }

        @keyframes zf-eq {
          from {
            transform: scaleY(0.3);
          }
          to {
            transform: scaleY(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .zf-eq {
            animation: none;
          }
        }
      `}</style>

      <style jsx>{`
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
            rgba(255, 255, 255, 0.12) var(--volume),
            rgba(255, 255, 255, 0.12) 100%
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
          cursor: pointer;
        }

        .volume-slider::-moz-range-track {
          height: 5px;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.12);
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
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
