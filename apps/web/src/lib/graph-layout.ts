import dagre from "@dagrejs/dagre";
import type { Node, Edge } from "@xyflow/react";

const NODE_WIDTH = 180;
const NODE_HEIGHT = 60;

export function layoutGraph<TNode extends Omit<Node, "position">, TEdge extends Edge>(
  nodes: TNode[],
  edges: TEdge[]
): { nodes: (TNode & { position: { x: number; y: number } })[]; edges: TEdge[] } {
  if (nodes.length === 0) return { nodes: [], edges: [] };

  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: "TB", ranksep: 80, nodesep: 40 });
  g.setDefaultEdgeLabel(() => ({}));

  nodes.forEach((n) => {
    g.setNode(n.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });
  edges.forEach((e) => {
    g.setEdge(e.source, e.target);
  });

  dagre.layout(g);

  const positionedNodes = nodes.map((n) => {
    const pos = g.node(n.id);
    return { ...n, position: { x: pos.x - NODE_WIDTH / 2, y: pos.y - NODE_HEIGHT / 2 } };
  });

  return { nodes: positionedNodes, edges };
}
