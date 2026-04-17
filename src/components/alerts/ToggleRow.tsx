"use client";

import { cn } from "@/components/ui/cn";

export function ToggleRow({
  label,
  description,
  checked,
  onChange
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  const id = `toggle_${label.replace(/\s+/g, "_").toLowerCase()}`;
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="text-sm font-semibold text-white">{label}</div>
        {description ? <div className="mt-1 text-sm text-white/65">{description}</div> : null}
      </div>

      <div className="mt-0.5">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <label
          htmlFor={id}
          className={cn(
            "relative block h-7 w-12 cursor-pointer select-none rounded-full border transition",
            "peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-cyan-400/60 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-black/40",
            checked ? "border-cyan-400/40 bg-cyan-400/25" : "border-white/15 bg-white/5"
          )}
          aria-label={label}
        >
          <span
            className={cn(
              "absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform",
              checked ? "translate-x-5" : "translate-x-0"
            )}
          />
        </label>
      </div>
    </div>
  );
}

