"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "./LanguageContext";

type SiteLanguage = "english" | "sinhala" | "tamil";

// Always English, Sinhala, Tamil in that order. Each language is shown in its
// own script; in Tamil every name is in Tamil, the same as the picker under the hero
export function languageChoices(current: SiteLanguage): [SiteLanguage, string][] {
  return current === "tamil"
    ? [
        ["english", "ஆங்கிலம்"],
        ["sinhala", "சிங்களம்"],
        ["tamil", "தமிழ்"],
      ]
    : [
        ["english", "English"],
        ["sinhala", "සිංහල"],
        ["tamil", "தமிழ்"],
      ];
}

const SHORT_LABEL: Record<SiteLanguage, string> = {
  english: "EN",
  sinhala: "සිං",
  tamil: "த",
};

export function GlobeIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a14 14 0 0 1 0 18" />
      <path d="M12 3a14 14 0 0 0 0 18" />
    </svg>
  );
}

// True once the language picker under the hero has scrolled away or faded
// out, so the page never shows two language pickers at once
export function useHeroPickerGone() {
  const [heroPickerVisible, setHeroPickerVisible] = useState(true);

  useEffect(() => {
    let frame = 0;

    const check = () => {
      frame = 0;
      const picker = document.getElementById("hero-language-picker");
      if (!picker) {
        setHeroPickerVisible(false);
        return;
      }
      const rect = picker.getBoundingClientRect();
      const onScreen = rect.bottom > 72 && rect.top < window.innerHeight;
      // The hero text fades out as you scroll, so count it as gone once faint
      let opacity = 1;
      for (let el: HTMLElement | null = picker; el && el !== document.body; el = el.parentElement) {
        opacity *= Number(getComputedStyle(el).opacity);
      }
      setHeroPickerVisible(onScreen && opacity > 0.35);
    };

    // Check again just after scrolling stops, because the hero fades its
    // text on its own scroll handler and may not have updated yet
    let settle = 0;
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(check);
      window.clearTimeout(settle);
      settle = window.setTimeout(check, 150);
    };

    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(settle);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return !heroPickerVisible;
}

// Language button in the top bar, so the language can be changed from
// anywhere on the page without scrolling back up to the hero
export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!boxRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  const show = useHeroPickerGone();

  // Close the list if the button hides while it is open
  useEffect(() => {
    if (!show) setIsOpen(false);
  }, [show]);

  const current = language as SiteLanguage;

  return (
    <div
      ref={boxRef}
      aria-hidden={!show}
      className={`relative transition-all duration-300 ease-out ${
        show
          ? "visible max-w-[120px] translate-y-0 opacity-100"
          : "pointer-events-none invisible -mr-3 max-w-0 -translate-y-1 overflow-hidden opacity-0"
      }`}
    >
      <button
        type="button"
        tabIndex={show ? 0 : -1}
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="Change language"
        title="Change language"
        className={`flex h-10 shrink-0 items-center gap-1.5 rounded-full border px-3 text-[13px] font-semibold transition ${
          isOpen
            ? "border-[#FFD400] bg-[#FFD400] text-[#090D16]"
            : "border-[#FFD400]/40 bg-[#FFD400]/10 text-[#FFD400] hover:border-[#FFD400]"
        }`}
      >
        <GlobeIcon className="size-[18px]" />
        <span className="min-w-[1.5em] text-center">{SHORT_LABEL[current]}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-44 rounded-xl border border-white/10 bg-[#111A2B] p-1.5 shadow-2xl">
          {languageChoices(current).map(([code, label]) => {
            const isActive = code === current;
            return (
              <button
                key={code}
                type="button"
                onClick={() => {
                  setLanguage(code);
                  setIsOpen(false);
                }}
                aria-current={isActive ? "true" : undefined}
                className={`flex w-full items-center justify-between rounded-lg px-3.5 py-2.5 text-left text-[14px] transition hover:bg-white/5 hover:text-[#FFD400] ${
                  isActive ? "bg-[#FFD400]/[0.08] font-semibold text-[#FFD400]" : "text-white/75"
                }`}
              >
                {label}
                {isActive && <span className="size-1.5 rounded-full bg-[#FFD400]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
