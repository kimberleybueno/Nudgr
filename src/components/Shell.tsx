"use client";

import { useState } from "react";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { STORAGE_KEYS } from "@/lib/storage";
import { SEED_USER, SEED_PACTS, SEED_MESSAGES } from "@/lib/seed";
import type { TabId, UserData, Pact, Message } from "@/types";

import BottomNav from "./BottomNav";
import SideNav from "./SideNav";
import HomeTab from "./HomeTab";
import PlaceholderTab from "./PlaceholderTab";

export default function Shell() {
  const { isDesktop } = useBreakpoint();
  const [tab, setTab] = useState<TabId>("home");

  // Active model (v2) — drives Home today.
  const [user, setUser] = useLocalStorage<UserData>(STORAGE_KEYS.user, SEED_USER);

  // PRESERVED (v1) — loaded + persisted so the eventual Pacts / Circle tabs
  // pick up real data. Not surfaced anywhere yet but they survive page reloads
  // and round-trip through localStorage.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_pacts, _setPacts]       = useLocalStorage<Pact[]>(STORAGE_KEYS.pacts, SEED_PACTS);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_messages, _setMessages] = useLocalStorage<Message[]>(STORAGE_KEYS.messages, SEED_MESSAGES);

  return (
    <div className="min-h-screen" style={{ background: "#F4F8F4" }}>
      {isDesktop && <SideNav active={tab} onChange={setTab} />}

      <main className="max-w-[440px] mx-auto pb-[88px] lg:ml-[72px] lg:max-w-[640px] lg:pb-6">
        {tab === "home"     && <HomeTab user={user} setUser={setUser} />}
        {tab === "pacts"    && <PlaceholderTab emoji="💬" title="Pacts"
                                  blurb="Group accountability with friends. Share progress, check in, and celebrate streaks together." />}
        {tab === "circle"   && <PlaceholderTab emoji="🤝" title="Circle"
                                  blurb="The people who have your back. Accountability partners, nudges, and shared goals all in one place." />}
        {tab === "settings" && <PlaceholderTab emoji="⚙️" title="Settings"
                                  blurb="Name, notifications, theme, and account preferences live here." />}
      </main>

      {!isDesktop && <BottomNav active={tab} onChange={setTab} />}
    </div>
  );
}
