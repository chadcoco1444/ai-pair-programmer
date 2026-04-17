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

# Map solution filename → problem slug
def solution_to_slug(filename):
    """test_two_sum.py → two-sum"""
    name = os.path.basename(filename).replace("test_", "").replace(".py", "")
    return name.replace("_", "-")

# Find YAML for a slug
def find_yaml(slug):
    for root, dirs, files in os.walk(SEED_DIR):
        for f in files:
            if f == f"{slug}.yaml":
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

    # Skip problems that can't be tested through simple stdin/stdout
    # (e.g., design problems, encode/decode, linked list cycle detection)
    SKIP_SLUGS = {
        "encode-and-decode-strings",  # Design problem, no stdin/stdout format
        "linked-list-cycle",          # Requires cycle construction, can't send via stdin
        "clone-graph",                # Graph construction from adjacency list
        "serialize-and-deserialize-binary-tree",  # Design problem
        "implement-trie",            # Multi-operation design problem
        "find-median-from-data-stream",  # Multi-operation design problem
        "merge-k-sorted-lists",      # Linked list input
        "merge-two-sorted-lists",    # Linked list input
        "reverse-linked-list",       # Linked list input
        "remove-nth-node-from-end",  # Linked list input
        "reorder-list",              # Linked list input
    }

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
            test_cases.append({
                "id": f"tc-{i+1}",
                "input": tc.get("input", ""),
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
