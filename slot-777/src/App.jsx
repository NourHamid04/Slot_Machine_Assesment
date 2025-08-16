// src/App.jsx
import React, { useMemo, useRef, useState } from "react";
import Reel from "./components/Reel.jsx";
import { SYMBOLS, buildWeightedStrip, STRIP_LENGTH } from "./game/Config.js";

export default function App() {
  // Money + bet
  const [balance, setBalance] = useState(1000);
  const [bet, setBet] = useState(10);
  const [winnings, setWinnings] = useState(0);

  // Reels
  const [strips, setStrips] = useState(() => [
    buildWeightedStrip(STRIP_LENGTH),
    buildWeightedStrip(STRIP_LENGTH),
    buildWeightedStrip(STRIP_LENGTH),
  ]);

  // Visual position on each reel (grows as we spin)
  const [pos, setPos] = useState(() => [
    Math.floor(Math.random() * STRIP_LENGTH),
    Math.floor(Math.random() * STRIP_LENGTH),
    Math.floor(Math.random() * STRIP_LENGTH),
  ]);

  const [spinning, setSpinning] = useState(false);
  const [message, setMessage] = useState("Good luck!");

  // Sounds (put actual files in /public/sounds and uncomment these src paths)
  const spinSfx = useRef(null);
  const stopSfx = useRef(null);
  const winSfx = useRef(null);

  const canSpin = !spinning && bet > 0 && balance >= bet;

  // Helper: how far to move (in items) to reach `target` from `current`
  function stepsToTarget(current, target, stripLen) {
    const delta = (target - (current % stripLen) + stripLen) % stripLen;
    const cycles = 3; // extra full rotations before landing (feels better)
    return cycles * stripLen + delta;
  }

  async function handleSpin() {
    if (!canSpin) return;

    setSpinning(true);
    setMessage("Spinning…");
    setWinnings(0);
    setBalance((b) => b - bet);

// Play spin sound faster
  if (spinSfx.current) {
    spinSfx.current.playbackRate = 1.5; // speed up spin
    spinSfx.current.currentTime = 0;
    spinSfx.current.play().catch(() => {});
  }

    const stripLen = strips[0].length;

    // Choose random landing indexes for each reel
    const targets = [0, 1, 2].map(() => Math.floor(Math.random() * stripLen));

    // Compute travel steps and durations (L -> M -> R)
    const steps = [
      stepsToTarget(pos[0], targets[0], stripLen),
      stepsToTarget(pos[1], targets[1], stripLen),
      stepsToTarget(pos[2], targets[2], stripLen),
    ];
    const durations = [1100, 1600, 2100];

    // Kick off all reel transitions
    setPos((p) => [p[0] + steps[0], p[1] + steps[1], p[2] + steps[2]]);

    // Sequential stops with soft click
    await new Promise((r) => setTimeout(r, durations[0] + 50));
    stopSfx.current?.play().catch(() => {});
    await new Promise((r) => setTimeout(r, durations[1] - durations[0] + 50));
    stopSfx.current?.play().catch(() => {});
    await new Promise((r) => setTimeout(r, durations[2] - durations[1] + 50));
    stopSfx.current?.play().catch(() => {});

    // Evaluate center-line result
    const landed = [
      strips[0][targets[0]],
      strips[1][targets[1]],
      strips[2][targets[2]],
    ];

    if (landed[0].id === landed[1].id && landed[1].id === landed[2].id) {
      const multiplier =
        SYMBOLS.find((s) => s.id === landed[0].id)?.multiplier ?? 0;
      const win = bet * multiplier;
      setWinnings(win);
      setBalance((b) => b + win);
      setMessage(`WIN! ${landed[0].label} ×3 → +$${win}`);
      winSfx.current?.play().catch(() => {});
    } else {
      setMessage("No win. Try again!");
    }

    // Occasionally rebuild strips for freshness
    if (Math.random() < 0.05) {
      setStrips([
        buildWeightedStrip(stripLen),
        buildWeightedStrip(stripLen),
        buildWeightedStrip(stripLen),
      ]);
    }

    setSpinning(false);
  }

  function changeBet(delta) {
    setBet((b) => Math.max(1, Math.min(1000, b + delta)));
  }
  function maxBet() {
    setBet((_) => Math.max(1, Math.min(1000, balance)));
  }

  const payoutTable = useMemo(
    () => SYMBOLS.map((s) => ({ symbol: s.glyph, label: s.label, x: s.multiplier })),
    []
  );

return (
  <div className="min-h-screen w-full 
                bg-gradient-to-b from-[#0A0F1F] via-black to-[#070A12] 
                text-white flex items-center justify-center p-2 sm:p-4 md:p-6">
  <div className="w-full">

    {/* SLOT MACHINE FRAME */}
    <div className="relative w-full rounded-none sm:rounded-[1.5rem] 
                    border border-slate-700/60 
                    bg-gradient-to-b from-[#0B1224] to-black 
                    shadow-[0_0_40px_rgba(2,6,23,0.6),inset_0_0_40px_rgba(2,6,23,0.85)] 
                    p-3 xs:p-4 sm:p-5 md:p-7">

      {/* Now everything inside will stretch full width */}


        {/* machine header / title plate */}
        <div className="relative ">
          <div className="mx-auto w-full max-w-md rounded-2xl bg-gradient-to-b from-[#0E172D] to-[#0A1020] border border-slate-700/70 shadow-[0_10px_30px_rgba(0,0,0,0.6),inset_0_0_40px_rgba(30,41,59,0.45)] p-4 text-center">
            <div className="text-[10px] uppercase tracking-[0.35em] text-slate-300">Cyber Slots</div>
            <div className="text-3xl md:text-4xl font-extrabold">
              <span className="text-white drop-shadow-[0_0_18px_rgba(255,255,255,0.25)]">NEON</span>
              <span className="mx-2 text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-500 to-red-400 drop-shadow-[0_0_22px_rgba(239,68,68,0.9)]">777</span>
            </div>
          </div>

          {/* marquee bulbs */}
          <div className="hidden sm:flex justify-center gap-1 mt-3">
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full ${i % 2 === 0 ? "bg-red-600" : "bg-red-500"} shadow-[0_0_12px_rgba(239,68,68,0.9)]`}
              />
            ))}
          </div>
        </div>

        {/* HUD */}
        <div className="grid grid-cols-3 gap-4 mb-2 text-center">
          <div className="rounded-2xl bg-[#070A12]/60 border border-red-600/50 shadow-[0_0_18px_rgba(239,68,68,0.35)] p-4">
            <div className="text-[10px] uppercase tracking-wider text-red-300">Balance</div>
            <div className="text-2xl font-extrabold text-red-200 drop-shadow-[0_0_10px_rgba(239,68,68,0.7)]">
              ${balance}
            </div>
          </div>
          <div className="rounded-2xl bg-[#070A12]/60 border border-slate-500/40 shadow-[0_0_18px_rgba(148,163,184,0.25)] p-4">
            <div className="text-[10px] uppercase tracking-wider text-slate-300">Bet</div>
            <div className="text-2xl font-extrabold text-slate-100 drop-shadow-[0_0_8px_rgba(148,163,184,0.6)]">
              ${bet}
            </div>
          </div>
          <div className="rounded-2xl bg-[#070A12]/60 border border-red-500/50 shadow-[0_0_18px_rgba(239,68,68,0.35)] p-4">
            <div className="text-[10px] uppercase tracking-wider text-red-300">Winnings</div>
            <div
              className={`text-2xl font-extrabold ${
                winnings > 0
                  ? "text-red-300 animate-pulse drop-shadow-[0_0_14px_rgba(239,68,68,0.9)]"
                  : "text-slate-200"
              }`}
            >
              ${winnings}
            </div>
          </div>
        </div>

        {/* SLOT WINDOW */}
        <div className="relative mx-auto max-w-3xl rounded-[1.5rem] bg-gradient-to-b from-[#0C142B] to-black border-2 border-slate-700/70 shadow-[0_20px_60px_rgba(0,0,0,0.6),inset_0_0_60px_rgba(2,6,23,0.9)] p-5 md:p-6 mb-2">
          {/* bezel inner border */}
          <div className="absolute inset-1 rounded-[1.35rem] border border-slate-600/40 pointer-events-none" />

          {/* Reels */}
          <div className="flex items-center justify-center gap-6">
            <div className="rounded-xl bg-gradient-to-b from-slate-900 to-black border border-slate-700/70 shadow-[inset_0_6px_30px_rgba(0,0,0,0.85)] p-3">
              <Reel strip={strips[0]} position={pos[0]} durationMs={1100} />
            </div>
            <div className="rounded-xl bg-gradient-to-b from-slate-900 to-black border border-slate-700/70 shadow-[inset_0_6px_30px_rgba(0,0,0,0.85)] p-3">
              <Reel strip={strips[1]} position={pos[1]} durationMs={1600} />
            </div>
            <div className="rounded-xl bg-gradient-to-b from-slate-900 to-black border border-slate-700/70 shadow-[inset_0_6px_30px_rgba(0,0,0,0.85)] p-3">
              <Reel strip={strips[2]} position={pos[2]} durationMs={2100} />
            </div>
          </div>

          {/* marquee bottom row */}
          <div className="flex justify-center gap-1 mt-2">
            {Array.from({ length: 18 }).map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${i % 2 === 0 ? "bg-red-600" : "bg-red-500"} shadow-[0_0_12px_rgba(239,68,68,0.9)]`}
              />
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <div className="flex items-center gap-2 bg-[#070A12]/60 border border-slate-700/60 rounded-2xl p-3 shadow-[0_0_12px_rgba(15,23,42,0.5)]">
            <button
              className="px-4 py-2 rounded-xl bg-gradient-to-b from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white font-bold shadow-lg active:scale-95 disabled:opacity-40"
              disabled={spinning}
              onClick={() => changeBet(-1)}
            >
              −
            </button>
            <div className="px-4 text-lg font-semibold text-slate-100">${bet}</div>
            <button
              className="px-4 py-2 rounded-xl bg-gradient-to-b from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white font-bold shadow-lg active:scale-95 disabled:opacity-40"
              disabled={spinning}
              onClick={() => changeBet(1)}
            >
              +
            </button>
            <button
              className="ml-2 px-4 py-2 rounded-xl bg-gradient-to-b from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-black font-extrabold shadow-lg active:scale-95 disabled:opacity-40"
              disabled={spinning || balance <= 0}
              onClick={maxBet}
            >
              Max Bet
            </button>
          </div>

          <button
            className="px-10 py-4 rounded-2xl bg-gradient-to-r from-red-600 via-red-500 to-red-400 hover:brightness-110 text-black font-extrabold tracking-widest text-lg shadow-[0_0_25px_rgba(239,68,68,0.7)] active:scale-95 disabled:opacity-40 border border-red-400/40"
            onClick={handleSpin}
            disabled={!canSpin}
          >
            SPIN
          </button>
        </div>

        {/* Message */}
        <div className="mt-5 text-center text-sm text-slate-300 tracking-wide">{message}</div>

      
        {/* Sounds */}
        <audio ref={spinSfx} src="/sounds/spin.mp3" preload="auto" />
        <audio ref={stopSfx} src="/sounds/stop.mp3" preload="auto" />
        <audio ref={winSfx}  src="/sounds/win.mp3"  preload="auto" />
      </div>
    </div>
  </div>
);



}
