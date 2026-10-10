"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { useLanguage } from "./LanguageContext";
import { fetchNowPlaying, NOW_PLAYING_POLL_MS } from "../lib/now-playing";
import { PLAY_EVENT, showToast } from "../lib/ui-events";

/*
 * The one live radio stream for the whole site. It sits in the root
 * layout, so it keeps playing when a listener opens the Privacy Policy or
 * Terms pages and comes back. The big player and the mini player are only
 * controls for it (useLiveRadio), so there is never a second stream.
 */

const RADIO_STREAM_URL = "https://s5.radio.co/s83b3fe12f/listen";

// Our own picture for the player, shown for every song instead of
// Radio.co's default artwork
export const NOW_PLAYING_ART = "/images/now-playing-art.jpg";

type TrackData = {
  title?: string;
  track_title?: string;
  track_artist?: string;
  artist?: string;
};

type NowPlayingResponse = {
  data?: TrackData;
};

type LiveRadio = {
  isPlaying: boolean;
  isBuffering: boolean;
  volume: number;
  isMuted: boolean;
  trackTitle: string;
  trackArtist: string;
  loadingTrack: boolean;
  error: string;
  sleepEndsAt: number | null;
  sleepMinutesLeft: number;
  sleepChoice: number | null;
  togglePlay: () => Promise<void>;
  setVolume: (volume: number) => void;
  setIsMuted: (muted: boolean) => void;
  toggleMute: () => void;
  setSleepTimer: (minutes: number | null) => void;
};

const LiveRadioContext = createContext<LiveRadio | null>(null);

export function useLiveRadio() {
  const radio = useContext(LiveRadioContext);
  if (!radio) throw new Error("useLiveRadio must be used inside LiveRadioProvider");
  return radio;
}

