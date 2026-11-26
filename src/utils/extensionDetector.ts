/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ExtensionFinding {
  name: string;
  reason: string;
}

export interface ExtensionDetectionResult {
  detected: boolean;
  findings: ExtensionFinding[];
  checkedAt: string;
}

const KNOWN_EXTENSION_SIGNATURES: { name: string; selector: string; reason: string }[] = [
  {
    name: "Grammarly",
    selector:
      "grammarly-desktop-integration, grammarly-extension, grammarly-popups, [data-new-gr-c-s-check-loaded], [data-gr-ext-installed]",
    reason: "Grammarly DOM integration or attribute detected",
  },
  {
    name: "AI Assistant / Copilot Extension",
    selector:
      "[id*='chatgpt-extension'], [id*='monica-'], [id*='merlin-'], [id*='harpa-'], [id*='liner-'], [id*='perplexity-'], [id*='sider-'], [data-extension-id]",
    reason: "AI overlay or assistant extension element detected",
  },
  {
    name: "Password Manager Extension",
    selector:
      "[data-lastpass-icon-added], div[id^='__lpform'], com-1password-button, com-1password-notification, bitwarden-popup, [data-dashlane-rid]",
    reason: "Browser password manager injection detected",
  },
  {
    name: "Dark Reader",
    selector: "meta[name='darkreader'], style.darkreader",
    reason: "Dark Reader stylesheet injection detected",
  },
  {
    name: "Screen / Companion Extension",
    selector: "#loom-companion-mv3, loom-container, .goog-te-banner-frame, #goog-gt-tt",
    reason: "Screen companion or translator extension detected",
  },
];

const EXTENSION_PROTOCOLS = ["chrome-extension://", "moz-extension://", "safari-extension://", "extension://"];

function hasExtensionProtocol(url: string | null | undefined): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  return EXTENSION_PROTOCOLS.some((proto) => lower.startsWith(proto));
}

/**
 * Scans the current browser DOM, injected resources, and custom elements
 * for active browser extensions.
 */
export function detectBrowserExtensions(): ExtensionDetectionResult {
  const findings: ExtensionFinding[] = [];
  const seen = new Set<string>();

  const addFinding = (name: string, reason: string) => {
    const key = `${name}:${reason}`;
    if (!seen.has(key)) {
      seen.add(key);
      findings.push({ name, reason });
    }
  };

  if (typeof window === "undefined" || typeof document === "undefined") {
    return { detected: false, findings, checkedAt: new Date().toISOString() };
  }

  // 1. Check known extension DOM selectors & attributes
  for (const sig of KNOWN_EXTENSION_SIGNATURES) {
    try {
      if (document.querySelector(sig.selector)) {
        addFinding(sig.name, sig.reason);
      }
    } catch {
      // Ignore invalid selector on older browsers
    }
  }

  // 2. Check Performance Resource Timing API for extension-loaded assets
  try {
    const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
    for (const res of resources) {
      if (hasExtensionProtocol(res.name)) {
        addFinding("Browser Extension Resource", `Loaded extension asset: ${res.name.slice(0, 48)}...`);
        break;
      }
    }
  } catch {
    // Ignore if Performance API is restricted
  }

  // 3. Check DOM <script>, <link>, <iframe>, <img> tags for extension:// URLs
  try {
    const nodes = document.querySelectorAll("script[src], link[href], iframe[src], img[src]");
    nodes.forEach((el) => {
      const url = el.getAttribute("src") || el.getAttribute("href");
      if (hasExtensionProtocol(url)) {
        addFinding("Injected Extension Node", `Injected <${el.tagName.toLowerCase()}> from extension URL`);
      }
    });
  } catch {
    // Ignore DOM query errors
  }

  // 4. Check unexpected custom hyphenated elements injected directly into <html> or <body> outside #root
  try {
    const rootEl = document.getElementById("root");
    const checkChildren = (parent: Element | null) => {
      if (!parent) return;
      Array.from(parent.children).forEach((child) => {
        if (child === rootEl) return;
        const tag = child.tagName.toLowerCase();
        if (tag.includes("-") && !tag.startsWith("vite-")) {
          addFinding("Injected Extension Element", `Unexpected custom element <${tag}> outside app root`);
        }
      });
    };
    checkChildren(document.documentElement);
    checkChildren(document.body);
  } catch {
    // Ignore
  }

  return {
    detected: findings.length > 0,
    findings,
    checkedAt: new Date().toISOString(),
  };
}
