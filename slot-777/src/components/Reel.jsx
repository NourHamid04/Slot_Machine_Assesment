// src/components/Reel.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";

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
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-2xl bg-zinc-900/60 backdrop-blur p-0.5
                 h-48 sm:h-56 md:h-64 w-28 sm:w-32 md:w-36 shadow-inner"
    >
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
            // item is exactly the window height so only one is visible at a time
            style={{ height: itemH || undefined }}
            className="flex items-center justify-center text-5xl md:text-6xl"
          >
            <span className="drop-shadow-[0_2px_2px_rgba(0,0,0,0.6)] select-none">
              {s.glyph}
            </span>
          </li>
        ))}
      </ul>

      {/* Center highlight ring to emphasize the fixed position (optional) */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[70%] w-[80%] rounded-xl ring-1 ring-amber-400/30" />
      </div>
    </div>
  );
}
