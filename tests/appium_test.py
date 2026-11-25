"""
Appium Mobile & Cross-Platform Tests for HireShield AI
Connects to an Appium 2 server (Chromium/Mobile Web driver) on APPIUM_SERVER_URL
to verify mobile viewport responsiveness, touch targets, and Expo Router screen parity.
"""

import os
import sys
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium import webdriver as selenium_webdriver
from selenium.webdriver.chrome.options import Options as ChromeOptions

from appium import webdriver as appium_webdriver
from appium.options.common import AppiumOptions

from test_utils import SuiteRecorder

BASE_URL = os.environ.get("APP_BASE_URL", "http://localhost:3000")
APPIUM_URL = os.environ.get("APPIUM_SERVER_URL", "http://127.0.0.1:4723")


def create_mobile_driver():
    """Prefer live Appium 2 server; fall back to Chrome mobile emulation if offline."""
    try:
        opts = AppiumOptions()
        opts.set_capability("platformName", "Linux")
        opts.set_capability("appium:automationName", "Chromium")
        opts.set_capability("goog:chromeOptions", {
            "args": ["--headless=new", "--no-sandbox", "--disable-dev-shm-usage", "--window-size=390,844"],
            "mobileEmulation": {"deviceName": "Pixel 7"},
        })
        driver = appium_webdriver.Remote(command_executor=APPIUM_URL, options=opts)
        return driver, "Appium 2 Chromium Driver"
    except Exception:
        chrome_opts = ChromeOptions()
        chrome_opts.add_argument("--headless=new")
        chrome_opts.add_argument("--no-sandbox")
        chrome_opts.add_argument("--disable-dev-shm-usage")
        chrome_opts.add_argument("--window-size=390,844")
        chrome_opts.add_experimental_option("mobileEmulation", {"deviceName": "Pixel 7"})
        driver = selenium_webdriver.Chrome(options=chrome_opts)
        return driver, "Mobile Emulation Fallback"


def main() -> int:
    recorder = SuiteRecorder("Appium Mobile", "reports/appium_results.json")
    driver, mode = create_mobile_driver()
    wait = WebDriverWait(driver, 15)
    print(f"Running Appium Mobile tests ({mode}) against {BASE_URL}...")

    try:
        def tc_mobile_viewport():
            driver.get(BASE_URL)
            wait.until(EC.presence_of_element_located((By.ID, "role-btn-candidate")))
            width = driver.execute_script("return window.innerWidth")
            assert width <= 480, f"Expected mobile viewport width <= 480, got {width}"
            return f"Mobile viewport active (width={width}px via {mode})"

        def tc_mobile_no_horizontal_overflow():
            scroll_w = driver.execute_script("return document.documentElement.scrollWidth")
            client_w = driver.execute_script("return document.documentElement.clientWidth")
            assert scroll_w <= client_w + 2, f"Horizontal overflow detected: {scroll_w} > {client_w}"
            return f"Zero horizontal overflow ({scroll_w}px <= {client_w}px)"

        def tc_mobile_candidate_login():
            driver.find_element(By.ID, "role-btn-candidate").click()
            wait.until(EC.element_to_be_clickable((By.ID, "auth-login-submit-btn"))).click()
            wait.until(EC.element_to_be_clickable((By.ID, "otp-verify-submit-btn"))).click()
            wait.until(EC.presence_of_element_located((By.ID, "header-logout-btn")))
            return "Mobile Candidate 2FA login flow succeeded"

        def tc_mobile_ai_chat_accessible():
            chat_btn = wait.until(
                EC.element_to_be_clickable((By.XPATH, "//button[@title='Open HireShield AI Chat']"))
            )
            rect = chat_btn.rect
            assert rect["height"] >= 40, f"Touch target too small: {rect['height']}px"
            chat_btn.click()
            wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(),'HireShield AI Chat')]")))
            return f"Mobile AI Chat button touch target OK ({rect['height']}px)"

        def tc_expo_crossplatform_screens():
            required_screens = [
                "app/_layout.tsx",
                "app/index.tsx",
                "app/(candidate)/index.tsx",
                "app/(candidate)/live-room.tsx",
                "app/(interviewer)/index.tsx",
            ]
            missing = [p for p in required_screens if not os.path.exists(p)]
            assert not missing, f"Missing Expo Router screens: {missing}"
            assert not os.path.exists("app/(admin)/index.tsx"), "Removed admin screen still exists"
            return f"All {len(required_screens)} Expo Router mobile screens verified"

        recorder.run_case("TC-APP-01: Mobile Viewport Initialization", tc_mobile_viewport)
        recorder.run_case("TC-APP-02: Responsive Layout (No Overflow)", tc_mobile_no_horizontal_overflow)
        recorder.run_case("TC-APP-03: Mobile Candidate Auth & OTP", tc_mobile_candidate_login)
        recorder.run_case("TC-APP-04: Mobile AI Chat Touch Target", tc_mobile_ai_chat_accessible)
        recorder.run_case("TC-APP-05: Expo Router Screen Parity", tc_expo_crossplatform_screens)
    finally:
        driver.quit()

    return recorder.save()


if __name__ == "__main__":
    sys.exit(main())

