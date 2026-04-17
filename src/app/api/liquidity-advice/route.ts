import type { NextRequest } from "next/server";
import { getOpenAIClient } from "@/lib/ai/openai";

export const runtime = "nodejs";

type Pool = {
  name: string;
  apyRange: { min: number; max: number };
  risk: "Low" | "Medium" | "High";
  explanation?: string;
};
type Body = { pools: Pool[] };

function fallback(pools: Pool[]) {
  const pickFrom = pools.filter((p) => p.risk === "Low");
  const best = [...(pickFrom.length ? pickFrom : pools)].sort((a, b) => b.apyRange.max - a.apyRange.max)[0];
  return {
    bestPool: best?.name ?? "TON / USDT",
    reason: best
      ? `For moderate risk, ${best.name} is a balanced option with stable returns and lower impermanent loss. Estimated APY: ${best.apyRange.min}%–${best.apyRange.max}%.`
      : "For a moderate-risk profile, choose a medium-risk pool with strong APY and deep liquidity."
  };
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body || !Array.isArray(body.pools) || body.pools.length === 0) {
    return new Response("Missing pools[]", { status: 400 });
  }

  const pools = body.pools
    .map((p) => ({
      name: String(p.name ?? "").trim(),
      apyRange: { min: Number(p.apyRange?.min), max: Number(p.apyRange?.max) },
      risk: p.risk,
      explanation: typeof p.explanation === "string" ? p.explanation : undefined
    }))
    .filter(
      (p) =>
        p.name &&
        Number.isFinite(p.apyRange.min) &&
        Number.isFinite(p.apyRange.max) &&
        p.apyRange.min >= 0 &&
        p.apyRange.max >= p.apyRange.min &&
        (p.risk === "Low" || p.risk === "Medium" || p.risk === "High")
    );

  if (pools.length === 0) return new Response("No valid pools provided", { status: 400 });

  const prompt =
    `You are a DeFi expert. Recommend the best liquidity pool for a moderate-risk user.\n` +
    `Pools (JSON): ${JSON.stringify(pools)}\n` +
    `Return ONLY JSON with fields: bestPool (string, exact pool name), reason (string).\n`;

  try {
    const client = getOpenAIClient();
    const resp = await client.responses.create({
      model: "gpt-4o-mini",
      input: prompt
    });

    const text = resp.output_text?.trim() ?? "";
    if (!text) return Response.json(fallback(pools));

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      const start = text.indexOf("{");
      const end = text.lastIndexOf("}");
      if (start >= 0 && end > start) parsed = JSON.parse(text.slice(start, end + 1));
      else return Response.json(fallback(pools));
    }

    const obj = parsed as Partial<{ bestPool: string; reason: string }>;
    if (typeof obj.bestPool !== "string" || typeof obj.reason !== "string") return Response.json(fallback(pools));

    return Response.json({ bestPool: obj.bestPool, reason: obj.reason });
  } catch {
    return Response.json(fallback(pools));
  }
}

