/**
 * Parse free-form test case input into structured args array.
 * Runs server-side in TypeScript — NOT in language wrappers.
 */
export function parseTestInput(input: string): any[] {
  const raw = input.trim();
  if (!raw) return [];

  // Format 0: multi-op (ops = [...], args = [...])
  if (looksLikeAssignment(raw)) {
    const multiOp = tryParseMultiOp(raw);
    if (multiOp) return multiOp;

    // Format 1: var = val
    return parseVarValFormat(raw);
  }

  // Try JSON parse (single value: array, number, string, boolean, null)
  const jsonResult = tryJsonParse(raw);
  if (jsonResult !== undefined) {
    return [jsonResult];
  }

  // Format 2/3: space or comma separated tokens
  const tokens = splitTopLevel(raw);
  if (tokens.length > 1) {
    return tokens.map(t => {
      const p = tryJsonParse(t.trim());
      return p !== undefined ? p : t.trim();
    });
  }

  // Fallback: single string arg
  return [raw];
}

function looksLikeAssignment(s: string): boolean {
  const match = s.match(/^[a-zA-Z_]\w*\s*=/);
  if (!match) return false;
  const eqPos = s.indexOf("=");
  return eqPos > 0 && s[eqPos + 1] !== "=";
}

function parseVarValFormat(raw: string): any[] {
  const joined = raw.split("\n").join(" ").trim();
  const parts = splitByAssignment(joined);
  return parts.map(part => {
    const eqIdx = part.indexOf("=");
    const val = part.substring(eqIdx + 1).trim();
    const parsed = tryJsonParse(val);
    return parsed !== undefined ? parsed : val;
  });
}

function splitByAssignment(s: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let inStr = false;
  let strChar = "";
  let current = "";

  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inStr) {
      current += c;
      if (c === strChar && s[i - 1] !== "\\") inStr = false;
    } else if (c === '"' || c === "'") {
      inStr = true;
      strChar = c;
      current += c;
    } else if ("([{".includes(c)) {
      depth++;
      current += c;
    } else if (")]}".includes(c)) {
      depth--;
      current += c;
    } else if (c === "," && depth === 0) {
      const rest = s.slice(i + 1).trimStart();
      if (/^[a-zA-Z_]\w*\s*=(?!=)/.test(rest)) {
        parts.push(current.trim());
        current = "";
        continue;
      }
      current += c;
    } else if (c === " " && depth === 0) {
      // Check if what follows (after optional spaces/commas) is a new var=val assignment
      const rest = s.slice(i + 1).trimStart();
      if (current.trim() && /^[a-zA-Z_]\w*\s*=(?!=)/.test(rest)) {
        parts.push(current.trim());
        current = "";
        // Skip any separating whitespace/commas
        while (i + 1 < s.length && (s[i + 1] === " " || s[i + 1] === ",")) i++;
        continue;
      }
      current += c;
    } else {
      current += c;
    }
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

function splitTopLevel(s: string): string[] {
  const tokens: string[] = [];
  let depth = 0;
  let inStr = false;
  let strChar = "";
  let current = "";

  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inStr) {
      current += c;
      if (c === strChar && s[i - 1] !== "\\") inStr = false;
    } else if (c === '"' || c === "'") {
      inStr = true;
      strChar = c;
      current += c;
    } else if ("([{".includes(c)) {
      depth++;
      current += c;
    } else if (")]}".includes(c)) {
      depth--;
      current += c;
    } else if ((c === " " || c === ",") && depth === 0 && current.trim()) {
      tokens.push(current.trim());
      current = "";
      while (i + 1 < s.length && (s[i + 1] === " " || s[i + 1] === ",")) i++;
    } else if (c !== " " || depth > 0) {
      current += c;
    }
  }
  if (current.trim()) tokens.push(current.trim());
  return tokens;
}

function tryParseMultiOp(raw: string): any[] | null {
  const parts = parseVarValFormat(raw);
  // Expect exactly 2 arrays
  if (parts.length !== 2 || !Array.isArray(parts[0]) || !Array.isArray(parts[1])) {
    return null;
  }
  const ops = parts[0];
  const args = parts[1];
  // First element must be an uppercase-starting class name, second must be array of arrays
  if (
    ops.length === 0 ||
    typeof ops[0] !== "string" ||
    !/^[A-Z]/.test(ops[0]) ||
    !args.every((a: any) => Array.isArray(a))
  ) {
    return null;
  }
  return [{ __multiOp: true, ops, args }];
}

function tryJsonParse(s: string): any | undefined {
  s = s.trim();
  if (!s) return undefined;
  try {
    return JSON.parse(s);
  } catch {}
  // Try normalizing Python-style None/True/False
  try {
    const normalized = s
      .replace(/\bNone\b/g, "null")
      .replace(/\bTrue\b/g, "true")
      .replace(/\bFalse\b/g, "false");
    return JSON.parse(normalized);
  } catch {}
  return undefined;
}
