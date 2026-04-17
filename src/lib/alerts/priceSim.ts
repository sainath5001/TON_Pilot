type PriceState = {
  price: number;
  // store last N returns (as %)
  returnsPct: number[];
};

export function createPriceSim(initialPrice = 6.5) {
  let state: PriceState = { price: initialPrice, returnsPct: [] };

  return {
    next(): { price: number; volatilityPct: number; returnPct: number } {
      // Simple bounded random walk (demo only)
      const prev = state.price;
      const shock = (Math.random() - 0.5) * 0.6; // +/-0.30%
      const drift = (Math.random() - 0.5) * 0.05; // tiny drift
      const next = Math.max(0.01, prev * (1 + (shock + drift) / 100));

      const retPct = ((next - prev) / prev) * 100;
      const returnsPct = [...state.returnsPct, retPct].slice(-20);
      state = { price: next, returnsPct };

      // Volatility = std dev of returns (in %)
      const mean = returnsPct.reduce((a, b) => a + b, 0) / returnsPct.length;
      const variance =
        returnsPct.reduce((acc, r) => acc + (r - mean) * (r - mean), 0) / Math.max(1, returnsPct.length - 1);
      const vol = Math.sqrt(variance);

      return { price: next, volatilityPct: vol, returnPct: retPct };
    }
  };
}

