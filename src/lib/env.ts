function required(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required environment variable: ${name}`);
  return v;
}

export const env = {
  // Keep secrets server-side only (do not prefix with NEXT_PUBLIC_)
  stonfiApiKey: process.env.STONFI_API_KEY,
  tonstakersApiKey: process.env.TONSTAKERS_API_KEY,

  // Public values
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? "TON Pilot"
} as const;

export const serverOnlyEnv = {
  stonfiApiKey: () => required("STONFI_API_KEY"),
  tonstakersApiKey: () => required("TONSTAKERS_API_KEY")
} as const;

