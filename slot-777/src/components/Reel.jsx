// src/components/Reel.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";

import { Crown } from "lucide-react"; 

export default function Reel({ strip, position, durationMs }) {
  const containerRef = useRef(null);
  const [itemH, setItemH] = useState(0);

  // We want exactly ONE visible item locked in the center
  const VISIBLE = 1;

  // Repeat the strip but keep it light; modulo will keep us safe forever
  const repeatedStrip = useMemo(() => {
    const reps = 10; // can be small because we modulo the position below
    return Array.from({ length: reps * strip.length }, (_, i) => strip[i % strip.length]);
  }, [strip]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const resize = () => setItemH(el.clientHeight / VISIBLE); // == full height
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Keep position in-range so we never scroll beyond rendered items
  const wrapped = ((position % strip.length) + strip.length) % strip.length;

  // For 1 visible item, the target item should sit exactly in the window
  const translateY = itemH ? -(wrapped * itemH) : 0;
return (
  <div className="relative w-full">
    {/* subtle blue stage glow (scales with viewport) */}
    <div
      className="pointer-events-none absolute -z-10 rounded-[2rem]
                 -inset-3 xs:-inset-4 sm:-inset-6
                 bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.45),transparent_60%)]
                 blur-md sm:blur-lg md:blur-xl"
    />

    {/* GOLD MACHINE BODY — larger reel */}
    <div
      ref={containerRef}
      className="
        relative overflow-hidden rounded-[1.25rem] sm:rounded-[2rem] p-2
        w-full max-w-36 xs:max-w-44 sm:max-w-52 md:max-w-64 lg:max-w-72 xl:max-w-80
        aspect-[8/15]   /* was 9/16 — taller/wider */
        border border-amber-200/60
        bg-[conic-gradient(from_220deg_at_50%_50%,#fcd34d_0%,#f59e0b_22%,#b45309_45%,#f59e0b_68%,#fcd34d_100%)]
        shadow-[0_10px_30px_rgba(0,0,0,0.5),inset_0_2px_0_rgba(255,255,255,0.6),inset_0_-6px_12px_rgba(0,0,0,0.25)]
      "
    >
      {/* inner lip */}
      <div
        className="absolute inset-1 rounded-[1rem] sm:rounded-[1.65rem] border border-amber-100/40
                   shadow-[inset_0_0_14px_rgba(255,255,255,0.45)] pointer-events-none"
      />

      {/* DRUM WINDOW */}
      <div
        className="relative size-full rounded-[0.9rem] sm:rounded-[1.35rem] overflow-hidden
                   bg-[linear-gradient(180deg,#0f0f11_0%,#141417_100%)]
                   shadow-[inset_0_10px_20px_rgba(0,0,0,0.55),inset_0_-10px_20px_rgba(0,0,0,0.55)]"
      >
        {/* curved glass sheen */}
        <div className="pointer-events-none absolute inset-0
                        bg-[radial-gradient(120%_80%_at_50%_20%,rgba(255,255,255,0.10)_0%,transparent_55%)]"
        />

        {/* ultra subtle texture lines */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.06]
                        bg-[repeating-linear-gradient(90deg,transparent_0px,transparent_12px,rgba(255,255,255,0.6)_13px,transparent_14px)]"
        />

        {/* SPINNING LIST */}
        <ul
          className="will-change-transform"
          style={{
            transform: `translateY(${translateY}px)`,
            transition: `transform ${durationMs}ms cubic-bezier(0.2, 0.9, 0.2, 1)`,
          }}
        >
          {repeatedStrip.map((s, i) => (
            <li
              key={i}
              style={{ height: itemH || undefined }}
              className="
                flex items-center justify-center
                text-[clamp(3rem,8vw,4.5rem)] md:text-[clamp(3.5rem,6vw,5rem)]
                font-extrabold text-white select-none
                drop-shadow-[0_0_14px_rgba(0,0,0,0.65)]
              "
            >
              <span className="leading-none">{s.glyph}</span>
            </li>
          ))}
        </ul>

        {/* vignettes (single top & bottom) */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-8 sm:h-10
                        bg-gradient-to-b from-black/55 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 sm:h-10
                        bg-gradient-to-t from-black/55 to-transparent" />

        {/* neon payline */}
        <div
          className="pointer-events-none absolute inset-x-2 sm:inset-x-3
                     top-1/2 -translate-y-1/2
                     h-[3px] sm:h-[4px] rounded-full
                     bg-[linear-gradient(90deg,#f472b6,#fde047,#22d3ee)]
                     shadow-[0_0_12px_rgba(253,224,71,0.85)] sm:shadow-[0_0_16px_rgba(253,224,71,0.95)]"
        />
      </div>
    </div>

    {/* Slim vertical glow bar */}
    <div className="absolute right-0 sm:-right-2 top-1/2 -translate-y-1/2">
      <div
        className="h-16 xs:h-20 sm:h-24 md:h-28 w-[3px] sm:w-[4px] rounded-full
                   bg-[linear-gradient(180deg,#fde047,#f59e0b,#f97316)]
                   shadow-[0_0_12px_rgba(245,158,11,0.85)] sm:shadow-[0_0_14px_rgba(245,158,11,0.9)]
                   opacity-70"
      />
    </div>
  </div>
);



}
