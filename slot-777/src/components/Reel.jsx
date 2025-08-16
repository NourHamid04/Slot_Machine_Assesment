// src/components/Reel.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";

export default function Reel({ strip, position, durationMs }) {
  const containerRef = useRef(null);
  const [itemH, setItemH] = useState(0);

  // Show THREE visible items (center one is the payline)
  const VISIBLE = 3;
  const OFFSET_TOP = Math.floor(VISIBLE / 2); // 1 (so center is index +1 from top)

  // Repeat the strip (lightweight; we land in the middle cycle to avoid edges)
  const reps = 10;
  const repeatedStrip = useMemo(
    () => Array.from({ length: reps * strip.length }, (_, i) => strip[i % strip.length]),
    [strip]
  );

  // Middle cycle start (keeps translate well away from edges)
  const baseIndex = useMemo(
    () => Math.floor(reps / 2) * strip.length,
    [strip.length]
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const resize = () => setItemH(el.clientHeight / VISIBLE);
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Keep position in-range relative to logical strip
  const wrapped = ((position % strip.length) + strip.length) % strip.length;

  // For 3 visible items, show (wrapped-1, wrapped, wrapped+1)
  const translateY = itemH ? -((baseIndex + wrapped - OFFSET_TOP) * itemH) : 0;

return (
  <div className="relative w-full">
    {/* subtle purple/orange stage glow */}
    <div
      className="pointer-events-none absolute -z-10 rounded-[2rem]
                 -inset-3 xs:-inset-4 sm:-inset-6
                 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.35),transparent_60%)]
                 blur-md sm:blur-lg md:blur-xl"
    />

    {/* NEON MACHINE BODY — bigger to fit 3 rows */}
    <div
      ref={containerRef}
      className="
        relative overflow-hidden rounded-[1.25rem] sm:rounded-[2rem] p-2
        w-full max-w-44 xs:max-w-56 sm:max-w-64 md:max-w-80 lg:max-w-96 xl:max-w-[28rem]
        aspect-[7/15]
        border border-yellow-400/60
        bg-[conic-gradient(from_220deg_at_50%_50%,#facc15_0%,#f97316_25%,#a855f7_50%,#f97316_75%,#facc15_100%)]
        shadow-[0_10px_30px_rgba(0,0,0,0.6),inset_0_2px_0_rgba(255,255,255,0.4),inset_0_-6px_12px_rgba(0,0,0,0.25)]
      "
    >
      {/* inner lip */}
      <div
        className="absolute inset-1 rounded-[1rem] sm:rounded-[1.65rem] border border-yellow-200/40
                   shadow-[inset_0_0_14px_rgba(255,255,255,0.4)] pointer-events-none"
      />

      {/* DRUM WINDOW */}
      <div
        className="relative size-full rounded-[0.9rem] sm:rounded-[1.35rem] overflow-hidden
                   bg-[linear-gradient(180deg,#0d0d0f_0%,#1a1a1d_100%)]
                   shadow-[inset_0_10px_20px_rgba(0,0,0,0.55),inset_0_-10px_20px_rgba(0,0,0,0.55)]"
      >
        {/* curved glass sheen */}
        <div className="pointer-events-none absolute inset-0
                        bg-[radial-gradient(120%_80%_at_50%_20%,rgba(255,255,255,0.10)_0%,transparent_55%)]"
        />

        {/* ultra subtle texture lines */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.06]
                        bg-[repeating-linear-gradient(90deg,transparent_0px,transparent_12px,rgba(255,255,255,0.5)_13px,transparent_14px)]"
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
                text-[clamp(1.25rem,3.5vw,2rem)] md:text-[clamp(1.75rem,2.5vw,2.5rem)]
                font-extrabold text-white select-none
                drop-shadow-[0_0_10px_rgba(0,0,0,0.65)]
              "
            >
              <span className="leading-none">{s.glyph}</span>
            </li>
          ))}
        </ul>

        {/* vignettes tuned for 3 rows */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-12 sm:h-16
                        bg-gradient-to-b from-black/60 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 sm:h-16
                        bg-gradient-to-t from-black/60 to-transparent" />

        {/* neon payline (middle row highlight) */}
        <div
          className="pointer-events-none absolute inset-x-2 sm:inset-x-3
                     top-1/2 -translate-y-1/2
                     h-[3px] sm:h-[4px] rounded-full
                     bg-[linear-gradient(90deg,#f97316,#fde047,#a855f7)]
                     shadow-[0_0_14px_rgba(253,224,71,0.9)] sm:shadow-[0_0_18px_rgba(168,85,247,0.8)]"
        />
      </div>
    </div>

    {/* Slim vertical glow bar */}
    <div className="absolute right-0 sm:-right-2 top-1/2 -translate-y-1/2">
      <div
        className="h-16 xs:h-20 sm:h-24 md:h-28 w-[3px] sm:w-[4px] rounded-full
                   bg-[linear-gradient(180deg,#fde047,#f97316,#a855f7)]
                   shadow-[0_0_14px_rgba(249,115,22,0.9)]
                   opacity-80"
      />
    </div>
  </div>
);

}
