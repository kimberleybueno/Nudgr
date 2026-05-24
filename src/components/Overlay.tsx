"use client";

import { useEffect } from "react";
import { C } from "@/lib/colors";

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  /** Desktop: render as right-side panel instead of bottom sheet */
  side?: boolean;
  /** Max height of mobile bottom sheet */
  maxHeight?: string;
}

export default function Overlay({ open, onClose, title, children, side, maxHeight = "90vh" }: Props) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex anim-fade"
      style={{
        background: "rgba(45, 45, 45, 0.45)",
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={
          side
            ? "ml-auto h-full w-full max-w-[440px] bg-white anim-slide-up"
            : "mt-auto w-full bg-white rounded-t-[28px] anim-slide-up sm:mx-auto sm:max-w-[520px] sm:rounded-3xl sm:mb-6"
        }
        style={{ maxHeight, overflowY: "auto" }}
      >
        {!side && (
          <div className="pt-3 pb-1 flex justify-center">
            <div style={{ width: 36, height: 4, borderRadius: 2, background: C.faint }} />
          </div>
        )}
        {title && (
          <div className="px-5 pt-3 pb-2 flex items-center justify-between sticky top-0 bg-white z-10">
            <h2 className="text-[17px] font-bold" style={{ color: C.sageDark }}>{title}</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
              style={{ background: C.bg, color: C.muted }}
              aria-label="Close"
            >×</button>
          </div>
        )}
        <div className="px-5 pb-6 pt-2">{children}</div>
      </div>
    </div>
  );
}
