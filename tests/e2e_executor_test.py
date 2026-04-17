#!/usr/bin/env python3
"""
E2E Executor Regression Test
Tests ALL solutions through the executor API (wrapper + Docker sandbox + judge).

Usage:
    python3 tests/e2e_executor_test.py [--executor-url http://localhost:4000]

Prerequisites:
    - Executor must be running (npm run dev:executor)
    - Docker must be running with skill-runner-python image built
"""

import os
import sys
import json
import glob
import yaml
import urllib.request
import urllib.error
import time

EXECUTOR_URL = os.environ.get("EXECUTOR_URL", "http://localhost:4000")
SOLUTIONS_DIR = os.path.join(os.path.dirname(__file__), "solutions")
SEED_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "seed", "problems")


# ---------------------------------------------------------------------------
# Python port of TypeScript parseTestInput (server-side parser)
# ---------------------------------------------------------------------------
import re


def parse_test_input(input_str):
    """Parse free-form test case input into a list of args (mirrors TS parseTestInput)."""
    raw = input_str.strip()
    if not raw:
        return []

    # Format 0: multi-op (ops = [...], args = [...])
    if _looks_like_assignment(raw):
        multi = _try_parse_multi_op(raw)
        if multi is not None:
            return multi

        # Format 1: var = val
        return _parse_var_val(raw)

    # Try JSON parse (single value)
    val = _try_json(raw)
    if val is not _SENTINEL:
        return [val]

    # Format 2/3: space or comma separated tokens
    tokens = _split_top_level(raw)
    if len(tokens) > 1:
        result = []
        for t in tokens:
            t = t.strip()
            p = _try_json(t)
            result.append(p if p is not _SENTINEL else t)
        return result

    return [raw]


def _try_parse_multi_op(raw):
    """Detect multi-op format: ops=[...], args=[[...], ...] where first op is uppercase class."""
    parts = _parse_var_val(raw)
    if len(parts) != 2 or not isinstance(parts[0], list) or not isinstance(parts[1], list):
        return None
    ops = parts[0]
    args = parts[1]
    if (
        len(ops) == 0
        or not isinstance(ops[0], str)
        or not ops[0][0].isupper()
        or not all(isinstance(a, list) for a in args)
    ):
        return None
    return [{"__multiOp": True, "ops": ops, "args": args}]


_SENTINEL = object()


def _looks_like_assignment(s):
    m = re.match(r'^[a-zA-Z_]\w*\s*=', s)
    if not m:
        return False
    eq_pos = s.index('=')
    return eq_pos > 0 and (eq_pos + 1 >= len(s) or s[eq_pos + 1] != '=')


def _parse_var_val(raw):
    joined = raw.replace('\n', ' ').strip()
    parts = _split_by_assignment(joined)
    results = []
    for part in parts:
        eq_idx = part.index('=')
        val = part[eq_idx + 1:].strip()
        p = _try_json(val)
        results.append(p if p is not _SENTINEL else val)
    return results


def _split_by_assignment(s):
    parts = []
    depth = 0
    in_str = False
    str_char = ''
    current = ''

    i = 0
    while i < len(s):
        c = s[i]
        if in_str:
            current += c
            if c == str_char and (i == 0 or s[i - 1] != '\\'):
                in_str = False
        elif c in ('"', "'"):
            in_str = True
            str_char = c
            current += c
        elif c in '([{':
            depth += 1
            current += c
        elif c in ')]}':
            depth -= 1
            current += c
        elif c == ',' and depth == 0:
            rest = s[i + 1:].lstrip()
            if re.match(r'^[a-zA-Z_]\w*\s*=(?!=)', rest):
                parts.append(current.strip())
                current = ''
                i += 1
                continue
            current += c
        elif c == ' ' and depth == 0:
            rest = s[i + 1:].lstrip()
            if current.strip() and re.match(r'^[a-zA-Z_]\w*\s*=(?!=)', rest):
                parts.append(current.strip())
                current = ''
                while i + 1 < len(s) and s[i + 1] in (' ', ','):
                    i += 1
                i += 1
                continue
            current += c
        else:
            current += c
        i += 1

    if current.strip():
        parts.append(current.strip())
    return parts


def _split_top_level(s):
    tokens = []
    depth = 0
    in_str = False
    str_char = ''
    current = ''

    i = 0
    while i < len(s):
        c = s[i]
        if in_str:
            current += c
            if c == str_char and (i == 0 or s[i - 1] != '\\'):
                in_str = False
        elif c in ('"', "'"):
            in_str = True
            str_char = c
            current += c
        elif c in '([{':
            depth += 1
            current += c
        elif c in ')]}':
            depth -= 1
            current += c
        elif c in (' ', ',') and depth == 0 and current.strip():
            tokens.append(current.strip())
            current = ''
            while i + 1 < len(s) and s[i + 1] in (' ', ','):
                i += 1
        elif c != ' ' or depth > 0:
            current += c
        i += 1

    if current.strip():
        tokens.append(current.strip())
    return tokens


def _try_json(s):
    s = s.strip()
    if not s:
        return _SENTINEL
    try:
        return json.loads(s)
    except Exception:
        pass
    # Try Python-style None/True/False
    try:
        normalized = re.sub(r'\bNone\b', 'null', s)
        normalized = re.sub(r'\bTrue\b', 'true', normalized)
        normalized = re.sub(r'\bFalse\b', 'false', normalized)
        return json.loads(normalized)
    except Exception:
        pass
    return _SENTINEL

