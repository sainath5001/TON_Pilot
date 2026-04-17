"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { ToggleRow } from "@/components/alerts/ToggleRow";
import { useLocalStorageState } from "@/lib/storage/useLocalStorage";
import type { AlertEvent, AlertSettings } from "@/lib/alerts/types";
import { ALERT_HISTORY_STORAGE_KEY, ALERT_SETTINGS_STORAGE_KEY } from "@/lib/alerts/types";
import { createAlertEngine } from "@/lib/alerts/engine";
import { ToastHost, type Toast } from "@/components/alerts/ToastHost";
import { Button } from "@/components/ui/Button";

const defaults: AlertSettings = {
  priceDropEnabled: false,
  priceDropThresholdPct: 5,
  highVolatilityEnabled: false,
  highVolatilityThresholdPct: 5
};

function clampPct(n: number) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

export function SmartAlertsFeature() {
  const { value, setValue, hydrated } = useLocalStorageState<AlertSettings>(ALERT_SETTINGS_STORAGE_KEY, defaults);
  const { value: history, setValue: setHistory } = useLocalStorageState<AlertEvent[]>(ALERT_HISTORY_STORAGE_KEY, []);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const notifier = useMemo(
    () => ({
      notify: (event: AlertEvent) => {
        setToasts((prev) => [{ ...event, dismissAfterMs: 6500 }, ...prev].slice(0, 3));
      }
    }),
    []
  );

  const onEvent = useCallback(
    (event: AlertEvent) => {
      setHistory((prev) => [event, ...prev].slice(0, 50));
    },
    [setHistory]
  );

  useEffect(() => {
    if (!hydrated) return;
    const engine = createAlertEngine({
      settings: value,
      notifier,
      onEvent,
      intervalMs: 12_000
    });
    engine.start();
    return () => engine.stop();
  }, [hydrated, notifier, onEvent, value]);

  return (
    <div className="mx-auto w-full max-w-3xl">
      <ToastHost toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
      <Card>
        <Card.Title>Smart Alerts</Card.Title>
        <Card.Description>Runs a local background check every ~12s (simulated data for now).</Card.Description>

        {!hydrated ? (
          <div className="mt-5 text-sm text-white/60">Loading settings…</div>
        ) : (
          <div className="mt-6 space-y-6">
            <div className="space-y-3">
              <ToggleRow
                label="Price drop alert"
                description="Get alerted when price drops by your threshold."
                checked={value.priceDropEnabled}
                onChange={(next) => setValue((prev) => ({ ...prev, priceDropEnabled: next }))}
              />

              <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
                <div className="text-sm text-white/65">Threshold (%)</div>
                <input
                  inputMode="decimal"
                  value={value.priceDropThresholdPct}
                  onChange={(e) =>
                    setValue((prev) => ({ ...prev, priceDropThresholdPct: clampPct(Number(e.target.value)) }))
                  }
                  className="h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-cyan-400/40 focus:bg-black/30 sm:w-40"
                  disabled={!value.priceDropEnabled}
                />
              </div>
            </div>

            <div className="h-px w-full bg-white/10" />

            <div className="space-y-3">
              <ToggleRow
                label="High volatility alert"
                description="Get alerted when volatility exceeds your threshold."
                checked={value.highVolatilityEnabled}
                onChange={(next) => setValue((prev) => ({ ...prev, highVolatilityEnabled: next }))}
              />

              <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
                <div className="text-sm text-white/65">Threshold (%)</div>
                <input
                  inputMode="decimal"
                  value={value.highVolatilityThresholdPct}
                  onChange={(e) =>
                    setValue((prev) => ({ ...prev, highVolatilityThresholdPct: clampPct(Number(e.target.value)) }))
                  }
                  className="h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-cyan-400/40 focus:bg-black/30 sm:w-40"
                  disabled={!value.highVolatilityEnabled}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
              Settings are saved to <span className="font-mono text-white/80">localStorage</span> and will persist
              after refresh.
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-white">Alert history</div>
                  <div className="mt-1 text-sm text-white/65">Most recent alerts (saved locally).</div>
                </div>
                <Button variant="ghost" onClick={() => setHistory(() => [])}>
                  Clear
                </Button>
              </div>

              {history.length === 0 ? (
                <div className="mt-4 text-sm text-white/60">No alerts yet.</div>
              ) : (
                <div className="mt-4 space-y-2">
                  {history.slice(0, 10).map((a) => (
                    <div key={a.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-white">{a.title}</div>
                          <div className="mt-1 text-sm text-white/70">{a.message}</div>
                        </div>
                        <div className="text-xs text-white/45">{new Date(a.ts).toLocaleTimeString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

