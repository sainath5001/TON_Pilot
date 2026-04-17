export type LimitOrderStatus = "active" | "triggered";

export type LimitOrder = {
  id: string;
  createdAt: number;
  triggeredAt?: number;
  pair: string; // e.g. "TON → jUSDT"
  tokenFrom: string;
  tokenTo: string;
  targetPrice: string;
  amount: string;
  status: LimitOrderStatus;
};

