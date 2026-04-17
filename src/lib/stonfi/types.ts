export type StonfiAsset = {
  contractAddress: string; // "ton" or jetton master address
  meta?: {
    symbol?: string;
    displayName?: string;
    decimals?: number;
    imageUrl?: string;
  };
};

export type SwapRecommendation = {
  action: "swap" | "wait";
  confidence: "High" | "Medium" | "Low";
  reason: string;
};

