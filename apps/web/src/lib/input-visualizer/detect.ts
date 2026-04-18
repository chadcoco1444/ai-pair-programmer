import type { InputShape } from "./types";

/** Lightweight JSON parse that tolerates trailing commas and Python-style None/True/False. */
function tryJson(s: string): unknown | undefined {
  const trimmed = s.trim();
  if (!trimmed) return undefined;
  try {
    return JSON.parse(trimmed);
  } catch {}
  try {
    const normalized = trimmed
      .replace(/\bNone\b/g, "null")
      .replace(/\bTrue\b/g, "true")
      .replace(/\bFalse\b/g, "false");
    return JSON.parse(normalized);
  } catch {}
  return undefined;
}

/** Split "name = value" comma-separated pairs, respecting brackets. */
function splitAssignments(s: string): { name: string; rawValue: string }[] {
  const parts: { name: string; rawValue: string }[] = [];
  let depth = 0;
  let current = "";
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === "[" || c === "{" || c === "(") depth++;
    else if (c === "]" || c === "}" || c === ")") depth--;
    if (c === "," && depth === 0) {
      const m = /^\s*([a-zA-Z_]\w*)\s*=\s*(.+)\s*$/.exec(current);
      if (m) parts.push({ name: m[1], rawValue: m[2] });
      current = "";
      continue;
    }
    current += c;
  }
  const m = /^\s*([a-zA-Z_]\w*)\s*=\s*(.+)\s*$/.exec(current);
  if (m) parts.push({ name: m[1], rawValue: m[2] });
  return parts;
}

function isSingleAssignment(s: string): { name: string; rawValue: string } | null {
  const assignments = splitAssignments(s);
  return assignments.length === 1 ? assignments[0] : null;
}

function classifyValue(
  name: string | null,
  value: unknown
): InputShape {
  if (typeof value === "string") {
    return { kind: "string", value };
  }
  if (Array.isArray(value)) {
    // Array of strings?
    if (value.every((v) => typeof v === "string")) {
      return { kind: "string-array", values: value as string[] };
    }
    // 2D array — could be matrix or graph or tree/list-of-lists
    if (value.every((v) => Array.isArray(v))) {
      // name hints: adjList → graph
      if (name && /adjlist|adj|graph|edges/i.test(name)) {
        return { kind: "graph", adjList: value as number[][] };
      }
      return { kind: "matrix", cells: value as (number | string)[][] };
    }
    // 1D array of numbers or numbers+nulls
    const allNumeric = value.every(
      (v) => typeof v === "number" || v === null
    );
    if (allNumeric) {
      // name hint: root/tree → tree
      if (name && /root|tree/i.test(name)) {
        return { kind: "tree", levelOrder: value as (number | null)[] };
      }
      // name hint: head/list → list
      if (name && /head|list|node/i.test(name)) {
        return { kind: "list", values: value.filter((v): v is number => v !== null) };
      }
      // plain numeric array (no nulls) → array
      if (value.every((v) => typeof v === "number")) {
        return { kind: "array", values: value as number[] };
      }
      // numeric with nulls but no name → treat as tree
      return { kind: "tree", levelOrder: value as (number | null)[] };
    }
    return { kind: "unknown" };
  }
  return { kind: "unknown" };
}

export function detectInputType(raw: string): InputShape {
  const trimmed = raw.trim();
  if (!trimmed) return { kind: "unknown" };

  // Case 1: single "name = value"
  const single = isSingleAssignment(trimmed);
  if (single) {
    const value = tryJson(single.rawValue);
    if (value === undefined) return { kind: "unknown" };
    return classifyValue(single.name, value);
  }

  // Case 2: multiple "name = val, name2 = val2"
  const assignments = splitAssignments(trimmed);
  if (assignments.length > 1) {
    const parts: { name: string; value: unknown }[] = [];
    for (const a of assignments) {
      const v = tryJson(a.rawValue);
      if (v !== undefined) parts.push({ name: a.name, value: v });
    }
    if (parts.length === 0) return { kind: "unknown" };
    return { kind: "multi-arg", parts };
  }

  // Case 3: no assignment, just a value
  const value = tryJson(trimmed);
  if (value === undefined) return { kind: "unknown" };
  return classifyValue(null, value);
}
