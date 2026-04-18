import type { JSX } from "react";

const CELL = 40;
const GAP = 3;

export function renderMatrix(cells: (number | string)[][]): JSX.Element {
  const rows = cells.length;
  const cols = rows > 0 ? cells[0].length : 0;
  const w = Math.max(1, cols) * (CELL + GAP);
  const h = Math.max(1, rows) * (CELL + GAP);
  return (
    <figure className="my-3 overflow-x-auto">
      <svg
        width={w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        role="img"
        aria-label="Matrix visualization"
      >
        {cells.map((row, r) =>
          row.map((v, c) => (
            <g key={`${r}-${c}`} transform={`translate(${c * (CELL + GAP)}, ${r * (CELL + GAP)})`}>
              <rect
                x="0"
                y="0"
                width={CELL}
                height={CELL}
                rx="4"
                fill={v === 0 || v === "0" ? "#0f172a" : "#1e293b"}
                stroke="#334155"
              />
              <text
                x={CELL / 2}
                y={CELL / 2 + 5}
                textAnchor="middle"
                fill="#f8fafc"
                fontFamily="'Fira Code', monospace"
                fontSize="13"
              >
                {v}
              </text>
            </g>
          ))
        )}
      </svg>
    </figure>
  );
}
