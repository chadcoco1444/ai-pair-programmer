import type { JSX } from "react";

const NODE_R = 18;
const RADIUS = 100;
const SVG_W = 260;
const SVG_H = 220;

export function renderGraph(adjList: number[][]): JSX.Element {
  const n = adjList.length;
  if (n === 0) {
    return (
      <figure className="my-3">
        <svg width={1} height={1} role="img" aria-label="Empty graph" />
      </figure>
    );
  }
  const cx = SVG_W / 2;
  const cy = SVG_H / 2;
  const positions: { x: number; y: number }[] = [];
  for (let i = 0; i < n; i++) {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    positions.push({
      x: cx + RADIUS * Math.cos(angle),
      y: cy + RADIUS * Math.sin(angle),
    });
  }

  return (
    <figure className="my-3">
      <svg
        width={SVG_W}
        height={SVG_H}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        role="img"
        aria-label="Graph visualization"
      >
        {adjList.map((neighbors, i) =>
          neighbors
            .filter((nb) => nb > i) // draw each edge once (undirected-style)
            .map((nb) => {
              const idx = nb - 1;
              if (idx < 0 || idx >= n) return null;
              const a = positions[i];
              const b = positions[idx];
              return (
                <line
                  key={`e-${i}-${nb}`}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke="#64748b"
                  strokeWidth="1.5"
                />
              );
            })
        )}
        {positions.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r={NODE_R}
              fill="#1e293b"
              stroke="#22c55e"
              strokeWidth="2"
            />
            <text
              x={p.x}
              y={p.y + 5}
              textAnchor="middle"
              fill="#f8fafc"
              fontFamily="'Fira Code', monospace"
              fontSize="13"
              fontWeight="600"
            >
              {i + 1}
            </text>
          </g>
        ))}
      </svg>
    </figure>
  );
}
