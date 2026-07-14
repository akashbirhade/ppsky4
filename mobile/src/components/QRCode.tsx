// ─── QR Code (SVG) ──────────────────────────────────────────────────────────
// Lightweight, dependency-free QR-style renderer for demo tickets. Produces a
// deterministic, scannable-looking code (finder patterns + data modules) from
// the encoded booking data. For production, swap for a real QR library.

import React, { useMemo } from 'react';
import { View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

interface QRCodeProps {
  value: string;
  size?: number;
  color?: string;
  backgroundColor?: string;
  padding?: number;
}

const GRID = 25; // modules per side

// Deterministic PRNG seeded from the string (mulberry32).
const seedFrom = (str: string) => {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
};

const mulberry32 = (a: number) => () => {
  a |= 0;
  a = (a + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

// True if (r,c) is inside a 7x7 finder pattern region (with 1-module quiet gap).
const inFinderZone = (r: number, c: number) => {
  const tl = r < 8 && c < 8;
  const tr = r < 8 && c >= GRID - 8;
  const bl = r >= GRID - 8 && c < 8;
  return tl || tr || bl;
};

// Finder pattern module state at a corner-local (r,c) within an 8x8 block.
const finderModule = (lr: number, lc: number) => {
  if (lr === 7 || lc === 7) return false; // quiet gap
  const outer = lr === 0 || lr === 6 || lc === 0 || lc === 6;
  const inner = lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4;
  return outer || inner;
};

export const QRCode: React.FC<QRCodeProps> = ({
  value,
  size = 180,
  color = '#111827',
  backgroundColor = '#FFFFFF',
  padding = 12,
}) => {
  const cells = useMemo(() => {
    const rand = mulberry32(seedFrom(value));
    const out: { r: number; c: number }[] = [];
    for (let r = 0; r < GRID; r++) {
      for (let c = 0; c < GRID; c++) {
        if (inFinderZone(r, c)) continue;
        if (rand() < 0.46) out.push({ r, c });
      }
    }
    return out;
  }, [value]);

  const finderCells = useMemo(() => {
    const out: { r: number; c: number }[] = [];
    const corners: [number, number][] = [
      [0, 0],
      [0, GRID - 7],
      [GRID - 7, 0],
    ];
    corners.forEach(([or, oc]) => {
      for (let lr = 0; lr < 7; lr++) {
        for (let lc = 0; lc < 7; lc++) {
          if (finderModule(lr, lc)) out.push({ r: or + lr, c: oc + lc });
        }
      }
    });
    return out;
  }, []);

  const inner = size - padding * 2;
  const cell = inner / GRID;

  return (
    <View style={{ width: size, height: size, backgroundColor, borderRadius: 12, padding }}>
      <Svg width={inner} height={inner}>
        {cells.map(({ r, c }, i) => (
          <Rect key={`d${i}`} x={c * cell} y={r * cell} width={cell} height={cell} fill={color} />
        ))}
        {finderCells.map(({ r, c }, i) => (
          <Rect key={`f${i}`} x={c * cell} y={r * cell} width={cell} height={cell} fill={color} />
        ))}
      </Svg>
    </View>
  );
};

export default QRCode;
