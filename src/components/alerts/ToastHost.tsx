"use client";

import { useEffect } from "react";
import { cn } from "@/components/ui/cn";
import type { AlertEvent } from "@/lib/alerts/types";

export type Toast = AlertEvent & { dismissAfterMs?: number };

export function ToastHost({
  toasts,
  onDismiss
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  useEffect(() => {
    const timers = toasts
      .filter((t) => (t.dismissAfterMs ?? 6000) > 0)
      .map((t) => {
        const ms = t.dismissAfterMs ?? 6000;
        return setTimeout(() => onDismiss(t.id), ms);
      });
    return () => timers.forEach(clearTimeout);
  }, [toasts, onDismiss]);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 w-[360px] max-w-[calc(100vw-2rem)] space-y-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "pointer-events-auto rounded-2xl border bg-black/40 p-4 backdrop-blur",
            t.type === "price_drop" ? "border-amber-400/20" : "border-red-400/20"
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-white">{t.title}</div>
              <div className="mt-1 text-sm text-white/70">{t.message}</div>
              <div className="mt-2 text-xs text-white/45">{new Date(t.ts).toLocaleTimeString()}</div>
            </div>
            <button
              type="button"
              onClick={() => onDismiss(t.id)}
              className="rounded-lg px-2 py-1 text-xs text-white/60 hover:bg-white/10 hover:text-white"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

