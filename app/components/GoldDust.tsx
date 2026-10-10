"use client";

import { useEffect, useRef } from "react";

/*
 * Soft gold dust that drifts slowly upwards and twinkles, drawn on a
 * plain canvas (no extra libraries). Same little gold specks as the top
 * of the page, so a section with it looks like part of the same sky.
 * It fills its parent, so the parent needs `relative`.
 */

const GOLD = [255, 212, 0];
const PALE = [255, 236, 170];

export default function GoldDust({ density = 1 }: { density?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let count = 0;
    let x = new Float32Array(0);
    let y = new Float32Array(0);
    let size = new Float32Array(0);
    let speed = new Float32Array(0);
    let sway = new Float32Array(0);
    let twinkle = new Float32Array(0);
    let tint = new Float32Array(0);

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);

      // About one speck per 2,500 square pixels
      count = Math.round(((width * height) / 2500) * density);
      x = new Float32Array(count);
      y = new Float32Array(count);
      size = new Float32Array(count);
      speed = new Float32Array(count);
      sway = new Float32Array(count);
      twinkle = new Float32Array(count);
      tint = new Float32Array(count);
      for (let i = 0; i < count; i++) {
        x[i] = Math.random() * width;
        y[i] = Math.random() * height;
        // A few bigger, closer specks among many small ones
        const near = Math.random() < 0.12;
        size[i] = near ? 2.4 + Math.random() * 2.2 : 0.8 + Math.random() * 1.6;
        speed[i] = (near ? 14 : 5) + Math.random() * 10;
        sway[i] = Math.random() * Math.PI * 2;
        twinkle[i] = Math.random() * Math.PI * 2;
        tint[i] = Math.random();
      }
      if (reduceMotion) draw(performance.now());
    };

    let frame = 0;
    let last = performance.now();
    let shown = true;

    const draw = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";

      for (let i = 0; i < count; i++) {
        if (!reduceMotion) {
          y[i] -= speed[i] * dt;
          x[i] += Math.sin(now * 0.0004 + sway[i]) * 6 * dt;
          if (y[i] < -6) {
            y[i] = height + 6;
            x[i] = Math.random() * width;
          }
        }

        // Fade out near the top and bottom edges so there's no hard line
        const edge = Math.min(y[i] / 80, (height - y[i]) / 80, 1);
        const glow = 0.45 + 0.55 * Math.sin(twinkle[i] + now * 0.0018);
        const alpha = Math.max(0, edge) * glow * (size[i] > 2.4 ? 0.75 : 0.55);
        if (alpha < 0.02) continue;

        const c = tint[i] > 0.8 ? PALE : GOLD;
        const s = size[i];
        ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${alpha.toFixed(3)})`;
        ctx.fillRect(x[i] - s / 2, y[i] - s / 2, s, s);

        // Bigger specks get a soft halo
        if (s > 2.4) {
          const h = s * 4;
          ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${(alpha * 0.1).toFixed(3)})`;
          ctx.fillRect(x[i] - h / 2, y[i] - h / 2, h, h);
        }
      }

      ctx.globalCompositeOperation = "source-over";
      if (!reduceMotion && shown) frame = window.requestAnimationFrame(draw);
    };

    const start = () => {
      if (frame || reduceMotion) return;
      last = performance.now();
      frame = window.requestAnimationFrame(draw);
    };
    const stop = () => {
      window.cancelAnimationFrame(frame);
      frame = 0;
    };

    resize();
    window.addEventListener("resize", resize);

    // Only animate while the dust is on screen and the tab is visible
    const observer = new IntersectionObserver(([entry]) => {
      shown = entry.isIntersecting && document.visibilityState === "visible";
      if (shown) start();
      else stop();
    });
    observer.observe(canvas);

    const onVisibility = () => {
      shown = document.visibilityState === "visible";
      if (shown) start();
      else stop();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      observer.disconnect();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [density]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 size-full"
    />
  );
}
