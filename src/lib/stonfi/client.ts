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
  const ac = new AbortController();
  // Keep client timeout slightly > server timeout so Network shows a real response (504)
  // instead of a client-side "cancelled" request.
  const timeout = setTimeout(() => ac.abort("timeout"), 95_000);

  try {
    const res = await fetch("/api/stonfi/swap-tx", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
      signal: ac.signal
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      const msg = text.trim() || res.statusText || "Swap transaction builder failed";
      throw new Error(`swap-tx ${res.status}: ${msg}`);
    }
    return (await res.json()) as {
      validUntil: number;
      messages: Array<{ address: string; amount: string; payload?: string }>;
    };
  } catch (e: unknown) {
    const anyErr = e as { name?: string; message?: string; cause?: { name?: string; message?: string } } | null;
    const isAbort =
      (e instanceof DOMException && e.name === "AbortError") ||
      anyErr?.name === "AbortError" ||
      anyErr?.cause?.name === "AbortError" ||
      (anyErr?.message?.toLowerCase().includes("aborted") ?? false) ||
      (anyErr?.cause?.message?.toLowerCase().includes("aborted") ?? false);

    if (isAbort) {
      throw new Error("Swap builder timed out. Please try again.");
    }
    throw e instanceof Error ? e : new Error("Failed to build swap transaction");
  } finally {
    clearTimeout(timeout);
  }
}

