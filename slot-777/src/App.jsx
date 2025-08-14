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
  <div className="min-h-screen w-full bg-gradient-to-b from-red-900 via-red-950 to-black text-white flex items-center justify-center p-4">
    <div className="w-full max-w-3xl">
      {/* HUD */}
      <div className="grid grid-cols-3 gap-3 mb-4 text-center">
        <div className="rounded-2xl bg-red-950/60 border border-red-800 p-3 shadow-lg">
          <div className="text-xs uppercase tracking-wide text-red-300">Balance</div>
          <div className="text-2xl font-bold text-red-100">${balance}</div>
        </div>
        <div className="rounded-2xl bg-red-950/60 border border-red-800 p-3 shadow-lg">
          <div className="text-xs uppercase tracking-wide text-red-300">Bet</div>
          <div className="text-2xl font-bold text-red-100">${bet}</div>
        </div>
        <div className="rounded-2xl bg-red-950/60 border border-red-800 p-3 shadow-lg">
          <div className="text-xs uppercase tracking-wide text-red-300">Winnings</div>
          <div
            className={`text-2xl font-bold ${
              winnings > 0 ? "text-yellow-300 animate-bounce" : "text-red-100"
            }`}
          >
            ${winnings}
          </div>
        </div>
      </div>

      {/* Reels */}
      <div className="flex items-center justify-center gap-3 sm:gap-4 mb-4">
        <Reel strip={strips[0]} position={pos[0]} durationMs={1100} />
        <Reel strip={strips[1]} position={pos[1]} durationMs={1600} />
        <Reel strip={strips[2]} position={pos[2]} durationMs={2100} />
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <div className="flex items-center gap-2 bg-red-950/60 border border-red-800 rounded-2xl p-2 shadow">
          <button
            className="px-4 py-2 rounded-xl bg-red-800 hover:bg-red-700 active:scale-95 disabled:opacity-50"
            disabled={spinning}
            onClick={() => changeBet(-1)}
          >
            −
          </button>
          <div className="px-4 text-lg font-semibold text-red-100">${bet}</div>
          <button
            className="px-4 py-2 rounded-xl bg-red-800 hover:bg-red-700 active:scale-95 disabled:opacity-50"
            disabled={spinning}
            onClick={() => changeBet(1)}
          >
            +
          </button>
          <button
            className="ml-2 px-4 py-2 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold active:scale-95 disabled:opacity-50"
            disabled={spinning || balance <= 0}
            onClick={maxBet}
          >
            Max Bet
          </button>
        </div>

        <button
          className="px-8 py-3 rounded-2xl bg-gradient-to-b from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-red-900 font-extrabold tracking-wider shadow-lg active:scale-95 disabled:opacity-50"
          onClick={handleSpin}
          disabled={!canSpin}
        >
          SPIN
        </button>
      </div>

      {/* Message */}
      <div className="mt-4 text-center text-sm text-red-200">{message}</div>

      {/* Payout table */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-2 text-center text-xs">
        {payoutTable.map((p) => (
          <div key={p.label} className="rounded-xl bg-red-950/40 border border-red-800 p-2">
            <div className="text-2xl">{p.symbol}</div>
            <div className="text-red-200">{p.label}</div>
            <div className="font-semibold text-yellow-400">×{p.x}</div>
          </div>
        ))}
      </div>

      {/* Sounds */}
      <audio ref={spinSfx} src="/sounds/spin.mp3" preload="auto" />
      {/* <audio ref={stopSfx} src="/sounds/stop.mp3" preload="auto" /> */}
      <audio ref={winSfx}  src="/sounds/win.mp3"  preload="auto" />
    </div>
  </div>
);

}
