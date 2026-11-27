/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Returns the currently active fullscreen element across standard and vendor-prefixed APIs.
 */
export function getFullscreenElement(): Element | null {
  if (typeof document === "undefined") return null;
  const doc = document as any;
  return (
    doc.fullscreenElement ||
    doc.webkitFullscreenElement ||
    doc.mozFullScreenElement ||
    doc.msFullscreenElement ||
    null
  );
}

/**
 * Checks whether the current browser/environment supports requesting fullscreen.
 */
export function isFullscreenSupported(): boolean {
  if (typeof document === "undefined") return false;
  const doc = document as any;
  const el = document.documentElement as any;
  const hasMethod = Boolean(
    el?.requestFullscreen ||
      el?.webkitRequestFullscreen ||
      el?.mozRequestFullScreen ||
      el?.msRequestFullscreen
  );
  const enabled = doc.fullscreenEnabled ?? doc.webkitFullscreenEnabled ?? doc.mozFullScreenEnabled ?? true;
  return hasMethod && Boolean(enabled);
}

/**
 * Requests fullscreen on document.documentElement with vendor fallbacks.
 * Must be invoked directly inside a user-gesture handler (click/submit) before awaits.
 * Never throws on rejection (e.g. iframe restrictions or headless environments).
 */
export async function enterFullscreen(): Promise<boolean> {
  if (typeof document === "undefined") return false;
  if (getFullscreenElement()) return true;

  const el = document.documentElement as any;
  try {
    const fn =
      el.requestFullscreen ||
      el.webkitRequestFullscreen ||
      el.mozRequestFullScreen ||
      el.msRequestFullscreen;

    if (!fn) return false;
    const result = fn.call(el);
    if (result && typeof result.then === "function") {
      await result;
    }
    return true;
  } catch (err) {
    console.warn("Fullscreen request was blocked or rejected:", err);
    return false;
  }
}

/**
 * Safely exits fullscreen only if currently active. Never throws.
 */
export async function exitFullscreenSafe(): Promise<void> {
  if (typeof document === "undefined") return;
  if (!getFullscreenElement()) return;

  const doc = document as any;
  try {
    const fn =
      doc.exitFullscreen ||
      doc.webkitExitFullscreen ||
      doc.mozCancelFullScreen ||
      doc.msExitFullscreen;

    if (!fn) return;
    const result = fn.call(doc);
    if (result && typeof result.then === "function") {
      await result;
    }
  } catch (err) {
    console.warn("Exit fullscreen error ignored:", err);
  }
}

/**
 * Subscribes to standard and vendor-prefixed fullscreenchange events.
 */
export function addFullscreenChangeListener(handler: () => void): () => void {
  if (typeof document === "undefined") return () => {};
  const events = [
    "fullscreenchange",
    "webkitfullscreenchange",
    "mozfullscreenchange",
    "MSFullscreenChange",
  ];
  events.forEach((evt) => document.addEventListener(evt, handler));
  return () => {
    events.forEach((evt) => document.removeEventListener(evt, handler));
  };
}
