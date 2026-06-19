"use client";

import { useState, useRef, useEffect } from "react";
import { N, HERO_GRADIENT } from "@/lib/colors";

interface Props {
  onComplete: (name: string, primaryGoal: string) => void;
}

const PRESETS = [
  "Marathon training",
  "Launch my app",
  "Read more",
  "Save money",
  "Learn a language",
  "Get fit",
];

export default function OnboardingGate({ onComplete }: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const nameRef = useRef<HTMLInputElement>(null);
  const goalRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === 1) nameRef.current?.focus();
    else goalRef.current?.focus();
  }, [step]);

  const nameValid = name.trim().length > 0;
  const goalValid = goal.trim().length > 0;

  const submit = async () => {
    if (!nameValid || !goalValid) return;
    setSubmitting(true);
    setErr(null);
    try {
      await Promise.resolve();
      onComplete(name.trim(), goal.trim());
    } catch {
      setErr("Couldn't save. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col anim-fade"
      style={{ background: N.cream }}
    >
      {/* Brand mark */}
      <div className="flex justify-center pt-12 pb-2">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-[28px] font-bold"
          style={{ background: HERO_GRADIENT, fontFamily: "var(--font-sans)" }}
        >n</div>
      </div>

      <div className="flex-1 flex flex-col items-center px-6 pt-6 pb-10 max-w-[440px] w-full mx-auto">
        {step === 1 ? (
          <>
            <h1 className="text-[26px] font-bold text-center" style={{ color: N.sageDeep }}>
              Welcome to Nudgr
            </h1>
            <p className="text-[14px] text-center mt-2 mb-7" style={{ color: N.inkSoft }}>
              Let&apos;s start with your name.
            </p>

            <label className="w-full">
              <span className="block text-[11px] font-bold tracking-wide mb-1.5" style={{ color: N.inkSoft }}>
                YOUR NAME
              </span>
              <input
                ref={nameRef}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && nameValid) setStep(2); }}
                placeholder="Kimberley"
                className="w-full px-4 py-3.5 rounded-2xl text-[16px] outline-none"
                style={{
                  background: "#fff",
                  border: `1.5px solid ${name ? N.tan : N.line}`,
                  color: N.ink,
                }}
                autoComplete="given-name"
              />
              <span className="block text-[11px] mt-1.5" style={{ color: N.inkSoft }}>
                This is how you&apos;ll appear to your Circle and Pacts.
              </span>
            </label>

            <div className="flex-1" />

            <button
              onClick={() => setStep(2)}
              disabled={!nameValid}
              className="w-full h-12 rounded-2xl text-[14px] font-bold text-white disabled:opacity-40"
              style={{ background: N.sageDeep }}
            >
              Continue
            </button>
            <div className="text-[10px] font-bold tracking-wide mt-4" style={{ color: N.inkSoft }}>
              STEP 1 OF 2
            </div>
          </>
        ) : (
          <>
            <h1 className="text-[26px] font-bold text-center" style={{ color: N.sageDeep }}>
              What are you working on?
            </h1>
            <p className="text-[14px] text-center mt-2 mb-7" style={{ color: N.inkSoft }}>
              Pick one goal to start with. You can add more later.
            </p>

            <label className="w-full">
              <span className="block text-[11px] font-bold tracking-wide mb-1.5" style={{ color: N.inkSoft }}>
                MY PRIMARY GOAL
              </span>
              <input
                ref={goalRef}
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && goalValid) submit(); }}
                placeholder="Run a marathon, launch my app, read more..."
                className="w-full px-4 py-3.5 rounded-2xl text-[16px] outline-none"
                style={{
                  background: "#fff",
                  border: `1.5px solid ${goal ? N.tan : N.line}`,
                  color: N.ink,
                }}
              />
              <span className="block text-[11px] mt-1.5" style={{ color: N.inkSoft }}>
                We&apos;ll set this up as your first goal.
              </span>
            </label>

            <div className="flex flex-wrap gap-1.5 mt-4 w-full">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  onClick={() => setGoal(p)}
                  className="px-3 py-2 rounded-full text-[12px] font-semibold"
                  style={{
                    background: goal === p ? N.sage : "transparent",
                    color: goal === p ? "#fff" : N.tan,
                    border: `1px solid ${goal === p ? N.sage : N.tan}`,
                  }}
                >{p}</button>
              ))}
            </div>

            <div className="flex-1" />

            {err && (
              <div className="text-[12px] text-center mb-3" style={{ color: "#A8483A" }}>{err}</div>
            )}
            <button
              onClick={submit}
              disabled={!goalValid || submitting}
              className="w-full h-12 rounded-2xl text-[14px] font-bold text-white disabled:opacity-40"
              style={{ background: N.sageDeep }}
            >
              {submitting ? "Saving..." : "Start using Nudgr"}
            </button>
            <button
              onClick={() => setStep(1)}
              className="text-[12px] font-semibold mt-3"
              style={{ color: N.inkSoft }}
            >Back</button>
            <div className="text-[10px] font-bold tracking-wide mt-4" style={{ color: N.inkSoft }}>
              STEP 2 OF 2
            </div>
          </>
        )}
      </div>
    </div>
  );
}
