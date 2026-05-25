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
import PeopleTab from "./PeopleTab";
import PlaceholderTab from "./PlaceholderTab";

export default function Shell() {
  const { isDesktop } = useBreakpoint();
  const [tab, setTab] = useState<TabId>("home");

  // v2 model — drives Home today.
  const [user, setUser] = useLocalStorage<UserData>(STORAGE_KEYS.user, SEED_USER);

  // Pacts + Messages — drive the People tab.
  const [pacts, setPacts]       = useLocalStorage<Pact[]>(STORAGE_KEYS.pacts, SEED_PACTS);
  const [messages, setMessages] = useLocalStorage<Message[]>(STORAGE_KEYS.messages, SEED_MESSAGES);

  return (
    <div className="min-h-screen" style={{ background: "#F4F8F4" }}>
      {isDesktop && <SideNav active={tab} onChange={setTab} />}

      {/*
        Mobile: full-width column up to 460px (phone-sized), bottom nav.
        Desktop: sidebar offset, content fills width up to 1200px,
                 multi-column layouts within each tab.
      */}
      <div className="lg:pl-[72px]">
        <main
          className="w-full mx-auto"
          style={{
            maxWidth: isDesktop ? 1200 : 460,
            paddingBottom: isDesktop ? 0 : 88,
            minHeight: "100vh",
          }}
        >
          {tab === "home" && <HomeTab user={user} setUser={setUser} isDesktop={isDesktop} />}

          {tab === "people" && (
            <PeopleTab
              pacts={pacts}
              setPacts={setPacts}
              messages={messages}
              setMessages={setMessages}
              goals={user.goals}
              goalPartners={user.partners}
              userName={user.name}
              isDesktop={isDesktop}
            />
          )}

          {tab === "settings" && (
            <PlaceholderTab
              emoji="⚙️"
              title="Settings"
              blurb="Name, notifications, theme, and account preferences live here."
            />
          )}
        </main>
      </div>

      {!isDesktop && <BottomNav active={tab} onChange={setTab} />}
    </div>
  );
}
