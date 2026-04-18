import type { JSX } from "react";

const NODE_R = 18;
const LEVEL_H = 60;
const SIBLING_W = 50;

interface Layout {
  id: number;
  value: number;
  x: number;
  y: number;
  parentX?: number;
  parentY?: number;
}

function buildLayout(levelOrder: (number | null)[]): Layout[] {
  // Convert level-order to tree nodes with (depth, index-at-depth)
  if (levelOrder.length === 0 || levelOrder[0] === null) return [];
  const nodes: Layout[] = [];
  const queue: { value: number; index: number; depth: number; parentIndex: number }[] = [];
  queue.push({ value: levelOrder[0] as number, index: 0, depth: 0, parentIndex: -1 });
  let i = 1;
  while (queue.length > 0 && i < levelOrder.length) {
    const node = queue.shift()!;
    // left child
    if (i < levelOrder.length && levelOrder[i] !== null) {
      queue.push({
        value: levelOrder[i] as number,
        index: nodes.length + queue.length + 1,
        depth: node.depth + 1,
        parentIndex: node.index,
      });
    }
    i++;
    // right child
    if (i < levelOrder.length && levelOrder[i] !== null) {
      queue.push({
        value: levelOrder[i] as number,
        index: nodes.length + queue.length,
        depth: node.depth + 1,
        parentIndex: node.index,
      });
    }
    i++;
    nodes.push({
      id: node.index,
      value: node.value,
      x: 0, // assigned later
      y: node.depth * LEVEL_H + NODE_R + 10,
    });
  }
  // Flush remaining queue into nodes
  while (queue.length > 0) {
    const node = queue.shift()!;
    nodes.push({
      id: node.index,
      value: node.value,
      x: 0,
      y: node.depth * LEVEL_H + NODE_R + 10,
    });
  }

  // Assign x by depth grouping
  const byDepth = new Map<number, Layout[]>();
  for (const n of nodes) {
    const d = Math.round((n.y - NODE_R - 10) / LEVEL_H);
    if (!byDepth.has(d)) byDepth.set(d, []);
    byDepth.get(d)!.push(n);
  }
  const maxDepth = Math.max(...Array.from(byDepth.keys()));
  const totalWidth = Math.pow(2, maxDepth) * SIBLING_W;
  for (const [depth, siblings] of byDepth) {
    const slots = Math.pow(2, depth);
    const slotW = totalWidth / slots;
    siblings.forEach((n, idx) => {
      n.x = slotW / 2 + idx * slotW;
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
        {nodes.map((n, i) => (
          <g key={i}>
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
