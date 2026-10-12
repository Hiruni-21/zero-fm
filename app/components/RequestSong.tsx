"use client";

import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import { useLanguage } from "./LanguageContext";
import {
  DAILY_REQUEST_LIMIT,
  dailyLimitReached,
  markRequestSent,
  requestCooldownMinutes,
} from "../lib/request-cooldown";
import { OPEN_FULL_SCHEDULE_EVENT } from "./Schedule";
import {
  preloadRequestableTracks,
  type RequestableTrack,
} from "../lib/request-tracks";

type PickedTrack = {
  id: number;
  title: string;
  artist: string;
};

function cleanText(value: string) {
  return value
    .toLowerCase()
    .replace(/[_\-–—/|()[\].,'"]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function trackLabel(track: PickedTrack) {
  return [track.title, track.artist]
    .filter(Boolean)
    .join(" - ");
}

type Feedback = {
  type: "success" | "error";
  message: string;
};

export default function RequestSong() {
  const { t } = useLanguage();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [song, setSong] = useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [feedback, setFeedback] =
    useState<Feedback | null>(null);

  /*
   * Radio.co only queues songs from the station's own catalogue,
   * so the song field suggests catalogue songs to pick from.
   */
  const [catalogue, setCatalogue] =
    useState<RequestableTrack[]>([]);

  const [pickedTrack, setPickedTrack] =
    useState<PickedTrack | null>(null);

  const [showSuggestions, setShowSuggestions] =
    useState(false);

  // Suggestion highlighted with the arrow keys
  const [activeSuggestion, setActiveSuggestion] =
    useState(-1);

  // Little animations: music notes on success, a shake on errors
  const [celebrateKey, setCelebrateKey] = useState(0);
  const [shakeKey, setShakeKey] = useState(0);

  useEffect(() => {
    if (feedback?.type === "success") {
      setCelebrateKey(Date.now());
    } else if (feedback?.type === "error") {
      setShakeKey(Date.now());
    }
  }, [feedback]);

  useEffect(() => {
    if (!celebrateKey) return;
    const id = window.setTimeout(() => setCelebrateKey(0), 2600);
    return () => window.clearTimeout(id);
  }, [celebrateKey]);

  useEffect(() => {
    let active = true;

    preloadRequestableTracks()
      .then((tracks) => {
        if (active) setCatalogue(tracks);
      })
      .catch(() => {
        // Suggestions just stay empty; submitting explains the problem.
      });

    return () => {
      active = false;
    };
  }, []);

  const suggestions = useMemo(() => {
    const query = cleanText(song);
    if (!query || pickedTrack) return [];

    const words = query.split(" ");

    return catalogue
      .filter((track) => {
        const haystack = cleanText(
          `${track.title} ${track.artist}`
        );
        return words.every((word) =>
          haystack.includes(word)
        );
      })
      .slice(0, 6);
  }, [catalogue, song, pickedTrack]);

  useEffect(() => {
    setActiveSuggestion(-1);
  }, [suggestions]);

  const pickTrack = (track: PickedTrack) => {
    setPickedTrack({
      id: track.id,
      title: track.title,
      artist: track.artist,
    });
    setSong(trackLabel(track));
    setShowSuggestions(false);
    setFeedback(null);
  };

  /*
   * Preserve song selection from Search
   * or Category modal.
   */
  useEffect(() => {
    const handleSongSelected = (event: Event) => {
      const customEvent =
        event as CustomEvent<{
          id?: number;
          title?: string;
          artist?: string;
        }>;

      if (!customEvent.detail) {
        return;
      }

      const {
        id,
        title,
        artist,
      } = customEvent.detail;

      const songInfo = [
        title,
        artist,
      ]
        .filter(Boolean)
        .join(" - ");

      if (!songInfo) {
        return;
      }

      setSong(songInfo);

      if (typeof id === "number") {
        setPickedTrack({
          id,
          title: title || "",
          artist: artist || "",
        });
      }

      const requestSection =
        document.getElementById("request");

      if (requestSection) {
        requestSection.scrollIntoView({
          behavior: "smooth",
        });
      }
    };

    window.addEventListener(
      "zero-fm-song-selected",
      handleSongSelected
    );

    return () => {
      window.removeEventListener(
        "zero-fm-song-selected",
        handleSongSelected
      );
    };
  }, []);

  /*
   * Submit request
   */
  const submitRequest = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setFeedback(null);

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const trimmedSong = song.trim();

    const phoneDigits =
      trimmedPhone.replace(/\D/g, "");

    /*
     * Required fields
     */
    if (
      !trimmedName ||
      !trimmedPhone ||
      !trimmedSong
    ) {
      setFeedback({
        type: "error",
        message: t(
          "request.errorRequired"
        ),
      });

      return;
    }

    /*
     * Phone validation
     */
    if (
      !/^\+?[\d\s().-]+$/.test(
        trimmedPhone
      ) ||
      phoneDigits.length < 7 ||
      phoneDigits.length > 15
    ) {
      setFeedback({
        type: "error",
        message: t(
          "request.errorPhone"
        ),
      });

      return;
    }

    /*
     * Work out which catalogue song this is. Radio.co needs its ID.
     */
    let track = pickedTrack;

    if (!track) {
      const query = cleanText(trimmedSong);
      const exact = catalogue.filter(
        (item) =>
          cleanText(trackLabel(item)) === query ||
          cleanText(item.title) === query
      );
      const candidates =
        exact.length > 0 ? exact : suggestions;

      if (candidates.length === 1) {
        track = candidates[0];
      }
    }

    if (!track) {
      setShowSuggestions(true);
      setFeedback({
        type: "error",
        message:
          suggestions.length > 0
            ? t("request.pickFromList")
            : t("request.notInLibrary"),
      });

      return;
    }

    if (dailyLimitReached()) {
      setFeedback({
        type: "error",
        message: t("request.dailyLimit", { limit: DAILY_REQUEST_LIMIT }),
      });

      return;
    }

    const waitMinutes = requestCooldownMinutes();
    if (waitMinutes > 0) {
      setFeedback({
        type: "error",
        message: t("request.cooldown", { minutes: waitMinutes }),
      });

      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        "/api/queue",
        {
          method: "POST",

          headers: {
            "content-type":
              "application/json",
          },

          body: JSON.stringify({
            trackId: track.id,
          }),
        }
      );

      const result: {
        success?: boolean;
        error?: string;
      } | null = await response
        .json()
        .catch(() => null);

      if (
        !response.ok ||
        !result?.success
      ) {
        throw new Error(
          result?.error ||
            t("request.errorGeneric")
        );
      }

      markRequestSent();

      /*
       * Keep a record of who asked, in the server log.
       * This never blocks the listener's request.
       */
      void fetch("/api/request", {
        method: "POST",
        headers: {
          "content-type":
            "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
          phone: trimmedPhone,
          song: trackLabel(track),
        }),
      }).catch(() => {});

      /*
       * SUCCESS
       */
      setFeedback({
        type: "success",
        message: t("request.queued"),
      });

      /*
       * Clear form after successful request
       */
      setName("");
      setPhone("");
      setSong("");
      setPickedTrack(null);
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : t(
                "request.errorGeneric"
              ),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="request"
      className="relative scroll-mt-[72px] bg-[#05080F]"
    >
      <div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 md:py-20 lg:px-12 lg:py-28">
        <div>

          {/* Request card: studio photo behind a dark glass panel */}
          <div className="zf-card relative overflow-hidden rounded-[28px] p-6 sm:p-10 lg:p-14">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
              <img
                src="/images/cinematic-podcast-studio.png"
                alt=""
                className="programs-drift size-full object-cover opacity-30"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#070B13] via-[#070B13]/85 to-[#070B13]/55" />
              <div className="absolute -left-32 -top-32 size-96 rounded-full bg-[#FFD400]/[0.08] blur-[100px]" />
            </div>

            <div className="relative grid gap-10 md:grid-cols-[0.9fr_1.1fr] md:items-center lg:gap-16">

              <div>
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.3em] text-[#FFD400]">
                  {t("request.broadcastLine")}
                </p>

                {/* A long heading (a full sentence) gets a smaller size */}
                <h2
                  className={`mt-4 font-display font-bold tracking-[-0.02em] ${
                    t("request.title").length > 24
                      ? "text-[28px] leading-[1.35] sm:text-[34px] lg:text-[40px]"
                      : "text-[36px] leading-[1.02] sm:text-[48px] lg:text-[56px]"
                  }`}
                >
                  {t("request.title")}
                </h2>

                {t("request.subtitle") && (
                  <p className="mt-4 max-w-[380px] text-[14px] leading-6 text-[#A5B1C2]">
                    {t("request.subtitle")}
                  </p>
                )}

                <p className="mt-6 font-display text-xl font-semibold italic leading-tight text-[#FFD400] sm:text-2xl">
                  {t("request.couldBeNext1")}
                  <br />
                  {t("request.couldBeNext2")}
                </p>
              </div>

              <form
                key={shakeKey}
                className={`min-w-0 space-y-2.5 ${
                  shakeKey ? "request-shake" : ""
                }`}
                onSubmit={submitRequest}
              >
                {/* NAME */}
                <label className="group/field flex h-12 items-center gap-3 rounded-xl border border-white/[0.1] bg-[#05080F]/70 backdrop-blur px-3.5 transition-[border-color,box-shadow] duration-200 hover:border-white/[0.16] focus-within:border-[#FFD400]/50 focus-within:shadow-[0_0_0_3px_rgba(255,212,0,0.08)]">
                  <span
                    className="font-mono text-[12px] text-[#64748B] transition-colors group-focus-within/field:text-[#FFD400]"
                    aria-hidden="true"
                  >
                    01
                  </span>

                  <input
                    type="text"
                    aria-label={t(
                      "request.nameLabel"
                    )}
                    placeholder={t(
                      "request.namePlaceholder"
                    )}
                    autoComplete="name"
                    maxLength={100}
                    value={name}
                    onChange={(event) =>
                      setName(
                        event.target.value
                      )
                    }
                    className="font-body w-full bg-transparent text-[14px] text-white outline-none placeholder:text-[#64748B]"
                  />
                </label>

                {/* PHONE */}
                <label className="group/field flex h-12 items-center gap-3 rounded-xl border border-white/[0.1] bg-[#05080F]/70 backdrop-blur px-3.5 transition-[border-color,box-shadow] duration-200 hover:border-white/[0.16] focus-within:border-[#FFD400]/50 focus-within:shadow-[0_0_0_3px_rgba(255,212,0,0.08)]">
                  <span
                    className="font-mono text-[12px] text-[#64748B] transition-colors group-focus-within/field:text-[#FFD400]"
                    aria-hidden="true"
                  >
                    02
                  </span>

                  <input
                    type="tel"
                    aria-label={t(
                      "request.phoneLabel"
                    )}
                    placeholder={t(
                      "request.phonePlaceholder"
                    )}
                    autoComplete="tel"
                    maxLength={30}
                    value={phone}
                    onChange={(event) =>
                      setPhone(
                        event.target.value
                      )
                    }
                    className="font-body w-full bg-transparent text-[14px] text-white outline-none placeholder:text-[#64748B]"
                  />
                </label>

                {/* SONG */}
                <div className="relative">
                <label className="group/field flex h-12 items-center gap-3 rounded-xl border border-white/[0.1] bg-[#05080F]/70 backdrop-blur px-3.5 transition-[border-color,box-shadow] duration-200 hover:border-white/[0.16] focus-within:border-[#FFD400]/50 focus-within:shadow-[0_0_0_3px_rgba(255,212,0,0.08)]">
                  <span
                    className="font-mono text-[12px] text-[#64748B] transition-colors group-focus-within/field:text-[#FFD400]"
                    aria-hidden="true"
                  >
                    03
                  </span>

                  <input
                    type="text"
                    aria-label={t(
                      "request.songLabel"
                    )}
                    placeholder={t(
                      "request.songPlaceholder"
                    )}
                    maxLength={200}
                    value={song}
                    autoComplete="off"
                    role="combobox"
                    aria-expanded={
                      showSuggestions &&
                      suggestions.length > 0
                    }
                    aria-controls="request-song-suggestions"
                    onChange={(event) => {
                      setSong(
                        event.target.value
                      );
                      setPickedTrack(null);
                      setShowSuggestions(true);
                      setFeedback(null);
                    }}
                    onFocus={() =>
                      setShowSuggestions(true)
                    }
                    aria-activedescendant={
                      activeSuggestion >= 0
                        ? `request-suggestion-${activeSuggestion}`
                        : undefined
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Escape") {
                        setShowSuggestions(false);
                        return;
                      }

                      if (!suggestions.length) return;

                      if (event.key === "ArrowDown") {
                        event.preventDefault();
                        setShowSuggestions(true);
                        setActiveSuggestion((index) =>
                          (index + 1) % suggestions.length
                        );
                      } else if (event.key === "ArrowUp") {
                        event.preventDefault();
                        setActiveSuggestion((index) =>
                          index <= 0
                            ? suggestions.length - 1
                            : index - 1
                        );
                      } else if (
                        event.key === "Enter" &&
                        activeSuggestion >= 0
                      ) {
                        event.preventDefault();
                        pickTrack(suggestions[activeSuggestion]);
                      }
                    }}
                    onBlur={() =>
                      window.setTimeout(
                        () =>
                          setShowSuggestions(false),
                        150
                      )
                    }
                    className="font-body w-full bg-transparent text-[14px] text-white outline-none placeholder:text-[#64748B]"
                  />

                  {pickedTrack && (
                    <span
                      className="request-pop shrink-0 text-[#34D399]"
                      aria-label={t("request.songFound")}
                    >
                      ✓
                    </span>
                  )}
                </label>

                {showSuggestions &&
                  suggestions.length > 0 && (
                    <ul
                      id="request-song-suggestions"
                      role="listbox"
                      className="absolute left-0 right-0 top-full z-20 mt-1 max-h-64 overflow-y-auto rounded-lg border border-white/[0.1] bg-[#0F1523] py-1 shadow-2xl"
                    >
                      {suggestions.map((track, index) => (
                        <li
                          key={track.id}
                          id={`request-suggestion-${index}`}
                          role="option"
                          aria-selected={index === activeSuggestion}
                        >
                          <button
                            type="button"
                            onMouseDown={(event) =>
                              event.preventDefault()
                            }
                            onClick={() =>
                              pickTrack(track)
                            }
                            onMouseEnter={() =>
                              setActiveSuggestion(index)
                            }
                            className={`flex w-full flex-col items-start border-l-2 px-3.5 py-2 text-left transition ${
                              index === activeSuggestion
                                ? "border-[#FFD400] bg-white/[0.06]"
                                : "border-transparent"
                            }`}
                          >
                            <span className="font-body text-xs text-white">
                              {track.title}
                            </span>
                            <span className="font-body text-[12px] text-[#8F9CAE]">
                              {track.artist}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* SUBMIT */}
                <div className="relative">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`font-body flex h-11 w-full items-center justify-center gap-2 rounded-lg text-[12px] font-bold uppercase tracking-[0.08em] text-[#090D16] transition duration-300 hover:shadow-[0_10px_28px_rgba(255,212,0,0.22)] disabled:cursor-wait disabled:opacity-60 ${
                    celebrateKey
                      ? "bg-[#34D399]"
                      : "bg-[#FFD400] hover:bg-[#ffe45c]"
                  }`}
                >
                  {isSubmitting ? (
                    <span
                      aria-hidden="true"
                      className="size-3.5 animate-spin rounded-full border-2 border-[#090D16]/25 border-t-[#090D16]"
                    />
                  ) : (
                    <span aria-hidden="true">
                      {celebrateKey ? "✓" : "▶"}
                    </span>
                  )}

                  {isSubmitting
                    ? t(
                        "request.submitting"
                      )
                    : celebrateKey
                      ? t("request.added")
                      : t(
                          "request.submit"
                        )}
                </button>

                {/* Music notes that float up after a song is queued */}
                {celebrateKey > 0 && (
                  <span
                    key={celebrateKey}
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0"
                  >
                    {["♪", "♫", "♪", "♬", "♫", "♪", "♬", "♪"].map(
                      (note, index) => (
                        <span
                          key={index}
                          className="request-note absolute bottom-1/2 text-[15px] text-[#FFD400]"
                          style={{
                            left: `${12 + index * 11}%`,
                            animationDelay: `${index * 60}ms`,
                            ["--drift" as string]: `${
                              (index % 2 ? 1 : -1) * (8 + index * 3)
                            }px`,
                          }}
                        >
                          {note}
                        </span>
                      )
                    )}
                  </span>
                )}
                </div>

                {/* FEEDBACK */}
                {feedback && (
                  <p
                    key={feedback.message}
                    role={
                      feedback.type ===
                      "error"
                        ? "alert"
                        : "status"
                    }
                    className={`request-feedback text-xs leading-5 ${
                      feedback.type ===
                      "success"
                        ? "text-[#34D399]"
                        : "text-red-300"
                    }`}
                  >
                    {feedback.message}
                  </p>
                )}
              </form>
            </div>
          </div>

        </div>
      </div>
      <style jsx global>{`
        .programs-drift {
          animation: programsDrift 18s ease-in-out infinite alternate;
        }

        @keyframes programsDrift {
          from {
            object-position: 40% 50%;
          }
          to {
            object-position: 60% 50%;
          }
        }

        .programs-bar {
          height: 30%;
          animation: programsBar 1s ease-in-out infinite alternate;
        }

        @keyframes programsBar {
          from {
            height: 25%;
          }
          to {
            height: 100%;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .programs-drift,
          .programs-bar {
            animation: none;
          }
        }

        .request-shake {
          animation: requestShake 0.4s ease;
        }

        @keyframes requestShake {
          20%,
          60% {
            translate: -5px 0;
          }

          40%,
          80% {
            translate: 5px 0;
          }
        }

        .request-note {
          opacity: 0;
          animation: requestNote 1.6s ease-out forwards;
        }

        @keyframes requestNote {
          0% {
            opacity: 0;
            translate: 0 0;
            scale: 0.6;
          }

          20% {
            opacity: 1;
          }

          100% {
            opacity: 0;
            translate: var(--drift, 0px) -70px;
            scale: 1.15;
          }
        }

        .request-pop {
          animation: requestPop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes requestPop {
          from {
            scale: 0;
          }
        }

        .request-feedback {
          animation: requestFade 0.35s ease;
        }

        @keyframes requestFade {
          from {
            opacity: 0;
            translate: 0 -4px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .request-shake,
          .request-note,
          .request-pop,
          .request-feedback {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}