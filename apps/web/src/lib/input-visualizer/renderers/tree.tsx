import type { JSX } from "react";

const NODE_R = 18;
const LEVEL_H = 60;
const SIBLING_W = 50;

interface Layout {
  value: number;
  depth: number;
  parentIdx: number; // -1 for root
  x: number;
  y: number;
}

function buildLayout(levelOrder: (number | null)[]): Layout[] {
  if (levelOrder.length === 0 || levelOrder[0] === null) return [];

  // First pass: BFS to establish depth + parent index
  const nodes: Layout[] = [];
  const slotQueue: { slot: number; depth: number; parentIdx: number }[] = [];

  nodes.push({ value: levelOrder[0] as number, depth: 0, parentIdx: -1, x: 0, y: 0 });
  slotQueue.push({ slot: 0, depth: 0, parentIdx: 0 });

  let cursor = 1;
  while (cursor < levelOrder.length && slotQueue.length > 0) {
    const parent = slotQueue.shift()!;
    // Left child
    if (cursor < levelOrder.length) {
      const v = levelOrder[cursor];
      if (v !== null) {
        const idx = nodes.length;
        nodes.push({
          value: v as number,
          depth: parent.depth + 1,
          parentIdx: parent.parentIdx,
          x: 0,
          y: 0,
        });
        slotQueue.push({ slot: 0, depth: parent.depth + 1, parentIdx: idx });
      }
      cursor++;
    }
    // Right child
    if (cursor < levelOrder.length) {
      const v = levelOrder[cursor];
      if (v !== null) {
        const idx = nodes.length;
        nodes.push({
          value: v as number,
          depth: parent.depth + 1,
          parentIdx: parent.parentIdx,
          x: 0,
          y: 0,
        });
        slotQueue.push({ slot: 0, depth: parent.depth + 1, parentIdx: idx });
      }
      cursor++;
    }
  }

  // Second pass: assign x by depth grouping, y by depth
  const byDepth = new Map<number, Layout[]>();
  for (const n of nodes) {
    if (!byDepth.has(n.depth)) byDepth.set(n.depth, []);
    byDepth.get(n.depth)!.push(n);
  }
  const maxDepth = Math.max(...Array.from(byDepth.keys()));
  const totalWidth = Math.pow(2, maxDepth) * SIBLING_W;
  for (const [depth, siblings] of byDepth) {
    const slots = Math.pow(2, depth);
    const slotW = totalWidth / slots;
    siblings.forEach((n, idx) => {
      n.x = slotW / 2 + idx * slotW;
      n.y = depth * LEVEL_H + NODE_R + 10;
    });
  }

  return nodes;
}

export function renderTree(levelOrder: (number | null)[]): JSX.Element {
  const nodes = buildLayout(levelOrder);
  if (nodes.length === 0) {
    return (
      <figure className="my-3">
        <svg width={1} height={1} role="img" aria-label="Empty tree" />
      </figure>
    );
  }
  const maxX = Math.max(...nodes.map((n) => n.x)) + NODE_R + 10;
  const maxY = Math.max(...nodes.map((n) => n.y)) + NODE_R + 10;
  return (
    <figure className="my-3 overflow-x-auto">
      <svg
        width={maxX}
        height={maxY}
        viewBox={`0 0 ${maxX} ${maxY}`}
        role="img"
        aria-label="Tree visualization"
      >
        {/* Edges first (behind nodes) */}
        {nodes.map((n, i) => {
          if (n.parentIdx < 0) return null;
          const p = nodes[n.parentIdx];
          return (
            <line
              key={`edge-${i}`}
              x1={p.x}
              y1={p.y}
              x2={n.x}
              y2={n.y}
              stroke="#475569"
              strokeWidth="1.5"
            />
          );
        })}
        {/* Nodes */}
        {nodes.map((n, i) => (
          <g key={`node-${i}`}>
            <circle
              cx={n.x}
              cy={n.y}
              r={NODE_R}
              fill="#1e293b"
              stroke="#22c55e"
              strokeWidth="2"
            />
            <text
              x={n.x}
              y={n.y + 5}
              textAnchor="middle"
              fill="#f8fafc"
              fontFamily="'Fira Code', monospace"
              fontSize="13"
              fontWeight="600"
            >
              {n.value}
            </text>
          </g>
        ))}
      </svg>
    </figure>
  );
}
