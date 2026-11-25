"""Shared test result recording utilities for HireShield AI CI suite."""

import json
import os
import time
from typing import Any, Callable, Dict, List


class SuiteRecorder:
    def __init__(self, suite_name: str, out_path: str):
        self.suite_name = suite_name
        self.out_path = out_path
        self.results: List[Dict[str, Any]] = []
        self.metrics: Dict[str, Any] = {}

    def run_case(self, name: str, fn: Callable[[], str]) -> bool:
        start = time.perf_counter()
        try:
            details = fn() or "Passed"
            duration_ms = round((time.perf_counter() - start) * 1000, 2)
            self.results.append({
                "suite": self.suite_name,
                "name": name,
                "status": "PASS",
                "duration_ms": duration_ms,
                "details": str(details),
            })
            print(f"  [PASS] {name} ({duration_ms}ms) - {details}")
            return True
        except Exception as exc:
            duration_ms = round((time.perf_counter() - start) * 1000, 2)
            self.results.append({
                "suite": self.suite_name,
                "name": name,
                "status": "FAIL",
                "duration_ms": duration_ms,
                "details": str(exc),
            })
            print(f"  [FAIL] {name} ({duration_ms}ms) - {exc}")
            return False

    def save(self) -> int:
        os.makedirs(os.path.dirname(self.out_path), exist_ok=True)
        passed = sum(1 for r in self.results if r["status"] == "PASS")
        failed = sum(1 for r in self.results if r["status"] == "FAIL")
        payload = {
            "suite": self.suite_name,
            "passed": passed,
            "failed": failed,
            "total": len(self.results),
            "metrics": self.metrics,
            "cases": self.results,
        }
        with open(self.out_path, "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2)
        return 0 if failed == 0 else 1

