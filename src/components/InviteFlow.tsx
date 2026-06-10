"use client";

import { useState } from "react";
import { C } from "@/lib/colors";

interface Props {
  userName: string;
  /** Called when triggered, returns false if native share unavailable so the fallback can show. */
  onTrigger: () => void;
  /** When fallback is open. */
  fallbackOpen: boolean;
  onCloseFallback: () => void;
}

export function getInviteUrl(userName: string) {
  const ref = encodeURIComponent(userName || "friend");
  return `https://app.mynudgr.com?ref=${ref}`;
}

/**
 * Triggers navigator.share() with a fallback modal for browsers that don't support it.
 * Use the exported sendInvite helper to fire the share from any button.
 */
export async function sendInvite(userName: string): Promise<{ shared: boolean; reason?: string }> {
  const url = getInviteUrl(userName);
  const payload = {
    title: "Join me on Nudgr",
    text: "I'm using Nudgr to stay accountable. Want to nudge me?",
    url,
  };
  if (typeof navigator !== "undefined" && (navigator as Navigator & { share?: (d: ShareData) => Promise<void> }).share) {
    try {
      await (navigator as Navigator & { share: (d: ShareData) => Promise<void> }).share(payload);
      return { shared: true };
    } catch (e) {
      return { shared: false, reason: (e as Error).message };
    }
  }
  return { shared: false, reason: "not-supported" };
}

/** Fallback modal — shown when navigator.share is unavailable. */
export default function InviteFallback({ userName, fallbackOpen, onCloseFallback }: Pick<Props, "userName" | "fallbackOpen" | "onCloseFallback">) {
  const [copied, setCopied] = useState(false);
  const url = getInviteUrl(userName);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  if (!fallbackOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center anim-fade"
         style={{ background: "rgba(45,45,45,0.45)" }} onClick={onCloseFallback}>
      <div onClick={(e) => e.stopPropagation()}
           className="w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-5 anim-slide-up">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[15px] font-bold" style={{ color: C.sageDark }}>Share Nudgr</div>
          <button onClick={onCloseFallback} className="text-base" style={{ color: C.muted }}>×</button>
        </div>
        <input readOnly value={url}
               className="w-full px-3 py-2.5 rounded-xl text-[12px] font-mono outline-none mb-2"
               style={{ background: C.bg, border: `1px solid ${C.faint}`, color: C.charcoal }} />
        <button onClick={copy}
                className="w-full h-11 rounded-xl text-[13px] font-bold text-white mb-2"
                style={{ background: C.sage }}>
          {copied ? "Copied ✓" : "Copy link"}
        </button>
        <a href={`mailto:?subject=${encodeURIComponent("Join me on Nudgr")}&body=${encodeURIComponent("I'm using Nudgr to stay accountable. Want to nudge me?\n\n" + url)}`}
           className="block text-center text-[12px] font-bold py-2" style={{ color: C.muted }}>
          Or share by email
        </a>
      </div>
    </div>
  );
}
