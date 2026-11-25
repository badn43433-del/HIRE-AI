"""
Selenium End-to-End Web UI Tests for HireShield AI
Runs headless Chromium against the live Express/Vite server.
"""

import os
import sys
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from test_utils import SuiteRecorder

BASE_URL = os.environ.get("APP_BASE_URL", "http://localhost:3000")


def create_driver() -> webdriver.Chrome:
    opts = Options()
    opts.add_argument("--headless=new")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")
    opts.add_argument("--window-size=1440,900")
    return webdriver.Chrome(options=opts)


def main() -> int:
    recorder = SuiteRecorder("Selenium E2E", "reports/selenium_results.json")
    print(f"Running Selenium E2E tests against {BASE_URL}...")
    driver = create_driver()
    wait = WebDriverWait(driver, 15)

    try:
        def tc_landing_page():
            driver.get(BASE_URL)
            wait.until(EC.presence_of_element_located((By.ID, "role-btn-candidate")))
            assert "HireShield" in driver.page_source or "HireShield" in driver.title
            return "Landing AuthPortal loaded with HireShield branding"

        def tc_no_admin_role():
            cand_btns = driver.find_elements(By.ID, "role-btn-candidate")
            int_btns = driver.find_elements(By.ID, "role-btn-interviewer")
            adm_btns = driver.find_elements(By.ID, "role-btn-admin")
            assert len(cand_btns) == 1 and len(int_btns) == 1
            assert len(adm_btns) == 0, "Admin role button should not exist"
            return "Candidate & Interviewer roles present; Admin role removed"

        def tc_candidate_login_and_otp():
            driver.find_element(By.ID, "role-btn-candidate").click()
            submit_btn = wait.until(EC.element_to_be_clickable((By.ID, "auth-login-submit-btn")))
            submit_btn.click()
            otp_btn = wait.until(EC.element_to_be_clickable((By.ID, "otp-verify-submit-btn")))
            otp_btn.click()
            wait.until(EC.presence_of_element_located((By.ID, "header-logout-btn")))
            assert "Sarah Jenkins" in driver.page_source
            return "Candidate authenticated via 2FA OTP into Candidate Portal"

        def tc_ai_chat_widget():
            chat_btn = wait.until(
                EC.element_to_be_clickable((By.XPATH, "//button[@title='Open HireShield AI Chat']"))
            )
            chat_btn.click()
            wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(),'HireShield AI Chat')]")))
            close_btn = driver.find_element(By.XPATH, "//button[@title='Close chat']")
            close_btn.click()
            return "AI Chat widget opened and closed cleanly"

        def tc_switch_to_interviewer():
            interviewer_btn = wait.until(
                EC.element_to_be_clickable((By.XPATH, "//button[normalize-space()='interviewer']"))
            )
            interviewer_btn.click()
            wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(),'Marcus Vance')]")))
            return "Switched to Interviewer Portal (Marcus Vance)"

        recorder.run_case("TC-SEL-01: Landing Page & Branding", tc_landing_page)
        recorder.run_case("TC-SEL-02: Role Selector (No Admin)", tc_no_admin_role)
        recorder.run_case("TC-SEL-03: Candidate Sign-In & 2FA OTP", tc_candidate_login_and_otp)
        recorder.run_case("TC-SEL-04: AI Chat Widget Toggle", tc_ai_chat_widget)
        recorder.run_case("TC-SEL-05: Role Switch to Interviewer", tc_switch_to_interviewer)
    finally:
        driver.quit()

    return recorder.save()


if __name__ == "__main__":
    sys.exit(main())

