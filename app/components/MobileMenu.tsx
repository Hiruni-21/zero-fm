"use client";

import { useState } from "react";
import { useLanguage } from "./LanguageContext";

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

  return (
    <div className="relative lg:hidden">
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
          {navItems.map(([key, href]) => (
            <a
              key={href}
              href={href}
              onClick={() => setIsOpen(false)}
              className="font-body block rounded-lg px-4 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/65 transition hover:bg-white/5 hover:text-[#FFD400]"
            >
              {t(key)}
            </a>
          ))}
        </nav>
      )}
    </div>
  );
}