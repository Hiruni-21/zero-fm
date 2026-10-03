"use client";

import { useState } from "react";
import CategoryModal from "./CategoryModal";
import type { SongLanguage } from "./MusicBrowserModal";
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
      <div className="grid gap-3 sm:grid-cols-3">
        {categories.map((category) => (
          <button
            key={category.title}
            type="button"
            aria-haspopup="dialog"
            aria-label={getAriaLabel(category.title)}
            onClick={() => openExploreModal(category.language)}
            className="group relative aspect-[1.32/1] cursor-pointer overflow-hidden rounded-xl border border-white/[0.08] bg-[#111622] text-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFD400]"
          >
            <img
              src={category.image}
              alt={category.imageAlt}
              className="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-[1.03]"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#070B13]/95 via-[#070B13]/25 to-transparent" />

            <span className="absolute inset-x-0 bottom-0 flex flex-col items-center p-3">
              <span className="flex items-baseline gap-1 text-white">
                <span className="font-display text-[11px] font-bold">
                  {category.label}
                </span>

                <span className="font-mono text-[7px] uppercase tracking-[0.1em]">
                  {t("categories.music")}
                </span>
              </span>

              <span className="mt-2 rounded-full border border-white/20 px-3 py-1 font-mono text-[7px] uppercase tracking-[0.08em] text-white transition duration-300 group-hover:border-[#FFD400]/60 group-hover:bg-[#FFD400] group-hover:text-[#090D16]">
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