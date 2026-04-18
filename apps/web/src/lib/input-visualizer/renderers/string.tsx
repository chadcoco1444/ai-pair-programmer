import type { JSX } from "react";

const CELL_W = 36;
const CELL_H = 44;
const GAP = 2;
const LABEL_H = 14;

export function renderString(s: string): JSX.Element {
  const n = s.length;
  const total = Math.max(1, n * (CELL_W + GAP));
  const h = CELL_H + LABEL_H;
  return (
    <figure className="my-3 overflow-x-auto">
      <svg
        width={total}
        height={h}
        viewBox={`0 0 ${total} ${h}`}
        role="img"
        aria-label="String visualization"
      >
        {Array.from(s).map((ch, i) => (
          <g key={i} transform={`translate(${i * (CELL_W + GAP)}, 0)`}>
            <rect
              x="0"
              y="0"
              width={CELL_W}
              height={CELL_H}
              rx="4"
              fill="#1e293b"
              stroke="#334155"
            />
            <text
              x={CELL_W / 2}
              y={CELL_H / 2 + 6}
              textAnchor="middle"
              fill="#f8fafc"
              fontFamily="'Fira Code', monospace"
              fontSize="16"
            >
              {ch}
            </text>
            <text
              x={CELL_W / 2}
              y={CELL_H + 10}
              textAnchor="middle"
              fill="#64748b"
              fontFamily="'Fira Code', monospace"
              fontSize="9"
            >
              {i}
            </text>
          </g>
        ))}
      </svg>
    </figure>
  );
}
