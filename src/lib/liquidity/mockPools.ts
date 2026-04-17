export type RiskLevel = "Low" | "Medium" | "High";

export type ApyRange = { min: number; max: number };

export type LiquidityPoolRow = {
  id: string;
  name: string; // e.g. "TON / jUSDT"
  risk: RiskLevel;
  apyRange: ApyRange;
  explanation: string;
};

const STABLE = new Set(["USDT", "JUSDT"]);
const VOLATILE = new Set(["STON", "NOT"]);

function splitPair(name: string) {
  const [a, b] = name.split("/").map((s) => s.trim().toUpperCase());
  return { a, b };
}

export function classifyRisk(name: string): { risk: RiskLevel; explanation: string } {
  const { a, b } = splitPair(name);
  const isStablePair = STABLE.has(a) || STABLE.has(b);
  const hasVolatile = VOLATILE.has(a) || VOLATILE.has(b);

  if (isStablePair && !hasVolatile) {
    return {
      risk: "Low",
      explanation: "Low risk because the pair includes a stablecoin, typically reducing volatility and impermanent loss."
    };
  }

  if (hasVolatile) {
    return {
      risk: "High",
      explanation: "High risk because the pair includes volatile tokens; returns can vary and impermanent loss risk is higher."
    };
  }

  return {
    risk: "Medium",
    explanation: "Medium risk due to typical market volatility and impermanent loss exposure."
  };
}

export async function fetchRealtimeApyPlaceholder(poolName: string): Promise<ApyRange | null> {
  // Placeholder for future: fetch real-time APY from STON.fi API/analytics endpoints.
  // For now we intentionally keep this null to avoid fake precise numbers.
  void poolName;
  return null;
}

export const mockPools: LiquidityPoolRow[] = [
  {
    id: "ton-usdt",
    name: "TON / USDT",
    apyRange: { min: 2, max: 7 },
    ...classifyRisk("TON / USDT")
  },
  {
    id: "ton-jusdt",
    name: "TON / jUSDT",
    apyRange: { min: 3, max: 8 },
    ...classifyRisk("TON / jUSDT")
  },
  {
    id: "ston-ton",
    name: "STON / TON",
    apyRange: { min: 5, max: 15 },
    ...classifyRisk("STON / TON")
  },
  {
    id: "not-ton",
    name: "NOT / TON",
    apyRange: { min: 5, max: 10 },
    ...classifyRisk("NOT / TON")
  }
];