# Slug aliases: solution filename slug → YAML filename slug
SLUG_ALIASES = {
    "construct-binary-tree": "construct-binary-tree-from-preorder-and-inorder",
    "kth-smallest-in-bst": "kth-smallest-element-in-bst",
    "longest-substring-without-repeating": "longest-substring-without-repeating-characters",
    "lowest-common-ancestor-bst": "lowest-common-ancestor-of-bst",
    "validate-bst": "validate-binary-search-tree",
}

# Map solution filename → problem slug
def solution_to_slug(filename):
    """test_two_sum.py → two-sum"""
    name = os.path.basename(filename).replace("test_", "").replace(".py", "")
    return name.replace("_", "-")

# Find YAML for a slug
def find_yaml(slug):
    # Try exact match first, then alias
    candidates = [slug, SLUG_ALIASES.get(slug, "")]
    for candidate in candidates:
        if not candidate:
            continue
        for root, dirs, files in os.walk(SEED_DIR):
            for f in files:
                if f == f"{candidate}.yaml":
                    return os.path.join(root, f)
    return None

# Extract only the Solution class code (no test code)
def extract_solution_code(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        lines = f.readlines()

    code_lines = []
    in_test = False
    for line in lines:
        # Stop at test function or test marker
        stripped = line.strip()
        if stripped.startswith("def test") or stripped.startswith("# === Test") or stripped.startswith("# Tests"):
            in_test = True
        if stripped.startswith("if __name__"):
            in_test = True
        if not in_test:
            code_lines.append(line)

    return "".join(code_lines).rstrip()

def submit_to_executor(code, test_cases, timeout=15000):
    """Submit code to executor API and return result."""
    payload = {
        "submissionId": f"e2e-{int(time.time()*1000)}",
        "language": "PYTHON",
        "code": code,
        "testCases": test_cases,
        "timeout": timeout,
        "memoryLimit": 256,
    }

    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        f"{EXECUTOR_URL}/execute/sync",
        data=data,
        headers={"Content-Type": "application/json"},
    )

    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read())
    except urllib.error.URLError as e:
        return {"status": "CONNECTION_ERROR", "error": str(e)}
    except Exception as e:
        return {"status": "ERROR", "error": str(e)}

def main():
    # Check executor is running
    try:
        resp = urllib.request.urlopen(f"{EXECUTOR_URL}/health", timeout=5)
        health = json.loads(resp.read())
        if health.get("status") != "ok":
            print(f"Executor not healthy: {health}")
            sys.exit(1)
    except Exception as e:
        print(f"Cannot connect to executor at {EXECUTOR_URL}: {e}")
        print("Start it with: npm run dev:executor")
        sys.exit(1)

    # Find all solution files
    solution_files = sorted(glob.glob(os.path.join(SOLUTIONS_DIR, "test_*.py")))
    print(f"Found {len(solution_files)} solutions\n")

    SKIP_SLUGS = set()  # All problems now supported

    passed = 0
    failed = 0
    skipped = 0
    errors = []

    for sol_file in solution_files:
        slug = solution_to_slug(sol_file)

        if slug in SKIP_SLUGS:
            print(f"  SKIP  {slug} (design/linked-list problem)")
            skipped += 1
            continue

        yaml_file = find_yaml(slug)
        if not yaml_file:
            print(f"  SKIP  {slug} (no YAML found)")
            skipped += 1
            continue

        # Load test cases from YAML
        with open(yaml_file, "r", encoding="utf-8") as f:
            problem = yaml.safe_load(f)

        test_cases_yaml = problem.get("testCases", [])
        if not test_cases_yaml:
            print(f"  SKIP  {slug} (no test cases)")
            skipped += 1
            continue

        # Build test cases for executor
        test_cases = []
        for i, tc in enumerate(test_cases_yaml):
            tc_input = tc.get("input", "")
            test_cases.append({
                "id": f"tc-{i+1}",
                "input": tc_input,
                "args": parse_test_input(tc_input),
                "expected": tc.get("expected", ""),
                "isHidden": tc.get("isHidden", False),
                "isKiller": tc.get("isKiller", False),
            })

        # Extract solution code
        code = extract_solution_code(sol_file)

        # Submit to executor
        result = submit_to_executor(code, test_cases)
        status = result.get("status", "UNKNOWN")

        if status == "ACCEPTED":
            print(f"  PASS  {slug}")
            passed += 1
        else:
            print(f"  FAIL  {slug} → {status}")
            for tr in result.get("testResults", []):
                if not tr.get("passed", True):
                    print(f"        {tr['testCaseId']}: actual={tr.get('actual','')[:60]} expected={tr.get('expected','')[:60]}")
                    if tr.get("stderr"):
                        print(f"        stderr: {tr['stderr'][:120]}")
            if result.get("error"):
                print(f"        error: {result['error']}")
            errors.append(slug)
            failed += 1

    print(f"\n{'='*50}")
    print(f"Total: {passed + failed + skipped} | Pass: {passed} | Fail: {failed} | Skip: {skipped}")
    if errors:
        print(f"Failed: {', '.join(errors)}")
    print(f"{'='*50}")

    sys.exit(0 if failed == 0 else 1)

if __name__ == "__main__":
    main()
