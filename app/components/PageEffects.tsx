"use client";

import { useEffect, useRef, useState } from "react";
import { TOAST_EVENT, type ToastDetail } from "../lib/ui-events";

/*
 * Page-wide interactions that sit on top of the existing design:
 * - thin yellow scroll progress line under the navbar
 * - navbar shadow once the page is scrolled
 * - sections fade up as they scroll into view
 * - press feedback on buttons and links
 * - back-to-top button
 * - short pop-up messages (toasts) any section can show
 */

const REVEAL_SELECTOR = [
  "main > section:not(#home) > *",
  "main > div:not(.fixed) > *",
  "main > footer > *",
  "#live",
  "#programs",
  "#shows > *",
  "#music .grid > button",
].join(", ");

export default function PageEffects() {
  const [progress, setProgress] = useState(0);
  const [showTop, setShowTop] = useState(false);
  const [toast, setToast] = useState<(ToastDetail & { id: number }) | null>(
    null
  );
  const toastTimer = useRef(0);

  // Toasts
  useEffect(() => {
    const onToast = (event: Event) => {
      const detail = (event as CustomEvent<ToastDetail>).detail;
      window.clearTimeout(toastTimer.current);
      setToast({ ...detail, id: Date.now() });
      toastTimer.current = window.setTimeout(() => setToast(null), 3200);
    };

    window.addEventListener(TOAST_EVENT, onToast);

    return () => {
      window.removeEventListener(TOAST_EVENT, onToast);
      window.clearTimeout(toastTimer.current);
    };
  }, []);

  // Scroll progress, navbar shadow, back-to-top visibility
  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;

      const max =
        document.documentElement.scrollHeight - window.innerHeight;

      setProgress(max > 0 ? Math.min(window.scrollY / max, 1) : 0);
      setShowTop(window.scrollY > 700);

      document.documentElement.toggleAttribute(
        "data-scrolled",
        window.scrollY > 8
      );
    };

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      document.documentElement.removeAttribute("data-scrolled");
    };
  }, []);

  // Fade sections up as they come into view
  useEffect(() => {
    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;

            el.classList.add("zf-revealed");
            observer.unobserve(el);

            // Remove the helper classes once the fade has finished
            window.setTimeout(() => {
              el.classList.remove("zf-reveal", "zf-revealed");
              el.style.removeProperty("--zf-reveal-delay");
            }, 1500);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    const elements = Array.from(
      new Set(document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR))
    );

    elements.forEach((el) => {
      // Anything already on screen stays as it is
      if (el.getBoundingClientRect().top < window.innerHeight) return;

      const siblings = el.parentElement
        ? Array.from(el.parentElement.children)
        : [];

      const delay = Math.min(Math.max(siblings.indexOf(el), 0), 4) * 110;

      el.style.setProperty("--zf-reveal-delay", `${delay}ms`);
      el.classList.add("zf-reveal");
      observer.observe(el);
    });

    // A menu jump lands on the real spot only if nothing is mid-tilt,
    // so finish every reveal straight away when one is clicked
    const showAll = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.('a[href^="#"]');
      if (!link) return;
      observer.disconnect();
      elements.forEach((el) => {
        el.classList.remove("zf-reveal", "zf-revealed");
        el.style.removeProperty("--zf-reveal-delay");
      });
    };

    document.addEventListener("click", showAll, true);

    return () => {
      document.removeEventListener("click", showAll, true);
      observer.disconnect();
      elements.forEach((el) => {
        el.classList.remove("zf-reveal", "zf-revealed");
      });
    };
  }, []);

  return (
    <>
      <style jsx global>{`
        html {
          scroll-padding-top: 136px;
        }

        header {
          transition: box-shadow 0.3s ease, background-color 0.3s ease;
        }

        html[data-scrolled] header {
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
        }

        /* Sections tip up into place in 3D as they scroll into view */
        .zf-reveal {
          opacity: 0;
          transform: perspective(1400px) translateY(70px) rotateX(16deg) scale(0.94);
          transform-origin: 50% 100%;
          transition: opacity 0.8s ease, transform 0.9s cubic-bezier(0.22, 1, 0.36, 1);
          transition-delay: var(--zf-reveal-delay, 0ms);
        }

        /* "none" so finished sections don't trap fixed popups */
        .zf-reveal.zf-revealed {
          opacity: 1;
          transform: none;
        }

        /* Premium card: dark glass with a soft gold edge and deep shadow */
        .zf-card {
          background:
            linear-gradient(180deg, rgba(22, 30, 48, 0.92), rgba(10, 14, 24, 0.94)) padding-box,
            linear-gradient(160deg, rgba(255, 212, 0, 0.35), rgba(255, 255, 255, 0.06) 35%, rgba(255, 255, 255, 0.04) 65%, rgba(255, 212, 0, 0.18)) border-box;
          border: 1px solid transparent;
          box-shadow:
            0 40px 80px -30px rgba(0, 0, 0, 0.85),
            0 0 0 1px rgba(255, 255, 255, 0.02),
            inset 0 1px 0 rgba(255, 255, 255, 0.06);
          transition: box-shadow 0.4s ease;
        }

        .zf-card:hover {
          box-shadow:
            0 50px 90px -30px rgba(0, 0, 0, 0.9),
            0 0 50px -10px rgba(255, 212, 0, 0.12),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
        }

        /* Fine film grain over the whole page for a richer, print-like feel */
        main::after {
          content: "";
          position: fixed;
          inset: 0;
          z-index: 60;
          pointer-events: none;
          opacity: 0.05;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }

        /* Hero scroll cue */
        .zf-scroll-dot {
          animation: zf-scroll-dot 1.6s ease-in-out infinite;
        }

        @keyframes zf-scroll-dot {
          0% {
            transform: translateY(0);
            opacity: 1;
          }
          70% {
            transform: translateY(12px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .zf-scroll-dot {
            animation: none;
          }
        }

        main button:not(:disabled):active,
        main a[href]:active {
          scale: 0.97;
        }

        /* Inputs already highlight their own box, so no extra frame */
        main input:focus,
        main textarea:focus {
          outline: none;
        }

        main button:focus-visible,
        main a[href]:focus-visible {
          outline: 2px solid rgba(255, 212, 0, 0.7);
          outline-offset: 2px;
        }

        /* Footer links: turn yellow with an underline that slides in */
        #contact a[href]:not(:has(img)):not(:has(svg)) {
          background: linear-gradient(#ffd400, #ffd400) 0 100% / 0 1px no-repeat;
          transition: color 0.2s ease, background-size 0.3s ease;
          width: fit-content;
        }

        #contact a[href]:not(:has(img)):not(:has(svg)):hover {
          color: #ffd400;
          background-size: 100% 1px;
        }

        .zf-toast {
          animation: zfToastIn 0.35s cubic-bezier(0.22, 1, 0.36, 1);
        }

        @keyframes zfToastIn {
          from {
            opacity: 0;
            translate: 0 16px;
            scale: 0.96;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          main button:active,
          main a[href]:active {
            scale: 1;
          }
        }
      `}</style>

      {/* Scroll progress line */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 right-0 top-[128px] z-[101] h-[2px] origin-left bg-[#FFD400]"
        style={{ transform: `scaleX(${progress})` }}
      />

      {/* Toast */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-5 z-[450] flex justify-center px-4"
      >
        {toast && (
          <div
            key={toast.id}
            className="zf-toast pointer-events-auto flex max-w-[460px] items-center gap-3 rounded-full border border-[#FFD400]/25 bg-[#0F1523]/95 py-2.5 pl-4 pr-2.5 text-[12px] text-white shadow-[0_16px_40px_rgba(0,0,0,0.5)] backdrop-blur"
          >
            <span className="size-1.5 shrink-0 rounded-full bg-[#FFD400]" />

            <span className="min-w-0">{toast.message}</span>

            {toast.actionLabel && toast.actionHref ? (
              <a
                href={toast.actionHref}
                onClick={() => setToast(null)}
                className="shrink-0 rounded-full bg-[#FFD400] px-3 py-1 text-[11px] font-bold text-[#090D16] transition hover:bg-[#ffe45c]"
              >
                {toast.actionLabel}
              </a>
            ) : (
              <button
                type="button"
                aria-label="Dismiss"
                onClick={() => setToast(null)}
                className="shrink-0 rounded-full px-2 text-white/40 transition hover:text-white"
              >
                ×
              </button>
            )}
          </div>
        )}
      </div>

      {/* Back to top */}
      <button
        type="button"
        aria-label="Back to top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed bottom-5 right-5 z-[90] flex size-11 items-center justify-center rounded-full border border-[#FFD400]/30 bg-[#0F1523]/90 text-[#FFD400] shadow-[0_10px_30px_rgba(0,0,0,0.4)] backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-[#FFD400]/60 hover:bg-[#FFD400] hover:text-[#090D16] ${
          showTop
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-3 opacity-0"
        }`}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>
      </button>
    </>
  );
}
