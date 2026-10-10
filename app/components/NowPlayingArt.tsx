"use client";

import { NOW_PLAYING_ART } from "./LiveRadio";

/*
 * The station's own picture for the player, the same for every song.
 * While the radio plays it blinks softly: it brightens with a blue glow
 * and dims again, like an ON AIR light.
 */
export default function NowPlayingArt({
  playing,
  className = "",
}: {
  playing: boolean;
  className?: string;
}) {
  return (
    <div className={`overflow-hidden ${className}`}>
      <img
        src={NOW_PLAYING_ART}
        alt="Zero FM Live"
        draggable={false}
        className={`size-full object-cover ${playing ? "zf-art-blink" : ""}`}
      />

      {/* Blue flash over the picture, in step with the blink */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.35),transparent_65%)] mix-blend-screen ${
          playing ? "zf-art-flash" : "opacity-0"
        }`}
      />

      <style jsx global>{`
        @keyframes zf-art-blink {
          0%,
          100% {
            filter: brightness(0.82) saturate(0.95);
          }
          50% {
            filter: brightness(1.15) saturate(1.1);
          }
        }

        @keyframes zf-art-flash {
          0%,
          100% {
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
        }

        .zf-art-blink {
          animation: zf-art-blink 1.4s ease-in-out infinite;
        }

        .zf-art-flash {
          animation: zf-art-flash 1.4s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .zf-art-blink,
          .zf-art-flash {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
