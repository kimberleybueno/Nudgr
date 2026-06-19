"use client";

import { useState } from "react";
import { N } from "@/lib/colors";
import { STORAGE_KEYS } from "@/lib/storage";
import { SAMPLE_USER, SAMPLE_PACTS, SAMPLE_MESSAGES } from "@/lib/seed";
import type { UserData, Pact, Message } from "@/types";

interface Props {
  user: UserData;
  setUser: React.Dispatch<React.SetStateAction<UserData>>;
  setPacts: React.Dispatch<React.SetStateAction<Pact[]>>;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

const APP_VERSION = "0.2.0";

export default function SettingsTab({ user, setUser, setPacts, setMessages }: Props) {
  const [editName, setEditName] = useState(false);
  const [editGoal, setEditGoal] = useState(false);
  const [nameDraft, setNameDraft] = useState(user.name);
  const [goalDraft, setGoalDraft] = useState(user.primaryGoalTitle ?? "");
  const [dailyReminder, setDailyReminder] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (text: string) => {
    setToast(text);
    setTimeout(() => setToast(null), 2200);
  };

  const saveName = () => {
    const v = nameDraft.trim();
    if (v) {
      setUser((u) => ({ ...u, name: v }));
      setEditName(false);
      showToast("Name updated");
    }
  };

  const saveGoal = () => {
    const v = goalDraft.trim();
    if (v) {
      setUser((u) => ({ ...u, primaryGoalTitle: v }));
      setEditGoal(false);
      showToast("Primary goal updated");
    }
  };

  const exportData = () => {
    const dump = {
      [STORAGE_KEYS.user]: user,
      [STORAGE_KEYS.pacts]: (typeof window !== "undefined" && window.localStorage.getItem(STORAGE_KEYS.pacts)) || "[]",
      [STORAGE_KEYS.messages]: (typeof window !== "undefined" && window.localStorage.getItem(STORAGE_KEYS.messages)) || "[]",
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(dump, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nudgr-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Backup downloaded");
  };

  const loadSample = () => {
    if (!confirm("This will replace your current Pacts and Circle with sample data. Continue?")) return;
    setUser({ ...SAMPLE_USER, name: user.name || SAMPLE_USER.name, onboardedAt: user.onboardedAt ?? new Date().toISOString() });
    setPacts(SAMPLE_PACTS);
    setMessages(SAMPLE_MESSAGES);
    showToast("Sample data loaded");
  };

  const resetApp = () => {
    if (!confirm("This will delete all your data. This cannot be undone.")) return;
    Object.values(STORAGE_KEYS).forEach((k) => window.localStorage.removeItem(k));
    window.location.reload();
  };

  return (
    <div className="anim-up pb-6">
      <div className="px-5 pt-12 pb-4">
        <p className="text-[10px] font-semibold tracking-[0.1em]" style={{ color: N.inkSoft }}>PREFERENCES</p>
        <h1 className="text-[24px] font-light mt-1" style={{ color: N.ink }}>Settings</h1>
      </div>

      {/* Profile */}
      <Section label="Profile">
        <Row
          label="Display name"
          value={user.name || "—"}
          onClick={() => { setNameDraft(user.name); setEditName(true); }}
        />
        <Row
          label="Primary goal"
          value={user.primaryGoalTitle || "—"}
          onClick={() => { setGoalDraft(user.primaryGoalTitle ?? ""); setEditGoal(true); }}
        />
      </Section>

      {/* Notifications */}
      <Section label="Notifications">
        <ToggleRow
          label="Daily reminder"
          on={dailyReminder}
          onChange={setDailyReminder}
        />
        <p className="px-5 py-2 text-[11px] italic" style={{ color: N.inkSoft }}>
          Push reminders coming soon. We&apos;ll let you know.
        </p>
      </Section>

      {/* Data */}
      <Section label="Data">
        <Row label="Export my data" hint="Download a JSON backup" onClick={exportData} />
        <Row label="Load sample data" hint="See the app populated" onClick={loadSample} />
        <Row label="Reset app" hint="Delete all data" onClick={resetApp} danger />
      </Section>

      {/* About */}
      <Section label="About">
        <Row label="Version" value={`v${APP_VERSION}`} />
        <Row
          label="Privacy Policy"
          onClick={() => window.open("https://mynudgr.com/privacy", "_blank", "noopener")}
        />
        <Row
          label="Terms of Service"
          onClick={() => window.open("https://mynudgr.com/terms", "_blank", "noopener")}
        />
        <Row
          label="Send feedback"
          onClick={() => { window.location.href = "mailto:kimberley@buenoschonigconsulting.com?subject=Nudgr%20beta%20feedback"; }}
        />
      </Section>

      {/* Edit name modal */}
      {editName && (
        <EditModal
          title="Edit display name"
          onCancel={() => setEditName(false)}
          onSave={saveName}
          canSave={nameDraft.trim().length > 0}
        >
          <input
            autoFocus
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") saveName(); }}
            placeholder="Your name"
            className="w-full px-4 py-3 rounded-xl text-[15px] outline-none"
            style={{ background: N.cream, border: `1.5px solid ${N.line}`, color: N.ink }}
          />
        </EditModal>
      )}

      {editGoal && (
        <EditModal
          title="Edit primary goal"
          onCancel={() => setEditGoal(false)}
          onSave={saveGoal}
          canSave={goalDraft.trim().length > 0}
        >
          <input
            autoFocus
            value={goalDraft}
            onChange={(e) => setGoalDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") saveGoal(); }}
            placeholder="My primary goal"
            className="w-full px-4 py-3 rounded-xl text-[15px] outline-none"
            style={{ background: N.cream, border: `1.5px solid ${N.line}`, color: N.ink }}
          />
        </EditModal>
      )}

      {toast && (
        <div
          className="fixed left-1/2 bottom-24 z-[110] px-4 py-2 rounded-full text-[12px] font-bold text-white anim-fade"
          style={{ background: N.sageDeep, transform: "translateX(-50%)" }}
        >{toast}</div>
      )}
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <div className="px-5 pb-1.5 text-[10px] font-bold tracking-wide" style={{ color: N.inkSoft }}>
        {label.toUpperCase()}
      </div>
      <div className="bg-white" style={{ borderTop: `1px solid ${N.line}`, borderBottom: `1px solid ${N.line}` }}>
        {children}
      </div>
    </section>
  );
}

function Row({ label, value, hint, onClick, danger }: {
  label: string; value?: string; hint?: string; onClick?: () => void; danger?: boolean;
}) {
  const inner = (
    <div className="flex items-center justify-between px-5 py-3.5">
      <div>
        <div className="text-[14px] font-semibold" style={{ color: danger ? "#A8483A" : N.ink }}>
          {label}
        </div>
        {hint && <div className="text-[11px] mt-0.5" style={{ color: N.inkSoft }}>{hint}</div>}
      </div>
      <div className="flex items-center gap-2">
        {value && <span className="text-[13px]" style={{ color: N.inkSoft }}>{value}</span>}
        {onClick && <span className="text-[14px]" style={{ color: N.inkSoft }}>›</span>}
      </div>
    </div>
  );
  return onClick ? (
    <button onClick={onClick} className="w-full text-left" style={{ borderBottom: `1px solid ${N.line}` }}>
      {inner}
    </button>
  ) : (
    <div style={{ borderBottom: `1px solid ${N.line}` }}>{inner}</div>
  );
}

function ToggleRow({ label, on, onChange }: { label: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: `1px solid ${N.line}` }}>
      <span className="text-[14px] font-semibold" style={{ color: N.ink }}>{label}</span>
      <button
        onClick={() => onChange(!on)}
        aria-pressed={on}
        className="relative w-11 h-6 rounded-full transition-colors"
        style={{ background: on ? N.sage : N.line }}
      >
        <span
          className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform"
          style={{ transform: on ? "translateX(20px)" : "none", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }}
        />
      </button>
    </div>
  );
}

function EditModal({
  title, onCancel, onSave, canSave, children,
}: { title: string; onCancel: () => void; onSave: () => void; canSave: boolean; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center anim-fade" style={{ background: "rgba(45,45,45,0.45)" }} onClick={onCancel}>
      <div onClick={(e) => e.stopPropagation()}
           className="w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-5 anim-slide-up">
        <div className="text-[15px] font-bold mb-3" style={{ color: N.sageDeep }}>{title}</div>
        {children}
        <div className="flex gap-2 mt-4">
          <button onClick={onCancel}
                  className="flex-1 h-11 rounded-xl text-[13px] font-bold"
                  style={{ background: N.cream, color: N.inkSoft, border: `1px solid ${N.line}` }}>Cancel</button>
          <button onClick={onSave} disabled={!canSave}
                  className="flex-1 h-11 rounded-xl text-[13px] font-bold text-white disabled:opacity-40"
                  style={{ background: N.sageDeep }}>Save</button>
        </div>
      </div>
    </div>
  );
}
