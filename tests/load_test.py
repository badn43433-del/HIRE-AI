"""
Concurrent HTTP Load Test Suite for HireShield AI (300 Test Cases)
Simulates concurrent users across core API endpoints and records latency/throughput.
"""

import os
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
import requests

from test_utils import SuiteRecorder

BASE_URL = os.environ.get("APP_BASE_URL", "http://localhost:3000")


def run_endpoint_load(path: str, total_requests: int = 20, concurrency: int = 10):
    url = f"{BASE_URL}{path}"
    latencies_ms = []
    errors = 0

    def hit():
        t0 = time.perf_counter()
        r = requests.get(url, timeout=10)
        ms = (time.perf_counter() - t0) * 1000
        return r.status_code, ms

    wall_start = time.perf_counter()
    with ThreadPoolExecutor(max_workers=concurrency) as pool:
        futures = [pool.submit(hit) for _ in range(total_requests)]
        for fut in as_completed(futures):
            try:
                code, ms = fut.result()
                if code != 200:
                    errors += 1
                latencies_ms.append(ms)
            except Exception:
                errors += 1
    wall_s = max(0.001, time.perf_counter() - wall_start)

    latencies_ms.sort()
    avg_ms = round(sum(latencies_ms) / max(1, len(latencies_ms)), 2)
    p95_idx = min(len(latencies_ms) - 1, int(len(latencies_ms) * 0.95))
    p95_ms = round(latencies_ms[p95_idx], 2) if latencies_ms else 0.0
    max_ms = round(latencies_ms[-1], 2) if latencies_ms else 0.0
    rps = round(total_requests / wall_s, 2)

    return {
        "requests": total_requests,
        "concurrency": concurrency,
        "errors": errors,
        "avg_ms": avg_ms,
        "p95_ms": p95_ms,
        "max_ms": max_ms,
        "rps": rps,
    }


def main() -> int:
    recorder = SuiteRecorder("Load Test", "reports/load_results.json")
    print(f"Running 300 Load test cases against {BASE_URL}...")

    endpoints = [
        "/api/positions",
        "/api/reports",
        "/api/sessions",
        "/",
    ]

    # 1-3: High-volume 100-request burst benchmarks per core API
    for idx, ep in enumerate(endpoints[:3], start=1):
        def make_burst(path=ep):
            def _run():
                stats = run_endpoint_load(path, total_requests=100, concurrency=20)
                recorder.metrics[f"burst_{path}"] = stats
                assert stats["errors"] == 0, f"{stats['errors']} failed requests on {path}"
                assert stats["p95_ms"] < 1500, f"p95 latency too high: {stats['p95_ms']}ms"
                return (
                    f"{stats['requests']} reqs @ {stats['concurrency']} threads | "
                    f"RPS={stats['rps']} | avg={stats['avg_ms']}ms | p95={stats['p95_ms']}ms | errors=0"
                )
            return _run
        recorder.run_case(f"TC-LOAD-{idx:03d}: Burst Load {ep} (100 reqs / 20 threads)", make_burst())

    # 4-300: 297 concurrent load wave cases (10 concurrent requests per wave = 2,970 requests)
    for i in range(4, 301):
        ep = endpoints[i % len(endpoints)]

        def make_wave(path=ep, case_num=i):
            def _run():
                stats = run_endpoint_load(path, total_requests=10, concurrency=5)
                if case_num % 50 == 0:
                    recorder.metrics[f"wave_{case_num}_{path}"] = stats
                assert stats["errors"] == 0, f"{stats['errors']} failed requests on {path}"
                assert stats["p95_ms"] < 1500, f"p95 latency too high: {stats['p95_ms']}ms"
                return f"10 reqs @ 5 threads | RPS={stats['rps']} | avg={stats['avg_ms']}ms | p95={stats['p95_ms']}ms"
            return _run

        recorder.run_case(f"TC-LOAD-{i:03d}: Concurrent Wave {ep} (#{i})", make_wave())

    recorder.metrics["total_load_cases"] = len(recorder.results)
    return recorder.save()


if __name__ == "__main__":
    sys.exit(main())
