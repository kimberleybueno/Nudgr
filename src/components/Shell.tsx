"use client";

import { useState } from "react";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { STORAGE_KEYS } from "@/lib/storage";
import { EMPTY_USER, EMPTY_PACTS, EMPTY_MESSAGES } from "@/lib/seed";
import { todayIso } from "@/lib/dates";
import type { TabId, UserData, Pact, Message, Goal, Task } from "@/types";

import BottomNav from "./BottomNav";
import SideNav from "./SideNav";
import HomeTab from "./HomeTab";
import PeopleTab from "./PeopleTab";
import SettingsTab from "./SettingsTab";
import VoiceScreen from "./VoiceScreen";
import OnboardingGate from "./OnboardingGate";
import UpdateBanner from "./UpdateBanner";

/**
 * Top-level app shell.
 *
 * Tab structure follows handoff sec 16: Goals, Pacts, Speak (action),
 * Crew, You. Speak opens the VoiceScreen instead of switching tabs.
 *
 * Pacts and Crew both currently render PeopleTab with a `section` prop;
 * once Pact chat (sec 12) lands, each tab will own a dedicated component.
 */
export default function Shell() {
  const { isDesktop } = useBreakpoint();
  const [tab, setTab] = useState<TabId>("goals");
  const [speakOpen, setSpeakOpen] = useState(false);

  const [user, setUser, userMeta]       = useLocalStorage<UserData>(STORAGE_KEYS.user, EMPTY_USER);
  const [pacts, setPacts]               = useLocalStorage<Pact[]>(STORAGE_KEYS.pacts, EMPTY_PACTS);
  const [messages, setMessages]         = useLocalStorage<Message[]>(STORAGE_KEYS.messages, EMPTY_MESSAGES);

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

  // Speak typed fallback: append a standalone to-do dated today.
  const addStandaloneFromSpeak = (text: string) => {
    const newTask: Task = {
      id: `t_${Math.random().toString(36).slice(2, 8)}`,
      text,
      done: false,
      star: false,
      overdue: false,
      goalId: null,
      partnerId: null,
      dueDate: todayIso(),
      recurring: null,
      createdAt: todayIso(),
    };
    setUser((u) => ({ ...u, tasks: [newTask, ...u.tasks] }));
    setTab("goals");
  };

  // Hydration splash: until the user record has been read from localStorage,
  // show a calm cream screen with the wordmark dot. Avoids the OnboardingGate
  // flashing for one paint when a returning user has data on disk.
  if (!userMeta.hydrated) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#F7F4EC" }}
        aria-label="Loading"
        role="status"
      >
        <span
          aria-hidden="true"
          className="dot-pulse block rounded-full"
          style={{
            width: 14, height: 14,
            background: "#7A9E7E",
            boxShadow: "0 0 0 5px rgba(122, 158, 126, 0.22)",
          }}
        />
      </div>
    );
  }

  // Gate: until onboarded, show the OnboardingGate over everything.
  if (!user.onboardedAt) {
    return <OnboardingGate onComplete={completeOnboarding} />;
  }

  const userInitial = (user.name?.[0] ?? "?").toUpperCase();

  return (
    <div className="min-h-screen" style={{ background: "#F4F8F4" }}>
      <UpdateBanner />

      {isDesktop && (
        <SideNav
          active={tab}
          onChange={setTab}
          onSpeak={() => setSpeakOpen(true)}
          userName={user.name}
          userInitial={userInitial}
          streak={user.streak ?? 0}
        />
      )}

      <div style={{ paddingLeft: isDesktop ? 258 : 0 }}>
        <main
          className="w-full mx-auto"
          style={{
            maxWidth: isDesktop ? 1200 : 460,
            paddingBottom: isDesktop ? 0 : 96,
            minHeight: "100vh",
          }}
        >
          {tab === "goals" && <HomeTab user={user} setUser={setUser} isDesktop={isDesktop} />}

          {tab === "pacts" && (
            <PeopleTab
              section="pacts"
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

          {tab === "crew" && (
            <PeopleTab
              section="crew"
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

          {tab === "you" && (
            <SettingsTab
              user={user}
              setUser={setUser}
              setPacts={setPacts}
              setMessages={setMessages}
            />
          )}
        </main>
      </div>

      {!isDesktop && (
        <BottomNav
          active={tab}
          onChange={setTab}
          onSpeak={() => setSpeakOpen(true)}
        />
      )}

      {speakOpen && (
        <VoiceScreen
          onClose={() => setSpeakOpen(false)}
          onAddTypedTodo={addStandaloneFromSpeak}
          isDesktop={isDesktop}
        />
      )}
    </div>
  );
}
