"use client";

import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import { useLanguage } from "./LanguageContext";

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

    setIsSubmitting(true);

    try {
      const response = await fetch(
        "/api/request",
        {
          method: "POST",

          headers: {
            "content-type":
              "application/json",
          },

          body: JSON.stringify({
            name: trimmedName,
            phone: trimmedPhone,
            song: trimmedSong,
          }),
        }
      );

      const result: {
        success?: boolean;
        error?: string;
        message?: string;
      } = await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.error ||
            t("request.errorGeneric")
        );
      }

      /*
       * SUCCESS
       */
      setFeedback({
        type: "success",
        message:
          result.message ||
          t("request.success"),
      });

      /*
       * Clear form after successful request
       */
      setName("");
      setPhone("");
      setSong("");
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
      className="scroll-mt-[72px] border-b border-white/[0.07] bg-[#090D16]"
    >
      <div className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 md:py-16 lg:px-12 lg:py-20">
        <div className="grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">

          {/* =====================================================
              LEFT - REQUEST FORM
          ===================================================== */}
          <div className="rounded-2xl border border-white/[0.09] bg-[#0F1523] p-5 sm:p-7">
            <div className="grid gap-6 md:grid-cols-[0.72fr_1.28fr] md:items-center md:gap-8">

              <div>
                <h2 className="font-display text-[26px] font-bold leading-tight sm:text-3xl">
                  {t("request.title")}
                </h2>

                <p className="mt-3 max-w-[230px] text-xs leading-5 text-[#8F9CAE]">
                  {t("request.subtitle")}
                </p>

                <p className="mt-5 font-display text-lg font-semibold italic leading-tight text-[#FFD400]">
                  {t("request.couldBeNext1")}
                  <br />
                  {t("request.couldBeNext2")}
                </p>
              </div>

              <form
                className="min-w-0 space-y-2.5"
                onSubmit={submitRequest}
              >
                {/* NAME */}
                <label className="flex h-11 items-center gap-3 rounded-lg border border-white/[0.08] bg-[#090D16] px-3.5 focus-within:border-[#FFD400]/50">
                  <span
                    className="font-mono text-[10px] text-[#64748B]"
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
                    className="font-body w-full bg-transparent text-xs text-white outline-none placeholder:text-[#64748B]"
                  />
                </label>

                {/* PHONE */}
                <label className="flex h-11 items-center gap-3 rounded-lg border border-white/[0.08] bg-[#090D16] px-3.5 focus-within:border-[#FFD400]/50">
                  <span
                    className="font-mono text-[10px] text-[#64748B]"
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
                    className="font-body w-full bg-transparent text-xs text-white outline-none placeholder:text-[#64748B]"
                  />
                </label>

                {/* SONG */}
                <label className="flex h-11 items-center gap-3 rounded-lg border border-white/[0.08] bg-[#090D16] px-3.5 focus-within:border-[#FFD400]/50">
                  <span
                    className="font-mono text-[10px] text-[#64748B]"
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
                    onChange={(event) =>
                      setSong(
                        event.target.value
                      )
                    }
                    className="font-body w-full bg-transparent text-xs text-white outline-none placeholder:text-[#64748B]"
                  />
                </label>

                {/* SUBMIT */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="font-body flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#FFD400] text-[10px] font-bold uppercase tracking-[0.08em] text-[#090D16] transition hover:bg-[#ffe45c] disabled:cursor-wait disabled:opacity-60"
                >
                  <span aria-hidden="true">
                    ▶
                  </span>

                  {isSubmitting
                    ? t(
                        "request.submitting"
                      )
                    : t(
                        "request.submit"
                      )}
                </button>

                {/* FEEDBACK */}
                {feedback && (
                  <p
                    role={
                      feedback.type ===
                      "error"
                        ? "alert"
                        : "status"
                    }
                    className={`text-xs leading-5 ${
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

          {/* =====================================================
              RIGHT - PROGRAMS
          ===================================================== */}
          <div className="relative flex min-h-[280px] flex-col justify-between overflow-hidden rounded-2xl border border-white/[0.09] bg-[#111622] p-5 sm:min-h-[300px] sm:p-7">

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#121826] via-transparent to-[#090D16]/70" />

            <div className="relative">
              <p className="font-mono text-[9px] font-medium uppercase tracking-[0.14em] text-[#FFD400]">
                {t(
                  "request.broadcastLine"
                )}
              </p>

              <h3 className="mt-4 font-display text-[34px] font-bold leading-[0.98] sm:text-[40px]">
                {t(
                  "request.todaysProgramsLine1"
                )}
                <br />
                {t(
                  "request.todaysProgramsLine2"
                )}
              </h3>

              <p className="mt-3 font-mono text-[8px] uppercase tracking-[0.12em] text-[#8F9CAE]">
                {t(
                  "request.greatMusicAllDay"
                )}
              </p>
            </div>

            <a
              href="#programs"
              className="relative mt-6 inline-flex h-9 w-fit items-center gap-2 rounded-lg border border-white/[0.12] px-4 font-mono text-[8px] font-medium uppercase tracking-[0.08em] text-white/75 transition hover:border-[#FFD400]/50 hover:text-[#FFD400]"
            >
              {t(
                "request.viewFullSchedule"
              )}

              <span aria-hidden="true">
                →
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}