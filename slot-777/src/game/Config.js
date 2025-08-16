// src/game/config.js
export const SYMBOLS = [
  { id: "chip",     label: "Casino Chip", glyph: "🎲", weight: 25, multiplier: 2 },
  { id: "bell",     label: "Bell",        glyph: "🔔", weight: 20, multiplier: 4 },
  { id: "bar",      label: "BAR",         glyph: "🟨", weight: 15, multiplier: 6 },
  { id: "star",     label: "Star",        glyph: "🌟", weight: 12, multiplier: 10 },
  { id: "seven",    label: "Seven",       glyph: "7️⃣", weight: 10, multiplier: 15 },
  { id: "crown",    label: "Crown",       glyph: "👑", weight: 8,  multiplier: 25 },
  { id: "diamond",  label: "Diamond",     glyph: "💎", weight: 5,  multiplier: 50 },
  { id: "rocket",   label: "Rocket",      glyph: "🚀", weight: 3,  multiplier: 75 },
  { id: "jackpot",  label: "Jackpot",     glyph: "🎰", weight: 1,  multiplier: 150 },
];

export const STRIP_LENGTH = 60;

// Build a weighted reel strip so common symbols appear more often.
export function buildWeightedStrip(length = STRIP_LENGTH) {
  const bag = [];
  for (const s of SYMBOLS) {
    for (let i = 0; i < s.weight; i++) bag.push(s);
  }

  const strip = [];
  for (let i = 0; i < length; i++) {
    strip.push(bag[Math.floor(Math.random() * bag.length)]);
  }
  return strip;
}
