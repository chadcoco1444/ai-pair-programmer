import type { JSX } from "react";

const CELL_W = 48;
const CELL_H = 48;
const GAP = 4;
const LABEL_H = 16;

export function renderArray(values: number[]): JSX.Element {
  const total = Math.max(1, values.length) * (CELL_W + GAP);
  return (
    <figure className="my-3 overflow-x-auto">
      <svg
        width={total}
        height={CELL_H + LABEL_H}
        viewBox={`0 0 ${total} ${CELL_H + LABEL_H}`}
        role="img"
        aria-label="Array visualization"
      >
        {values.map((v, i) => (
          <g key={i} transform={`translate(${i * (CELL_W + GAP)}, 0)`}>
            <rect
              x="0"
              y="0"
              width={CELL_W}
              height={CELL_H}
              rx="6"
              fill="#1e293b"
              stroke="#334155"
            />
            <text
              x={CELL_W / 2}
              y={CELL_H / 2 + 5}
              textAnchor="middle"
              fill="#f8fafc"
              fontFamily="'Fira Code', monospace"
              fontSize="14"
            >
              {v}
            </text>
            <text
              x={CELL_W / 2}
              y={CELL_H + 12}
              textAnchor="middle"
              fill="#64748b"
              fontFamily="'Fira Code', monospace"
              fontSize="10"
            >
              [{i}]
            </text>
          </g>
        ))}
      </svg>
    </figure>
  );
}
