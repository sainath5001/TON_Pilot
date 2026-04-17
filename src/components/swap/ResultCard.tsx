"use client";

import type { SwapRecommendation } from "@/lib/stonfi/types";
import { cn } from "@/components/ui/cn";

const styles: Record<SwapRecommendation["action"], { badge: string; card: string; title: string }> = {
  swap: {
    badge: "bg-emerald-400/15 text-emerald-200 border-emerald-400/20",
    card: "border-emerald-400/20",
    title: "text-emerald-200"
  },
  wait: {
    badge: "bg-amber-400/15 text-amber-200 border-amber-400/20",
    card: "border-amber-400/20",
    title: "text-amber-200"
  }
};

export function ResultCard({ result }: { result: SwapRecommendation }) {
  const s = styles[result.action];

  return (
    <div className={cn("rounded-2xl border bg-white/5 p-5 backdrop-blur", s.card)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold", s.badge)}>
            Recommendation
          </div>
          <div className={cn("mt-3 text-lg font-semibold", s.title)}>
            {result.action === "swap" ? "Swap now" : "Wait"}
          </div>
          <div className="mt-1 text-sm text-white/70">Confidence: {result.confidence}</div>
        </div>
      </div>
      <div className="mt-4 text-sm text-white/75">{result.reason}</div>
    </div>
  );
}

