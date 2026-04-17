import type { NextRequest } from "next/server";
import { getOpenAIClient } from "@/lib/ai/openai";

export const runtime = "nodejs";

type Body = {
  tokenFrom: string;
  tokenTo: string;
  amount: string;
};

function deriveMarketSignals(tokenFrom: string, tokenTo: string, amount: string) {
  // Minimal MVP (per prompt): simulate/fake these signals for now.
  // You can replace this later with real price data feeds.
  void tokenFrom;
  void tokenTo;
  void amount;
  return { priceTrend: "stable" as const, volatility: "medium" as const };
}

function fallbackAnalysis(input: { tokenFrom: string; tokenTo: string; amount: string }) {
  const amt = Number(input.amount);
  const hasAmount = Number.isFinite(amt) && amt > 0;
  const recommendation = hasAmount ? ("Swap now" as const) : ("Wait" as const);
  return {
    recommendation,
    confidence: hasAmount ? ("Low" as const) : ("Low" as const),
    reason: hasAmount
      ? `AI is temporarily unavailable, so this is a fallback suggestion. Confirm slippage and price before swapping ${input.tokenFrom} → ${input.tokenTo}.`
      : "Enter a valid amount to analyze."
  };
}

function pickOpenAiError(e: unknown): { status?: number; code?: string; message?: string } {
  if (!e || typeof e !== "object") return {};
  const anyErr = e as { status?: number; code?: string; message?: string; error?: { code?: string; message?: string } };
  return {
    status: typeof anyErr.status === "number" ? anyErr.status : undefined,
    code: anyErr.code ?? anyErr.error?.code,
    message: anyErr.message ?? anyErr.error?.message
  };
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body) return new Response("Invalid JSON body", { status: 400 });

  const tokenFrom = String(body.tokenFrom ?? "").trim();
  const tokenTo = String(body.tokenTo ?? "").trim();
  const amount = String(body.amount ?? "").trim();

  if (!tokenFrom || !tokenTo || !amount) return new Response("Missing tokenFrom/tokenTo/amount", { status: 400 });

  const { priceTrend, volatility } = deriveMarketSignals(tokenFrom, tokenTo, amount);

  const prompt =
    `You are a DeFi trading assistant.\n` +
    `User wants to swap ${amount} ${tokenFrom} to ${tokenTo}.\n` +
    `Price trend is ${priceTrend.toUpperCase()} and volatility is ${volatility.toUpperCase()}.\n` +
    `Should the user swap now or wait?\n` +
    `Respond ONLY in JSON with fields: recommendation ("Swap now" or "Wait"), confidence ("High"|"Medium"|"Low"), reason (short).\n`;

  let responseText: string | null = null;
  try {
    const client = getOpenAIClient();
    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input: prompt
    });
    responseText = response.output_text?.trim() ?? null;
  } catch (e: unknown) {
    // Keep the app usable for hackathon demos:
    // - missing key
    // - quota / rate limits
    // - transient network errors
    // Always return the requested JSON shape.
    const fallback = fallbackAnalysis({ tokenFrom, tokenTo, amount });
    const debug = process.env.NODE_ENV !== "production" ? pickOpenAiError(e) : undefined;
    return Response.json({ ...fallback, mode: "fallback", debug });
  }

  const text = responseText ?? "";
  if (!text) return Response.json({ ...fallbackAnalysis({ tokenFrom, tokenTo, amount }), mode: "fallback" });

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    // Fallback: try to extract the first JSON object from the text.
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start >= 0 && end > start) {
      parsed = JSON.parse(text.slice(start, end + 1));
    } else {
      return new Response("AI did not return valid JSON", { status: 502 });
    }
  }

  const obj = parsed as Partial<{ recommendation: string; confidence: string; reason: string }>;
  const recommendation = obj.recommendation;
  const confidence = obj.confidence;
  const reason = obj.reason;

  if (
    (recommendation !== "Swap now" && recommendation !== "Wait") ||
    (confidence !== "High" && confidence !== "Medium" && confidence !== "Low") ||
    typeof reason !== "string"
  ) {
    return new Response("AI returned unexpected JSON shape", { status: 502 });
  }

  return Response.json({ recommendation, confidence, reason, mode: "ai" });
}

