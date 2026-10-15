"use client";

import React from "react";

// English hero heading in a painted brush style:
// BRIGHTER / BEGINNINGS in thick white brush letters, a gold marker swipe
// behind BRIGHTER, MELODIOUS DAYS on a gold brush stroke, and small gold doodles.
// Font: Caveat Brush (Google), made thicker with a white outline and slanted.
// It "paints on" piece by piece when it comes on screen, then keeps gently moving:
// a slow float, a shine across MELODIOUS DAYS and wiggling dashes (globals.css).

// Letters lean hard and the first letter of each word is drawn bigger, like a hand-painted sign
function BrushWord({ word, delay }: { word: string; delay: string }) {
  return (
    <span
      className="zf-paint inline-block origin-left"
      style={{
        ["--d" as string]: delay,
        transform: "skewX(-14deg) scaleX(var(--zf-brush-narrow))",
        WebkitTextStroke: "var(--zf-brush-stroke) #fff",
        filter: "url(#zf-dry-brush)",
      }}
    >
      <span className="text-[1.22em] leading-[0]">{word.charAt(0)}</span>
      {word.slice(1)}
    </span>
  );
}

export default function BrushHeading({ line1, line2 }: { line1: string; line2: string }) {
  const words = line1.trim().split(/\s+/);
  const first = words[0] ?? "";
  const rest = words.slice(1).join(" ");

  // Each time the heading comes back on screen, paint it on again
  const rootRef = React.useRef<HTMLSpanElement>(null);
  const [cycle, setCycle] = React.useState(0);

  React.useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    let wasHidden = false;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) wasHidden = true;
      else if (wasHidden) {
        wasHidden = false;
        setCycle((c) => c + 1);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <span
      ref={rootRef}
      key={cycle}
      className="zf-brush-float relative isolate mx-auto block w-fit -rotate-6 pb-3 pt-3"
      style={
        {
          "--zf-brush-font": '"Caveat Brush", "Permanent Marker", cursive',
          "--zf-brush-stroke": "0.035em",
          "--zf-brush-narrow": "0.92",
        } as React.CSSProperties
      }
    >
      {/* Dry brush texture: tiny streaks so the letters look painted */}
      <svg aria-hidden="true" width="0" height="0" className="absolute">
        <filter id="zf-dry-brush">
          <feTurbulence type="fractalNoise" baseFrequency="0.9 0.05" numOctaves="2" seed="3" />
          <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -7 6.2" />
          <feComposite in="SourceGraphic" operator="in" />
        </filter>
      </svg>

      {/* Gold doodles hugging the heading: dashes and an x like a hand-drawn sign */}
      <svg
        aria-hidden="true"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
      >
        <g stroke="#FFD400" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
          {/* dashes and x on the left of BEGINNINGS */}
          <path className="zf-pop" style={{ ["--d" as string]: "1.5s" }} vectorEffect="non-scaling-stroke" d="M-2 44 l4 2 M-3 51 l5 0" />
          <path className="zf-pop" style={{ ["--d" as string]: "1.65s" }} vectorEffect="non-scaling-stroke" d="M-5 65 l3 5 M-2 65 l-3 5 M1 64 l-1.5 5" />
          {/* dashes after BEGINNINGS */}
          <path className="zf-pop" style={{ ["--d" as string]: "1.8s" }} vectorEffect="non-scaling-stroke" d="M97 56 l4 2 M96 64 l4 4" />
        </g>
      </svg>

      <span
        className="zf-brush relative block uppercase leading-[0.86]"
        style={{ fontFamily: "var(--zf-brush-font)", fontWeight: 400, letterSpacing: "-0.01em" }}
      >
        <span className="relative block w-fit text-left">
          {/* Gold marker swipe behind the first word */}
          <span
            aria-hidden="true"
            className="zf-paint absolute -left-[8%] top-[34%] -z-10 h-[50%] w-[100%] -skew-x-12 bg-[#FFD400]/55"
            style={{ borderRadius: "40px 8px 50px 10px", ["--d" as string]: "0.1s" }}
          />
          <BrushWord word={first} delay="0.35s" />
          {/* Little dashes right after the R */}
          <svg aria-hidden="true" viewBox="0 0 40 40" className="pointer-events-none absolute left-[99%] top-[32%] w-[0.3em] overflow-visible">
            <g stroke="#FFD400" strokeWidth="4.5" strokeLinecap="round" fill="none">
              <path className="zf-pop" style={{ ["--d" as string]: "1.35s" }} d="M6 14 L26 4 M8 30 L32 24" />
            </g>
          </svg>
        </span>
        <span className="ml-[0.45em] block text-left">
          <BrushWord word={rest} delay="0.75s" />
        </span>

        {/* Second line on a gold brush stroke */}
        <span
          className="zf-paint relative ml-[2.4em] mt-[0.1em] block w-fit -skew-x-[8deg] px-[0.7em] py-[0.1em] text-[0.3em] leading-[1.2] tracking-[0.05em] text-[#090D16]"
          style={{ fontFamily: '"Caveat Brush", cursive', ["--d" as string]: "1.15s" }}
        >
          <span
            aria-hidden="true"
            className="absolute inset-0 -z-10 overflow-hidden bg-[#FFD400]"
            style={{ borderRadius: "30px 6px 34px 8px" }}
          >
            {/* A soft shine that keeps sliding across the gold stroke */}
            <span className="zf-sheen absolute inset-y-0 left-0 w-1/3" />
          </span>
          {line2}
        </span>
      </span>
    </span>
  );
}
