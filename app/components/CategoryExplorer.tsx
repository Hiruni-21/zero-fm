"use client";

import { useEffect, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import CategoryModal from "./CategoryModal";
import { getSongLanguage, type SongLanguage } from "./MusicBrowserModal";
import { preloadRequestableTracks } from "../lib/request-tracks";
import { useLanguage, type SiteLanguage } from "./LanguageContext";

type Category = {
  language: SongLanguage;
  label: string;
  title: string;
  image: string;
  imageAlt: string;
};

const categories: Category[] = [
  {
    language: "sinhala",
    label: "සිංහල",
    title: "SINHALA MUSIC",
    image: "/images/Sigiriya Rock Amid Tropical Gardens.png",
    imageAlt: "Sigiriya rock rising above tropical gardens in Sri Lanka",
  },
  {
    language: "tamil",
    label: "தமிழ்",
    title: "TAMIL MUSIC",
    image: "/images/Vibrant South Indian Temple Courtyard.png",
    imageAlt: "Colorful South Indian Hindu temple courtyard",
  },
  {
    language: "english",
    label: "ENGLISH",
    title: "ENGLISH MUSIC",
    image: "/images/Hong Kong Harbor Lights at Night.png",
    imageAlt: "Harbor skyline illuminated at night",
  },
];

export default function CategoryExplorer({
  language: propLanguage,
}: {
  language?: SiteLanguage;
} = {}) {
  const { language: contextLanguage, t } = useLanguage();
  const activeSiteLanguage = propLanguage || contextLanguage;

  const [selectedLanguage, setSelectedLanguage] =
    useState<SongLanguage | null>(null);

  const [isExploreModalOpen, setIsExploreModalOpen] = useState(false);

  // How many requestable songs each language has, shown on the cards
  const [songCounts, setSongCounts] =
    useState<Partial<Record<SongLanguage, number>>>({});

  // Load the song catalogue in the background so Explore opens instantly.
  useEffect(() => {
    const load = () => {
      preloadRequestableTracks()
        .then((tracks) => {
          const counts: Partial<Record<SongLanguage, number>> = {};

          tracks.forEach((track) => {
            const songLanguage = getSongLanguage(track);
            if (songLanguage !== "unknown") {
              counts[songLanguage] = (counts[songLanguage] || 0) + 1;
            }
          });

          setSongCounts(counts);
        })
        .catch(() => {
        // The modal shows the error and a retry button if this fails.
      });
    };

    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(load, { timeout: 2000 });
      return () => window.cancelIdleCallback(id);
    }

    const id = window.setTimeout(load, 500);
    return () => window.clearTimeout(id);
  }, []);

  const activeCategory = categories.find(
    (category) => category.language === selectedLanguage
  );

  const openExploreModal = (songLanguage: SongLanguage) => {
    setSelectedLanguage(songLanguage);
    setIsExploreModalOpen(true);
  };

  const closeExploreModal = () => {
    setIsExploreModalOpen(false);
    setSelectedLanguage(null);
  };

  // Cards tilt slightly towards the mouse
  const handleTilt = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.pointerType !== "mouse") return;

    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    card.style.setProperty("--tilt-x", `${(-y * 7).toFixed(2)}deg`);
    card.style.setProperty("--tilt-y", `${(x * 9).toFixed(2)}deg`);
    card.style.setProperty("--glare-x", `${((x + 0.5) * 100).toFixed(1)}%`);
    card.style.setProperty("--glare-y", `${((y + 0.5) * 100).toFixed(1)}%`);
  };

  const resetTilt = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const card = event.currentTarget;
    card.style.setProperty("--tilt-x", "0deg");
    card.style.setProperty("--tilt-y", "0deg");
  };

  const getAriaLabel = (categoryTitle: string) => {
    if (activeSiteLanguage === "sinhala") {
      return `${categoryTitle} ගවේෂණය කරන්න`;
    }
    if (activeSiteLanguage === "tamil") {
      return `${categoryTitle} ஆராயுங்கள்`;
    }
    return `Explore ${categoryTitle}`;
  };

  return (
    <>
      <div className="mb-6 flex min-w-0 items-center gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FFD400] text-[#090D16] shadow-[0_8px_30px_rgba(255,212,0,0.12)] sm:h-12 sm:w-12">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-5 w-5 sm:h-6 sm:w-6"
            aria-hidden="true"
          >
            <path d="M9 18V5l10-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="16" cy="16" r="3" />
          </svg>
        </div>

        <div className="min-w-0">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-[#FFD400] sm:text-[11px]">
            {t("mobileApp.languages")}
          </p>

          <h2 className="mt-2 font-display text-[28px] font-bold leading-[1.25] tracking-[-0.03em] text-white sm:text-[40px] lg:text-[48px]">
            {/* An English "Hit" in the title gets the handwritten font */}
            {t("mobileApp.musicLibrary")
              .split(/(Hit)/)
              .map((part, index) =>
                part === "Hit" ? (
                  <span
                    key={index}
                    className="mx-1 inline-block -rotate-3 text-[1.25em] font-normal tracking-normal text-white"
                    style={{
                      fontFamily: '"Covered By Your Grace", cursive',
                      textShadow: "0 4px 14px rgba(255, 255, 255, 0.25)",
                    }}
                  >
                    {part}
                  </span>
                ) : (
                  part
                )
              )}
          </h2>
        </div>
      </div>

      <div className="grid gap-3 [perspective:900px] sm:grid-cols-3">
        {categories.map((category) => (
          <button
            key={category.title}
            type="button"
            aria-haspopup="dialog"
            aria-label={getAriaLabel(category.title)}
            onClick={() => openExploreModal(category.language)}
            onPointerMove={handleTilt}
            onPointerLeave={resetTilt}
            style={{
              transform:
                "rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg))",
            }}
            className="group relative aspect-[1.32/1] cursor-pointer overflow-hidden rounded-xl border border-white/[0.08] bg-[#111622] text-center transition-[transform,border-color,box-shadow] duration-300 ease-out hover:border-[#FFD400]/35 hover:shadow-[0_18px_40px_rgba(0,0,0,0.45)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFD400] motion-reduce:!transform-none"
          >
            <img
              src={category.image}
              alt={category.imageAlt}
              className="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-[1.08]"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#070B13]/95 via-[#070B13]/25 to-transparent" />

            {/* Light that follows the mouse */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{
                background:
                  "radial-gradient(circle at var(--glare-x, 50%) var(--glare-y, 50%), rgba(255,255,255,0.14), transparent 55%)",
              }}
            />

            {songCounts[category.language] ? (
              <span className="absolute right-2.5 top-2.5 rounded-full border border-white/15 bg-[#070B13]/70 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-white/80 backdrop-blur transition duration-300 group-hover:border-[#FFD400]/50 group-hover:text-[#FFD400]">
                {t("categories.songCount", {
                  n: songCounts[category.language] ?? 0,
                })}
              </span>
            ) : null}

            <span className="absolute inset-x-0 bottom-0 flex flex-col items-center p-3">
              <span className="flex items-baseline gap-1 text-white">
                <span className="font-display text-[11px] font-bold">
                  {category.label}
                </span>

                <span className="font-mono text-[10px] uppercase tracking-[0.1em]">
                  {t("categories.music")}
                </span>
              </span>

              <span className="mt-2 rounded-full border border-white/20 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-white transition duration-300 group-hover:border-[#FFD400]/60 group-hover:bg-[#FFD400] group-hover:text-[#090D16]">
                {t("categories.explore")}
              </span>
            </span>
          </button>
        ))}
      </div>

      {isExploreModalOpen &&
        selectedLanguage &&
        activeCategory && (
          <CategoryModal
            category={{
              title: activeCategory.title,
              language: selectedLanguage,
            }}
            onClose={closeExploreModal}
          />
        )}
    </>
  );
}