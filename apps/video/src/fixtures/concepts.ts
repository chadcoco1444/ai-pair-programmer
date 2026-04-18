export interface FixtureConcept {
  id: string;
  name: string;
  mastery: number; // 0..1 — progression applied during Skill Tree animation
  col: number;     // grid column (0-based)
  row: number;     // grid row (0-based)
}

/**
 * 22 concepts arranged on a 5×5 grid (with gaps). Each concept has two
 * mastery values: starting state and final state. The scene interpolates.
 */
export interface ConceptWithProgression extends FixtureConcept {
  startMastery: number;
  endMastery: number;
}

export const concepts: ConceptWithProgression[] = [
  { id: "array",        name: "Array",         mastery: 0.9,  startMastery: 0.40, endMastery: 0.90, col: 0, row: 0 },
  { id: "two-pointer",  name: "Two Pointer",   mastery: 0.8,  startMastery: 0.30, endMastery: 0.80, col: 1, row: 0 },
  { id: "sliding",      name: "Sliding Window",mastery: 0.6,  startMastery: 0.10, endMastery: 0.60, col: 2, row: 0 },
  { id: "binary-search",name: "Binary Search", mastery: 0.7,  startMastery: 0.20, endMastery: 0.70, col: 3, row: 0 },
  { id: "hash-table",   name: "Hash Table",    mastery: 0.85, startMastery: 0.30, endMastery: 0.85, col: 4, row: 0 },
  { id: "stack",        name: "Stack",         mastery: 0.75, startMastery: 0.45, endMastery: 0.75, col: 0, row: 1 },
  { id: "monotonic",    name: "Monotonic Stk", mastery: 0.4,  startMastery: 0.15, endMastery: 0.40, col: 1, row: 1 },
  { id: "linked-list",  name: "Linked List",   mastery: 0.65, startMastery: 0.30, endMastery: 0.65, col: 2, row: 1 },
  { id: "string",       name: "String",        mastery: 0.80, startMastery: 0.40, endMastery: 0.80, col: 3, row: 1 },
  { id: "recursion",    name: "Recursion",     mastery: 0.55, startMastery: 0.20, endMastery: 0.55, col: 4, row: 1 },
  { id: "tree",         name: "Tree",          mastery: 0.70, startMastery: 0.25, endMastery: 0.70, col: 0, row: 2 },
  { id: "bst",          name: "BST",           mastery: 0.60, startMastery: 0.20, endMastery: 0.60, col: 1, row: 2 },
  { id: "trie",         name: "Trie",          mastery: 0.45, startMastery: 0.10, endMastery: 0.45, col: 2, row: 2 },
  { id: "heap",         name: "Heap",          mastery: 0.50, startMastery: 0.20, endMastery: 0.50, col: 3, row: 2 },
  { id: "graph",        name: "Graph",         mastery: 0.40, startMastery: 0.10, endMastery: 0.40, col: 4, row: 2 },
  { id: "bfs-dfs",      name: "BFS / DFS",     mastery: 0.55, startMastery: 0.15, endMastery: 0.55, col: 0, row: 3 },
  { id: "union-find",   name: "Union Find",    mastery: 0.35, startMastery: 0.05, endMastery: 0.35, col: 1, row: 3 },
  { id: "dp-1d",        name: "DP 1D",         mastery: 0.60, startMastery: 0.25, endMastery: 0.60, col: 2, row: 3 },
  { id: "dp-2d",        name: "DP 2D",         mastery: 0.40, startMastery: 0.10, endMastery: 0.40, col: 3, row: 3 },
  { id: "greedy",       name: "Greedy",        mastery: 0.50, startMastery: 0.20, endMastery: 0.50, col: 4, row: 3 },
  { id: "interval",     name: "Interval",      mastery: 0.45, startMastery: 0.15, endMastery: 0.45, col: 1, row: 4 },
  { id: "matrix",       name: "Matrix",        mastery: 0.55, startMastery: 0.20, endMastery: 0.55, col: 3, row: 4 },
];
