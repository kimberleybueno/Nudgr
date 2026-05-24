"use client";

import { useState } from "react";
import { C } from "@/lib/colors";

const CONTACTS = [
  { name: "Maya Patel", ini: "M", col: "#C4A98A" },
  { name: "Jordan Lee", ini: "J", col: "#7A9E7E" },
  { name: "Sara Kim", ini: "S", col: "#97B099" },
  { name: "Tom Reed", ini: "T", col: "#D4845A" },
  { name: "Alex Cho", ini: "A", col: "#6B4A8A" },
];

export default function InviteFriends({ userName }: { userName: string }) {
  const link = `app.mynudgr.com/invite/${encodeURIComponent(userName)}`;
  const [copied, setCopied] = useState(false);
  const [invited, setInvited] = useState<string[]>([]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`https://${link}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked */
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl p-4 text-white"
           style={{ background: `linear-gradient(165deg, ${C.sageDark}, ${C.sage})` }}>
        <div className="text-[11px] font-bold tracking-wide opacity-65">YOUR INVITE LINK</div>
        <div className="text-[13px] font-mono mt-1 mb-3 truncate">{link}</div>
        <div className="flex gap-2">
          <button onClick={copy}
                  className="flex-1 h-10 rounded-xl text-[12px] font-bold"
                  style={{ background: "rgba(255,255,255,0.22)", color: "#fff" }}>
            {copied ? "Copied!" : "Copy link"}
          </button>
          <button className="flex-1 h-10 rounded-xl text-[12px] font-bold"
                  style={{ background: "#fff", color: C.sageDark }}>Share</button>
        </div>
      </div>

      <div>
        <div className="text-[11px] font-bold tracking-wide mb-2" style={{ color: C.muted }}>FROM CONTACTS</div>
        <div className="flex flex-col gap-1.5">
          {CONTACTS.map((c) => {
            const sent = invited.includes(c.name);
            return (
              <div key={c.name} className="flex items-center gap-3 p-2.5 rounded-2xl"
                   style={{ background: "#fff", border: `1px solid ${C.faint}` }}>
                <span className="w-9 h-9 rounded-full text-xs font-bold flex items-center justify-center text-white"
                      style={{ background: c.col }}>{c.ini}</span>
                <span className="text-[13px] font-bold flex-1" style={{ color: C.charcoal }}>{c.name}</span>
                <button onClick={() => setInvited((cur) => [...cur, c.name])}
                        disabled={sent}
                        className="px-3 h-8 rounded-full text-[11px] font-bold"
                        style={{
                          background: sent ? C.bg : C.sage,
                          color: sent ? C.muted : "#fff",
                          border: sent ? `1px solid ${C.faint}` : "none",
                        }}>
                  {sent ? "Sent ✓" : "Invite"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
