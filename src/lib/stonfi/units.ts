export function toUnits(amount: string, decimals: number) {
  // Minimal decimal -> integer string conversion (no floating point).
  // Example: toUnits("1.23", 6) => "1230000"
  const normalized = amount.trim();
  if (!normalized) return "0";

  const [whole, frac = ""] = normalized.split(".");
  const safeWhole = whole.replace(/^0+(?=\d)/, "") || "0";
  const safeFrac = frac.replace(/[^0-9]/g, "");

  const padded = (safeFrac + "0".repeat(decimals)).slice(0, decimals);
  const combined = (safeWhole + padded).replace(/^0+(?=\d)/, "") || "0";
  return combined;
}

