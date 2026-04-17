"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { RiskPill } from "@/components/liquidity/RiskPill";
import { mockPools, type LiquidityPoolRow } from "@/lib/liquidity/mockPools";
import { cn } from "@/components/ui/cn";

type Recommendation = {
  bestPool: string;
  reason: string;
};

export function AiLiquidityAdvisor() {
  const [loading, setLoading] = useState(false);
  const [rec, setRec] = useState<Recommendation | null>(null);
  const [error, setError] = useState<string | null>(null);

  const bestByApy = useMemo(() => {
    return [...mockPools].sort((a, b) => b.apyRange.max - a.apyRange.max)[0] as LiquidityPoolRow;
  }, []);

  async function onRecommend() {
    setRec(null);
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/liquidity-advice", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          pools: mockPools.map((p) => ({
            name: p.name,
            apyRange: p.apyRange,
            risk: p.risk,
            explanation: p.explanation
          }))
        })
      });
      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || "Failed to get advice");
      }
      const data = (await res.json()) as { bestPool: string; reason: string };
      setRec({ bestPool: data.bestPool, reason: data.reason });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to get advice");
      // Keep UI usable even if the API fails
      setRec({
        bestPool: bestByApy.name,
        reason: `For moderate risk, ${bestByApy.name} is a reasonable default. Estimated APY: ${bestByApy.apyRange.min}%–${bestByApy.apyRange.max}%. Risk: ${bestByApy.risk}.`
      });
    } finally {
      setLoading(false);
    }
  }

  const bestPoolId = useMemo(() => {
    if (!rec?.bestPool) return null;
    const match = mockPools.find((p) => p.name.toLowerCase() === rec.bestPool.toLowerCase());
    return match?.id ?? null;
  }, [rec]);

  return (
    <div className="mx-auto w-full max-w-5xl">
      <Card>
        <div className="flex items-start justify-between gap-4">
          <div>
            <Card.Title>Liquidity Pools</Card.Title>
            <Card.Description>Mock dataset with DeFi dashboard styling.</Card.Description>
          </div>
          <Button onClick={onRecommend} disabled={loading}>
            {loading ? "Thinking..." : "Get AI Recommendation"}
          </Button>
        </div>

        {error && <div className="mt-4 text-xs text-white/50">{error}</div>}

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="text-xs text-white/60">
              <tr className="border-b border-white/10">
                <th className="py-2 pr-4 font-medium">Pool</th>
                <th className="py-2 pr-4 font-medium">APY</th>
                <th className="py-2 pr-4 font-medium">Risk</th>
                <th className="py-2 pr-4 font-medium">Why</th>
              </tr>
            </thead>
            <tbody className="text-white/85">
              {mockPools.map((p) => (
                <tr
                  key={p.id}
                  className={cn(
                    "border-b border-white/10",
                    bestPoolId === p.id ? "bg-cyan-400/10" : undefined
                  )}
                >
                  <td className="py-3 pr-4 font-medium text-white">{p.name}</td>
                  <td className="py-3 pr-4">
                    <span className="inline-flex items-center rounded-lg border border-cyan-400/15 bg-cyan-400/10 px-2.5 py-1 text-xs font-semibold text-cyan-100">
                      Estimated APY: {p.apyRange.min}% – {p.apyRange.max}%
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <RiskPill risk={p.risk} />
                  </td>
                  <td className="py-3 pr-4 text-sm text-white/70">{p.explanation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-xs text-white/50">
          APY is dynamic and depends on trading volume, liquidity, and rewards.
        </div>

        {rec && (
          <div className="mt-5 rounded-2xl border border-white/10 bg-black/10 p-4">
            <div className="text-sm font-semibold text-white">Best pool: {rec.bestPool}</div>
            <div className="mt-1 text-sm text-white/70">{rec.reason}</div>
          </div>
        )}
      </Card>
    </div>
  );
}

