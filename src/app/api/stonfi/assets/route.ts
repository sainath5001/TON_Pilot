import { AssetTag, StonApiClient } from "@ston-fi/api";
export const runtime = "nodejs";

// Mainnet TON pseudo-asset address used by STON.fi API
export const TON_ASSET_ADDRESS = "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c";

function pickSymbol(asset: { meta?: { symbol?: string; displayName?: string } }) {
  const s = asset.meta?.symbol ?? asset.meta?.displayName ?? "";
  return s.toUpperCase();
}

export async function GET() {
  const client = new StonApiClient();

  // Same condition pattern as STON.fi quickstart:
  const condition = [AssetTag.LiquidityVeryHigh, AssetTag.LiquidityHigh, AssetTag.LiquidityMedium].join(" | ");
  const assets = await client.queryAssets({ condition });

  const ton = assets.find((a) => pickSymbol(a) === "TON") ?? assets[0];
  const usdt =
    assets.find((a) => pickSymbol(a).includes("USDT")) ??
    assets.find((a) => pickSymbol(a).includes("JUSDT")) ??
    assets[1] ??
    assets[0];

  if (!ton || !usdt) return Response.json({ error: "Failed to load default assets" }, { status: 500 });

  return Response.json({
    ton: {
      contractAddress: ton.contractAddress,
      meta: ton.meta
    },
    usdt: {
      contractAddress: usdt.contractAddress,
      meta: usdt.meta
    }
  });
}

