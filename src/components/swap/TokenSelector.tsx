"use client";

import type { StonfiAsset } from "@/lib/stonfi/types";

function label(asset: StonfiAsset) {
  return asset.meta?.symbol ?? asset.meta?.displayName ?? "Token";
}

export function TokenSelector({
  labelText,
  value,
  options,
  onChange
}: {
  labelText: string;
  value: string;
  options: StonfiAsset[];
  onChange: (next: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="text-xs font-medium text-white/70">{labelText}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none ring-0 transition focus:border-cyan-400/40 focus:bg-black/30"
      >
        {options.map((a) => (
          <option key={a.contractAddress} value={a.contractAddress}>
            {label(a)}
          </option>
        ))}
      </select>
    </div>
  );
}

