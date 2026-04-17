export type AlertType = "price_drop" | "high_volatility";

export type AlertEvent = {
  id: string;
  ts: number;
  type: AlertType;
  title: string;
  message: string;
  meta?: Record<string, string | number | boolean | null>;
};

export type AlertSettings = {
  priceDropEnabled: boolean;
  priceDropThresholdPct: number;
  highVolatilityEnabled: boolean;
  highVolatilityThresholdPct: number;
};

export const ALERT_SETTINGS_STORAGE_KEY = "ton-pilot.smartAlerts.v1";
export const ALERT_HISTORY_STORAGE_KEY = "ton-pilot.alertHistory.v1";

export type AlertNotifier = {
  notify: (event: AlertEvent) => void;
};

