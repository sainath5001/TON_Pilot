"use client";

import { useEffect, useMemo, useState } from "react";
import { TonConnectButton, useTonAddress, useTonConnectUI, useTonWallet } from "@tonconnect/ui-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TokenSelector } from "@/components/swap/TokenSelector";
import { ResultCard } from "@/components/swap/ResultCard";
import type { StonfiAsset, SwapRecommendation } from "@/lib/stonfi/types";
import { fetchDefaultAssets, buildSwapTx } from "@/lib/stonfi/client";
import { toUnits } from "@/lib/stonfi/units";

function assetLabel(a: StonfiAsset | null) {
  return a?.meta?.symbol ?? a?.meta?.displayName ?? "Token";
}

function assetDecimals(a: StonfiAsset | null) {
  return a?.meta?.decimals ?? 9;
}

export function AISwapAssistant() {
  const walletAddress = useTonAddress();
  const wallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();

  const [assets, setAssets] = useState<StonfiAsset[] | null>(null);
  const [from, setFrom] = useState<string>("ton");
  const [to, setTo] = useState<string>("");
  const [amount, setAmount] = useState<string>("");

  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<SwapRecommendation | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [buildingTx, setBuildingTx] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { ton, usdt } = await fetchDefaultAssets();
        if (cancelled) return;
        setAssets([ton, usdt]);
        setFrom(ton.contractAddress);
        setTo(usdt.contractAddress);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load assets");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const fromAsset = useMemo(() => assets?.find((a) => a.contractAddress === from) ?? null, [assets, from]);
  const toAsset = useMemo(() => assets?.find((a) => a.contractAddress === to) ?? null, [assets, to]);

  const offerUnits = useMemo(() => {
    if (!amount) return "0";
    return toUnits(amount, assetDecimals(fromAsset));
  }, [amount, fromAsset]);

  async function onAnalyze() {
    setError(null);
    setResult(null);
    setAnalyzing(true);
    try {
      if (!fromAsset || !toAsset) throw new Error("Assets not loaded yet.");
      if (!amount) throw new Error("Enter an amount to analyze.");

      const res = await fetch("/api/analyze-swap", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          tokenFrom: assetLabel(fromAsset),
          tokenTo: assetLabel(toAsset),
          amount
        })
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || "Analyze failed");
      }

      const data = (await res.json()) as {
        recommendation: "Swap now" | "Wait";
        confidence: "High" | "Medium" | "Low";
        reason: string;
      };

      setResult({
        action: data.recommendation === "Swap now" ? "swap" : "wait",
        confidence: data.confidence,
        reason: data.reason
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analyze failed");
    } finally {
      setAnalyzing(false);
    }
  }

  async function onSwap() {
    setError(null);
    let step: "build" | "wallet" | "idle" = "idle";
    if (!walletAddress) {
      setError("Connect your wallet first.");
      return;
    }
    if (!fromAsset || !toAsset) {
      setError("Assets not loaded yet.");
      return;
    }
    if (!amount || offerUnits === "0") {
      setError("Enter a valid amount.");
      return;
    }

    setBuildingTx(true);
    try {
      step = "build";
      const tx = await buildSwapTx({
        walletAddress,
        offerAddress: fromAsset.contractAddress,
        askAddress: toAsset.contractAddress,
        offerUnits,
        slippageTolerance: "0.01"
      });

      step = "wallet";
      await tonConnectUI.sendTransaction(tx);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Swap failed";
      const prefix =
        step === "build"
          ? "Swap (build tx) failed: "
          : step === "wallet"
            ? "Swap (wallet) failed: "
            : "Swap failed: ";
      setError(prefix + msg);
    } finally {
      setBuildingTx(false);
    }
  }

  const canInteract = !!assets && !error;

  return (
    <Card className="mx-auto w-full max-w-xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-white">AI Swap Assistant</div>
          <div className="mt-0.5 text-xs text-white/60">STON.fi swap + mocked recommendation</div>
        </div>
        <TonConnectButton />
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <TokenSelector labelText="From" value={from} options={assets ?? []} onChange={setFrom} />
        <TokenSelector labelText="To" value={to} options={assets ?? []} onChange={setTo} />
      </div>

      <div className="mt-4">
        <div className="flex items-end justify-between gap-3">
          <div className="flex-1">
            <div className="text-xs font-medium text-white/70">Amount</div>
            <div className="mt-1.5 flex h-11 items-center rounded-xl border border-white/10 bg-black/20 px-3 focus-within:border-cyan-400/40">
              <input
                inputMode="decimal"
                placeholder="0.0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30"
              />
              <div className="ml-3 text-xs font-medium text-white/60">{assetLabel(fromAsset)}</div>
            </div>
          </div>
        </div>
        <div className="mt-2 text-xs text-white/50">Slippage tolerance: 1%</div>
      </div>

      {error && <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-100">{error}</div>}

      <div className="mt-5 flex flex-wrap gap-2">
        <Button variant="secondary" onClick={onAnalyze} disabled={!canInteract || analyzing}>
          {analyzing ? "Analyzing..." : "Analyze Swap"}
        </Button>
        <Button onClick={onSwap} disabled={!canInteract || buildingTx}>
          {buildingTx ? "Preparing swap..." : "Swap via STON.fi"}
        </Button>
      </div>

      <div className="mt-4 text-xs text-white/50">
        Wallet: {wallet ? "connected" : "not connected"}
      </div>

      {result && (
        <div className="mt-5">
          <ResultCard result={result} />
        </div>
      )}
    </Card>
  );
}

