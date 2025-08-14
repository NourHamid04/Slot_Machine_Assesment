// src/game/config.js
export const SYMBOLS = [
  { id: "cherry",  label: "Cherry",  glyph: "🍒", weight: 30, multiplier: 2 },
  { id: "lemon",   label: "Lemon",   glyph: "🍋", weight: 25, multiplier: 3 },
  { id: "plum",    label: "Plum",    glyph: "🍑", weight: 20, multiplier: 4 },
  { id: "bell",    label: "Bell",    glyph: "🔔", weight: 12, multiplier: 6 },
  { id: "bar",     label: "BAR",     glyph: "🟥", weight: 8,  multiplier: 10 },
  { id: "seven",   label: "Seven",   glyph: "7️⃣", weight: 5,  multiplier: 20 },
  { id: "diamond", label: "Diamond", glyph: "💎", weight: 3,  multiplier: 50 },
];

export const STRIP_LENGTH = 60;

// Build a weighted reel strip so common symbols appear more often.
export function buildWeightedStrip(length = STRIP_LENGTH) {
  const bag = [];
  for (const s of SYMBOLS) for (let i = 0; i < s.weight; i++) bag.push(s);

  const strip = [];
  for (let i = 0; i < length; i++) {
    strip.push(bag[Math.floor(Math.random() * bag.length)]);
  }
  return strip;
}
