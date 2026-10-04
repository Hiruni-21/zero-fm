"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "./LanguageContext";
import { selectSection, useActiveSection } from "../lib/active-section";

const navItems: [string, string][] = [
  ["nav.home", "#home"],
  ["nav.live", "#live"],
  ["nav.programs", "#programs"],
  ["nav.request", "#request"],
  ["nav.about", "#about"],
  ["nav.contact", "#contact"],
  ["nav.downloadApp", "#app"],
];

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();
  const activeSection = useActiveSection();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close when tapping outside the menu or pressing Escape
  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
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

  return (
    <div ref={menuRef} className="relative lg:hidden">
      <button
        type="button"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white"
        aria-label={isOpen ? t("mobileMenu.close") : t("mobileMenu.open")}
        aria-expanded={isOpen}
        aria-controls="mobile-navigation"
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className="text-lg" aria-hidden="true">
          {isOpen ? "×" : "☰"}
        </span>
      </button>

      {isOpen && (
        <nav
          id="mobile-navigation"
          aria-label={t("mobileMenu.navigation")}
          className="absolute right-0 top-12 z-50 w-56 rounded-xl border border-white/10 bg-[#111A2B] p-2 shadow-2xl"
          onKeyDown={(event) => {
            if (event.key === "Escape") setIsOpen(false);
          }}
        >
          {navItems.map(([key, href]) => {
            const id = href.slice(1);
            const isActive = activeSection === id;

            return (
              <a
                key={href}
                href={href}
                aria-current={isActive ? "true" : undefined}
                onClick={() => {
                  selectSection(id);
                  setIsOpen(false);
                }}
                className={`zf-nav-link flex items-center justify-between rounded-lg px-4 py-3 transition hover:bg-white/5 hover:text-[#FFD400] ${
                  isActive
                    ? "bg-[#FFD400]/[0.06] text-[#FFD400]"
                    : "text-white/65"
                }`}
              >
                {t(key)}

                {isActive && (
                  <span className="size-1.5 rounded-full bg-[#FFD400]" />
                )}
              </a>
            );
          })}
        </nav>
      )}
    </div>
  );
}