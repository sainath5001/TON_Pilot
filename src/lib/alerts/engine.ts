import type { AlertEvent, AlertNotifier, AlertSettings } from "@/lib/alerts/types";
import { createPriceSim } from "@/lib/alerts/priceSim";

type EngineState = {
  lastPrice: number | null;
  lastCheckTs: number | null;
  lastTriggerTsByType: Partial<Record<AlertEvent["type"], number>>;
};

export function createAlertEngine(opts: {
  settings: AlertSettings;
  notifier: AlertNotifier;
  onEvent: (event: AlertEvent) => void;
  intervalMs?: number;
}) {
  const sim = createPriceSim(6.5);
  const intervalMs = opts.intervalMs ?? 12_000;
  const cooldownMs = 45_000;

  let timer: ReturnType<typeof setInterval> | null = null;
  let state: EngineState = { lastPrice: null, lastCheckTs: null, lastTriggerTsByType: {} };

  function emit(event: AlertEvent) {
    opts.onEvent(event);
    opts.notifier.notify(event);
  }

  function canTrigger(type: AlertEvent["type"], now: number) {
    const last = state.lastTriggerTsByType[type];
    return !last || now - last >= cooldownMs;
  }

  function markTriggered(type: AlertEvent["type"], now: number) {
    state = { ...state, lastTriggerTsByType: { ...state.lastTriggerTsByType, [type]: now } };
  }

  async function tick() {
    const now = Date.now();
    const { price, volatilityPct } = sim.next();

    const prevPrice = state.lastPrice;
    state = { ...state, lastPrice: price, lastCheckTs: now };

    // Price drop alert (% drop vs previous tick)
    if (opts.settings.priceDropEnabled && prevPrice && prevPrice > 0) {
      const dropPct = ((prevPrice - price) / prevPrice) * 100;
      if (dropPct >= opts.settings.priceDropThresholdPct && canTrigger("price_drop", now)) {
        markTriggered("price_drop", now);
        emit({
          id: `${now}_price_drop`,
          ts: now,
          type: "price_drop",
          title: "Price drop alert",
          message: `Price dropped ${dropPct.toFixed(2)}% in the last check. (Simulated)`,
          meta: { price: Number(price.toFixed(4)), dropPct: Number(dropPct.toFixed(2)) }
        });
      }
    }

    // High volatility alert (std dev of recent returns)
    if (opts.settings.highVolatilityEnabled) {
      if (volatilityPct >= opts.settings.highVolatilityThresholdPct && canTrigger("high_volatility", now)) {
        markTriggered("high_volatility", now);
        emit({
          id: `${now}_high_vol`,
          ts: now,
          type: "high_volatility",
          title: "High volatility alert",
          message: `Volatility is high (≈ ${volatilityPct.toFixed(2)}%). (Simulated)`,
          meta: { price: Number(price.toFixed(4)), volatilityPct: Number(volatilityPct.toFixed(2)) }
        });
      }
    }
  }

  function start() {
    if (timer) return;
    // fire once quickly, then interval
    void tick();
    timer = setInterval(() => void tick(), intervalMs);
  }

  function stop() {
    if (!timer) return;
    clearInterval(timer);
    timer = null;
  }

  return { start, stop };
}

