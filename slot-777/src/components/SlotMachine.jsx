// src/components/SlotMachine.jsx
import React, { useMemo, useRef, useState } from "react";
import Reel from "./Reel.jsx";
import { SYMBOLS, buildWeightedStrip, STRIP_LENGTH } from "../game/Config.js";

export default function SlotMachine() {
  // Money + bet
  const [balance, setBalance] = useState(1000);
  const [bet, setBet] = useState(10);
  const [winnings, setWinnings] = useState(0);
// Quick-bet helpers
const safeSetBet = (v) =>
  setBet(() => Math.max(1, Math.min(1000, Math.min(balance, v))))

const halfBet    = () => safeSetBet(Math.max(1, Math.floor(bet / 2)));
const doubleBet  = () => safeSetBet(bet * 2);
const minBet     = () => safeSetBet(1);
const maxBetQuick= () => safeSetBet(balance);

const presetBets = [5, 10, 25, 50, 100, 200, 500];

  // Reels
  const [strips, setStrips] = useState(() => [
    buildWeightedStrip(STRIP_LENGTH),
    buildWeightedStrip(STRIP_LENGTH),
    buildWeightedStrip(STRIP_LENGTH),
  ]);

  // Visual positions
  const [pos, setPos] = useState(() => [
    Math.floor(Math.random() * STRIP_LENGTH),
    Math.floor(Math.random() * STRIP_LENGTH),
    Math.floor(Math.random() * STRIP_LENGTH),
  ]);

  const [spinning, setSpinning] = useState(false);
  const [message, setMessage] = useState("Good luck!");

  // Sounds
  const spinSfx = useRef(null);
  const stopSfx = useRef(null);
  const winSfx = useRef(null);

  const canSpin = !spinning && bet > 0 && balance >= bet;

  // Steps helper
  function stepsToTarget(current, target, stripLen) {
    const delta = (target - (current % stripLen) + stripLen) % stripLen;
    const cycles = 3;
    return cycles * stripLen + delta;
  }

  async function handleSpin() {
    if (!canSpin) return;

    setSpinning(true);
    setMessage("Spinning…");
    setWinnings(0);
    setBalance((b) => b - bet);

    // spin sound faster
    if (spinSfx.current) {
      spinSfx.current.playbackRate = 1.5;
      spinSfx.current.currentTime = 0;
      spinSfx.current.play().catch(() => {});
    }

    const stripLen = strips[0].length;
    const targets = [0, 1, 2].map(() => Math.floor(Math.random() * stripLen));
    const steps = [
      stepsToTarget(pos[0], targets[0], stripLen),
      stepsToTarget(pos[1], targets[1], stripLen),
      stepsToTarget(pos[2], targets[2], stripLen),
    ];
    const durations = [1100, 1600, 2100];

    setPos((p) => [p[0] + steps[0], p[1] + steps[1], p[2] + steps[2]]);

    // stop sounds
    await new Promise((r) => setTimeout(r, durations[0] + 50));
    stopSfx.current?.play().catch(() => {});
    await new Promise((r) => setTimeout(r, durations[1] - durations[0] + 50));
    stopSfx.current?.play().catch(() => {});
    await new Promise((r) => setTimeout(r, durations[2] - durations[1] + 50));
    stopSfx.current?.play().catch(() => {});

    // check win
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
    setBet(() => Math.max(1, Math.min(1000, balance)));
  }

  const payoutTable = useMemo(
    () =>
      SYMBOLS.map((s) => ({
        symbol: s.glyph,
        label: s.label,
        x: s.multiplier,
      })),
    []
  );

return (
  <div className="min-h-screen w-full 
                  bg-gradient-to-b from-[#1a1a1a] via-black to-[#0d0d0d] 
                  text-white flex items-center justify-center p-2 sm:p-4 md:p-6">
    <div className="w-full">

      {/* SLOT MACHINE FRAME */}
      <div className="relative w-full rounded-none sm:rounded-[1.5rem] 
                      border border-yellow-400/40 
                      bg-gradient-to-b from-[#2b1a2f] to-black 
                      shadow-[0_0_40px_rgba(249,115,22,0.5),inset_0_0_40px_rgba(124,58,237,0.6)] 
                      p-3 xs:p-4 sm:p-5 md:p-7">

        {/* machine header / title plate */}
        <div className="relative">
          <div className="mx-auto w-full max-w-md rounded-2xl 
                          bg-gradient-to-b from-[#3b0764] to-[#1a1033] 
                          border border-purple-400/50 
                          shadow-[0_10px_30px_rgba(0,0,0,0.6),inset_0_0_40px_rgba(168,85,247,0.45)] 
                          p-4 text-center">
            <div className="text-[10px] uppercase tracking-[0.35em] text-yellow-300">Cyber Slots</div>
            <div className="text-3xl md:text-2xl font-extrabold">
              <span className="text-white drop-shadow-[0_0_18px_rgba(255,255,255,0.3)]">NEON</span>
              <span className="mx-2 text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-yellow-400 to-purple-400 drop-shadow-[0_0_22px_rgba(251,191,36,0.9)]">777</span>
            </div>
          </div>

          {/* marquee bulbs */}
          <div className="hidden sm:flex justify-center gap-1 mt-3">
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full ${
                  i % 3 === 0 ? "bg-orange-400" : i % 3 === 1 ? "bg-yellow-400" : "bg-purple-400"
                } shadow-[0_0_12px_rgba(251,191,36,0.9)]`}
              />
            ))}
          </div>
        </div>

        {/* HUD */}
        <div className="grid grid-cols-3 gap-4 mb-2 text-center">
          <div className="rounded-2xl bg-black/40 border border-orange-400/50 shadow-[0_0_18px_rgba(251,146,60,0.4)] p-4">
            <div className="text-[10px] uppercase tracking-wider text-orange-300">Balance</div>
            <div className="text-2xl font-extrabold text-orange-200 drop-shadow-[0_0_10px_rgba(251,146,60,0.7)]">
              ${balance}
            </div>
          </div>
          <div className="rounded-2xl bg-black/40 border border-purple-400/50 shadow-[0_0_18px_rgba(168,85,247,0.35)] p-4">
            <div className="text-[10px] uppercase tracking-wider text-purple-300">Bet</div>
            <div className="text-2xl font-extrabold text-purple-100 drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]">
              ${bet}
            </div>
          </div>
          <div className="rounded-2xl bg-black/40 border border-yellow-400/60 shadow-[0_0_18px_rgba(253,224,71,0.4)] p-4">
            <div className="text-[10px] uppercase tracking-wider text-yellow-300">Winnings</div>
            <div
              className={`text-2xl font-extrabold ${
                winnings > 0
                  ? "text-yellow-300 animate-pulse drop-shadow-[0_0_14px_rgba(253,224,71,0.9)]"
                  : "text-slate-200"
              }`}
            >
              ${winnings}
            </div>
          </div>
        </div>

       {/* SLOT WINDOW */}
<div className="relative mx-auto max-w-xl rounded-[1.5rem] 
                bg-gradient-to-b from-[#1f2937] to-black 
                border-2 border-slate-600/70 
                shadow-[0_20px_60px_rgba(0,0,0,0.6),inset_0_0_60px_rgba(30,41,59,0.9)] 
                p-4 md:p-5 mb-2">

  {/* bezel inner border */}
  <div className="absolute inset-1 rounded-[1.35rem] border border-slate-500/50 pointer-events-none" />

  {/* Reels */}
  <div className="flex items-center justify-center gap-3 sm:gap-4 md:gap-6">
    <div className="flex-1 min-w-[5rem] sm:min-w-[6rem] md:min-w-[7rem] lg:min-w-[8rem] 
                    rounded-xl bg-gradient-to-b from-[#0f172a] to-black 
                    border border-slate-700/70 
                    shadow-[inset_0_8px_36px_rgba(0,0,0,0.85)] p-4 md:p-5">
      <Reel strip={strips[0]} position={pos[0]} durationMs={1100} />
    </div>

    <div className="flex-1 min-w-[5rem] sm:min-w-[6rem] md:min-w-[7rem] lg:min-w-[8rem] 
                    rounded-xl bg-gradient-to-b from-[#0f172a] to-black 
                    border border-slate-700/70 
                    shadow-[inset_0_8px_36px_rgba(0,0,0,0.85)] p-4 md:p-5">
      <Reel strip={strips[1]} position={pos[1]} durationMs={1600} />
    </div>

    <div className="flex-1 min-w-[5rem] sm:min-w-[6rem] md:min-w-[7rem] lg:min-w-[8rem] 
                    rounded-xl bg-gradient-to-b from-[#0f172a] to-black 
                    border border-slate-700/70 
                    shadow-[inset_0_8px_36px_rgba(0,0,0,0.85)] p-4 md:p-5">
      <Reel strip={strips[2]} position={pos[2]} durationMs={2100} />
    </div>
  </div>

  {/* marquee bottom row */}
  <div className="flex justify-center gap-1 mt-3">
    {Array.from({ length: 18 }).map((_, i) => (
      <div
        key={i}
        className={`w-2 h-2 rounded-full ${
          i % 3 === 0 ? "bg-orange-400" : i % 3 === 1 ? "bg-yellow-400" : "bg-purple-400"
        } shadow-[0_0_12px_rgba(253,224,71,0.9)]`}
      />
    ))}
  </div>
</div>

{/* Controls */}
<div className="flex w-full flex-col gap-3 sm:gap-4 items-center justify-center">

  {/* Row A: Stepper + Live Bet */}
  <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
    <div className="flex items-center gap-2 bg-black/40 border border-slate-600/60 rounded-2xl p-2.5 sm:p-3 shadow-[0_0_12px_rgba(251,191,36,0.35)]">
      <button
        aria-label="Decrease Bet"
        className="px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-b from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-bold shadow-lg active:scale-95 disabled:opacity-40"
        disabled={spinning}
        onClick={() => changeBet(-1)}
      >−</button>

      <div className="px-3 sm:px-4 text-base sm:text-lg font-semibold text-yellow-200 whitespace-nowrap">
        ${bet}
      </div>

      <button
        aria-label="Increase Bet"
        className="px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-b from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-bold shadow-lg active:scale-95 disabled:opacity-40"
        disabled={spinning}
        onClick={() => changeBet(1)}
      >+</button>

      {/* bumpers */}
      <button
        aria-label="Increase Bet by 10"
        className="px-3 py-2 rounded-xl bg-gradient-to-b from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white font-semibold shadow-md active:scale-95 disabled:opacity-40"
        disabled={spinning}
        onClick={() => changeBet(10)}
      >+10</button>
      <button
        aria-label="Increase Bet by 50"
        className="px-3 py-2 rounded-xl bg-gradient-to-b from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white font-semibold shadow-md active:scale-95 disabled:opacity-40"
        disabled={spinning}
        onClick={() => changeBet(50)}
      >+50</button>
    </div>

    {/* Spin (kept prominent) */}
    <button
      className="px-8 sm:px-10 py-3 sm:py-4 rounded-2xl bg-gradient-to-r from-orange-500 via-yellow-400 to-purple-400 hover:brightness-110 text-black font-extrabold tracking-widest text-base sm:text-lg shadow-[0_0_25px_rgba(251,191,36,0.7)] active:scale-95 disabled:opacity-40 border border-yellow-400/50"
      onClick={handleSpin}
      disabled={!canSpin}
    >
      SPIN
    </button>
  </div>

  {/* Row B: Quick “chip” presets (scrollable on small screens) */}
  <div className="w-full max-w-4xl flex items-center justify-center">
    <div className="flex gap-2 sm:gap-3 overflow-x-auto no-scrollbar py-1 px-1">
      {presetBets.map((v) => (
        <button
          key={v}
          aria-label={`Set bet to ${v}`}
          className={[
            "px-4 py-2 rounded-xl border font-semibold shadow-md active:scale-95 whitespace-nowrap",
            "bg-gradient-to-b from-[#1f2937] to-black text-yellow-200",
            "border-yellow-400/40 hover:border-yellow-300/70",
            bet === v ? "ring-2 ring-yellow-400/70" : ""
          ].join(" ")}
          disabled={spinning}
          onClick={() => safeSetBet(v)}
        >
          ${v}
        </button>
      ))}
    </div>
  </div>

  {/* Row C: Smart Actions */}
  <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
    <button
      aria-label="Minimum Bet"
      className="px-4 py-2 rounded-xl bg-gradient-to-b from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-white font-semibold shadow-md active:scale-95 disabled:opacity-40"
      disabled={spinning}
      onClick={minBet}
    >
      Min
    </button>
    <button
      aria-label="Half Bet"
      className="px-4 py-2 rounded-xl bg-gradient-to-b from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-semibold shadow-md active:scale-95 disabled:opacity-40"
      disabled={spinning || bet <= 1}
      onClick={halfBet}
    >
      ½
    </button>
    <button
      aria-label="Double Bet"
      className="px-4 py-2 rounded-xl bg-gradient-to-b from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-semibold shadow-md active:scale-95 disabled:opacity-40"
      disabled={spinning}
      onClick={doubleBet}
    >
      ×2
    </button>
    <button
      aria-label="Max Bet (to balance)"
      className="px-4 py-2 rounded-xl bg-gradient-to-b from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-black font-extrabold shadow-md active:scale-95 disabled:opacity-40"
      disabled={spinning || balance <= 0}
      onClick={maxBetQuick}
    >
      Max
    </button>
    {/* Keep your existing "Max Bet" if you want both behaviors:
        - Max = set bet to balance
        - Max Bet = your existing function (maybe has extra logic) */}
    {/* <button ... onClick={maxBet}>Max Bet</button> */}
  </div>
</div>

        {/* Message */}
        <div className="mt-5 text-center text-sm text-purple-200 tracking-wide">{message}</div>

        {/* Sounds */}
        <audio ref={spinSfx} src="/sounds/spin.mp3" preload="auto" />
        <audio ref={stopSfx} src="/sounds/stop.mp3" preload="auto" />
        <audio ref={winSfx}  src="/sounds/win.mp3"  preload="auto" />
      </div>
    </div>
  </div>
);
}
