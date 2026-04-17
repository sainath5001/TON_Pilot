"use client";

import { cn } from "@/components/ui/cn";
import type { RiskLevel } from "@/lib/liquidity/mockPools";

const styles: Record<RiskLevel, string> = {
  Low: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
  Medium: "border-amber-400/20 bg-amber-400/10 text-amber-200",
  High: "border-red-400/20 bg-red-400/10 text-red-200"
};

export function RiskPill({ risk }: { risk: RiskLevel }) {
  return (
    <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold", styles[risk])}>
      {risk}
    </span>
  );
}

