"use client";

import { useState } from "react";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { STORAGE_KEYS } from "@/lib/storage";
import { EMPTY_USER, EMPTY_PACTS, EMPTY_MESSAGES } from "@/lib/seed";
import type { TabId, UserData, Pact, Message, Goal } from "@/types";

import BottomNav from "./BottomNav";
import SideNav from "./SideNav";
import HomeTab from "./HomeTab";
import PeopleTab from "./PeopleTab";
import SettingsTab from "./SettingsTab";
import OnboardingGate from "./OnboardingGate";
import UpdateBanner from "./UpdateBanner";

export default function Shell() {
  const { isDesktop } = useBreakpoint();
  const [tab, setTab] = useState<TabId>("home");

  const [user, setUser] = useLocalStorage<UserData>(STORAGE_KEYS.user, EMPTY_USER);
  const [pacts, setPacts]       = useLocalStorage<Pact[]>(STORAGE_KEYS.pacts, EMPTY_PACTS);
  const [messages, setMessages] = useLocalStorage<Message[]>(STORAGE_KEYS.messages, EMPTY_MESSAGES);

  const completeOnboarding = (name: string, primaryGoal: string) => {
    const nowIso = new Date().toISOString();
    const newGoalId = `g_${Math.random().toString(36).slice(2, 8)}`;
    const newGoal: Goal = {
      id: newGoalId,
      emoji: "🎯",
      name: primaryGoal,
      color: "#7A9E7E",
      deadline: "",
      deadlineDate: "",
      tasks: [],
    };
    setUser({
      ...EMPTY_USER,
      name,
      primaryGoalTitle: primaryGoal,
      onboardedAt: nowIso,
      goals: [newGoal],
    });
  };

  // Gate: until onboarded, show the OnboardingGate over everything.
  if (!user.onboardedAt) {
    return <OnboardingGate onComplete={completeOnboarding} />;
  }

  return (
    <div className="min-h-screen" style={{ background: "#F4F8F4" }}>
      <UpdateBanner />

      {isDesktop && <SideNav active={tab} onChange={setTab} />}

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
              user={user}
              setUser={setUser}
              isDesktop={isDesktop}
            />
          )}

          {tab === "settings" && (
            <SettingsTab
              user={user}
              setUser={setUser}
              setPacts={setPacts}
              setMessages={setMessages}
            />
          )}
        </main>
      </div>

      {!isDesktop && <BottomNav active={tab} onChange={setTab} />}
    </div>
  );
}
