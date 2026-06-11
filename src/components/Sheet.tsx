"use client";

import { useEffect } from "react";
import { N } from "@/lib/colors";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Optional secondary line under the title */
  subtitle?: string;
  children: React.ReactNode;
  /** When true, render as a centered 440px desktop modal. Defaults to mobile bottom sheet. */
  isDesktop?: boolean;
}

/**
 * Sheet primitive per design_handoff_nudgr_app/README.md sec 15.
 *
 *   Mobile: bottom sheet, cream-card, 26px top radius, grabber, slide-up.
 *   Desktop: 440px centered modal over a dark scrim, fade-in.
 *
 * Esc closes. Body scroll is locked while open. Used by all three pickers.
 */
export default function Sheet({ open, onClose, title, subtitle, children, isDesktop = false }: Props) {
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
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
      className="fixed inset-0 z-50 flex"
      style={{
        background: "rgba(47, 74, 53, 0.42)",
        backdropFilter: "blur(2px)",
        WebkitBackdropFilter: "blur(2px)",
        alignItems: isDesktop ? "center" : "flex-end",
        justifyContent: "center",
        animation: "sheet-fade 0.18s ease both",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full"
        style={{
          background: N.creamCard,
          boxShadow: N.shadow,
          maxWidth: isDesktop ? 440 : "100%",
          borderRadius: isDesktop ? 20 : "26px 26px 0 0",
          padding: 0,
          overflow: "hidden",
          animation: isDesktop ? "sheet-pop 0.22s ease both" : "sheet-slide 0.28s cubic-bezier(0.2, 0.8, 0.2, 1) both",
          maxHeight: isDesktop ? "calc(100vh - 48px)" : "85vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Grabber on mobile */}
        {!isDesktop && (
          <div className="flex justify-center pt-2.5 pb-1.5">
            <span
              aria-hidden="true"
              className="block rounded-full"
              style={{ width: 36, height: 4, background: N.lineStrong }}
            />
          </div>
        )}

        {/* Header */}
        <div
          className="flex items-start justify-between"
          style={{ padding: isDesktop ? "20px 22px 6px" : "8px 22px 4px" }}
        >
          <div className="min-w-0">
            <h2
              className="font-display"
              style={{
                fontSize: 20,
                fontWeight: 600,
                color: N.ink,
                letterSpacing: "-0.01em",
                lineHeight: 1.2,
              }}
            >
              {title}
            </h2>
            {subtitle && (
              <p style={{ fontSize: 13, color: N.inkSoft, marginTop: 4 }}>{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 flex items-center justify-center rounded-full"
            style={{
              width: 32,
              height: 32,
              background: "transparent",
              color: N.inkSoft,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div style={{ padding: "8px 22px 22px", overflowY: "auto" }}>
          {children}
        </div>
      </div>

      <style>{`
        @keyframes sheet-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes sheet-slide { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes sheet-pop {
          from { opacity: 0; transform: translateY(6px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)  scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          [role="dialog"] > div { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
