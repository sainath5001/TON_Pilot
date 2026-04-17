import type { StonfiAsset } from "@/lib/stonfi/types";

export async function fetchDefaultAssets() {
  const res = await fetch("/api/stonfi/assets", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch assets");
  return (await res.json()) as { ton: StonfiAsset; usdt: StonfiAsset };
}

export async function buildSwapTx(input: {
  walletAddress: string;
  offerAddress: string; // "ton" or jetton master address
  askAddress: string; // "ton" or jetton master address
  offerUnits: string;
  slippageTolerance: string; // e.g. "0.01"
}) {
  const res = await fetch("/api/stonfi/swap-tx", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input)
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(msg || "Failed to build swap transaction");
  }
  return (await res.json()) as {
    validUntil: number;
    messages: Array<{ address: string; amount: string; payload?: string }>;
  };
}

