"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/*
 * Weekly program posters in a 3D "cover flow": the poster in the middle
 * faces you, the ones beside it turn away and sink back. It slides on its
 * own every few seconds; listeners can swipe, use the arrows or the dots.
 * Auto-play pauses while the pointer is over it, while the page is
 * hidden, and for reduced motion.
 */

const POSTERS = [
  { src: "/images/programs/cover-lanthaya.jpg", alt: "Cover Lanthaya, every Monday at 6.30 PM" },
  { src: "/images/programs/time-capsule.jpg", alt: "Time Capsule, every Tuesday at 8.30 PM" },
  { src: "/images/programs/hitlist.jpg", alt: "Hitlist, every Wednesday at 6.30 PM" },
  { src: "/images/programs/mixxer.jpg", alt: "Mixxer, every Friday at 6.30 PM" },
];

const AUTO_PLAY_MS = 4500;

export default function ProgramPosterCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const slides = () =>
    Array.from(trackRef.current?.children ?? []) as HTMLElement[];

  // Scroll so poster `index` sits in the middle (wrapping at the ends)
  const goTo = useCallback((index: number) => {
    const track = trackRef.current;
    const all = slides();
    if (!track || !all.length) return;
    const target = all[(index + all.length) % all.length];
    const left = target.offsetLeft - (track.clientWidth - target.offsetWidth) / 2;
    track.scrollTo({ left, behavior: "smooth" });
  }, []);

  // Turn each poster by how far it is from the middle
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;

    const update = () => {
      frame = 0;
      const middle = track.scrollLeft + track.clientWidth / 2;
      let closest = 0;
      let closestDistance = Infinity;

      slides().forEach((slide, index) => {
        const center = slide.offsetLeft + slide.offsetWidth / 2;
        const offset = (center - middle) / slide.offsetWidth; // -1 = one poster left
        const distance = Math.abs(offset);

        if (distance < closestDistance) {
          closestDistance = distance;
          closest = index;
        }

        const card = slide.firstElementChild as HTMLElement | null;
        if (!card) return;
        const clamped = Math.max(-1.6, Math.min(1.6, offset));

        card.style.transform = reduce
          ? ""
          : `perspective(1200px) translateZ(${-Math.min(distance, 1.6) * 220}px) rotateY(${clamped * -38}deg) scale(${1 - Math.min(distance, 1.6) * 0.04})`;
        card.style.opacity = String(1 - Math.min(distance, 1.6) * 0.32);
        card.style.zIndex = String(10 - Math.round(distance * 3));
      });

      setActive(closest);
    };

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    track.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.cancelAnimationFrame(frame);
      track.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [goTo]);

  // Auto-play
  useEffect(() => {
    if (paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      goTo(active + 1);
    }, AUTO_PLAY_MS);
    return () => window.clearInterval(id);
  }, [paused, goTo, active]);

  return (
    <div
      className="group/carousel relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Zero FM programs"
    >
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain px-[11vw] py-12 [scrollbar-width:none] sm:px-[27vw] lg:px-[32vw] [&::-webkit-scrollbar]:hidden"
      >
        {POSTERS.map((poster, index) => (
          <div
            key={poster.src}
            className="relative w-[78vw] shrink-0 snap-center px-2 sm:w-[46vw] sm:px-3 lg:w-[36vw]"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${POSTERS.length}`}
          >
            <button
              type="button"
              onClick={() => goTo(index)}
              tabIndex={-1}
              className="relative block aspect-square w-full overflow-hidden rounded-[22px] shadow-[0_40px_80px_-25px_rgba(0,0,0,0.9)] ring-1 ring-white/10 transition-[transform,opacity] duration-150 ease-out will-change-transform"
            >
              <img
                src={poster.src}
                alt={poster.alt}
                loading={index < 3 ? "eager" : "lazy"}
                draggable={false}
                className="size-full object-cover"
              />
              {/* Light sheen across the poster */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.06] to-transparent"
              />
            </button>
            {/* Soft reflection on the floor */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-6 -bottom-6 h-10 rounded-full bg-[#FFD400]/[0.08] blur-2xl"
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        aria-label="Previous program"
        onClick={() => goTo(active - 1)}
        className="absolute left-4 top-1/2 z-20 flex size-12 -translate-y-1/2 items-center justify-center rounded-full border border-[#FFD400]/25 bg-[#05080F]/70 text-[#FFD400] backdrop-blur transition hover:bg-[#FFD400] hover:text-[#090D16] sm:left-8"
      >
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>

      <button
        type="button"
        aria-label="Next program"
        onClick={() => goTo(active + 1)}
        className="absolute right-4 top-1/2 z-20 flex size-12 -translate-y-1/2 items-center justify-center rounded-full border border-[#FFD400]/25 bg-[#05080F]/70 text-[#FFD400] backdrop-blur transition hover:bg-[#FFD400] hover:text-[#090D16] sm:right-8 md:right-20"
      >
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>

      <div className="flex justify-center gap-2">
        {POSTERS.map((poster, index) => (
          <button
            key={poster.src}
            type="button"
            aria-label={`Show program ${index + 1}`}
            aria-current={index === active}
            onClick={() => goTo(index)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === active ? "w-8 bg-[#FFD400]" : "w-1.5 bg-white/30 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
