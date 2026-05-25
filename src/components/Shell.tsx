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
    <div
      className="min-h-screen"
      style={{ background: isDesktop ? "#E2EAE3" : "#F4F8F4" }}
    >
      {isDesktop && <SideNav active={tab} onChange={setTab} />}

      {/* On mobile: full-width column. On desktop: centered phone-shaped card with sidebar on the left. */}
      <div className="lg:pl-[72px] flex justify-center lg:py-6">
        <main
          className="w-full mx-auto lg:rounded-[28px] lg:overflow-hidden"
          style={{
            maxWidth: 460,
            background: "#F4F8F4",
            paddingBottom: isDesktop ? 24 : 88,
            minHeight: isDesktop ? "calc(100vh - 48px)" : "100vh",
            boxShadow: isDesktop
              ? "0 12px 40px rgba(45, 60, 47, 0.12), 0 2px 6px rgba(45, 60, 47, 0.05)"
              : "none",
          }}
        >
          {tab === "home" && <HomeTab user={user} setUser={setUser} />}

          {tab === "people" && (
            <PeopleTab
              pacts={pacts}
              setPacts={setPacts}
              messages={messages}
              setMessages={setMessages}
              goals={user.goals}
              goalPartners={user.partners}
              userName={user.name}
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
