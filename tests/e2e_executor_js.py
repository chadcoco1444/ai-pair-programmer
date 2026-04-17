#!/usr/bin/env python3
"""
E2E Executor Regression Test — JavaScript
Tests ALL solutions through the executor API (wrapper + Docker sandbox + judge).

Usage:
    python3 tests/e2e_executor_js.py [--executor-url http://localhost:4000]

Prerequisites:
    - Executor must be running (npm run dev:executor)
    - Docker must be running with skill-runner-javascript image built
"""

import os
import sys
import json
import glob
import yaml
import urllib.request
import urllib.error
import time
import re

EXECUTOR_URL = os.environ.get("EXECUTOR_URL", "http://localhost:4000")
SOLUTIONS_DIR = os.path.join(os.path.dirname(__file__), "solutions_js")
SEED_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "seed", "problems")

# Import shared parse_test_input from Python E2E (same directory)
sys.path.insert(0, os.path.dirname(__file__))
from e2e_executor_test import parse_test_input, find_yaml, SLUG_ALIASES


def solution_to_slug(filename):
    """two_sum.js → two-sum"""
    name = os.path.basename(filename).replace(".js", "")
    return name.replace("_", "-")


def submit_to_executor(code, test_cases, timeout=15000):
    """Submit JS code to executor API and return result."""
    payload = {
        "submissionId": f"e2e-js-{int(time.time()*1000)}",
        "language": "JAVASCRIPT",
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

    # Find all JS solution files
    solution_files = sorted(glob.glob(os.path.join(SOLUTIONS_DIR, "*.js")))
    print(f"Found {len(solution_files)} JS solutions\n")

    passed = 0
    failed = 0
    skipped = 0
    errors = []

    for sol_file in solution_files:
        slug = solution_to_slug(sol_file)

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

        # Read JS solution code
        with open(sol_file, "r", encoding="utf-8") as f:
            code = f.read()

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
    print(f"JS Total: {passed + failed + skipped} | Pass: {passed} | Fail: {failed} | Skip: {skipped}")
    if errors:
        print(f"Failed: {', '.join(errors)}")
    print(f"{'='*50}")

    sys.exit(0 if failed == 0 else 1)


if __name__ == "__main__":
    main()
