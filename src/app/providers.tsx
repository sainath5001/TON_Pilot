"use client";

import { TonConnectUIProvider } from "@tonconnect/ui-react";

export function Providers({ children }: { children: React.ReactNode }) {
  // Keep this SSR-safe: client components still prerender, so no `window` access here.
  return <TonConnectUIProvider manifestUrl="/tonconnect-manifest.json">{children}</TonConnectUIProvider>;
}

