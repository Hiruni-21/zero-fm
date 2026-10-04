"use client";

/*
 * Small page-wide events so separate sections can talk to each other
 * without sharing state:
 * - showToast("...") pops a short message at the bottom of the screen
 * - requestPlay() asks the live player to start (used by Listen Live buttons)
 */

export const TOAST_EVENT = "zero-fm:toast";
export const PLAY_EVENT = "zero-fm:play";

export type ToastDetail = {
  message: string;
  actionLabel?: string;
  actionHref?: string;
};

export function showToast(
  message: string,
  action?: { label: string; href: string }
) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent<ToastDetail>(TOAST_EVENT, {
      detail: {
        message,
        actionLabel: action?.label,
        actionHref: action?.href,
      },
    })
  );
}

export function requestPlay() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(PLAY_EVENT));
}
