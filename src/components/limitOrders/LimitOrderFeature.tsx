"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useLocalStorageState } from "@/lib/storage/useLocalStorage";
import type { LimitOrder } from "@/lib/limitOrders/types";
import { cn } from "@/components/ui/cn";

const STORAGE_KEY = "ton-pilot.limitOrders.v1";

function uid() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function formatPair(from: string, to: string) {
  return `${from} → ${to}`;
}

export function LimitOrderFeature() {
  const { value: orders, setValue: setOrders, hydrated } = useLocalStorageState<LimitOrder[]>(STORAGE_KEY, []);

  const [tokenFrom, setTokenFrom] = useState("TON");
  const [tokenTo, setTokenTo] = useState("USDT");
  const [targetPrice, setTargetPrice] = useState("");
  const [amount, setAmount] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [lastPrice, setLastPrice] = useState<number | null>(null);
  const [lastCheckedAt, setLastCheckedAt] = useState<number | null>(null);

  const pollingRef = useRef(false);

  const activeOrders = useMemo(() => orders.filter((o) => o.status === "active"), [orders]);
  const triggeredOrders = useMemo(() => orders.filter((o) => o.status === "triggered"), [orders]);

  async function fetchTonUsdtPrice() {
    // Simple price reference from STON.fi DEX API assets (USD prices).
    // TON/USDT ≈ tonPriceUsd / usdtPriceUsd.
    const [ton, usdt] = await Promise.all([
      fetch("https://api.ston.fi/v1/assets/EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c", { cache: "no-store" }).then((r) =>
        r.json()
      ),
      fetch("https://api.ston.fi/v1/assets/EQBynBO23ywHy_CgarY9NK9FTz0yDsG82PtcbSTQgGoXwiuA", { cache: "no-store" }).then((r) =>
        r.json()
      )
    ]);

    const tonUsd = Number((ton as { dexPriceUsd?: string }).dexPriceUsd ?? NaN);
    const usdtUsd = Number((usdt as { dexPriceUsd?: string }).dexPriceUsd ?? NaN);
    if (!Number.isFinite(tonUsd) || !Number.isFinite(usdtUsd) || usdtUsd <= 0) throw new Error("Price unavailable");
    return tonUsd / usdtUsd;
  }

  useEffect(() => {
    if (!hydrated) return;
    const interval = setInterval(async () => {
      if (pollingRef.current) return;
      pollingRef.current = true;
      try {
        const price = await fetchTonUsdtPrice();
        setLastPrice(price);
        setLastCheckedAt(Date.now());

        const now = Date.now();
        const toTrigger = orders.filter((o) => {
          if (o.status !== "active") return false;
          // Only monitor TON -> USDT/jUSDT MVP for now
          if (o.tokenFrom !== "TON") return false;
          if (o.tokenTo !== "USDT" && o.tokenTo !== "jUSDT") return false;
          const target = Number(o.targetPrice);
          if (!Number.isFinite(target) || target <= 0) return false;
          return price >= target;
        });

        if (toTrigger.length > 0) {
          const ids = new Set(toTrigger.map((o) => o.id));
          setOrders(
            orders.map((o) =>
              ids.has(o.id)
                ? {
                    ...o,
                    status: "triggered",
                    triggeredAt: o.triggeredAt ?? now
                  }
                : o
            )
          );
          setNotice(`Triggered ${toTrigger.length} order(s) at price ≈ ${price.toFixed(4)} USDT/TON`);
          setTimeout(() => setNotice(null), 7_000);
        }
      } catch {
        // Ignore transient price failures
      } finally {
        pollingRef.current = false;
      }
    }, 10_000);

    return () => clearInterval(interval);
  }, [hydrated, orders, setOrders]);

  function createOrder() {
    setFormError(null);
    if (!targetPrice.trim() || Number(targetPrice) <= 0) {
      setFormError("Enter a valid target price.");
      return;
    }
    if (!amount.trim() || Number(amount) <= 0) {
      setFormError("Enter a valid amount.");
      return;
    }

    const order: LimitOrder = {
      id: uid(),
      createdAt: Date.now(),
      triggeredAt: undefined,
      pair: formatPair(tokenFrom, tokenTo),
      tokenFrom,
      tokenTo,
      targetPrice: targetPrice.trim(),
      amount: amount.trim(),
      status: "active"
    };

    setOrders([order, ...orders]);
    setTargetPrice("");
    setAmount("");
  }

  function markTriggered(id: string) {
    const now = Date.now();
    setOrders(orders.map((o) => (o.id === id ? { ...o, status: "triggered", triggeredAt: o.triggeredAt ?? now } : o)));
  }

  function removeOrder(id: string) {
    setOrders(orders.filter((o) => o.id !== id));
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      {notice && (
        <div className="mb-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-sm text-emerald-100">
          {notice}
        </div>
      )}

      <div className="mb-4 text-xs text-white/55">
        Price monitor: checks every 10s ·{" "}
        {lastPrice != null ? (
          <span className="text-white/70">TON/USDT ≈ {lastPrice.toFixed(4)}</span>
        ) : (
          <span className="text-white/40">price unavailable</span>
        )}{" "}
        {lastCheckedAt ? <span className="text-white/40">· last checked {new Date(lastCheckedAt).toLocaleTimeString()}</span> : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <Card.Title>Create Limit Order</Card.Title>
          <Card.Description>Create an order and let the app auto-trigger it when the target is reached.</Card.Description>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <div className="text-xs font-medium text-white/70">From</div>
              <select
                value={tokenFrom}
                onChange={(e) => setTokenFrom(e.target.value)}
                className="h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none transition focus:border-cyan-400/40 focus:bg-black/30"
              >
                <option value="TON">TON</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="text-xs font-medium text-white/70">To</div>
              <select
                value={tokenTo}
                onChange={(e) => setTokenTo(e.target.value)}
                className="h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none transition focus:border-cyan-400/40 focus:bg-black/30"
              >
                <option value="USDT">USDT</option>
                <option value="jUSDT">jUSDT</option>
              </select>
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <div className="text-xs font-medium text-white/70">Target price ({tokenTo} per {tokenFrom})</div>
              <input
                inputMode="decimal"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                placeholder="e.g. 6.50"
                className="h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-cyan-400/40 focus:bg-black/30"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="text-xs font-medium text-white/70">Amount ({tokenFrom})</div>
              <input
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 10"
                className="h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-cyan-400/40 focus:bg-black/30"
              />
            </div>
          </div>

          {formError && (
            <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-100">
              {formError}
            </div>
          )}

          <div className="mt-5">
            <Button onClick={createOrder}>Create Order</Button>
          </div>
        </Card>

        <Card>
          <Card.Title>Active Orders</Card.Title>
          <Card.Description>{hydrated ? `${activeOrders.length} active` : "Loading..."}</Card.Description>

          {!hydrated ? null : activeOrders.length === 0 ? (
            <div className="mt-5 text-sm text-white/60">No active orders yet.</div>
          ) : (
            <div className="mt-5 space-y-3">
              {activeOrders.map((o) => (
                <div key={o.id} className="rounded-xl border border-white/10 bg-black/10 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-white">{o.pair}</div>
                      <div className="mt-1 text-xs text-white/60">
                        Target: {o.targetPrice} {o.tokenTo}/{o.tokenFrom} · Amount: {o.amount} {o.tokenFrom}
                      </div>
                    </div>
                    <div className="shrink-0 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-white/70">
                      Active
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button variant="secondary" onClick={() => markTriggered(o.id)}>
                      Mark triggered
                    </Button>
                    <Button variant="ghost" onClick={() => removeOrder(o.id)}>
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <Card.Title>Triggered</Card.Title>
          <Card.Description>{hydrated ? `${triggeredOrders.length} triggered` : "Loading..."}</Card.Description>

          {!hydrated ? null : triggeredOrders.length === 0 ? (
            <div className="mt-5 text-sm text-white/60">No triggered orders yet.</div>
          ) : (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="text-xs text-white/60">
                  <tr className="border-b border-white/10">
                    <th className="py-2 pr-4 font-medium">Pair</th>
                    <th className="py-2 pr-4 font-medium">Target price</th>
                    <th className="py-2 pr-4 font-medium">Amount</th>
                    <th className="py-2 pr-4 font-medium">Triggered at</th>
                    <th className="py-2 pr-4 font-medium">Status</th>
                    <th className="py-2 pr-0 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-white/80">
                  {triggeredOrders.map((o) => (
                    <tr key={o.id} className={cn("border-b border-white/10", "bg-emerald-400/5")}>
                      <td className="py-3 pr-4">{o.pair}</td>
                      <td className="py-3 pr-4">
                        {o.targetPrice} {o.tokenTo}/{o.tokenFrom}
                      </td>
                      <td className="py-3 pr-4">
                        {o.amount} {o.tokenFrom}
                      </td>
                      <td className="py-3 pr-4 text-white/60">
                        {o.triggeredAt ? new Date(o.triggeredAt).toLocaleString() : "—"}
                      </td>
                      <td className="py-3 pr-4">
                        <span className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-xs font-semibold text-emerald-200">
                          Triggered
                        </span>
                      </td>
                      <td className="py-3 pr-0">
                        <Button variant="ghost" onClick={() => removeOrder(o.id)}>
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

