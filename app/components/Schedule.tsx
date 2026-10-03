"use client";

import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "./LanguageContext";

type Program = { time: string; endTime: string; program: string };
type ScheduleResponse = { station: string; timezone: string; schedule: Program[] };

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function getCurrentMinutesInColombo() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Colombo",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const hour = Number(parts.find((part) => part.type === "hour")?.value || 0);
  const minute = Number(parts.find((part) => part.type === "minute")?.value || 0);
  return hour * 60 + minute;
}

function isLive(program: Program, currentMinutes: number) {
  const start = timeToMinutes(program.time);
  const end = timeToMinutes(program.endTime);
  return end > start
    ? currentMinutes >= start && currentMinutes < end
    : currentMinutes >= start || currentMinutes < end;
}

function CalendarIcon() {
  return (
    <svg aria-hidden="true" className="size-3.5 text-[#FFD400]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18M8 14h.01M12 14h.01M16 14h.01" />
    </svg>
  );
}

export default function Schedule() {
  const { t } = useLanguage();
  const [schedule, setSchedule] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMinutes, setCurrentMinutes] = useState(getCurrentMinutesInColombo());

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await fetch("/api/schedule", { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to fetch schedule");
        const result: ScheduleResponse = await response.json();
        setSchedule(result.schedule || []);
      } catch (error) {
        console.error("Failed to fetch schedule:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
    const scheduleInterval = setInterval(fetchSchedule, 60000);
    const timeInterval = setInterval(() => setCurrentMinutes(getCurrentMinutesInColombo()), 60000);
    return () => {
      clearInterval(scheduleInterval);
      clearInterval(timeInterval);
    };
  }, []);

  const currentProgramIndex = useMemo(
    () => schedule.findIndex((program) => isLive(program, currentMinutes)),
    [schedule, currentMinutes]
  );
  const nextProgramIndex = useMemo(() => {
    if (!schedule.length) return -1;
    if (currentProgramIndex < 0) {
      return schedule.findIndex((program) => timeToMinutes(program.time) > currentMinutes);
    }
    return (currentProgramIndex + 1) % schedule.length;
  }, [schedule, currentProgramIndex, currentMinutes]);
  const currentProgram = currentProgramIndex >= 0 ? schedule[currentProgramIndex] : null;
  const nextProgram = nextProgramIndex >= 0 ? schedule[nextProgramIndex] : null;

  return (
    <section id="programs" className="flex h-full min-h-0 min-w-0 flex-col scroll-mt-24">
      <div className="flex shrink-0 items-end justify-between gap-2 border-b border-white/[0.08] pb-3">
        <div>
          <p className="font-mono text-[7px] font-semibold uppercase tracking-[0.14em] text-[#FFD400]">Zero FM</p>
          <div className="mt-1 flex items-center gap-2">
            <CalendarIcon />
            <h3 className="font-display text-sm font-bold text-white">{t("schedule.todaysPrograms")}</h3>
          </div>
        </div>
        <span className="font-mono text-[7px] font-medium uppercase tracking-[0.1em] text-[#8F9CAE]">Asia / Colombo</span>
      </div>

      <div className="mt-2 grid shrink-0 gap-2">
        <article className="rounded-lg border border-[#FFD400]/20 bg-[#FFD400]/[0.05] p-2.5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-mono text-[7px] font-semibold uppercase tracking-[0.1em] text-[#FFD400]">{t("schedule.liveNow")}</p>
              <p className="mt-1 truncate font-display text-[9px] font-semibold text-white">{loading ? t("schedule.loadingProgram") : currentProgram?.program || t("schedule.noLiveProgram")}</p>
              {currentProgram && <p className="mt-0.5 font-mono text-[7px] text-[#8F9CAE]">{currentProgram.time} – {currentProgram.endTime}</p>}
            </div>
            {currentProgram && <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[#34D399]/20 bg-[#34D399]/[0.08] px-2 py-1 font-mono text-[6px] font-semibold uppercase text-[#34D399]"><span className="size-1 rounded-full bg-[#34D399]" />{t("schedule.live")}</span>}
          </div>
        </article>

        <article className="rounded-lg border border-white/[0.08] bg-[#121826] p-2.5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-mono text-[7px] font-semibold uppercase tracking-[0.1em] text-[#8F9CAE]">{t("schedule.nextProgram")}</p>
              <p className="mt-1 truncate font-display text-[9px] font-semibold text-white">{loading ? t("schedule.loadingProgram") : nextProgram?.program || t("schedule.noUpcomingProgram")}</p>
              {nextProgram && <p className="mt-0.5 font-mono text-[7px] text-[#64748B]">{nextProgram.time} – {nextProgram.endTime}</p>}
            </div>
            {nextProgram && <span className="shrink-0 font-mono text-[8px] font-semibold text-[#FFD400]">{nextProgram.time}</span>}
          </div>
        </article>
      </div>

      <div className="schedule-scrollbar mt-2 max-h-[180px] min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
        {loading ? (
          <div className="space-y-1" aria-label={t("schedule.loadingSchedule")}>
            {[1, 2, 3, 4, 5].map((row) => <div key={row} className="h-[39px] animate-pulse border-b border-white/[0.05] bg-white/[0.02]" />)}
          </div>
        ) : schedule.length === 0 ? (
          <p className="py-6 text-center text-[9px] text-[#8F9CAE]">{t("schedule.noPrograms")}</p>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {schedule.map((program, index) => {
              const active = index === currentProgramIndex;
              const next = index === nextProgramIndex && !active;
              return (
                <div key={`${program.time}-${program.program}-${index}`} className="grid grid-cols-[42px_minmax(0,1fr)_auto] items-center gap-2 py-2">
                  <span className={`font-mono text-[8px] ${active ? "text-[#FFD400]" : "text-[#8F9CAE]"}`}>{program.time}</span>
                  <div className="min-w-0">
                    <p className={`truncate font-display text-[9px] font-semibold ${active ? "text-[#FFD400]" : "text-white/90"}`}>{program.program}</p>
                    <p className="mt-0.5 font-mono text-[7px] text-[#64748B]">{program.time} – {program.endTime}</p>
                  </div>
                  {active ? (
                    <span className="font-mono text-[6px] font-semibold uppercase tracking-[0.05em] text-[#34D399]">{t("schedule.live")}</span>
                  ) : next ? (
                    <span className="font-mono text-[6px] font-semibold uppercase tracking-[0.05em] text-[#FFD400]">{t("schedule.next")}</span>
                  ) : (
                    <span className="font-mono text-[7px] text-[#64748B]">{String(index + 1).padStart(2, "0")}</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <a href="#programs" className="mt-2 flex h-8 shrink-0 items-center justify-center gap-2 rounded-md border border-white/[0.08] bg-[#121826] font-mono text-[7px] font-medium uppercase tracking-[0.08em] text-white/85 transition hover:border-[#FFD400]/40 hover:text-[#FFD400]">
        {t("schedule.viewFullSchedule")} <span aria-hidden="true">→</span>
      </a>
    </section>
  );
}