"use client";

import { useSyncExternalStore } from "react";

/*
 * Scroll spy shared by the desktop navbar and the mobile menu.
 * Works out which page section is under the navbar while scrolling.
 */

export const NAV_SECTIONS = [
  "home",
  "live",
  "programs",
  "request",
  "about",
  "contact",
] as const;

export type NavSection = (typeof NAV_SECTIONS)[number];

const HEADER_HEIGHT = 72;

let active: NavSection = "home";
// The section the visitor clicked. It stays highlighted while it's still
// on screen, so clicking "Programs" doesn't flip back to "Live" on desktop,
// where both sit side by side.
let pinned: NavSection | null = null;
let pinnedAt = 0;

const listeners = new Set<() => void>();
let frame = 0;

function emit(next: NavSection) {
  if (next === active) return;
  active = next;
  listeners.forEach((listener) => listener());
}

function compute() {
  frame = 0;

  const line = HEADER_HEIGHT + window.innerHeight * 0.3;
  const atBottom =
    window.innerHeight + window.scrollY >=
    document.documentElement.scrollHeight - 4;

  const visible: NavSection[] = [];
  let best: { id: NavSection; top: number } | null = null;

  for (const id of NAV_SECTIONS) {
    const el = document.getElementById(id);
    if (!el) continue;

    const rect = el.getBoundingClientRect();
    if (rect.top <= line && rect.bottom > HEADER_HEIGHT) {
      visible.push(id);

      // Sections side by side (Live and Programs on desktop) start at
      // the same height; the first one in the menu wins.
      const sameRow = best && Math.abs(rect.top - best.top) < 60;

      if (!sameRow && (!best || rect.top > best.top)) {
        best = { id, top: rect.top };
      }
    }
  }

  // Keep a clicked section for as long as it's on screen; while the smooth
  // scroll is still travelling, keep it regardless.
  if (pinned) {
    const travelling = Date.now() - pinnedAt < 1200;
    if (travelling || visible.includes(pinned)) {
      emit(pinned);
      return;
    }
    pinned = null;
  }

  if (atBottom) {
    emit("contact");
    return;
  }

  emit(best?.id ?? "home");
}

function schedule() {
  if (!frame) frame = window.requestAnimationFrame(compute);
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  if (listeners.size === 1) {
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    // Pinning ends as soon as the visitor scrolls by hand
    window.addEventListener("wheel", unpin, { passive: true });
    window.addEventListener("touchmove", unpin, { passive: true });
    schedule();
  }

  return () => {
    listeners.delete(listener);

    if (listeners.size === 0) {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("wheel", unpin);
      window.removeEventListener("touchmove", unpin);
    }
  };
}

function unpin() {
  if (pinned && Date.now() - pinnedAt > 1200) pinned = null;
}

/** Call when a nav link is clicked so it highlights straight away. */
export function selectSection(id: string) {
  if (!(NAV_SECTIONS as readonly string[]).includes(id)) return;
  pinned = id as NavSection;
  pinnedAt = Date.now();
  emit(pinned);
}

export function useActiveSection(): NavSection {
  return useSyncExternalStore(
    subscribe,
    () => active,
    () => "home"
  );
}
