"use client";

import { useEffect } from "react";
import MusicBrowserModal from "./MusicBrowserModal";
import type { SongLanguage } from "./MusicBrowserModal";

export type CategoryModalData = {
  title: string;
  language: SongLanguage;
};

type CategoryModalProps = {
  category: CategoryModalData;
  onClose: () => void;
};

export default function CategoryModal({
  category,
  onClose,
}: CategoryModalProps) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    document.body.style.overflow = "hidden";

    const handleHashChange = () => {
      onClose();
    };

    window.addEventListener("hashchange", handleHashChange);

    return () => {
      document.body.style.overflow = previousOverflow;

      window.removeEventListener(
        "hashchange",
        handleHashChange
      );

      previousFocus?.focus();
    };
  }, [onClose]);

  return (
    <div
      className="category-modal-backdrop fixed inset-0 z-[120] flex items-center justify-center bg-[#02040A]/80 p-4 backdrop-blur-[3px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        aria-modal="true"
        aria-labelledby="song-browser-title"
        role="dialog"
        className="category-modal-panel flex max-h-[90vh] w-full max-w-[820px] flex-col overflow-hidden rounded-2xl border border-white/[0.1] bg-[#0F1523] shadow-[0_28px_100px_rgba(0,0,0,0.6)]"
      >
        <MusicBrowserModal
          language={category.language}
          title={category.title}
          onClose={onClose}
        />
      </section>
    </div>
  );
}