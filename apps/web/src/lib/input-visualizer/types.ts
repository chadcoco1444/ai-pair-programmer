export type InputShape =
  | { kind: "array"; values: number[] }
  | { kind: "matrix"; cells: (number | string)[][] }
  | { kind: "tree"; levelOrder: (number | null)[] }
  | { kind: "list"; values: number[] }
  | { kind: "string"; value: string }
  | { kind: "string-array"; values: string[] }
  | { kind: "graph"; adjList: number[][] }
  | { kind: "multi-arg"; parts: { name: string; value: unknown }[] }
  | { kind: "unknown" };
