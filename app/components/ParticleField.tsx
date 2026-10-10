"use client";

import { useEffect, useRef } from "react";
import type { MutableRefObject } from "react";

/*
 * Gold particle scene behind the top of the page, drawn on a plain canvas
 * (no extra libraries). Thousands of specks fly towards the viewer like a
 * star tunnel; as the page scrolls they gather into a glowing gold ring
 * (the "0" of Zero), the ring turns in 3D, then bursts apart as the next
 * section arrives. The pointer pushes nearby specks away.
 *
 * `progress` is read from a ref (0 at the top of the hero, 1 at its end)
 * so scrolling never re-renders React.
 */

type Props = {
  progressRef: MutableRefObject<number>;
};

const GOLD = [255, 212, 0];
const PALE = [255, 236, 170];

export default function ParticleField({ progressRef }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.innerWidth < 768;
    const COUNT = small ? 2000 : 5200;

    // Each speck: tunnel position (x, y, z), ring position (rx, ry, rz),
    // burst direction, size, colour mix and a little personal timing.
    const tx = new Float32Array(COUNT);
    const ty = new Float32Array(COUNT);
    const tz = new Float32Array(COUNT);
    const rx = new Float32Array(COUNT);
    const ry = new Float32Array(COUNT);
    const rz = new Float32Array(COUNT);
    const bx = new Float32Array(COUNT);
    const by = new Float32Array(COUNT);
    const bz = new Float32Array(COUNT);
    const size = new Float32Array(COUNT);
    const tint = new Float32Array(COUNT);
    const delay = new Float32Array(COUNT);
    const twinkle = new Float32Array(COUNT);
    // Pointer push, eased back to zero
    const px = new Float32Array(COUNT);
    const py = new Float32Array(COUNT);

    const DEPTH = 2400;

    for (let i = 0; i < COUNT; i++) {
      // Tunnel: a hollow tube along z so the middle stays clear for the title
      const angle = Math.random() * Math.PI * 2;
      const radius = 260 + Math.random() * 900;
      tx[i] = Math.cos(angle) * radius;
      ty[i] = Math.sin(angle) * radius * 0.75;
      tz[i] = Math.random() * DEPTH;

      // Ring: a fuzzy torus, denser at the core, with a faint outer halo
      const a = Math.random() * Math.PI * 2;
      const halo = Math.random() < 0.12;
      const spread = halo ? 70 + Math.random() * 150 : Math.pow(Math.random(), 2.6) * 38;
      const tubeAngle = Math.random() * Math.PI * 2;
      const R = 300 + Math.cos(tubeAngle) * spread;
      rx[i] = Math.cos(a) * R;
      ry[i] = Math.sin(a) * R;
      rz[i] = Math.sin(tubeAngle) * spread;

      // Burst: straight out from the ring, a bit towards the viewer
      const out = 2.2 + Math.random() * 2.8;
      bx[i] = rx[i] * out + (Math.random() - 0.5) * 400;
      by[i] = ry[i] * out + (Math.random() - 0.5) * 400;
      bz[i] = -400 - Math.random() * 900;

      size[i] = halo ? 0.7 + Math.random() * 0.9 : 1.1 + Math.random() * 1.9;
      tint[i] = Math.random();
      delay[i] = Math.random() * 0.35;
      twinkle[i] = Math.random() * Math.PI * 2;
    }

    let width = 0;
    let height = 0;
    let dpr = 1;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    const pointer = { x: -9999, y: -9999, active: false };
    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = true;
    };
    const onPointerLeave = () => {
      pointer.active = false;
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerleave", onPointerLeave);

    const ease = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
    const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);

    let shown = true;
    let frame = 0;
    let last = performance.now();
    let flight = 0; // how far the tunnel has travelled
    let spin = 0;
    let smooth = progressRef.current;

    const draw = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      // Follow the scroll softly so the scene glides instead of jumping
      smooth += (progressRef.current - smooth) * Math.min(dt * 6, 1);
      const p = reduceMotion ? 0.45 : smooth;

      // Phases: 0–0.4 gather into the ring, 0.4–0.72 turn it, 0.72–1 burst
      const gather = ease(clamp01(p / 0.4));
      const turn = ease(clamp01((p - 0.38) / 0.34));
      const burst = ease(clamp01((p - 0.72) / 0.28));

      flight += dt * 260 * (1 - gather * 0.85);
      spin += dt * (0.12 + turn * 0.1);

      // Ring orientation: gentle wobble, then a half turn that passes edge-on
      const yaw = Math.sin(spin) * 0.2 + Math.sin(turn * Math.PI) * 1.38;
      const pitch = 0.3 + Math.cos(spin * 0.7) * 0.1 + Math.sin(turn * Math.PI) * 0.35;
      const roll = spin * 0.6;
      const cy = Math.cos(yaw), sy = Math.sin(yaw);
      const cp = Math.cos(pitch), sp = Math.sin(pitch);
      const cr = Math.cos(roll), sr = Math.sin(roll);

      const scale = Math.min(width, height) / (small ? 820 : 900);
      const focal = 800;
      const camera = 900;
      const halfW = width / 2;
      const halfH = height / 2;
      const fade = 1 - burst * 0.5;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";

      const reach = small ? 70 : 110;

      for (let i = 0; i < COUNT; i++) {
        const g = ease(clamp01((gather - delay[i]) / (1 - delay[i] * 0.6)));

        // Tunnel speck moving towards the viewer, wrapping around
        let z0 = (tz[i] - flight) % DEPTH;
        if (z0 < 0) z0 += DEPTH;
        const tunnelZ = z0 - DEPTH * 0.35;

        // Ring speck, rotated in 3D (roll, then pitch, then yaw)
        let x = rx[i] * cr - ry[i] * sr;
        let y = rx[i] * sr + ry[i] * cr;
        let z = rz[i];
        const y1 = y * cp - z * sp;
        const z1 = y * sp + z * cp;
        y = y1;
        z = z1;
        const x2 = x * cy + z * sy;
        const z2 = -x * sy + z * cy;
        x = x2;
        z = z2;

        // Burst outward from wherever the ring is
        x += (bx[i] - rx[i]) * burst;
        y += (by[i] - ry[i]) * burst;
        z += bz[i] * burst;

        const wx = tx[i] + (x - tx[i]) * g;
        const wy = ty[i] + (y - ty[i]) * g;
        const wz = tunnelZ + (z - tunnelZ) * g;

        const depth = camera + wz;
        if (depth < 40) continue;

        const k = (focal / depth) * scale;
        let sx = halfW + wx * k;
        let sy2 = halfH + wy * k;

        // The pointer clears a little hole in the cloud
        if (pointer.active && !reduceMotion) {
          const dx = sx + px[i] - pointer.x;
          const dy = sy2 + py[i] - pointer.y;
          const dist2 = dx * dx + dy * dy;
          if (dist2 < reach * reach) {
            const dist = Math.sqrt(dist2) || 1;
            const force = (1 - dist / reach) * 18;
            px[i] += (dx / dist) * force;
            py[i] += (dy / dist) * force;
          }
        }
        px[i] *= 0.92;
        py[i] *= 0.92;
        sx += px[i];
        sy2 += py[i];

        if (sx < -10 || sx > width + 10 || sy2 < -10 || sy2 > height + 10) continue;

        const near = Math.min(focal / depth, 2.4);
        const glow = 0.55 + 0.45 * Math.sin(twinkle[i] + now * 0.0021);
        const alpha = Math.min(1, (0.18 + near * 0.5) * glow * fade * (0.75 + g * 0.45));
        if (alpha < 0.02) continue;

        const c = tint[i] > 0.82 ? PALE : GOLD;
        const s = size[i] * near * (small ? 1.1 : 1);
        ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${alpha.toFixed(3)})`;
        ctx.fillRect(sx - s / 2, sy2 - s / 2, s, s);

        // Every few specks get a soft halo, so the ring glows
        if (i % 6 === 0) {
          const h = s * 4;
          ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${(alpha * 0.08).toFixed(3)})`;
          ctx.fillRect(sx - h / 2, sy2 - h / 2, h, h);
        }
      }

      ctx.globalCompositeOperation = "source-over";

      if (!reduceMotion && shown) frame = window.requestAnimationFrame(draw);
    };

    const start = () => {
      if (frame) return;
      last = performance.now();
      frame = window.requestAnimationFrame(draw);
    };
    const stop = () => {
      window.cancelAnimationFrame(frame);
      frame = 0;
    };

    // Only animate while the scene is on screen and the tab is visible
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

    if (reduceMotion) draw(performance.now());
    else start();

    return () => {
      stop();
      observer.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [progressRef]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 size-full"
    />
  );
}
