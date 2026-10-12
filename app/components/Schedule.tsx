"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLanguage } from "./LanguageContext";

type Program = {
  time: string;
  endTime: string;
  program: string;
};

type ScheduleResponse = {
  station: string;
  timezone: string;
  schedule: Program[];
};

// Any button on the page can open the full schedule popup by firing this event
export const OPEN_FULL_SCHEDULE_EVENT = "zero-fm:open-full-schedule";

type DayPart = "lateNight" | "morning" | "afternoon" | "evening" | "night";

const DAY_MINUTES = 24 * 60;

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

// "00:00" as an end time means midnight at the end of the day
function endToMinutes(program: Program) {
  const start = timeToMinutes(program.time);
  const end = timeToMinutes(program.endTime);
  return end <= start ? end + DAY_MINUTES : end;
}

function getCurrentMinutesInColombo() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Colombo",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const hour =
    Number(parts.find((part) => part.type === "hour")?.value || 0) % 24;

  const minute = Number(
    parts.find((part) => part.type === "minute")?.value || 0
  );

  return hour * 60 + minute;
}

function formatClock(minutes: number) {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m}m`;
  return m ? `${h}h ${m}m` : `${h}h`;
}

function isLive(program: Program, currentMinutes: number) {
  const start = timeToMinutes(program.time);
  const end = endToMinutes(program);

  return (
    (currentMinutes >= start && currentMinutes < end) ||
    (end > DAY_MINUTES && currentMinutes < end - DAY_MINUTES)
  );
}

function getDayPart(time: string): DayPart {
  const hour = Math.floor(timeToMinutes(time) / 60);

  if (hour < 5) return "lateNight";
  if (hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

function CalendarIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5 text-[#FFD400]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18M8 14h.01M12 14h.01M16 14h.01" />
    </svg>
  );
}

function LiveDot() {
  return (
    <span className="relative flex size-2 shrink-0">
      <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#34D399] opacity-60" />
      <span className="relative inline-flex size-2 rounded-full bg-[#34D399]" />
    </span>
  );
}

export default function Schedule() {
  const { t } = useLanguage();

  const [schedule, setSchedule] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentMinutes, setCurrentMinutes] = useState(
    getCurrentMinutesInColombo()
  );

  const [fullOpen, setFullOpen] = useState(false);

  useEffect(() => {
    const open = () => setFullOpen(true);
    window.addEventListener(OPEN_FULL_SCHEDULE_EVENT, open);
    return () => window.removeEventListener(OPEN_FULL_SCHEDULE_EVENT, open);
  }, []);

  const listRef = useRef<HTMLDivElement>(null);
  const liveRowRef = useRef<HTMLDivElement>(null);
  const hasScrolledToLive = useRef(false);

  useEffect(() => {
    let mounted = true;

    const fetchSchedule = async () => {
      try {
        const response = await fetch("/api/schedule", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch schedule");
        }

        const result: ScheduleResponse = await response.json();

        if (mounted) {
          const sorted = [...(result.schedule || [])].sort(
            (a, b) => timeToMinutes(a.time) - timeToMinutes(b.time)
          );

          setSchedule(sorted);
        }
      } catch (error) {
        console.error("Failed to fetch schedule:", error);

        if (mounted) {
          setSchedule([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchSchedule();

    const scheduleInterval = setInterval(fetchSchedule, 5 * 60_000);

    // Update the clock right as each minute starts, so it changes at the
    // same moment as the phone's or computer's own clock.
    let clockTimer: ReturnType<typeof setTimeout>;
    const tickClock = () => {
      if (!mounted) return;
      setCurrentMinutes(getCurrentMinutesInColombo());
      const now = new Date();
      const msToNextMinute =
        60_000 - (now.getSeconds() * 1000 + now.getMilliseconds());
      clockTimer = setTimeout(tickClock, msToNextMinute + 50);
    };
    tickClock();

    // Coming back to a background tab: catch up straight away
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        clearTimeout(clockTimer);
        tickClock();
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      mounted = false;
      clearInterval(scheduleInterval);
      clearTimeout(clockTimer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const currentProgramIndex = useMemo(
    () =>
      schedule.findIndex((program) => isLive(program, currentMinutes)),
    [schedule, currentMinutes]
  );

  const nextProgramIndex = useMemo(() => {
    if (!schedule.length) {
      return -1;
    }

    if (currentProgramIndex >= 0) {
      return (currentProgramIndex + 1) % schedule.length;
    }

    const upcomingIndex = schedule.findIndex(
      (program) => timeToMinutes(program.time) > currentMinutes
    );

    return upcomingIndex >= 0 ? upcomingIndex : 0;
  }, [schedule, currentProgramIndex, currentMinutes]);

  const currentProgram =
    currentProgramIndex >= 0 ? schedule[currentProgramIndex] : null;

  const nextProgram =
    nextProgramIndex >= 0 ? schedule[nextProgramIndex] : null;

  // How far through the live show we are
  const liveProgress = useMemo(() => {
    if (!currentProgram) {
      return null;
    }

    const start = timeToMinutes(currentProgram.time);
    const end = endToMinutes(currentProgram);

    let now = currentMinutes;
    if (now < start) now += DAY_MINUTES;

    const total = end - start;
    const elapsed = Math.min(Math.max(now - start, 0), total);

    return {
      percent: total > 0 ? (elapsed / total) * 100 : 0,
      minutesLeft: Math.max(total - elapsed, 0),
    };
  }, [currentProgram, currentMinutes]);

  // Programs grouped by morning / afternoon / evening / night
  const groups = useMemo(() => {
    const result: { part: DayPart; items: { program: Program; index: number }[] }[] = [];

    schedule.forEach((program, index) => {
      const part = getDayPart(program.time);
      const last = result[result.length - 1];

      if (last && last.part === part) {
        last.items.push({ program, index });
      } else {
        result.push({ part, items: [{ program, index }] });
      }
    });

    return result;
  }, [schedule]);

  // Bring the live show into view once the list has loaded
  useEffect(() => {
    if (hasScrolledToLive.current || loading) return;

    const list = listRef.current;
    const row = liveRowRef.current;

    if (list && row) {
      list.scrollTop = Math.max(row.offsetTop - 48, 0);
      hasScrolledToLive.current = true;
    }
  }, [loading, currentProgramIndex]);

  return (
    <section
      className="grid h-full min-h-0 min-w-0 grid-cols-[minmax(0,1fr)] grid-rows-[auto_auto_minmax(0,1fr)_auto] gap-3 overflow-hidden p-4 sm:p-5"
    >
      {/* =====================================================
          HEADER
      ====================================================== */}
      <div className="border-b border-white/[0.08] pb-4">
        {/* Station name on the left, clock on the right */}
        <div className="flex items-start justify-between gap-3">
          <p className="font-mono text-[12px] font-bold uppercase tracking-[0.22em] text-[#FFD400]">
            ZERO FM
          </p>

          <div className="shrink-0 text-right">
            <p suppressHydrationWarning className="font-mono text-[18px] font-semibold leading-none text-white">
              {formatClock(currentMinutes)}
            </p>

            <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-[#8F9CAE]">
              Asia / Colombo
            </p>
          </div>
        </div>

        {/* Heading gets the full width, so it doesn't squeeze on phones */}
        <div className="mt-2 flex items-start gap-2.5">
          <span className="mt-[0.4em] shrink-0">
            <CalendarIcon />
          </span>

          <h3 className="min-w-0 font-display text-[20px] font-bold leading-[1.4] text-white sm:text-[22px]">
            {t("schedule.todaysPrograms")}
          </h3>
        </div>
      </div>

      {/* =====================================================
          LIVE NOW + UP NEXT
      ====================================================== */}
      <div className="space-y-2.5">
        <article className="relative overflow-hidden rounded-xl border border-[#FFD400]/25 bg-gradient-to-br from-[#FFD400]/[0.07] to-transparent p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {currentProgram && <LiveDot />}

              <p className="font-mono text-[12px] font-bold uppercase tracking-[0.14em] text-[#FFD400]">
                {t("schedule.liveNow")}
              </p>
            </div>

            {currentProgram && (
              <p className="font-mono text-[11px] text-[#A8B2C2]">
                {currentProgram.time} – {currentProgram.endTime}
              </p>
            )}
          </div>

          <p className="mt-2 truncate font-display text-[19px] font-semibold leading-tight text-white">
            {loading
              ? t("schedule.loadingProgram")
              : currentProgram?.program || t("schedule.noLiveProgram")}
          </p>

          {liveProgress && (
            <div className="mt-3">
              <div className="h-1 overflow-hidden rounded-full bg-white/[0.08]">
                <div
                  className="h-full rounded-full bg-[#FFD400] transition-[width] duration-700"
                  style={{ width: `${liveProgress.percent}%` }}
                />
              </div>

              <p className="mt-1.5 font-mono text-[12px] text-[#8F9CAE]">
                {t("schedule.minutesLeft", {
                  minutes: String(liveProgress.minutesLeft),
                })}
              </p>
            </div>
          )}
        </article>

        <article className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-[#121826] px-4 py-3">
          <div className="min-w-0">
            <p className="font-mono text-[12px] font-semibold uppercase tracking-[0.14em] text-[#8F9CAE]">
              {t("schedule.nextProgram")}
            </p>

            <p className="mt-1 truncate font-display text-[15px] font-semibold text-white">
              {loading
                ? t("schedule.loadingProgram")
                : nextProgram?.program || t("schedule.noUpcomingProgram")}
            </p>
          </div>

          {nextProgram && (
            <span className="shrink-0 rounded-lg border border-[#FFD400]/20 bg-[#FFD400]/[0.06] px-2.5 py-1.5 font-mono text-[13px] font-semibold text-[#FFD400]">
              {nextProgram.time}
            </span>
          )}
        </article>
      </div>

      {/* =====================================================
          FULL DAY LIST
      ====================================================== */}
      {/* On phones the list is shown in full and scrolls with the page, so a
          swipe over it never gets caught inside a small scroll box */}
      <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-[#0D1420]/60 lg:min-h-0">
        {loading ? (
          <div className="space-y-4 p-4">
            {[1, 2, 3, 4, 5].map((row) => (
              <div key={row} className="flex items-center gap-4">
                <div className="h-3 w-12 animate-pulse rounded bg-white/[0.06]" />
                <div className="h-3.5 flex-1 animate-pulse rounded bg-white/[0.06]" />
              </div>
            ))}
          </div>
        ) : schedule.length === 0 ? (
          <div className="flex h-full items-center justify-center px-6 py-10 text-center">
            <p className="text-[13px] text-[#8F9CAE]">
              {t("schedule.noPrograms")}
            </p>
          </div>
        ) : (
          <div
            ref={listRef}
            className="schedule-scrollbar relative lg:h-full lg:overflow-y-auto lg:overscroll-contain"
          >
            {groups.map((group) => (
              <div key={`${group.part}-${group.items[0].index}`}>
                <p className="z-10 border-b border-white/[0.05] bg-[#0D1420]/95 px-4 py-2 font-mono text-[12px] font-semibold uppercase tracking-[0.18em] text-[#94A3B8] backdrop-blur lg:sticky lg:top-0">
                  {t(`schedule.${group.part}`)}
                </p>

                {group.items.map(({ program, index }) => {
                  const active = index === currentProgramIndex;
                  const next = index === nextProgramIndex && !active;
                  const finished =
                    !active &&
                    currentProgramIndex >= 0 &&
                    index < currentProgramIndex;

                  return (
                    <div
                      key={`${program.time}-${program.program}`}
                      ref={active ? liveRowRef : undefined}
                      className={`relative flex items-center gap-4 border-b border-white/[0.04] px-4 py-3.5 transition last:border-b-0 ${
                        active
                          ? "bg-[#FFD400]/[0.05]"
                          : "hover:bg-white/[0.02]"
                      } ${finished ? "opacity-70" : ""}`}
                    >
                      {active && (
                        <span className="absolute inset-y-0 left-0 w-[3px] bg-[#FFD400]" />
                      )}

                      <div className="w-[52px] shrink-0">
                        <p
                          className={`font-mono text-[14px] font-semibold leading-none ${
                            active ? "text-[#FFD400]" : "text-white"
                          }`}
                        >
                          {program.time}
                        </p>

                        <p className="mt-1.5 font-mono text-[12px] leading-none text-[#94A3B8]">
                          {program.endTime}
                        </p>
                      </div>

                      <p
                        className={`min-w-0 flex-1 font-display text-[14px] font-semibold leading-snug ${
                          active ? "text-[#FFD400]" : "text-white"
                        }`}
                      >
                        {program.program}
                      </p>

                      {active ? (
                        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#34D399]/25 bg-[#34D399]/[0.08] px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-[#34D399]">
                          <LiveDot />
                          {t("schedule.live")}
                        </span>
                      ) : next ? (
                        <span className="shrink-0 rounded-full border border-[#FFD400]/20 bg-[#FFD400]/[0.06] px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-[#FFD400]">
                          {t("schedule.next")}
                        </span>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* =====================================================
          VIEW FULL SCHEDULE
      ====================================================== */}
      <button
        type="button"
        onClick={() => setFullOpen(true)}
        className="group flex h-10 items-center justify-center gap-2 rounded-lg border border-white/[0.08] bg-[#121826] font-mono text-[12px] font-medium uppercase tracking-[0.1em] text-white/85 transition hover:border-[#FFD400]/40 hover:bg-[#FFD400]/[0.03] hover:text-[#FFD400]"
      >
        {t("schedule.viewFullSchedule")}

        <span
          aria-hidden="true"
          className="text-[#FFD400] transition-transform duration-200 group-hover:translate-x-1"
        >
          →
        </span>
      </button>

      {fullOpen && (
        <FullScheduleModal
          schedule={schedule}
          currentMinutes={currentMinutes}
          currentProgramIndex={currentProgramIndex}
          onClose={() => setFullOpen(false)}
        />
      )}
    </section>
  );
}

/* =====================================================
   FULL SCHEDULE POPUP
   Opens from "View Full Schedule". Shows the whole day with
   what has finished, what's on now and when each show starts.
===================================================== */
function FullScheduleModal({
  schedule,
  currentMinutes,
  currentProgramIndex,
  onClose,
}: {
  schedule: Program[];
  currentMinutes: number;
  currentProgramIndex: number;
  onClose: () => void;
}) {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const liveRef = useRef<HTMLLIElement>(null);

  const close = () => {
    setVisible(false);
    window.setTimeout(onClose, 200);
  };

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setVisible(true));
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    liveRef.current?.scrollIntoView({ block: "center" });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      window.cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const listenLive = () => {
    close();
    window.setTimeout(() => {
      document.getElementById("live")?.scrollIntoView({ behavior: "smooth" });
    }, 220);
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="full-schedule-title"
      className={`fixed inset-0 z-[400] flex items-end justify-center bg-black/70 backdrop-blur-sm transition-opacity duration-200 sm:items-center sm:p-6 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div
        className={`flex max-h-[88vh] w-full max-w-[560px] flex-col overflow-hidden rounded-t-[22px] border border-white/[0.08] bg-[#0F1523] shadow-[0_30px_100px_rgba(0,0,0,0.6)] transition-transform duration-300 sm:rounded-[22px] ${
          visible ? "translate-y-0" : "translate-y-8"
        }`}
      >
        {/* HEADER */}
        <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] p-5 sm:p-6">
          <div>
            <p className="font-mono text-[12px] font-bold uppercase tracking-[0.22em] text-[#FFD400]">
              ZERO FM
            </p>

            <h2
              id="full-schedule-title"
              className="mt-2 font-display text-[24px] font-bold leading-none text-white"
            >
              {t("schedule.fullSchedule")}
            </h2>

            <p className="mt-2 text-[12px] text-[#8F9CAE]">
              {t("schedule.everyDay")}
            </p>
          </div>

          <button
            ref={closeRef}
            type="button"
            onClick={close}
            aria-label={t("schedule.close")}
            className="flex size-9 shrink-0 items-center justify-center rounded-full border border-white/[0.1] text-white/70 transition hover:border-[#FFD400]/50 hover:text-[#FFD400]"
          >
            <span aria-hidden="true" className="text-lg leading-none">
              ×
            </span>
          </button>
        </div>

        {/* SHOWS */}
        <ol className="schedule-scrollbar min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
          {schedule.map((program, index) => {
            const start = timeToMinutes(program.time);
            const end = endToMinutes(program);
            const active = index === currentProgramIndex;
            const finished = !active && end <= currentMinutes;

            let startsIn = start - currentMinutes;
            if (startsIn < 0) startsIn += DAY_MINUTES;

            let progress = 0;
            if (active) {
              let now = currentMinutes;
              if (now < start) now += DAY_MINUTES;
              progress = ((now - start) / (end - start)) * 100;
            }

            return (
              <li
                key={`${program.time}-${program.program}`}
                ref={active ? liveRef : undefined}
                className={`relative mb-2 flex gap-4 rounded-xl border p-4 transition last:mb-0 ${
                  active
                    ? "border-[#FFD400]/30 bg-[#FFD400]/[0.06]"
                    : "border-white/[0.06] bg-[#121826] hover:border-white/[0.14]"
                } ${finished ? "opacity-50" : ""}`}
              >
                <div className="w-[56px] shrink-0">
                  <p
                    className={`font-mono text-[15px] font-semibold leading-none ${
                      active ? "text-[#FFD400]" : "text-white"
                    }`}
                  >
                    {program.time}
                  </p>

                  <p className="mt-1.5 font-mono text-[12px] text-[#64748B]">
                    {formatDuration(end - start)}
                  </p>
                </div>

                <div className="min-w-0 flex-1">
                  <p
                    className={`font-display text-[15px] font-semibold leading-snug ${
                      active ? "text-[#FFD400]" : "text-white"
                    }`}
                  >
                    {program.program}
                  </p>

                  <p className="mt-1 font-mono text-[11px] text-[#8F9CAE]">
                    {program.time} – {program.endTime}
                  </p>

                  {active && (
                    <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/[0.08]">
                      <div
                        className="h-full rounded-full bg-[#FFD400]"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                </div>

                <div className="shrink-0 self-center">
                  {active ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#34D399]/25 bg-[#34D399]/[0.08] px-2.5 py-1 font-mono text-[11px] font-semibold uppercase text-[#34D399]">
                      <LiveDot />
                      {t("schedule.live")}
                    </span>
                  ) : finished ? (
                    <span className="font-mono text-[12px] uppercase text-[#64748B]">
                      {t("schedule.finished")}
                    </span>
                  ) : (
                    <span className="font-mono text-[12px] text-[#A8B2C2]">
                      {t("schedule.startsIn", {
                        time: formatDuration(startsIn),
                      })}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ol>

        {/* FOOTER */}
        <div className="flex items-center justify-between gap-3 border-t border-white/[0.08] p-4 sm:px-6">
          <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-[#64748B]">
            Asia / Colombo · {formatClock(currentMinutes)}
          </p>

          <button
            type="button"
            onClick={listenLive}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-[#FFD400] px-5 text-[12px] font-bold text-[#090D16] transition hover:bg-[#ffe45c]"
          >
            <span aria-hidden="true">►</span>
            {t("schedule.listenLive")}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
