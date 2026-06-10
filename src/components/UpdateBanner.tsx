"use client";

import { useEffect, useState } from "react";
import { C } from "@/lib/colors";

/**
 * Detects a waiting Service Worker (new version ready) and shows a sticky banner.
 * Tap "Refresh" → SKIP_WAITING → controllerchange → reload.
 *
 * Pattern B per spec: user-controlled. No automatic skipWaiting in install — only
 * triggered by user action so they don't lose unsaved state from an unexpected reload.
 */
export default function UpdateBanner() {
  const [waitingReg, setWaitingReg] = useState<ServiceWorkerRegistration | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;

    const check = (reg: ServiceWorkerRegistration) => {
      if (reg.waiting) setWaitingReg(reg);
      reg.addEventListener("updatefound", () => {
        const installing = reg.installing;
        if (!installing) return;
        installing.addEventListener("statechange", () => {
          if (installing.state === "installed" && navigator.serviceWorker.controller) {
            setWaitingReg(reg);
          }
        });
      });
    };

    navigator.serviceWorker.getRegistration().then((reg) => { if (reg) check(reg); });

    const onChange = () => { window.location.reload(); };
    navigator.serviceWorker.addEventListener("controllerchange", onChange);
    return () => navigator.serviceWorker.removeEventListener("controllerchange", onChange);
  }, []);

  if (!waitingReg || dismissed) return null;

  const refresh = () => {
    waitingReg.waiting?.postMessage({ type: "SKIP_WAITING" });
  };

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[120] flex items-center gap-2 px-4 pt-safe"
      style={{ background: C.warm + "f0", borderBottom: `1px solid ${C.faint}`, paddingTop: 14, paddingBottom: 10 }}
    >
      <div className="flex-1 text-[12px] font-semibold" style={{ color: C.sageDark }}>
        A new version is ready.
      </div>
      <button
        onClick={refresh}
        className="px-3 h-8 rounded-lg text-[11px] font-bold text-white"
        style={{ background: C.sage }}
      >Refresh</button>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        className="w-7 h-7 flex items-center justify-center text-base"
        style={{ color: C.charcoal }}
      >×</button>
    </div>
  );
}
