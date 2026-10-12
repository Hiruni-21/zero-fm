"use client";

import { useEffect, useState } from "react";

type HistoryTrack = {
  title?: string;
  start_time?: string;
  artwork_url?: string | null;
};

type HistoryResponse = {
  data?: HistoryTrack[];
};

export default function RecentlyPlayed() {
  const [tracks, setTracks] = useState<HistoryTrack[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const response = await fetch("/api/history", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch history");
      }

      const result: HistoryResponse = await response.json();

      setTracks((result.data || []).slice(0, 8));
    } catch (error) {
      console.error(
        "Failed to fetch recently played history:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();

    const interval = setInterval(fetchHistory, 60000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <section className="mt-24">
      {/* HEADER */}

      <div className="flex items-end justify-between">
        <div>
          <p className="font-mono text-[12px] font-bold uppercase tracking-[0.3em] text-[#FFD400]">
            Zero FM
          </p>

          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-white">
            Recently Played
          </h2>
        </div>

        <span className="font-mono text-[12px] uppercase tracking-[0.2em] text-white/30">
          Live History
        </span>
      </div>

      {/* LOADING */}

      {loading ? (
        <div className="mt-7 space-y-3">
          {[1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              className="h-[86px] animate-pulse rounded-xl border border-white/10 bg-white/[0.03]"
            />
          ))}
        </div>
      ) : tracks.length === 0 ? (
        /* EMPTY */

        <div className="mt-7 rounded-xl border border-white/10 bg-white/[0.03] p-8 text-center">
          <p className="text-sm text-white/40">
            No recently played tracks available.
          </p>
        </div>
      ) : (
        /* TRACK LIST */

        <div className="mt-7 space-y-3">
          {tracks.map((track, index) => {
            const artwork = track.artwork_url || null;

            return (
              <div
                key={`${track.start_time}-${index}`}
                className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-3 transition duration-200 hover:border-[#FFD400]/30 hover:bg-white/[0.05]"
              >
                {/* ARTWORK */}

                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-[#111827]">
                  {artwork ? (
                    <img
                      src={artwork}
                      alt={track.title || "Zero FM"}
                      className="h-full w-full object-cover"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <span className="text-[11px] font-bold text-[#FFD400]">
                        ZERO
                      </span>
                    </div>
                  )}
                </div>

                {/* TRACK INFORMATION */}

                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-sm font-semibold text-white">
                    {track.title || "Unknown Track"}
                  </p>

                  {track.start_time && (
                    <p className="mt-1 font-mono text-xs text-white/40">
                      {new Date(track.start_time).toLocaleTimeString(
                        "en-US",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>
                  )}
                </div>

                {/* NUMBER */}

                <span className="shrink-0 font-mono text-[12px] text-white/20">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}