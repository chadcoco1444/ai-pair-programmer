import type { JSX } from "react";

const CELL_H = 32;
const GAP = 6;
const CHAR_W = 9; // approx
const PAD = 16;

export function renderStringArray(values: string[]): JSX.Element {
  const widths = values.map((v) => Math.max(48, v.length * CHAR_W + PAD));
  const positions: number[] = [];
  let cursor = 0;
  for (const w of widths) {
    positions.push(cursor);
    cursor += w + GAP;
  }
  const totalW = Math.max(1, cursor);
  const totalH = CELL_H + 8;
  return (
    <figure className="my-3 overflow-x-auto">
      <svg
        width={totalW}
        height={totalH}
        viewBox={`0 0 ${totalW} ${totalH}`}
        role="img"
        aria-label="String array visualization"
      >
        {values.map((v, i) => {
          const x = positions[i];
          const w = widths[i];
          return (
            <g key={i}>
              <rect
                x={x}
                y={4}
                width={w}
                height={CELL_H}
                rx="16"
                fill="#1e293b"
                stroke="#334155"
              />
              <text
                x={x + w / 2}
                y={4 + CELL_H / 2 + 5}
                textAnchor="middle"
                fill="#f8fafc"
                fontFamily="'Fira Code', monospace"
                fontSize="13"
              >
                {v}
              </text>
            </g>
          );
        })}
      </svg>
    </figure>
  );
}
