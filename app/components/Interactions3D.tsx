"use client";

import { useEffect } from "react";

/*
 * Extra 3D touches for the home page, all in one place:
 * - section headings flip up into place in 3D as they come on screen
 * - with a mouse: some cards tilt towards the pointer and the main
 *   buttons lean towards it ("magnetic")
 * - on phones (no mouse): the music cards tip back as they scroll in
 * Nothing moves for people who ask their device for reduced motion.
 */

// Cards that tilt towards the mouse, with how far (degrees)
const TILT_TARGETS: [string, number][] = [
  ["#request .zf-card", 3],
  ["#live .group\\/art", 14],
];

// Buttons that lean towards the mouse
const MAGNETIC_SELECTOR = [
  'header a[href="#download-app"]',
  'header button[aria-label="Search Zero FM"]',
  '#live button[title*="Space"]',
  "#request form button[type=submit]",
].join(", ");

const HEADING_SELECTOR = "main section:not(#home) h2";

export default function Interactions3D() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const mouse = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const cleanups: (() => void)[] = [];

    /* Headings flip up into place ---------------------------------------- */
    const headings = Array.from(
      document.querySelectorAll<HTMLElement>(HEADING_SELECTOR)
    ).filter((el) => el.getBoundingClientRect().top > window.innerHeight);

    headings.forEach((el) => el.classList.add("zf-h3d"));
    const headingObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("zf-h3d-in");
          headingObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.4 }
    );
    headings.forEach((el) => headingObserver.observe(el));

    // A menu jump shows every heading straight away
    const showAll = (event: MouseEvent) => {
      if (!(event.target as Element | null)?.closest?.('a[href^="#"]')) return;
      headings.forEach((el) => el.classList.add("zf-h3d-in"));
    };
    document.addEventListener("click", showAll, true);
    cleanups.push(() => {
      headingObserver.disconnect();
      document.removeEventListener("click", showAll, true);
    });

    if (mouse) {
      /* Cards tilt towards the pointer ----------------------------------- */
      TILT_TARGETS.forEach(([selector, max]) => {
        document.querySelectorAll<HTMLElement>(selector).forEach((card) => {
          const move = (event: PointerEvent) => {
            const rect = card.getBoundingClientRect();
            const px = (event.clientX - rect.left) / rect.width - 0.5;
            const py = (event.clientY - rect.top) / rect.height - 0.5;
            card.style.transition = "transform 120ms ease-out";
            card.style.transform = `perspective(1000px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg)`;
          };
          const leave = () => {
            card.style.transition = "transform 600ms cubic-bezier(.2,.8,.2,1)";
            card.style.transform = "";
          };
          card.addEventListener("pointermove", move);
          card.addEventListener("pointerleave", leave);
          cleanups.push(() => {
            card.removeEventListener("pointermove", move);
            card.removeEventListener("pointerleave", leave);
          });
        });
      });

      /* Buttons lean towards the pointer --------------------------------- */
      document.querySelectorAll<HTMLElement>(MAGNETIC_SELECTOR).forEach((button) => {
        const move = (event: PointerEvent) => {
          const rect = button.getBoundingClientRect();
          const dx = event.clientX - (rect.left + rect.width / 2);
          const dy = event.clientY - (rect.top + rect.height / 2);
          button.style.translate = `${(dx * 0.25).toFixed(1)}px ${(dy * 0.3).toFixed(1)}px`;
        };
        const leave = () => {
          button.style.translate = "";
        };
        button.style.transition = `${getComputedStyle(button).transition}, translate 250ms cubic-bezier(.2,.8,.2,1)`;
        button.addEventListener("pointermove", move);
        button.addEventListener("pointerleave", leave);
        cleanups.push(() => {
          button.removeEventListener("pointermove", move);
          button.removeEventListener("pointerleave", leave);
        });
      });
    } else {
      /* Phones: music cards tip back as they scroll in ------------------- */
      const cards = Array.from(
        document.querySelectorAll<HTMLElement>("#music .grid > button")
      );
      let frame = 0;
      const update = () => {
        frame = 0;
        const h = window.innerHeight;
        cards.forEach((card) => {
          const rect = card.getBoundingClientRect();
          // 0 when the card is in the middle of the screen, 1 at the bottom edge
          const t = Math.max(0, Math.min(1, (rect.top + rect.height / 2 - h * 0.5) / (h * 0.5)));
          card.style.setProperty("--tilt-x", `${(t * 22).toFixed(1)}deg`);
        });
      };
      const onScroll = () => {
        if (!frame) frame = window.requestAnimationFrame(update);
      };
      update();
      window.addEventListener("scroll", onScroll, { passive: true });
      cleanups.push(() => {
        window.cancelAnimationFrame(frame);
        window.removeEventListener("scroll", onScroll);
      });
    }

    return () => cleanups.forEach((cleanup) => cleanup());
  }, []);

  return (
    <>
      <style jsx global>{`
        .zf-h3d {
          opacity: 0;
          transform: perspective(800px) rotateX(-75deg) translateY(30px);
          transform-origin: 50% 100%;
        }

        .zf-h3d.zf-h3d-in {
          opacity: 1;
          transform: none;
          transition:
            opacity 700ms ease-out,
            transform 1000ms cubic-bezier(0.2, 0.8, 0.2, 1);
        }
      `}</style>
    </>
  );
}