export function LiveRadioProvider({ children }: { children: ReactNode }) {
  const { t } = useLanguage();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // True while the stream reconnects by itself (its pause isn't a stop)
  const reconnectingRef = useRef(false);
  // Reconnects tried since the stream last moved, and the next one waiting
  const retriesRef = useRef(0);
  const retryTimerRef = useRef<number | null>(null);
  // The listener wants the radio on (false after Stop, a call, or giving up)
  const wantPlayingRef = useRef(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const previousVolumeRef = useRef(80);

  const [track, setTrack] = useState<TrackData | null>(null);
  const [loadingTrack, setLoadingTrack] = useState(true);
  const [error, setError] = useState("");

  // Sleep timer: when the radio should stop by itself
  const [sleepEndsAt, setSleepEndsAt] = useState<number | null>(null);
  const [sleepMinutesLeft, setSleepMinutesLeft] = useState(0);
  const [sleepChoice, setSleepChoice] = useState<number | null>(null);

  /* ------------------------------------------------------------------------ */
  /* Current Track                                                            */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    const load = async () => {
      try {
        const result = await fetchNowPlaying<NowPlayingResponse>();
        setTrack(result.data ?? null);
      } catch (error) {
        console.error("Failed to fetch current track:", error);
      } finally {
        setLoadingTrack(false);
      }
    };

    load();
    const interval = window.setInterval(load, NOW_PLAYING_POLL_MS);
    return () => window.clearInterval(interval);
  }, []);

  const trackTitle = track?.track_title || track?.title || "Zero FM Live";
  const trackArtist = track?.track_artist || track?.artist || "Zero FM";

  /* ------------------------------------------------------------------------ */
  /* Volume                                                                   */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume / 100;
    audioRef.current.muted = isMuted || volume === 0;
  }, [volume, isMuted]);

  const toggleMute = () => {
    if (isMuted || volume === 0) {
      setIsMuted(false);
      if (volume === 0) setVolume(previousVolumeRef.current || 80);
    } else {
      previousVolumeRef.current = volume;
      setIsMuted(true);
    }
  };

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

    wantPlayingRef.current = false;
    if (retryTimerRef.current !== null) {
      window.clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
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
      wantPlayingRef.current = true;
      retriesRef.current = 0;

      // A fresh address so neither the browser nor a cache serves old audio
      audio.src = `${RADIO_STREAM_URL}?t=${Date.now()}`;
      await audio.play();

      setIsPlaying(true);
    } catch (error) {
      setIsBuffering(false);
      console.error("Unable to play radio stream:", error);
      setIsPlaying(false);
      setError(t("player.playError"));
    }
  };

  const giveUp = () => {
    stopStream();
    setIsPlaying(false);
    setIsBuffering(false);
  };

  // The connection dropped (often when a computer or phone wakes and its
  // network comes back): join the live stream again by itself, up to four
  // times, waiting `delay` ms first. Returns false when it has given up.
  const reconnect = (delay = 0): boolean => {
    const audio = audioRef.current;
    if (!audio || !wantPlayingRef.current) return false;

    // One attempt at a time
    if (retryTimerRef.current !== null || reconnectingRef.current) return true;
    if (retriesRef.current >= 4) return false;

    retriesRef.current += 1;
    setIsBuffering(true);

    const attempt = () => {
      retryTimerRef.current = null;
      if (!wantPlayingRef.current) return;

      reconnectingRef.current = true;
      audio.src = `${RADIO_STREAM_URL}?t=${Date.now()}`;
      audio
        .play()
        .then(() => {
          reconnectingRef.current = false;
        })
        .catch(() => {
          reconnectingRef.current = false;
          // The network may still be waking up: wait a little and try again
          if (!reconnect(3000)) giveUp();
        });
    };

    if (delay) retryTimerRef.current = window.setTimeout(attempt, delay);
    else attempt();
    return true;
  };

  // A live stream never really ends, so an end means the connection dropped
  const handleEnded = () => {
    if (reconnect()) return;
    giveUp();
  };

  const handlePlay = () => {
    setIsPlaying(true);
    setError("");
  };

  // Anything that pauses the radio from outside the site (a phone call,
  // another app taking over the sound, headphones unplugged, the lock
  // screen) stops it fully, so it doesn't start again on its own after the
  // call and the button shows Play. Play then reconnects to what's on air.
  const handlePause = () => {
    // Reconnecting, or the stream ended (handleEnded deals with that)
    if (
      reconnectingRef.current ||
      retryTimerRef.current !== null ||
      audioRef.current?.ended
    )
      return;
    if (audioRef.current?.getAttribute("src")) stopStream();
    setIsPlaying(false);
    setIsBuffering(false);
  };

  const handleAudioError = () => {
    // Stopping clears the stream address; that isn't a real error
    if (!audioRef.current?.getAttribute("src")) return;

    // A dropped connection gets a few tries to come back first
    if (reconnect(3000)) return;

    giveUp();
    setError(t("player.unavailable"));
  };

  // The stream can stop on its own (network drop, or the browser suspending a
  // background tab) without a pause event. Check that it's still moving, and
  // show it as stopped if not, so the button never claims it's playing.
  useEffect(() => {
    if (!isPlaying) return;

    let lastTime = audioRef.current?.currentTime ?? 0;
    let stuckSince = 0;

    const check = () => {
      const audio = audioRef.current;
      if (!audio) return;
      // A reconnect is already under way
      if (retryTimerRef.current !== null || reconnectingRef.current) return;

      const dead = audio.paused || audio.ended || Boolean(audio.error);
      const moved = audio.currentTime !== lastTime;
      lastTime = audio.currentTime;

      if (moved) {
        stuckSince = 0;
        retriesRef.current = 0;
      } else if (!stuckSince) stuckSince = Date.now();

      // Give a slow connection 20 seconds to recover before giving up
      const stuck = stuckSince > 0 && Date.now() - stuckSince > 20_000;

      // The connection dropped: try joining the live stream again. A pause
      // from outside (a call) already stopped it, so it isn't retried here.
      if ((stuck || audio.error) && !audio.paused) {
        stuckSince = 0;
        if (reconnect()) return;
      }

      if (dead || stuck) {
        stopStream();
        setIsPlaying(false);
        setIsBuffering(false);
      }
    };

    const interval = window.setInterval(check, 5000);
    const onVisible = () => {
      if (document.visibilityState === "visible") check();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [isPlaying]);

  // Keep the latest values for listeners that are set up once
  const latest = useRef({ togglePlay, isPlaying });
  latest.current = { togglePlay, isPlaying };

  // "Listen Live" buttons elsewhere on the page start the player
  useEffect(() => {
    const onPlayRequest = () => {
      document
        .getElementById("live")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });

      if (!latest.current.isPlaying) void latest.current.togglePlay();
    };

    window.addEventListener(PLAY_EVENT, onPlayRequest);
    return () => window.removeEventListener(PLAY_EVENT, onPlayRequest);
  }, []);

  // Show the song on the browser tab and phone lock screen while playing
  useEffect(() => {
    const baseTitle = document.title.replace(/^▶ .*? · /, "");

    if (isPlaying) document.title = `▶ ${trackTitle} · ${baseTitle}`;

    if ("mediaSession" in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: trackTitle,
        artist: trackArtist,
        album: "Zero FM Live",
        artwork: [
          {
            src: new URL(NOW_PLAYING_ART, window.location.origin).href,
            sizes: "512x512",
            type: "image/jpeg",
          },
        ],
      });

      navigator.mediaSession.setActionHandler("play", () => {
        if (!latest.current.isPlaying) void latest.current.togglePlay();
      });
      navigator.mediaSession.setActionHandler("pause", () => {
        if (latest.current.isPlaying) void latest.current.togglePlay();
      });
      navigator.mediaSession.setActionHandler("stop", () => {
        if (latest.current.isPlaying) void latest.current.togglePlay();
      });
    }

    return () => {
      document.title = baseTitle;
    };
  }, [isPlaying, trackTitle, trackArtist]);

  /* ------------------------------------------------------------------------ */
  /* Sleep Timer                                                              */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!sleepEndsAt) return;

    const tick = () => {
      const left = sleepEndsAt - Date.now();

      if (left <= 0) {
        stopStream();
        // Show the stopped state too, even if the tab was in the background
        setIsPlaying(false);
        setIsBuffering(false);
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

  return (
    <LiveRadioContext.Provider
      value={{
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
      }}
    >
      {children}

      <audio
        ref={audioRef}
        preload="none"
        onPlay={handlePlay}
        onPlaying={() => setIsBuffering(false)}
        onWaiting={() => setIsBuffering(true)}
        onPause={handlePause}
        onEnded={handleEnded}
        onError={handleAudioError}
      />
    </LiveRadioContext.Provider>
  );
}
