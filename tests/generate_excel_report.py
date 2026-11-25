"""
Generates a styled Excel (.xlsx) Test Report from all CI test suite outputs
for GitHub Actions artifact download and submission.
"""

import glob
import json
import os
import xml.etree.ElementTree as ET
from datetime import datetime, timezone

import openpyxl
from openpyxl.styles import Alignment, Font, PatternFill, Border, Side


HEADER_FILL = PatternFill(start_color="1E1B4B", end_color="1E1B4B", fill_type="solid")
HEADER_FONT = Font(color="FFFFFF", bold=True, size=11)
PASS_FILL = PatternFill(start_color="DCFCE7", end_color="DCFCE7", fill_type="solid")
PASS_FONT = Font(color="166534", bold=True)
FAIL_FILL = PatternFill(start_color="FEE2E2", end_color="FEE2E2", fill_type="solid")
FAIL_FONT = Font(color="991B1B", bold=True)
THIN_BORDER = Border(
    left=Side(style="thin", color="CBD5E1"),
    right=Side(style="thin", color="CBD5E1"),
    top=Side(style="thin", color="CBD5E1"),
    bottom=Side(style="thin", color="CBD5E1"),
)


def parse_junit_xml(path: str):
    if not os.path.exists(path):
        return None
    tree = ET.parse(path)
    root = tree.getroot()
    cases = []
    for tc in root.iter("testcase"):
        name = tc.attrib.get("name", "unknown")
        time_ms = round(float(tc.attrib.get("time", 0)) * 1000, 2)
        failure = tc.find("failure")
        error = tc.find("error")
        if failure is not None or error is not None:
            status = "FAIL"
            details = (failure.attrib.get("message") if failure is not None else error.attrib.get("message")) or "Failed"
        else:
            status = "PASS"
            details = "Pytest assertion passed"
        cases.append({
            "suite": "Backend Unit (Pytest)",
            "name": name,
            "status": status,
            "duration_ms": time_ms,
            "details": details,
        })
    passed = sum(1 for c in cases if c["status"] == "PASS")
    failed = sum(1 for c in cases if c["status"] == "FAIL")
    return {"suite": "Backend Unit (Pytest)", "passed": passed, "failed": failed, "total": len(cases), "metrics": {}, "cases": cases}


def style_header(ws, row_idx: int, col_count: int):
    for col in range(1, col_count + 1):
        cell = ws.cell(row=row_idx, column=col)
        cell.fill = HEADER_FILL
        cell.font = HEADER_FONT
        cell.alignment = Alignment(horizontal="left", vertical="center")
        cell.border = THIN_BORDER


def auto_fit_columns(ws):
    for col in ws.columns:
        max_len = 0
        col_letter = col[0].column_letter
        for cell in col:
            val = str(cell.value or "")
            max_len = max(max_len, len(val))
        ws.column_dimensions[col_letter].width = min(max(max_len + 4, 14), 65)


def main():
    os.makedirs("reports", exist_ok=True)
    suites = []

    junit_suite = parse_junit_xml("reports/junit-unit.xml")
    if junit_suite:
        suites.append(junit_suite)

    for jp in sorted(glob.glob("reports/*_results.json")):
        with open(jp, "r", encoding="utf-8") as f:
            suites.append(json.load(f))

    wb = openpyxl.Workbook()

    # 1. Summary Sheet
    ws_sum = wb.active
    ws_sum.title = "Summary"
    ws_sum.append(["HireShield AI - Automated CI Test Report"])
    ws_sum["A1"].font = Font(bold=True, size=14, color="1E1B4B")
    ws_sum.append(["Generated At (UTC)", datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")])
    ws_sum.append(["GitHub Repository", os.environ.get("GITHUB_REPOSITORY", "badn43433-del/hire")])
    ws_sum.append(["Git Branch", os.environ.get("GITHUB_REF_NAME", "main")])
    ws_sum.append(["Commit SHA", os.environ.get("GITHUB_SHA", "local")[:12]])
    ws_sum.append([])

    ws_sum.append(["Test Suite", "Total Cases", "Passed", "Failed", "Status"])
    style_header(ws_sum, 7, 5)

    grand_total = grand_pass = grand_fail = 0
    for s in suites:
        grand_total += s["total"]
        grand_pass += s["passed"]
        grand_fail += s["failed"]
        st = "PASS" if s["failed"] == 0 and s["total"] > 0 else "FAIL"
        ws_sum.append([s["suite"], s["total"], s["passed"], s["failed"], st])
        r = ws_sum.max_row
        st_cell = ws_sum.cell(row=r, column=5)
        st_cell.fill = PASS_FILL if st == "PASS" else FAIL_FILL
        st_cell.font = PASS_FONT if st == "PASS" else FAIL_FONT
        for c in range(1, 6):
            ws_sum.cell(row=r, column=c).border = THIN_BORDER

    overall = "PASS" if grand_fail == 0 and grand_total > 0 else "FAIL"
    ws_sum.append(["TOTAL", grand_total, grand_pass, grand_fail, overall])
    r = ws_sum.max_row
    for c in range(1, 6):
        cell = ws_sum.cell(row=r, column=c)
        cell.font = Font(bold=True)
        cell.border = THIN_BORDER
    ws_sum.cell(row=r, column=5).fill = PASS_FILL if overall == "PASS" else FAIL_FILL
    ws_sum.cell(row=r, column=5).font = PASS_FONT if overall == "PASS" else FAIL_FONT
    auto_fit_columns(ws_sum)

    # 2. Detailed Test Cases Sheet
    ws_cases = wb.create_sheet("Test_Cases")
    ws_cases.append(["Suite", "Test Case Name", "Status", "Duration (ms)", "Details"])
    style_header(ws_cases, 1, 5)

    for s in suites:
        for tc in s.get("cases", []):
            ws_cases.append([
                tc["suite"],
                tc["name"],
                tc["status"],
                tc["duration_ms"],
                tc["details"],
            ])
            r = ws_cases.max_row
            st_cell = ws_cases.cell(row=r, column=3)
            st_cell.fill = PASS_FILL if tc["status"] == "PASS" else FAIL_FILL
            st_cell.font = PASS_FONT if tc["status"] == "PASS" else FAIL_FONT
            for c in range(1, 6):
                ws_cases.cell(row=r, column=c).border = THIN_BORDER
    auto_fit_columns(ws_cases)

    # 3. Load & Security Metrics Sheet
    ws_met = wb.create_sheet("Performance_&_Security")
    ws_met.append(["Suite", "Metric / Endpoint", "Value"])
    style_header(ws_met, 1, 3)

    for s in suites:
        for k, v in (s.get("metrics") or {}).items():
            ws_met.append([s["suite"], k, json.dumps(v) if isinstance(v, dict) else str(v)])
            r = ws_met.max_row
            for c in range(1, 4):
                ws_met.cell(row=r, column=c).border = THIN_BORDER
    auto_fit_columns(ws_met)

    out_file = "reports/HireShield_Test_Report.xlsx"
    wb.save(out_file)
    print(f"Generated Excel test report: {out_file} (Total={grand_total}, Passed={grand_pass}, Failed={grand_fail})")


if __name__ == "__main__":
    main()
