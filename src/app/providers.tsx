"use client";

import { TonConnectUIProvider } from "@tonconnect/ui-react";
import { useEffect, useMemo, useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const fromEnv = useMemo(() => {
    const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
    return base ? `${base}/tonconnect-manifest.json` : null;
  }, []);

  const [computed, setComputed] = useState<string | null>(fromEnv);

  useEffect(() => {
    if (computed) return;
    setComputed(new URL("/tonconnect-manifest.json", window.location.origin).toString());
  }, [computed]);

  // Wait until we have a usable manifest URL (prevents TonConnect trying a wrong/relative URL).
  if (!computed) return <>{children}</>;

  return <TonConnectUIProvider manifestUrl={computed}>{children}</TonConnectUIProvider>;
}

