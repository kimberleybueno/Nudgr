"use client";

import { useState } from "react";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { STORAGE_KEYS } from "@/lib/storage";
import { SEED_TODOS, SEED_GOALS, SEED_PACTS, SEED_MESSAGES } from "@/lib/seed";
import type { TabId, Todo, Goal, Pact, Message } from "@/types";

import BottomNav from "./BottomNav";
import SideNav from "./SideNav";
import Overlay from "./Overlay";
import HomeTab from "./HomeTab";
import PactsTab from "./PactsTab";
import CircleTab from "./CircleTab";
import ProfileTab from "./ProfileTab";
import CreateGoal from "./CreateGoal";

export default function Shell() {
  const { isDesktop } = useBreakpoint();
  const [tab, setTab] = useState<TabId>("home");
  const [creating, setCreating] = useState(false);

  const [todos, setTodos]       = useLocalStorage<Todo[]>(STORAGE_KEYS.todos, SEED_TODOS);
  const [goals, setGoals]       = useLocalStorage<Goal[]>(STORAGE_KEYS.goals, SEED_GOALS);
  const [pacts, setPacts]       = useLocalStorage<Pact[]>(STORAGE_KEYS.pacts, SEED_PACTS);
  const [messages, setMessages] = useLocalStorage<Message[]>(STORAGE_KEYS.messages, SEED_MESSAGES);
  const [userName, setUserName] = useLocalStorage<string>(STORAGE_KEYS.userName, "friend");

  return (
    <div className="min-h-screen" style={{ background: "#F4F8F4" }}>
      {isDesktop && <SideNav active={tab} onChange={setTab} onCreate={() => setCreating(true)} />}

      <main className="max-w-[640px] mx-auto pb-[88px] lg:pb-0 lg:max-w-none lg:ml-[72px]">
        <div key={tab} className="anim-up">
          {tab === "home" && (
            <HomeTab
              todos={todos} setTodos={setTodos}
              goals={goals} setGoals={setGoals}
              pacts={pacts} setPacts={setPacts}
              messages={messages} setMessages={setMessages}
              userName={userName}
              onCreate={() => setCreating(true)}
              onOpenPacts={() => setTab("pacts")}
            />
          )}
          {tab === "pacts" && (
            <PactsTab
              pacts={pacts} setPacts={setPacts}
              messages={messages} setMessages={setMessages}
            />
          )}
          {tab === "circle" && (
            <CircleTab goals={goals} pacts={pacts} messages={messages} setMessages={setMessages} />
          )}
          {tab === "profile" && (
            <ProfileTab goals={goals} pacts={pacts} userName={userName} setUserName={setUserName} />
          )}
        </div>
      </main>

      {!isDesktop && <BottomNav active={tab} onChange={setTab} onCreate={() => setCreating(true)} />}

      <Overlay open={creating} onClose={() => setCreating(false)} title="New goal" side={isDesktop}>
        <CreateGoal
          goals={goals}
          onCreate={(g) => { setGoals((cur) => [g, ...cur]); setCreating(false); }}
          onCancel={() => setCreating(false)}
        />
      </Overlay>
    </div>
  );
}
