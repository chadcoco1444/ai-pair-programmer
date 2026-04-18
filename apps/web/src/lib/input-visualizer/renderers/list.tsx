import type { JSX } from "react";

const NODE_W = 56;
const NODE_H = 44;
const ARROW_W = 32;

export function renderLinkedList(values: number[]): JSX.Element {
  const total = Math.max(1, values.length * NODE_W + Math.max(0, values.length - 1) * ARROW_W);
  const h = NODE_H + 10;
  return (
    <figure className="my-3 overflow-x-auto">
      <svg
        width={total}
        height={h}
        viewBox={`0 0 ${total} ${h}`}
        role="img"
        aria-label="Linked list visualization"
      >
        {values.map((v, i) => {
          const x = i * (NODE_W + ARROW_W);
          return (
            <g key={i}>
              <rect
                x={x}
                y={5}
                width={NODE_W}
                height={NODE_H}
                rx="6"
                fill="#1e293b"
                stroke="#334155"
              />
              <text
                x={x + NODE_W / 2}
                y={5 + NODE_H / 2 + 5}
                textAnchor="middle"
                fill="#f8fafc"
                fontFamily="'Fira Code', monospace"
                fontSize="14"
              >
                {v}
              </text>
              {i < values.length - 1 && (
                <path
                  data-role="arrow"
                  d={`M ${x + NODE_W} ${5 + NODE_H / 2} L ${x + NODE_W + ARROW_W - 4} ${5 + NODE_H / 2} M ${x + NODE_W + ARROW_W - 8} ${5 + NODE_H / 2 - 4} L ${x + NODE_W + ARROW_W - 4} ${5 + NODE_H / 2} L ${x + NODE_W + ARROW_W - 8} ${5 + NODE_H / 2 + 4}`}
                  stroke="#64748b"
                  strokeWidth="1.5"
                  fill="none"
                />
              )}
            </g>
          );
        })}
      </svg>
    </figure>
  );
}
